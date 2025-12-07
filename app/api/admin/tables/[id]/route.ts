/**
 * Admin Single Table API
 *
 * GET /api/admin/tables/:id - Get single table
 * PATCH /api/admin/tables/:id - Update table
 * DELETE /api/admin/tables/:id - Delete table
 *
 * Story 4.1: Table CRUD Operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody, parseIdParam, errorResponse, type RouteContext } from '@/lib/api';
import { getTable, updateTable, deleteTable } from '@/lib/services/seating';
import { z } from 'zod';

// Update table validation schema
const updateTableSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  type: z.enum(['standard', 'vip', 'reserved']).optional(),
  status: z.enum(['available', 'full', 'reserved']).optional(),
});

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    const table = await getTable(idResult.id);

    if (!table) {
      return errorResponse('TABLE_NOT_FOUND', 'Asztal nem található');
    }

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error('Get table API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    const validation = await validateBody(request, updateTableSchema);
    if (!validation.success) return validation.response;

    const table = await updateTable(idResult.id, validation.data);

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error('Update table API error:', error);

    if (error instanceof Error) {
      if (error.message === 'TABLE_NOT_FOUND') {
        return errorResponse('TABLE_NOT_FOUND', 'Asztal nem található');
      }
      if (error.message === 'TABLE_NAME_EXISTS') {
        return errorResponse('TABLE_NAME_EXISTS', 'Ilyen nevű asztal már létezik');
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    await deleteTable(idResult.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete table API error:', error);

    if (error instanceof Error) {
      if (error.message === 'TABLE_NOT_FOUND') {
        return errorResponse('TABLE_NOT_FOUND', 'Asztal nem található');
      }
      if (error.message === 'TABLE_NOT_EMPTY') {
        return errorResponse('TABLE_NOT_EMPTY', 'Asztal nem törölhető, vendégek vannak hozzárendelve');
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
