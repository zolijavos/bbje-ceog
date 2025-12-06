/**
 * Admin Move Guest API
 *
 * POST /api/admin/table-assignments/move - Move guest to different table
 *
 * Story 4.2: Manual Guest-to-Table Assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { moveGuestToTable } from '@/lib/services/seating';
import { z } from 'zod';

// Move validation schema
const moveSchema = z.object({
  guestId: z.number().int().positive(),
  tableId: z.number().int().positive(),
  seatNumber: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = moveSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { guestId, tableId, seatNumber } = validationResult.data;
    const assignment = await moveGuestToTable(
      guestId,
      tableId,
      seatNumber,
      session.user.id
    );

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Move guest API error:', error);

    if (error instanceof Error) {
      const errorMessages: Record<string, { message: string; status: number }> = {
        TABLE_NOT_FOUND: { message: 'Asztal nem található', status: 404 },
        TABLE_FULL: { message: 'Cél asztal megtelt', status: 400 },
        SEAT_TAKEN: { message: 'Szék már foglalt', status: 400 },
        INVALID_SEAT_NUMBER: { message: 'Érvénytelen székszám', status: 400 },
      };

      const errorInfo = errorMessages[error.message];
      if (errorInfo) {
        return NextResponse.json(
          { error: error.message, message: errorInfo.message },
          { status: errorInfo.status }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
