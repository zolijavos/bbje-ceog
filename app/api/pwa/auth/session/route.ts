import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { verifyPWASession } from '@/lib/services/pwa-auth';

// GET /api/pwa/auth/session - Check current session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('pwa_session');
    const session = sessionCookie?.value ? verifyPWASession(sessionCookie.value) : null;

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    // Fetch fresh guest data
    const guest = await prisma.guest.findUnique({
      where: { id: session.guestId },
      select: {
        id: true,
        email: true,
        name: true,
        guest_type: true,
        phone: true,
        company: true,
        position: true,
      },
    });

    if (!guest) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      guest,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
