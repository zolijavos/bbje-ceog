/**
 * Admin Guest List API
 *
 * GET /api/admin/guests - Get paginated and filtered guest list
 * POST /api/admin/guests - Create a new guest
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getGuestList, getGuestStats, createGuest } from '@/lib/services/guest';
import { GuestType, RegistrationStatus } from '@prisma/client';
import { z } from 'zod';

// Validation schema for creating a guest
const createGuestSchema = z.object({
  email: z.string().email('Ervenytelen email cim'),
  name: z.string().min(1, 'A nev megadasa kotelezo'),
  guest_type: z.enum(['vip', 'paying_single', 'paying_paired']),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
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
    console.error('Guest list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createGuestSchema.safeParse(body);

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

    // Create guest - data is validated, so we can safely cast
    const guest = await createGuest({
      email: validationResult.data.email,
      name: validationResult.data.name,
      guest_type: validationResult.data.guest_type,
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
    console.error('Create guest error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        { success: false, error: 'Ez az email cim mar letezik' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create guest' },
      { status: 500 }
    );
  }
}
