/**
 * Admin Seating Stats API
 *
 * GET /api/admin/seating-stats - Get seating statistics
 *
 * Story 4.5: Seating Arrangement Export/Reports
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { getSeatingStats } from '@/lib/services/seating';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const stats = await getSeatingStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error('Seating stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
