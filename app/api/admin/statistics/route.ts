import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';

/**
 * GET /api/admin/statistics
 * Returns comprehensive statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Registration Overview
    const guestStats = await prisma.guest.groupBy({
      by: ['registration_status'],
      _count: true,
    });

    const guestTypeStats = await prisma.guest.groupBy({
      by: ['guest_type'],
      _count: true,
    });

    const totalGuests = await prisma.guest.count();
    const invitedCount = guestStats.find((s) => s.registration_status === 'invited')?._count || 0;
    const registeredCount = guestStats.find((s) => s.registration_status === 'registered')?._count || 0;
    const approvedCount = guestStats.find((s) => s.registration_status === 'approved')?._count || 0;
    const declinedCount = guestStats.find((s) => s.registration_status === 'declined')?._count || 0;

    const vipCount = guestTypeStats.find((s) => s.guest_type === 'vip')?._count || 0;
    const singleCount = guestTypeStats.find((s) => s.guest_type === 'paying_single')?._count || 0;
    const pairedCount = guestTypeStats.find((s) => s.guest_type === 'paying_paired')?._count || 0;

    const registrationRate = totalGuests > 0 ? ((registeredCount + approvedCount) / totalGuests) * 100 : 0;

    // 2. Payment Statistics
    const paymentStats = await prisma.payment.groupBy({
      by: ['payment_status'],
      _sum: { amount: true },
      _count: true,
    });

    const paymentMethodStats = await prisma.payment.groupBy({
      by: ['payment_method'],
      _count: true,
    });

    const totalRevenue = paymentStats.reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);
    const paidRevenue = Number(paymentStats.find((s) => s.payment_status === 'paid')?._sum.amount || 0);
    const pendingRevenue = Number(paymentStats.find((s) => s.payment_status === 'pending')?._sum.amount || 0);

    const paidCount = paymentStats.find((s) => s.payment_status === 'paid')?._count || 0;
    const pendingCount = paymentStats.find((s) => s.payment_status === 'pending')?._count || 0;
    const failedCount = paymentStats.find((s) => s.payment_status === 'failed')?._count || 0;

    const cardPayments = paymentMethodStats.find((s) => s.payment_method === 'card')?._count || 0;
    const bankTransfers = paymentMethodStats.find((s) => s.payment_method === 'bank_transfer')?._count || 0;

    // 3. Seating Statistics
    const totalTables = await prisma.table.count();
    const totalCapacity = await prisma.table.aggregate({
      _sum: { capacity: true },
    });

    const totalAssignments = await prisma.tableAssignment.count();
    const occupancyRate = totalCapacity._sum.capacity
      ? (totalAssignments / totalCapacity._sum.capacity) * 100
      : 0;

    const unassignedGuests = await prisma.guest.count({
      where: {
        registration_status: 'approved',
        table_assignment: null,
      },
    });

    const tablesByType = await prisma.table.groupBy({
      by: ['type'],
      _count: true,
      _sum: { capacity: true },
    });

    const assignmentsByTableType = await prisma.$queryRaw<
      { type: string; occupied: bigint }[]
    >`
      SELECT t.type, COUNT(ta.id) as occupied
      FROM tables t
      LEFT JOIN table_assignments ta ON t.id = ta.table_id
      GROUP BY t.type
    `;

    // 4. Check-in Statistics
    const totalCheckins = await prisma.checkin.count();
    const checkinRate = approvedCount > 0 ? (totalCheckins / approvedCount) * 100 : 0;

    const overrideCheckins = await prisma.checkin.count({
      where: { is_override: true },
    });

    const checkinsByStaff = await prisma.checkin.groupBy({
      by: ['staff_user_id'],
      _count: true,
    });

    // 5. Email Statistics
    const emailStats = await prisma.emailLog.groupBy({
      by: ['email_type', 'status'],
      _count: true,
    });

    const totalEmailsSent = emailStats.reduce((sum, s) => sum + s._count, 0);
    const successfulEmails = emailStats
      .filter((s) => s.status === 'sent')
      .reduce((sum, s) => sum + s._count, 0);
    const emailDeliveryRate = totalEmailsSent > 0 ? (successfulEmails / totalEmailsSent) * 100 : 0;

    // 6. Dietary Requirements
    const dietaryStats = await prisma.guest.findMany({
      where: {
        dietary_requirements: {
          not: null,
        },
      },
      select: {
        dietary_requirements: true,
      },
    });

    const dietaryCounts: Record<string, number> = {};
    dietaryStats.forEach((guest) => {
      const req = guest.dietary_requirements?.toLowerCase() || '';
      if (req.includes('vegetarian') || req.includes('vegetáriánus')) {
        dietaryCounts['Vegetarian'] = (dietaryCounts['Vegetarian'] || 0) + 1;
      }
      if (req.includes('vegan') || req.includes('vegán')) {
        dietaryCounts['Vegan'] = (dietaryCounts['Vegan'] || 0) + 1;
      }
      if (req.includes('gluten') || req.includes('glutén')) {
        dietaryCounts['Gluten-free'] = (dietaryCounts['Gluten-free'] || 0) + 1;
      }
      if (req.includes('lactose') || req.includes('laktóz')) {
        dietaryCounts['Lactose-free'] = (dietaryCounts['Lactose-free'] || 0) + 1;
      }
    });

    // 7. Time-based trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRegistrations = await prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM guests
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const dailyPayments = await prisma.$queryRaw<
      { date: string; count: bigint; total: number }[]
    >`
      SELECT DATE(paid_at) as date, COUNT(*) as count, SUM(amount) as total
      FROM payments
      WHERE paid_at >= ${thirtyDaysAgo} AND payment_status = 'paid'
      GROUP BY DATE(paid_at)
      ORDER BY date ASC
    `;

    // 8. Days until event
    const eventDate = new Date(process.env.EVENT_DATE || '2026-03-27');
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Build response
    return NextResponse.json({
      registration: {
        total: totalGuests,
        byStatus: {
          invited: invitedCount,
          registered: registeredCount,
          approved: approvedCount,
          declined: declinedCount,
        },
        byType: {
          vip: vipCount,
          paying_single: singleCount,
          paying_paired: pairedCount,
        },
        registrationRate: Math.round(registrationRate * 10) / 10,
      },
      payments: {
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        byStatus: {
          paid: paidCount,
          pending: pendingCount,
          failed: failedCount,
        },
        byMethod: {
          card: cardPayments,
          bank_transfer: bankTransfers,
        },
      },
      seating: {
        totalTables,
        totalCapacity: totalCapacity._sum.capacity || 0,
        totalAssigned: totalAssignments,
        unassignedGuests,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        byTableType: tablesByType.map((t) => ({
          type: t.type,
          count: t._count,
          capacity: t._sum.capacity || 0,
          occupied: Number(assignmentsByTableType.find((a) => a.type === t.type)?.occupied || 0),
        })),
      },
      checkins: {
        total: totalCheckins,
        checkinRate: Math.round(checkinRate * 10) / 10,
        overrides: overrideCheckins,
        byStaff: checkinsByStaff.map((s) => ({
          staff_id: s.staff_user_id,
          count: s._count,
        })),
      },
      emails: {
        total: totalEmailsSent,
        successful: successfulEmails,
        deliveryRate: Math.round(emailDeliveryRate * 10) / 10,
        byType: emailStats.map((s) => ({
          type: s.email_type,
          status: s.status,
          count: s._count,
        })),
      },
      dietary: dietaryCounts,
      trends: {
        dailyRegistrations: dailyRegistrations.map((d) => ({
          date: d.date,
          count: Number(d.count),
        })),
        dailyPayments: dailyPayments.map((d) => ({
          date: d.date,
          count: Number(d.count),
          total: d.total,
        })),
      },
      event: {
        date: eventDate.toISOString(),
        daysUntil: daysUntilEvent,
      },
    });
  } catch (error) {
    logError('[STATISTICS-API]', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
