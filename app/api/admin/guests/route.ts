/**
 * Admin Guest List API
 *
 * GET /api/admin/guests - Get paginated and filtered guest list
 * POST /api/admin/guests - Create a new guest
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody, errorResponse } from '@/lib/api';
import { getGuestList, getGuestStats, createGuest } from '@/lib/services/guest';
import { createAuditLog } from '@/lib/services/audit';
import { logError } from '@/lib/utils/logger';
import { GuestType, RegistrationStatus } from '@prisma/client';
import { z } from 'zod';

// Validation schema for creating a guest
const createGuestSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  guest_type: z.enum(['vip', 'invited', 'paying_single', 'paying_paired', 'applicant']),
  title: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  dietary_requirements: z.string().nullable().optional(),
  seating_preferences: z.string().nullable().optional(),
  is_vip_reception: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const search = searchParams.get('search') || '';
    const typeParam = searchParams.get('type') || 'all';
    const statusParam = searchParams.get('status') || 'all';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Support array filters (comma-separated)
    const guestTypesParam = searchParams.get('guest_types');
    const registrationStatusesParam = searchParams.get('registration_statuses');
    const isVipReceptionParam = searchParams.get('is_vip_reception');
    const hasTicketParam = searchParams.get('has_ticket');
    const hasTableParam = searchParams.get('has_table');

    // Parse array filters
    const validGuestTypes = ['vip', 'invited', 'paying_single', 'paying_paired', 'applicant'];
    const validStatuses = ['invited', 'registered', 'approved', 'declined', 'pending', 'pending_approval', 'rejected', 'cancelled', 'checked_in'];

    let guestTypes: GuestType[] | undefined;
    if (guestTypesParam) {
      guestTypes = guestTypesParam.split(',').filter(t => validGuestTypes.includes(t)) as GuestType[];
      if (guestTypes.length === 0) guestTypes = undefined;
    }

    let registrationStatuses: RegistrationStatus[] | undefined;
    if (registrationStatusesParam) {
      registrationStatuses = registrationStatusesParam.split(',').filter(s => validStatuses.includes(s)) as RegistrationStatus[];
      if (registrationStatuses.length === 0) registrationStatuses = undefined;
    }

    // Parse boolean filters
    const isVipReception = isVipReceptionParam === 'true' ? true : isVipReceptionParam === 'false' ? false : undefined;
    const hasTicket = hasTicketParam === 'true' ? true : hasTicketParam === 'false' ? false : undefined;
    const hasTable = hasTableParam === 'true' ? true : hasTableParam === 'false' ? false : undefined;

    // Special filter: not checked in (approved but no checkin record)
    const notCheckedIn = statusParam === 'not_checked_in';

    // Validate single guest type (legacy support)
    let type: GuestType | 'all' = 'all';
    if (typeParam !== 'all' && !guestTypes) {
      if (validGuestTypes.includes(typeParam)) {
        type = typeParam as GuestType;
      }
    }

    // Validate single registration status (legacy support)
    let status: RegistrationStatus | 'all' = 'all';
    if (statusParam !== 'all' && !registrationStatuses && !notCheckedIn) {
      if (validStatuses.includes(statusParam)) {
        status = statusParam as RegistrationStatus;
      }
    }

    // Get guest list
    const result = await getGuestList({
      page,
      limit: Math.min(limit, 500), // Max 500 per page for bulk operations
      search,
      type,
      status,
      guestTypes,
      registrationStatuses,
      isVipReception,
      hasTicket,
      hasTable,
      notCheckedIn,
    });

    // Optionally include stats
    let stats = null;
    if (includeStats) {
      stats = await getGuestStats();
    }

    return NextResponse.json({
      success: true,
      ...result,
      stats,
    });
  } catch (error) {
    logError('Guest list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.success) {
      return auth.response;
    }

    // Parse and validate request body
    const validation = await validateBody(request, createGuestSchema);
    if (!validation.success) {
      return validation.response;
    }

    // Create guest - data is validated
    const guest = await createGuest({
      email: validation.data.email,
      name: validation.data.name,
      guest_type: validation.data.guest_type,
      title: validation.data.title || null,
      phone: validation.data.phone || null,
      company: validation.data.company || null,
      position: validation.data.position || null,
      dietary_requirements: validation.data.dietary_requirements || null,
      seating_preferences: validation.data.seating_preferences || null,
    });

    // Log audit event
    await createAuditLog({
      action: 'CREATE',
      entityType: 'guest',
      entityId: guest.id,
      entityName: guest.name,
      newValues: {
        email: guest.email,
        name: guest.name,
        guest_type: guest.guest_type,
        company: guest.company,
        position: guest.position,
      },
    });

    return NextResponse.json(
      {
        success: true,
        guest,
        message: 'Vendeg sikeresen hozzaadva',
      },
      { status: 201 }
    );
  } catch (error) {
    logError('Create guest error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return errorResponse('EMAIL_EXISTS', 'Ez az email cim mar letezik');
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create guest' },
      { status: 500 }
    );
  }
}
