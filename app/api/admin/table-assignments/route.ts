/**
 * Admin Table Assignments API
 *
 * GET /api/admin/table-assignments - List all assignments
 * POST /api/admin/table-assignments - Assign guest to table
 *
 * Story 4.2: Manual Guest-to-Table Assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody, errorResponse } from '@/lib/api';
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
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const unassignedOnly = searchParams.get('unassigned') === 'true';

    if (unassignedOnly) {
      const guests = await getUnassignedGuests();
      return NextResponse.json({ success: true, guests });
    }

    const assignments = await getAllAssignments();
    return NextResponse.json({ success: true, assignments });
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
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const validation = await validateBody(request, assignmentSchema);
    if (!validation.success) return validation.response;

    const { guestId, tableId, seatNumber } = validation.data;
    const assignment = await assignGuestToTable(
      guestId,
      tableId,
      seatNumber,
      auth.session.user.id
    );

    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error) {
    console.error('Create assignment API error:', error);

    if (error instanceof Error) {
      const errorMessages: Record<string, string> = {
        GUEST_NOT_FOUND: 'Vendég nem található',
        TABLE_NOT_FOUND: 'Asztal nem található',
        GUEST_ALREADY_ASSIGNED: 'Vendég már másik asztalhoz van rendelve',
        TABLE_FULL: 'Asztal megtelt',
        SEAT_TAKEN: 'Ez a szék már foglalt',
        INVALID_SEAT_NUMBER: 'Érvénytelen székszám',
      };

      if (errorMessages[error.message]) {
        return errorResponse(error.message, errorMessages[error.message]);
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
