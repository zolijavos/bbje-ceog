/**
 * API Route: POST /api/admin/guests/import
 * Handles CSV file upload for bulk guest import
 *
 * Story 1.4: CSV Guest List Import
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api';
import { importGuestsFromCSV } from '@/lib/services/csv';

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.success) return auth.response;

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are accepted' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'File is empty' },
        { status: 400 }
      );
    }

    // Process CSV import
    const result = await importGuestsFromCSV(content);

    // Return response with appropriate status
    if (result.success) {
      return NextResponse.json({
        success: true,
        imported: result.imported,
        total: result.total,
        errors: result.errors,
        message:
          result.errors.length > 0
            ? `${result.imported} guests imported successfully, ${result.errors.length} errors`
            : `${result.imported} guests imported successfully`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          imported: result.imported,
          total: result.total,
          errors: result.errors,
          error:
            result.errors.length > 0
              ? result.errors[0].message
              : 'Import failed',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
