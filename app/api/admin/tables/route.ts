/**
 * Admin Tables API
 *
 * GET /api/admin/tables - List all tables
 * POST /api/admin/tables - Create a new table
 *
 * Story 4.1: Table CRUD Operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody, errorResponse } from '@/lib/api';
import { getAllTables, createTable } from '@/lib/services/seating';
import { z } from 'zod';

// Create table validation schema
const createTableSchema = z.object({
  name: z.string().min(1, 'Név megadása kötelező').max(100, 'Név max 100 karakter'),
  capacity: z.number().int().min(1, 'Kapacitás min 1').max(20, 'Kapacitás max 20'),
  type: z.enum(['standard', 'vip', 'reserved']).optional().default('standard'),
  pos_x: z.number().int().optional(),
  pos_y: z.number().int().optional(),
});

export async function GET() {
  try {
    // Verify admin authentication
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    const tables = await getAllTables();
    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error('Tables list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    // Parse and validate request body
    const validation = await validateBody(request, createTableSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, capacity, type, pos_x, pos_y } = validation.data;
    const table = await createTable({ name, capacity, type, pos_x, pos_y });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error) {
    console.error('Create table API error:', error);

    if (error instanceof Error && error.message === 'TABLE_NAME_EXISTS') {
      return errorResponse('TABLE_NAME_EXISTS', 'Ilyen nevű asztal már létezik');
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
