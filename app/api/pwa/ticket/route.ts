import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';
import { verifyPWASession } from '@/lib/services/pwa-auth';
import { EVENT_CONFIG } from '@/lib/config/event';
import { logError } from '@/lib/utils/logger';

// Helper to get session from cookie
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pwa_session');
  return sessionCookie?.value ? verifyPWASession(sessionCookie.value) : null;
}

// GET /api/pwa/ticket - Get ticket data with QR token
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch guest and registration data
    const guest = await prisma.guest.findUnique({
      where: { id: session.guestId },
      include: {
        registration: true,
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      );
    }

    const registration = guest.registration;

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Generate QR token if registration has ticket
    let qrToken: string | null = null;

    if (
      registration.qr_code_hash &&
      ['registered', 'approved'].includes(guest.registration_status)
    ) {
      // Generate fresh JWT token for QR code
      // This is the same token that would be in the e-ticket email
      const expiryTimestamp = Math.floor(EVENT_CONFIG.ticketExpiry.getTime() / 1000);
      const nowTimestamp = Math.floor(Date.now() / 1000);
      const expiresInSeconds = expiryTimestamp - nowTimestamp;

      // Only generate token if event hasn't passed yet
      if (expiresInSeconds > 0) {
        const qrSecret = process.env.QR_SECRET;
        if (!qrSecret) {
          logError('QR_SECRET not configured');
          return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
          );
        }

        qrToken = jwt.sign(
          {
            registration_id: registration.id,
            guest_id: guest.id,
            ticket_type: registration.ticket_type,
          },
          qrSecret,
          {
            expiresIn: expiresInSeconds,
          }
        );
      }
      // If event has passed, qrToken remains null - ticket is expired
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        guest_type: guest.guest_type,
      },
      registration: {
        id: registration.id,
        ticket_type: registration.ticket_type,
        qr_code_hash: registration.qr_code_hash,
      },
      qrToken,
    });
  } catch (error) {
    logError('Ticket fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}
