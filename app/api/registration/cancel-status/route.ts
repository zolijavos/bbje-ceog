import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyPWASession } from '@/lib/services/pwa-auth';
import { EVENT_CONFIG } from '@/lib/config/event';

const CANCELLATION_DEADLINE_DAYS = 7;

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pwa_session');
  return sessionCookie?.value ? verifyPWASession(sessionCookie.value) : null;
}

/**
 * GET /api/registration/cancel-status
 * Check if the guest can cancel their registration
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const now = new Date();
    const eventDate = new Date(EVENT_CONFIG.date);

    // Calculate deadline (7 days before event)
    const deadline = new Date(eventDate);
    deadline.setDate(deadline.getDate() - CANCELLATION_DEADLINE_DAYS);

    // Calculate days until deadline
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const alreadyCancelled = registration.cancelled_at !== null;
    const eventPassed = now > eventDate;
    const deadlinePassed = now > deadline;

    const canCancel = !alreadyCancelled && !eventPassed && !deadlinePassed;

    return NextResponse.json({
      canCancel,
      alreadyCancelled,
      eventPassed,
      deadlinePassed,
      daysUntilDeadline: Math.max(0, daysUntilDeadline),
      cancelledAt: registration.cancelled_at?.toISOString() || null,
    });

  } catch (error) {
    console.error('Cancel status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check cancellation status' },
      { status: 500 }
    );
  }
}
