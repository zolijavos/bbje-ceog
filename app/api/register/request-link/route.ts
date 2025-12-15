/**
 * Request Magic Link API
 *
 * POST /api/register/request-link
 *
 * Sends a new magic link email to a guest.
 * Used when a guest's link has expired or they need a new one.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendMagicLinkEmail } from '@/lib/services/email';
import { logError } from '@/lib/utils/logger';

interface RequestLinkBody {
  email: string;
  reason?: 'expired' | 'resend';
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestLinkBody = await request.json();
    const { email, reason } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email cím megadása kötelező' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Érvénytelen email formátum' },
        { status: 400 }
      );
    }

    // Find guest by email with magic link expiry info for server-side verification
    const guest = await prisma.guest.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        magic_link_expires_at: true,
      },
    });

    if (!guest) {
      // Don't reveal whether email exists (security)
      // But return success with a generic message
      return NextResponse.json({
        success: true,
        message: 'Ha az email cím szerepel a vendéglistán, hamarosan megérkezik az új meghívó.',
      });
    }

    // SECURITY FIX: Only bypass rate limit if the link is ACTUALLY expired
    // Server-side verification prevents clients from faking 'expired' reason
    const isActuallyExpired = guest.magic_link_expires_at
      ? new Date() > guest.magic_link_expires_at
      : false;

    const shouldBypassRateLimit = reason === 'expired' && isActuallyExpired;

    // Send magic link with verified rate limit bypass
    const result = await sendMagicLinkEmail(guest.id, {
      bypassRateLimit: shouldBypassRateLimit,
    });

    if (!result.success) {
      // Check if it's a rate limit error
      if (result.error?.includes('Rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Túl sok kérés. Kérjük, várjon egy órát az újabb próbálkozás előtt.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, error: result.error || 'Email küldési hiba' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ha az email cím szerepel a vendéglistán, hamarosan megérkezik az új meghívó.',
    });
  } catch (error) {
    logError('[REQUEST-LINK]', error);

    return NextResponse.json(
      { success: false, error: 'Szerverhiba történt' },
      { status: 500 }
    );
  }
}
