/**
 * Admin Table Position API
 *
 * PATCH /api/admin/tables/:id/position - Update table position (drag-drop)
 *
 * Story 4.4: Interactive Drag-and-Drop Seating Map
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, parseIdParam, validateBody, errorResponse, type RouteContext } from '@/lib/api';
import { updateTablePosition } from '@/lib/services/seating';
import { z } from 'zod';

// Position update validation schema (accepts floats for meters, stores as scaled int)
const positionSchema = z.object({
  pos_x: z.number().min(0).max(1000),
  pos_y: z.number().min(0).max(1000),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;
    const tableId = idResult.id;

    const validation = await validateBody(request, positionSchema);
    if (!validation.success) return validation.response;

    const { pos_x, pos_y } = validation.data;
    const table = await updateTablePosition(tableId, pos_x, pos_y);

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Update table position API error:', error);

    if (error instanceof Error && error.message === 'TABLE_NOT_FOUND') {
      return errorResponse('TABLE_NOT_FOUND', 'Asztal nem található');
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
