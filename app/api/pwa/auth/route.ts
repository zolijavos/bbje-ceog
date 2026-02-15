import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { logError } from '@/lib/utils/logger';

const PWA_SESSION_SECRET = process.env.APP_SECRET;
if (!PWA_SESSION_SECRET) {
  throw new Error('APP_SECRET environment variable is required for PWA authentication');
}

const QR_SECRET = process.env.QR_SECRET;
if (!QR_SECRET) {
  throw new Error('QR_SECRET environment variable is required for PWA authentication');
}

const PWA_SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds (reduced from 30 for security)

interface PWASessionPayload {
  guestId: number;
  registrationId: number;
  email: string;
  iat: number;
  exp: number;
}

// POST /api/pwa/auth - Login with QR token or code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, code } = body;

    let guestId: number | null = null;
    let registrationId: number | null = null;
    let email: string | null = null;

    // Auth via QR token (JWT from e-ticket)
    if (token) {
      try {
        const decoded = jwt.verify(token, QR_SECRET) as {
          registration_id: number;
          guest_id: number;
          ticket_type: string;
        };

        guestId = decoded.guest_id;
        registrationId = decoded.registration_id;

        // Verify registration exists and is valid
        const registration = await prisma.registration.findUnique({
          where: { id: registrationId },
          include: { guest: true },
        });

        if (!registration || registration.guest_id !== guestId) {
          return NextResponse.json(
            { success: false, error: 'Érvénytelen jegy' },
            { status: 401 }
          );
        }

        // Verify registration status is valid for PWA access
        if (!['registered', 'approved'].includes(registration.guest.registration_status)) {
          return NextResponse.json(
            { success: false, error: 'Registration is not active' },
            { status: 401 }
          );
        }

        email = registration.guest.email;
      } catch (jwtError) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired QR code' },
          { status: 401 }
        );
      }
    }
    // Auth via registration code
    else if (code) {
      const normalizedCode = code.toUpperCase().trim();

      // Find guest by pwa_auth_code
      const guest = await prisma.guest.findFirst({
        where: { pwa_auth_code: normalizedCode },
        include: {
          registration: true,
        },
      });

      if (!guest) {
        return NextResponse.json(
          { success: false, error: 'Érvénytelen kód' },
          { status: 401 }
        );
      }

      if (!guest.registration || !['registered', 'approved'].includes(guest.registration_status)) {
        return NextResponse.json(
          { success: false, error: 'Nincs aktív regisztráció ehhez a kódhoz' },
          { status: 401 }
        );
      }

      guestId = guest.id;
      registrationId = guest.registration.id;
      email = guest.email;
    } else {
      return NextResponse.json(
        { success: false, error: 'Token vagy kód megadása kötelező' },
        { status: 400 }
      );
    }

    // Create PWA session token
    const sessionToken = jwt.sign(
      {
        guestId,
        registrationId,
        email,
      },
      PWA_SESSION_SECRET,
      { expiresIn: PWA_SESSION_EXPIRY }
    );

    // Set session cookie
    // Only use Secure flag if actually on HTTPS (check X-Forwarded-Proto header)
    const isHttps = request.headers.get('x-forwarded-proto') === 'https' ||
                    request.url.startsWith('https://');

    const cookieStore = await cookies();
    cookieStore.set('pwa_session', sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: PWA_SESSION_EXPIRY,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      guest: {
        id: guestId,
        email,
      },
    });
  } catch (error) {
    logError('PWA auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Belépési hiba' },
      { status: 500 }
    );
  }
}

// DELETE /api/pwa/auth - Logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('pwa_session');

  return NextResponse.json({ success: true });
}
