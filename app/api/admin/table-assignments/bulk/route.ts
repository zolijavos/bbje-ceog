/**
 * Admin Bulk Table Assignment API
 *
 * POST /api/admin/table-assignments/bulk - Bulk import from CSV
 *
 * Story 4.3: Bulk CSV Table Assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { bulkAssignFromCsv } from '@/lib/services/seating';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get CSV content from form data or JSON
    const contentType = request.headers.get('content-type') || '';

    let csvContent: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'NO_FILE', message: 'CSV fájl szükséges' },
          { status: 400 }
        );
      }

      csvContent = await file.text();
    } else {
      const body = await request.json();
      csvContent = body.csv;

      if (!csvContent || typeof csvContent !== 'string') {
        return NextResponse.json(
          { error: 'NO_CSV_CONTENT', message: 'CSV tartalom szükséges' },
          { status: 400 }
        );
      }
    }

    // Process CSV
    const result = await bulkAssignFromCsv(csvContent, session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Bulk assignment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
