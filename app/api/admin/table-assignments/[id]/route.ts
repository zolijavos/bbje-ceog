/**
 * Admin Single Table Assignment API
 *
 * PATCH /api/admin/table-assignments/:id - Move assignment to different table
 * DELETE /api/admin/table-assignments/:id - Remove assignment
 *
 * Story 4.2: Manual Guest-to-Table Assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody, parseIdParam, errorResponse, type RouteContext } from '@/lib/api';
import { removeGuestFromTable, moveGuestToTable } from '@/lib/services/seating';
import { z } from 'zod';

// Move validation schema
const moveSchema = z.object({
  tableId: z.number().int().positive(),
});

/**
 * PATCH - Move guest to a different table
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    const validation = await validateBody(request, moveSchema);
    if (!validation.success) return validation.response;

    const result = await moveGuestToTable(
      idResult.id,
      validation.data.tableId,
      undefined, // seatNumber - auto-assign
      auth.session.user.id // Track who made the move
    );

    return NextResponse.json({
      success: true,
      assignment: result,
    });
  } catch (error) {
    console.error('Move assignment API error:', error);

    if (error instanceof Error) {
      const errorMessages: Record<string, string> = {
        ASSIGNMENT_NOT_FOUND: 'Hozzárendelés nem található',
        TABLE_NOT_FOUND: 'Asztal nem található',
        TABLE_FULL: 'Az asztal megtelt',
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

/**
 * DELETE - Remove guest from table
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    await removeGuestFromTable(idResult.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete assignment API error:', error);

    if (error instanceof Error && error.message === 'ASSIGNMENT_NOT_FOUND') {
      return errorResponse('ASSIGNMENT_NOT_FOUND', 'Hozzárendelés nem található');
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
