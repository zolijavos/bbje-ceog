/**
 * Guest Registration Status API
 *
 * GET /api/registration/status?code={magic_link_hash}&email={email}
 *
 * Returns guest registration, payment, and ticket status
 * Story 2.6: Payment Status Dashboard for Guests
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateMagicLink } from '@/lib/auth/magic-link';
import { getGuestStatus } from '@/lib/services/registration';
import { generateTicket } from '@/lib/services/qr-ticket';
import { logError } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    // Validate required parameters
    if (!code || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hiányzó paraméterek: code és email szükséges',
        },
        { status: 400 }
      );
    }

    // Validate magic link
    const validationResult = await validateMagicLink(code, email);

    if (!validationResult.valid || !validationResult.guest) {
      return NextResponse.json(
        {
          success: false,
          errorType: validationResult.errorType,
          error: validationResult.error || 'Érvénytelen hozzáférés',
        },
        { status: 401 }
      );
    }

    // Get guest status
    const statusResult = await getGuestStatus(validationResult.guest.id);

    if (!statusResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: statusResult.error,
        },
        { status: 404 }
      );
    }

    // If ticket is available and has QR code, regenerate the QR code data URL
    let qrCodeDataUrl: string | null = null;
    if (
      statusResult.ticket?.available &&
      statusResult.registration?.id
    ) {
      try {
        const ticketResult = await generateTicket(statusResult.registration.id);
        qrCodeDataUrl = ticketResult.qrCodeDataUrl;
      } catch (error) {
        // Log but don't fail - QR code can be regenerated later
        logError('[STATUS-QR-GEN]', error);
      }
    }

    // Return status response
    return NextResponse.json({
      success: true,
      guest: statusResult.guest,
      registration: statusResult.registration
        ? {
            id: statusResult.registration.id,
            ticketType: statusResult.registration.ticketType,
            registeredAt: statusResult.registration.registeredAt.toISOString(),
            partnerFirstName: statusResult.registration.partnerFirstName,
            partnerLastName: statusResult.registration.partnerLastName,
          }
        : null,
      payment: statusResult.payment
        ? {
            status: statusResult.payment.status,
            method: statusResult.payment.method,
            paidAt: statusResult.payment.paidAt?.toISOString() || null,
          }
        : null,
      ticket: {
        available: statusResult.ticket?.available || false,
        qrCodeDataUrl: qrCodeDataUrl,
      },
    });
  } catch (error) {
    logError('[STATUS-API]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Belső szerver hiba',
      },
      { status: 500 }
    );
  }
}
