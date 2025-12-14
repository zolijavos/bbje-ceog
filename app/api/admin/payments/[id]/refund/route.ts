/**
 * Payment Refund API
 *
 * POST /api/admin/payments/[id]/refund - Refund a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError, logInfo } from '@/lib/utils/logger';

/**
 * POST - Refund payment
 *
 * For Stripe payments: Initiates refund via Stripe API
 * For bank transfers: Just marks as refunded (manual process)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { id } = await params;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || '';

    // Get payment with registration
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: {
            guest: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.payment_status !== 'paid') {
      return NextResponse.json(
        { error: payment.payment_status === 'refunded'
            ? 'Payment already refunded'
            : 'Only paid payments can be refunded' },
        { status: 400 }
      );
    }

    // ⚠️ IMPORTANT: Stripe automatic refund is NOT YET IMPLEMENTED
    // Currently this endpoint only marks the payment as "refunded" in the database.
    // For card payments, the actual money refund must be done MANUALLY via Stripe Dashboard.
    //
    // To enable automatic Stripe refunds:
    // 1. Uncomment the code block below
    // 2. Ensure STRIPE_SECRET_KEY is configured in production
    // 3. Test thoroughly in Stripe test mode first
    //
    // See: https://stripe.com/docs/refunds

    let stripeRefunded = false;

    if (payment.payment_method === 'card' && payment.stripe_payment_intent_id) {
      logInfo('[PAYMENTS] Stripe refund needed for payment intent:', payment.stripe_payment_intent_id);
      logInfo('[PAYMENTS] ⚠️ Automatic refund NOT implemented - please process manually via Stripe Dashboard');

      // TODO: Enable automatic Stripe refunds when ready for production
      // import Stripe from 'stripe';
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      // try {
      //   await stripe.refunds.create({
      //     payment_intent: payment.stripe_payment_intent_id,
      //     reason: 'requested_by_customer',
      //   });
      //   stripeRefunded = true;
      //   logInfo('[PAYMENTS] Stripe refund successful');
      // } catch (stripeError) {
      //   logError('[PAYMENTS] Stripe refund failed:', stripeError);
      //   return NextResponse.json(
      //     { error: 'Stripe refund failed. Please process manually via Stripe Dashboard.' },
      //     { status: 500 }
      //   );
      // }
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        payment_status: 'refunded',
      },
    });

    // Update guest registration status back to registered
    if (payment.registration) {
      await prisma.registration.update({
        where: { id: payment.registration.id },
        data: {
          qr_code_hash: null, // Invalidate QR code
        },
      });

      // Update guest status
      await prisma.guest.update({
        where: { id: payment.registration.guest_id },
        data: {
          registration_status: 'registered',
        },
      });
    }

    logInfo('[PAYMENTS] Payment refunded:', {
      paymentId,
      guestId: payment.registration?.guest_id,
      amount: payment.amount,
      method: payment.payment_method,
      reason,
      stripeRefunded,
    });

    return NextResponse.json({
      success: true,
      stripeRefunded,
      message: payment.payment_method === 'card' && !stripeRefunded
        ? 'Payment marked as refunded. Please process Stripe refund manually.'
        : 'Payment refunded successfully',
    });
  } catch (error) {
    logError('[PAYMENTS] Error refunding payment:', error);
    return NextResponse.json(
      { error: 'Failed to refund payment' },
      { status: 500 }
    );
  }
}
