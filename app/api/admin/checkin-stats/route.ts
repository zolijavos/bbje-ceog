/**
 * Admin Check-in Stats API
 *
 * GET /api/admin/checkin-stats
 *
 * Returns check-in statistics for the dashboard.
 * Story 3.4: Admin Check-in Log Dashboard
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getCheckinStats } from '@/lib/services/checkin';

export async function GET() {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getCheckinStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Check-in stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
