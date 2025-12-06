/**
 * Admin Table Position API
 *
 * PATCH /api/admin/tables/:id/position - Update table position (drag-drop)
 *
 * Story 4.4: Interactive Drag-and-Drop Seating Map
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { updateTablePosition } from '@/lib/services/seating';
import { z } from 'zod';

// Position update validation schema (accepts floats for meters, stores as scaled int)
const positionSchema = z.object({
  pos_x: z.number().min(0).max(1000),
  pos_y: z.number().min(0).max(1000),
});

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
    const tableId = parseInt(id, 10);

    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = positionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { pos_x, pos_y } = validationResult.data;
    const table = await updateTablePosition(tableId, pos_x, pos_y);

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Update table position API error:', error);

    if (error instanceof Error) {
      if (error.message === 'TABLE_NOT_FOUND') {
        return NextResponse.json(
          { error: 'TABLE_NOT_FOUND', message: 'Asztal nem található' },
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
