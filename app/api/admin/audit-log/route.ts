/**
 * Admin Audit Log API
 *
 * GET /api/admin/audit-log - Get paginated audit log list
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api';
import { getAuditLogList, getRecentActivitySummary } from '@/lib/services/audit';
import { logError } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only admins can view audit logs
    const auth = await requireAdmin();
    if (!auth.success) {
      return auth.response;
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const userId = searchParams.get('userId')
      ? parseInt(searchParams.get('userId')!, 10)
      : undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const search = searchParams.get('search') || undefined;
    const includeSummary = searchParams.get('includeSummary') === 'true';

    // Get audit logs
    const result = await getAuditLogList({
      page,
      limit: Math.min(limit, 100), // Max 100 per page
      action,
      entityType,
      userId,
      startDate,
      endDate,
      search,
    });

    // Optionally include activity summary
    let summary = null;
    if (includeSummary) {
      summary = await getRecentActivitySummary();
    }

    return NextResponse.json({
      success: true,
      ...result,
      summary,
    });
  } catch (error) {
    logError('[AUDIT-LOG-API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
