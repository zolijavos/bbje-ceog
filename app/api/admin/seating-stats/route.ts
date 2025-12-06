/**
 * Admin Seating Stats API
 *
 * GET /api/admin/seating-stats - Get seating statistics
 *
 * Story 4.5: Seating Arrangement Export/Reports
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getSeatingStats } from '@/lib/services/seating';

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

    const stats = await getSeatingStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Seating stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
