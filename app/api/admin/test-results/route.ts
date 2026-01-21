import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { TestStatus } from '@prisma/client';
import { getFullName } from '@/lib/utils/name';

/**
 * GET /api/admin/test-results
 * Fetch all test results or filter by version
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version');

  try {
    const where = version ? { version } : {};

    const results = await prisma.testResult.findMany({
      where,
      include: {
        tester: {
          select: { id: true, first_name: true, last_name: true, email: true }
        }
      },
      orderBy: [
        { version: 'desc' },
        { feature_index: 'asc' }
      ]
    });

    // Add computed name field for backwards compatibility
    const resultsWithName = results.map(r => ({
      ...r,
      tester: {
        ...r.tester,
        name: getFullName(r.tester.first_name, r.tester.last_name),
      },
    }));

    return NextResponse.json({ results: resultsWithName });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/test-results
 * Create or update a test result
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { version, featureIndex, featureName, status, comment, stepResults } = body;

    // Validate required fields
    if (!version || featureIndex === undefined || !featureName) {
      return NextResponse.json(
        { error: 'Missing required fields: version, featureIndex, featureName' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: TestStatus[] = ['passed', 'failed', 'not_tested'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: passed, failed, or not_tested' },
        { status: 400 }
      );
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compute tester name for caching
    const testerName = getFullName(user.first_name, user.last_name);

    // Upsert the test result
    const result = await prisma.testResult.upsert({
      where: {
        version_feature_index: {
          version,
          feature_index: featureIndex
        }
      },
      create: {
        version,
        feature_index: featureIndex,
        feature_name: featureName,
        status: status || 'not_tested',
        comment: comment || null,
        step_results: stepResults ? JSON.stringify(stepResults) : null,
        tester_id: user.id,
        tester_name: testerName
      },
      update: {
        status: status || 'not_tested',
        comment: comment || null,
        step_results: stepResults ? JSON.stringify(stepResults) : null,
        tester_id: user.id,
        tester_name: testerName,
        updated_at: new Date()
      },
      include: {
        tester: {
          select: { id: true, first_name: true, last_name: true, email: true }
        }
      }
    });

    // Add computed name field for backwards compatibility
    const resultWithName = {
      ...result,
      tester: {
        ...result.tester,
        name: getFullName(result.tester.first_name, result.tester.last_name),
      },
    };

    return NextResponse.json({ success: true, result: resultWithName });
  } catch (error) {
    console.error('Error saving test result:', error);
    return NextResponse.json(
      { error: 'Failed to save test result' },
      { status: 500 }
    );
  }
}
