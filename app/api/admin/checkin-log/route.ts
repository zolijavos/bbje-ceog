/**
 * Admin Check-in Log API
 *
 * GET /api/admin/checkin-log
 *
 * Returns paginated check-in log with search and date filtering.
 * Story 3.4: Admin Check-in Log Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, parsePaginationParams } from '@/lib/api';
import { getCheckinLog } from '@/lib/services/checkin';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams, { limit: 50, maxLimit: 100 });
    const search = searchParams.get('search') || undefined;
    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');

    // Parse dates
    const dateFrom = dateFromStr ? new Date(dateFromStr) : undefined;
    const dateTo = dateToStr ? new Date(dateToStr) : undefined;

    const result = await getCheckinLog({
      page,
      limit,
      search,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Check-in log API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
