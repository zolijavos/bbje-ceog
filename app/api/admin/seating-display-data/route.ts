/**
 * Seating Display Data API
 *
 * GET /api/admin/seating-display-data
 *
 * Returns all tables with assigned guests and check-in stats
 * for the large-screen seating display. Admin-only.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tables = await prisma.table.findMany({
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          include: {
            guest: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                registration_status: true,
              },
            },
          },
        },
      },
    });

    let totalAssigned = 0;
    let checkedIn = 0;

    const tableData = tables.map((table) => {
      const guests = table.assignments.map((a) => {
        totalAssigned++;
        const isCheckedIn = a.guest.registration_status === 'checked_in';
        if (isCheckedIn) checkedIn++;
        return {
          id: a.guest.id,
          firstName: a.guest.first_name,
          lastName: a.guest.last_name,
          checkedIn: isCheckedIn,
        };
      });
      return {
        id: table.id,
        name: table.name,
        guests,
      };
    });

    return NextResponse.json({
      tables: tableData,
      checkinStats: { checkedIn, total: totalAssigned },
    });
  } catch (error) {
    logError('[SEATING-DISPLAY-DATA] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
