import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { verifyPWASession } from '@/lib/services/pwa-auth';

// Helper to get session from cookie
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pwa_session');
  return sessionCookie?.value ? verifyPWASession(sessionCookie.value) : null;
}

// GET /api/pwa/profile - Get guest profile with registration and table data
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch complete guest data
    const guest = await prisma.guest.findUnique({
      where: { id: session.guestId },
      include: {
        registration: true,
        table_assignment: {
          include: {
            table: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    const registration = guest.registration;
    const tableAssignment = guest.table_assignment;

    return NextResponse.json({
      guest: {
        id: guest.id,
        email: guest.email,
        name: guest.name,
        guest_type: guest.guest_type,
        phone: guest.phone,
        company: guest.company,
        position: guest.position,
      },
      registration: registration
        ? {
            id: registration.id,
            ticket_type: registration.ticket_type,
            status: guest.registration_status,
            qr_code_hash: registration.qr_code_hash,
            partner_name: registration.partner_name,
            partner_email: registration.partner_email,
          }
        : null,
      table: tableAssignment
        ? {
            id: tableAssignment.table.id,
            name: tableAssignment.table.name,
            table_type: tableAssignment.table.type,
            seat_number: tableAssignment.seat_number,
          }
        : null,
      dietary_requirements: guest.dietary_requirements || null,
      seating_preferences: guest.seating_preferences || null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Profile update schema
const profileUpdateSchema = z.object({
  phone: z.string().max(20).optional(),
  company: z.string().max(255).optional(),
  position: z.string().max(255).optional(),
  dietary_requirements: z.string().max(500).optional(),
  seating_preferences: z.string().max(500).optional(),
});

// PATCH /api/pwa/profile - Update guest profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Build guest update data
    const guestFields: Record<string, string | undefined> = {};

    if (validatedData.phone !== undefined) {
      guestFields.phone = validatedData.phone;
    }
    if (validatedData.company !== undefined) {
      guestFields.company = validatedData.company;
    }
    if (validatedData.position !== undefined) {
      guestFields.position = validatedData.position;
    }
    if (validatedData.dietary_requirements !== undefined) {
      guestFields.dietary_requirements = validatedData.dietary_requirements;
    }
    if (validatedData.seating_preferences !== undefined) {
      guestFields.seating_preferences = validatedData.seating_preferences;
    }

    // Update guest
    if (Object.keys(guestFields).length > 0) {
      await prisma.guest.update({
        where: { id: session.guestId },
        data: guestFields,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
