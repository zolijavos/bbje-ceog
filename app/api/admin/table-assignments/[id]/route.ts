/**
 * Admin Single Table Assignment API
 *
 * PATCH /api/admin/table-assignments/:id - Move assignment to different table
 * DELETE /api/admin/table-assignments/:id - Remove assignment
 *
 * Story 4.2: Manual Guest-to-Table Assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { removeGuestFromTable, moveGuestToTable } from '@/lib/services/seating';

/**
 * PATCH - Move guest to a different table
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const assignmentId = parseInt(id, 10);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tableId } = body;

    if (!tableId || typeof tableId !== 'number') {
      return NextResponse.json(
        { error: 'tableId is required and must be a number' },
        { status: 400 }
      );
    }

    const result = await moveGuestToTable(assignmentId, tableId);

    return NextResponse.json({
      success: true,
      assignment: result,
    });
  } catch (error) {
    console.error('Move assignment API error:', error);

    if (error instanceof Error) {
      if (error.message === 'ASSIGNMENT_NOT_FOUND') {
        return NextResponse.json(
          { error: 'ASSIGNMENT_NOT_FOUND', message: 'Hozzárendelés nem található' },
          { status: 404 }
        );
      }
      if (error.message === 'TABLE_NOT_FOUND') {
        return NextResponse.json(
          { error: 'TABLE_NOT_FOUND', message: 'Asztal nem található' },
          { status: 404 }
        );
      }
      if (error.message === 'TABLE_FULL') {
        return NextResponse.json(
          { error: 'TABLE_FULL', message: 'Az asztal megtelt' },
          { status: 400 }
        );
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const assignmentId = parseInt(id, 10);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    await removeGuestFromTable(assignmentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete assignment API error:', error);

    if (error instanceof Error) {
      if (error.message === 'ASSIGNMENT_NOT_FOUND') {
        return NextResponse.json(
          { error: 'ASSIGNMENT_NOT_FOUND', message: 'Hozzárendelés nem található' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
