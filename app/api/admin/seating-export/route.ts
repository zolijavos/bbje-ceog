/**
 * Admin Seating Export API
 *
 * GET /api/admin/seating-export - Export seating arrangement as CSV
 *
 * Story 4.5: Seating Arrangement Export/Reports
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { exportSeatingArrangement } from '@/lib/services/seating';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const csv = await exportSeatingArrangement();

    // Return as CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ultetesi-rend.csv"',
      },
    });
  } catch (error) {
    console.error('Seating export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
