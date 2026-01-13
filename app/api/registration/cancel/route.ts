import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { verifyPWASession } from '@/lib/services/pwa-auth';
import { EVENT_CONFIG } from '@/lib/config/event';
import { checkRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit';

const CANCELLATION_DEADLINE_DAYS = 7;

const cancelSchema = z.object({
  reason: z.string().max(500).nullable().optional(),
});

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pwa_session');
  return sessionCookie?.value ? verifyPWASession(sessionCookie.value) : null;
}

/**
 * POST /api/registration/cancel
 * Cancel guest registration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit check - prevent abuse (3 attempts per hour per guest)
    const rateLimitKey = `cancel:${session.guestId}`;
    const rateLimit = await checkRateLimit(rateLimitKey, RATE_LIMITS.CANCEL);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many cancellation attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const guest = await prisma.guest.findUnique({
      where: { id: session.guestId },
      include: {
        registration: true,
      },
    });

    if (!guest || !guest.registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = guest.registration;

    // Check if already cancelled
    if (registration.cancelled_at) {
      return NextResponse.json(
        { error: 'Registration is already cancelled' },
        { status: 400 }
      );
    }

    const now = new Date();
    const eventDate = new Date(EVENT_CONFIG.date);

    // Check if event has passed
    if (now > eventDate) {
      return NextResponse.json(
        { error: 'Event has already passed' },
        { status: 400 }
      );
    }

    // Check if within cancellation deadline (7 days before at midnight)
    const deadline = new Date(eventDate);
    deadline.setDate(deadline.getDate() - CANCELLATION_DEADLINE_DAYS);
    deadline.setHours(0, 0, 0, 0); // Set to midnight for clear cutoff

    if (now >= deadline) {
      return NextResponse.json(
        { error: 'Cancellation deadline has passed (7 days before event)' },
        { status: 400 }
      );
    }

    // Parse body
    const body = await request.json();
    const { reason } = cancelSchema.parse(body);

    // Use transaction to ensure both updates succeed or fail together
    await prisma.$transaction([
      prisma.registration.update({
        where: { id: registration.id },
        data: {
          cancelled_at: now,
          cancellation_reason: reason || null,
        },
      }),
      prisma.guest.update({
        where: { id: guest.id },
        data: {
          registration_status: 'cancelled',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}
