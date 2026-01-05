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
  guest_type: z.enum(['vip', 'paying_single', 'paying_paired', 'applicant']),
  title: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  dietary_requirements: z.string().nullable().optional(),
  seating_preferences: z.string().nullable().optional(),
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

    // Validate guest type
    let type: GuestType | 'all' = 'all';
    if (typeParam !== 'all') {
      if (['vip', 'paying_single', 'paying_paired'].includes(typeParam)) {
        type = typeParam as GuestType;
      }
    }

    // Validate registration status
    let status: RegistrationStatus | 'all' = 'all';
    if (statusParam !== 'all') {
      if (['invited', 'registered', 'approved', 'declined'].includes(statusParam)) {
        status = statusParam as RegistrationStatus;
      }
    }

    // Get guest list
    const result = await getGuestList({
      page,
      limit: Math.min(limit, 100), // Max 100 per page
      search,
      type,
      status,
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
