/**
 * Admin Tables API
 *
 * GET /api/admin/tables - List all tables
 * POST /api/admin/tables - Create a new table
 *
 * Story 4.1: Table CRUD Operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tables = await getAllTables();
    return NextResponse.json({ tables });
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createTableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, capacity, type, pos_x, pos_y } = validationResult.data;
    const table = await createTable({ name, capacity, type, pos_x, pos_y });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error('Create table API error:', error);

    if (error instanceof Error) {
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
