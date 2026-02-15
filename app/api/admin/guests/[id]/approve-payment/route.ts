/**
 * Admin Guest Payment Approval API
 *
 * PATCH /api/admin/guests/[id]/approve-payment - Approve manual bank transfer payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, parseIdParam, type RouteContext } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { approveManualPayment } from '@/lib/services/payment';
import { generateAndSendTicket } from '@/lib/services/email';

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;
    const guestId = idResult.id;

    // Find guest's registration
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        registration: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Vendeg nem talalhato' },
        { status: 404 }
      );
    }

    if (!guest.registration) {
      return NextResponse.json(
        { success: false, error: 'Vendegnek nincs regisztracioja' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (guest.registration.payment?.payment_status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'A fizetes mar jovahagyva' },
        { status: 400 }
      );
    }

    // Approve manual payment
    await approveManualPayment(guest.registration.id);
    console.log(`[ADMIN] Payment approved for registration ${guest.registration.id} by admin`);

    // Generate QR ticket and send email
    const ticketResult = await generateAndSendTicket(guest.registration.id);

    if (ticketResult.success) {
      console.log(`[ADMIN] Ticket sent to ${guest.email} after manual approval`);
      return NextResponse.json({
        success: true,
        message: 'Fizetes jovahagyva, e-ticket elkuldve',
        ticketSent: true,
      });
    } else {
      // Payment approved but ticket failed - still return success but warn
      console.error(`[ADMIN] Ticket sending failed for ${guest.email}: ${ticketResult.error}`);
      return NextResponse.json({
        success: true,
        message: 'Fizetes jovahagyva, de az e-ticket kuldese sikertelen',
        ticketSent: false,
        ticketError: ticketResult.error,
      });
    }
  } catch (error) {
    console.error('Approve payment error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'REGISTRATION_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'Regisztracio nem talalhato' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Fizetes jovahagyasa sikertelen' },
      { status: 500 }
    );
  }
}
