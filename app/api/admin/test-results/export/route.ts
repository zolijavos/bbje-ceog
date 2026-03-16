import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { getFullName } from '@/lib/utils/name';

/**
 * GET /api/admin/test-results/export
 * Export test results as CSV
 * Query params:
 * - version: optional, filter by version
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
          select: { first_name: true, last_name: true, email: true }
        }
      },
      orderBy: [
        { version: 'desc' },
        { feature_index: 'asc' }
      ]
    });

    // Build CSV content
    const headers = [
      'Version',
      'Feature Index',
      'Feature Name',
      'Status',
      'Tester Name',
      'Tester Email',
      'Comment',
      'Step Results',
      'Tested At',
      'Updated At'
    ];

    const rows = results.map(result => {
      // Parse step results for display
      let stepResultsDisplay = '';
      if (result.step_results) {
        try {
          const parsed = JSON.parse(result.step_results);
          const entries = Object.entries(parsed);
          const completed = entries.filter(([, v]) => v === true).length;
          stepResultsDisplay = `${completed}/${entries.length} completed`;
        } catch {
          stepResultsDisplay = result.step_results;
        }
      }

      return [
        result.version,
        result.feature_index.toString(),
        escapeCSV(result.feature_name),
        result.status,
        escapeCSV(result.tester_name || getFullName(result.tester.first_name, result.tester.last_name)),
        result.tester.email,
        escapeCSV(result.comment || ''),
        stepResultsDisplay,
        result.tested_at.toISOString(),
        result.updated_at.toISOString()
      ];
    });

    // Generate CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add BOM for Excel compatibility with Hungarian characters
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = version
      ? `test-results-v${version}-${timestamp}.csv`
      : `test-results-all-${timestamp}.csv`;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting test results:', error);
    return NextResponse.json(
      { error: 'Failed to export test results' },
      { status: 500 }
    );
  }
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string): string {
  if (!value) return '""';
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
