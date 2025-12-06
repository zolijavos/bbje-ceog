import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { verifyPWASession } from '@/lib/services/pwa-auth';
import { logError } from '@/lib/utils/logger';

// Helper to get session from cookie
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pwa_session');
  return sessionCookie?.value ? verifyPWASession(sessionCookie.value) : null;
}

// Push token schema
const pushTokenSchema = z.object({
  token: z.string().min(1).max(500),
});

// POST /api/pwa/push - Register FCM push token
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = pushTokenSchema.parse(body);

    // Save push token to guest record
    await prisma.guest.update({
      where: { id: session.guestId },
      data: { push_token: token },
    });

    return NextResponse.json({
      success: true,
      message: 'Push token registered',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid token format', details: error.errors },
        { status: 400 }
      );
    }

    logError('Push token registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}

// DELETE /api/pwa/push - Remove push token (unsubscribe)
export async function DELETE() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove push token from guest record
    await prisma.guest.update({
      where: { id: session.guestId },
      data: { push_token: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Push token removed',
    });
  } catch (error) {
    logError('Push token removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove push token' },
      { status: 500 }
    );
  }
}
