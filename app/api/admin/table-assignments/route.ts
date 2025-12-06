/**
 * Admin Table Assignments API
 *
 * GET /api/admin/table-assignments - List all assignments
 * POST /api/admin/table-assignments - Assign guest to table
 *
 * Story 4.2: Manual Guest-to-Table Assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getAllAssignments, assignGuestToTable, getUnassignedGuests } from '@/lib/services/seating';
import { z } from 'zod';

// Assignment validation schema
const assignmentSchema = z.object({
  guestId: z.number().int().positive(),
  tableId: z.number().int().positive(),
  seatNumber: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unassignedOnly = searchParams.get('unassigned') === 'true';

    if (unassignedOnly) {
      const guests = await getUnassignedGuests();
      return NextResponse.json({ guests });
    }

    const assignments = await getAllAssignments();
    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Table assignments list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validationResult = assignmentSchema.safeParse(body);

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
    const assignment = await assignGuestToTable(
      guestId,
      tableId,
      seatNumber,
      session.user.id
    );

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Create assignment API error:', error);

    if (error instanceof Error) {
      const errorMessages: Record<string, { message: string; status: number }> = {
        GUEST_NOT_FOUND: { message: 'Vendég nem található', status: 404 },
        TABLE_NOT_FOUND: { message: 'Asztal nem található', status: 404 },
        GUEST_ALREADY_ASSIGNED: { message: 'Vendég már másik asztalhoz van rendelve', status: 400 },
        TABLE_FULL: { message: 'Asztal megtelt', status: 400 },
        SEAT_TAKEN: { message: 'Ez a szék már foglalt', status: 400 },
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
