/**
 * Payments API
 *
 * GET /api/admin/payments - Get payment history with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';
import { getFullName } from '@/lib/utils/name';

/**
 * GET - List payments with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.payment_status = status;
    }

    if (method) {
      where.payment_method = method;
    }

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) {
        (where.created_at as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        (where.created_at as Record<string, Date>).lte = endDate;
      }
    }

    if (search) {
      where.registration = {
        guest: {
          OR: [
            { first_name: { contains: search } },
            { last_name: { contains: search } },
            { email: { contains: search } },
          ],
        },
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          registration: {
            include: {
              guest: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  guest_type: true,
                  phone: true,
                  company: true,
                },
              },
              billing_info: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPaid,
      totalPending,
      totalFailed,
      paidToday,
      revenueTotal,
      revenueToday,
      byMethod,
    ] = await Promise.all([
      prisma.payment.count({ where: { payment_status: 'paid' } }),
      prisma.payment.count({ where: { payment_status: 'pending' } }),
      prisma.payment.count({ where: { payment_status: 'failed' } }),
      prisma.payment.count({
        where: {
          payment_status: 'paid',
          paid_at: { gte: today },
        },
      }),
      prisma.payment.aggregate({
        where: { payment_status: 'paid' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          payment_status: 'paid',
          paid_at: { gte: today },
        },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ['payment_method'],
        where: { payment_status: 'paid' },
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    // Format payments for response
    const formattedPayments = payments.map((p) => {
      const guest = p.registration?.guest;
      return {
        id: p.id,
        registration_id: p.registration_id,
        stripe_session_id: p.stripe_session_id,
        stripe_payment_intent_id: p.stripe_payment_intent_id,
        amount: Number(p.amount),
        currency: p.currency,
        payment_status: p.payment_status,
        payment_method: p.payment_method,
        paid_at: p.paid_at,
        created_at: p.created_at,
        guest: guest ? {
          ...guest,
          name: getFullName(guest.first_name, guest.last_name),
        } : null,
        ticket_type: p.registration?.ticket_type || null,
        billing_info: p.registration?.billing_info || null,
      };
    });

    return NextResponse.json({
      payments: formattedPayments,
      total,
      limit,
      offset,
      stats: {
        total_paid: totalPaid,
        total_pending: totalPending,
        total_failed: totalFailed,
        paid_today: paidToday,
        revenue_total: Number(revenueTotal._sum.amount || 0),
        revenue_today: Number(revenueToday._sum.amount || 0),
        by_method: byMethod.reduce((acc, item) => {
          acc[item.payment_method] = {
            count: item._count,
            amount: Number(item._sum.amount || 0),
          };
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
      },
    });
  } catch (error) {
    logError('[PAYMENTS] Error listing payments:', error);
    return NextResponse.json(
      { error: 'Failed to list payments' },
      { status: 500 }
    );
  }
}
