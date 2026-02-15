/**
 * Email Logs API
 *
 * GET /api/admin/email-logs - Get sent email history
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';

/**
 * GET - List email logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('type');
    const status = searchParams.get('status');
    const guestId = searchParams.get('guest_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (emailType) {
      where.email_type = emailType;
    }

    if (status) {
      where.status = status;
    }

    if (guestId) {
      where.guest_id = parseInt(guestId);
    }

    if (search) {
      where.OR = [
        { recipient: { contains: search } },
        { subject: { contains: search } },
        { guest: { first_name: { contains: search } } },
        { guest: { last_name: { contains: search } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { sent_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          guest: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSent, totalFailed, sentToday, byType] = await Promise.all([
      prisma.emailLog.count({ where: { status: 'sent' } }),
      prisma.emailLog.count({ where: { status: 'failed' } }),
      prisma.emailLog.count({
        where: {
          status: 'sent',
          sent_at: { gte: today },
        },
      }),
      prisma.emailLog.groupBy({
        by: ['email_type'],
        _count: true,
        orderBy: { _count: { email_type: 'desc' } },
      }),
    ]);

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
      stats: {
        total_sent: totalSent,
        total_failed: totalFailed,
        sent_today: sentToday,
        by_type: byType.reduce((acc, item) => {
          acc[item.email_type] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    logError('[EMAIL-LOGS] Error listing logs:', error);
    return NextResponse.json(
      { error: 'Failed to list email logs' },
      { status: 500 }
    );
  }
}
