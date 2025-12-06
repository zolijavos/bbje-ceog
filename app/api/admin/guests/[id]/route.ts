/**
 * Admin Guest API - Single Guest Operations
 *
 * GET /api/admin/guests/[id] - Get a single guest
 * PATCH /api/admin/guests/[id] - Update a guest
 * DELETE /api/admin/guests/[id] - Delete a guest
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getGuestById, updateGuest, deleteGuest } from '@/lib/services/guest';
import { z } from 'zod';

// Validation schema for updating a guest
const updateGuestSchema = z.object({
  name: z.string().min(1, 'A nev megadasa kotelezo').optional(),
  title: z.string().max(50).optional().nullable(),
  guest_type: z.enum(['vip', 'paying_single', 'paying_paired']).optional(),
  registration_status: z
    .enum(['invited', 'registered', 'approved', 'declined'])
    .optional(),
  dietary_requirements: z.string().optional().nullable(),
  seating_preferences: z.string().optional().nullable(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guest ID' },
        { status: 400 }
      );
    }

    const guest = await getGuestById(id);

    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Vendeg nem talalhato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guest,
    });
  } catch (error) {
    console.error('Get guest error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guest ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateGuestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Update guest
    const guest = await updateGuest(id, validationResult.data);

    return NextResponse.json({
      success: true,
      guest,
      message: 'Vendeg adatai frissitve',
    });
  } catch (error) {
    console.error('Update guest error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'GUEST_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Vendeg nem talalhato' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update guest' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guest ID' },
        { status: 400 }
      );
    }

    // Delete guest
    await deleteGuest(id);

    return NextResponse.json({
      success: true,
      message: 'Vendeg torolve',
    });
  } catch (error) {
    console.error('Delete guest error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'GUEST_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Vendeg nem talalhato' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete guest' },
      { status: 500 }
    );
  }
}
