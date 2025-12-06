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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getTable, updateTable, deleteTable } from '@/lib/services/seating';
import { z } from 'zod';

// Update table validation schema
const updateTableSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  type: z.enum(['standard', 'vip', 'reserved']).optional(),
  status: z.enum(['available', 'full', 'reserved']).optional(),
});

export async function GET(
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

    const table = await getTable(tableId);

    if (!table) {
      return NextResponse.json(
        { error: 'TABLE_NOT_FOUND', message: 'Asztal nem található' },
        { status: 404 }
      );
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Get table API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validationResult = updateTableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const table = await updateTable(tableId, validationResult.data);

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Update table API error:', error);

    if (error instanceof Error) {
      if (error.message === 'TABLE_NOT_FOUND') {
        return NextResponse.json(
          { error: 'TABLE_NOT_FOUND', message: 'Asztal nem található' },
          { status: 404 }
        );
      }
      if (error.message === 'TABLE_NAME_EXISTS') {
        return NextResponse.json(
          { error: 'TABLE_NAME_EXISTS', message: 'Ilyen nevű asztal már létezik' },
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
    const tableId = parseInt(id, 10);

    if (isNaN(tableId)) {
      return NextResponse.json(
        { error: 'Invalid table ID' },
        { status: 400 }
      );
    }

    await deleteTable(tableId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete table API error:', error);

    if (error instanceof Error) {
      if (error.message === 'TABLE_NOT_FOUND') {
        return NextResponse.json(
          { error: 'TABLE_NOT_FOUND', message: 'Asztal nem található' },
          { status: 404 }
        );
      }
      if (error.message === 'TABLE_NOT_EMPTY') {
        return NextResponse.json(
          { error: 'TABLE_NOT_EMPTY', message: 'Asztal nem törölhető, vendégek vannak hozzárendelve' },
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
