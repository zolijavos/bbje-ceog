/**
 * Admin Guest API - Single Guest Operations
 *
 * GET /api/admin/guests/[id] - Get a single guest
 * PATCH /api/admin/guests/[id] - Update a guest
 * DELETE /api/admin/guests/[id] - Delete a guest
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody, parseIdParam, errorResponse, type RouteContext } from '@/lib/api';
import { getGuestById, updateGuest, deleteGuest } from '@/lib/services/guest';
import { createAuditLog } from '@/lib/services/audit';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

// Validation schema for updating a guest
const updateGuestSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  title: z.string().max(50).optional().nullable(),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  guest_type: z.enum(['vip', 'paying_single', 'paying_paired', 'applicant']).optional(),
  registration_status: z
    .enum(['pending', 'invited', 'registered', 'approved', 'declined', 'pending_approval', 'rejected'])
    .optional(),
  dietary_requirements: z.string().optional().nullable(),
  seating_preferences: z.string().optional().nullable(),
});

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    // Parse ID parameter
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }

    const guest = await getGuestById(idResult.id);

    if (!guest) {
      return errorResponse('GUEST_NOT_FOUND', 'Vendeg nem talalhato');
    }

    return NextResponse.json({
      success: true,
      guest,
    });
  } catch (error) {
    logError('Get guest error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    // Parse ID parameter
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }

    // Get old values for audit log
    const oldGuest = await getGuestById(idResult.id);

    // Parse and validate request body
    const validation = await validateBody(request, updateGuestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // Update guest
    const guest = await updateGuest(idResult.id, validation.data);

    // Log audit event
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'guest',
      entityId: guest.id,
      entityName: guest.name,
      oldValues: oldGuest ? {
        name: oldGuest.name,
        title: oldGuest.title,
        company: oldGuest.company,
        position: oldGuest.position,
        guest_type: oldGuest.guest_type,
        registration_status: oldGuest.registration_status,
      } : undefined,
      newValues: validation.data,
    });

    return NextResponse.json({
      success: true,
      guest,
      message: 'Vendeg adatai frissitve',
    });
  } catch (error) {
    logError('Update guest error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'GUEST_NOT_FOUND') {
      return errorResponse('GUEST_NOT_FOUND', 'Vendeg nem talalhato');
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
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    // Parse ID parameter
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }

    // Get guest info for audit log before deletion
    const guest = await getGuestById(idResult.id);

    // Delete guest
    await deleteGuest(idResult.id);

    // Log audit event
    if (guest) {
      await createAuditLog({
        action: 'DELETE',
        entityType: 'guest',
        entityId: idResult.id,
        entityName: guest.name,
        oldValues: {
          email: guest.email,
          name: guest.name,
          guest_type: guest.guest_type,
          registration_status: guest.registration_status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendeg torolve',
    });
  } catch (error) {
    logError('Delete guest error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'GUEST_NOT_FOUND') {
      return errorResponse('GUEST_NOT_FOUND', 'Vendeg nem talalhato');
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete guest' },
      { status: 500 }
    );
  }
}
