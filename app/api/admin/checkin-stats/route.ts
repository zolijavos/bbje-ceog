/**
 * Admin Check-in Stats API
 *
 * GET /api/admin/checkin-stats
 *
 * Returns check-in statistics for the dashboard.
 * Story 3.4: Admin Check-in Log Dashboard
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { getCheckinStats } from '@/lib/services/checkin';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const stats = await getCheckinStats();
    return NextResponse.json({ success: true, ...stats });
  } catch (error) {
    console.error('Check-in stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
