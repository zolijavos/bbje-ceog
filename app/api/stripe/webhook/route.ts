/**
 * Stripe Webhook Handler
 *
 * POST /api/stripe/webhook - Handle Stripe webhook events
 *
 * Handles:
 * - checkout.session.completed - Payment successful
 * - checkout.session.expired - Session timeout
 * - checkout.session.async_payment_succeeded - Delayed payment success
 * - checkout.session.async_payment_failed - Delayed payment failure
 * - payment_intent.payment_failed - Payment declined
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  constructWebhookEvent,
  confirmPayment,
  cancelPayment,
} from '@/lib/services/payment';
import { prisma } from '@/lib/db/prisma';
import { PaymentStatus } from '@prisma/client';
import { generateAndSendTicket } from '@/lib/services/email';
import { logError } from '@/lib/utils/logger';
import Stripe from 'stripe';

// Webhook event log for debugging - uses structured logging
function logWebhookEvent(eventType: string, sessionId: string, status: 'processing' | 'success' | 'error', details?: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    component: 'WEBHOOK',
    level: status === 'error' ? 'ERROR' : 'INFO',
    eventType,
    sessionId,
    status,
    details,
  };

  // Use structured logging for production (easier to parse in log aggregators)
  if (process.env.NODE_ENV === 'production') {
    if (status === 'error') {
      logError(`[WEBHOOK] ${eventType} | ${sessionId}`, details);
    }
    // In production, only log errors to reduce noise
    return;
  }

  // In development, log everything for debugging
  console.log(JSON.stringify(logData));
}

export async function POST(request: NextRequest) {
  let eventType = 'unknown';
  let sessionId = 'unknown';

  try {
    // Get raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logError('[WEBHOOK] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(payload, signature);
    } catch (err) {
      logError('[WEBHOOK] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    eventType = event.type;

    // Handle event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        sessionId = session.id;
        logWebhookEvent(event.type, sessionId, 'processing');

        // Confirm payment - updates payment to 'paid' and guest to 'approved'
        await confirmPayment(
          session.id,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id
        );

        logWebhookEvent(event.type, sessionId, 'success', 'Payment confirmed');

        // Generate QR ticket and send email (Story 2.3 + 2.4)
        // Idempotency: generateAndSendTicket checks if ticket already exists
        const registrationId = session.metadata?.registration_id;
        if (registrationId) {
          const ticketResult = await generateAndSendTicket(parseInt(registrationId, 10));
          if (ticketResult.success) {
            logWebhookEvent(event.type, sessionId, 'success', `Ticket sent to guest ${ticketResult.guestId}`);
          } else if (ticketResult.error === 'TICKET_ALREADY_EXISTS') {
            // Idempotent: ticket was already generated in a previous webhook call
            logWebhookEvent(event.type, sessionId, 'success', 'Ticket already exists (idempotent)');
          } else {
            logWebhookEvent(event.type, sessionId, 'error', `Ticket email failed: ${ticketResult.error}`);
          }
        } else {
          logWebhookEvent(event.type, sessionId, 'error', 'Missing registration_id in session metadata');
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        sessionId = session.id;
        logWebhookEvent(event.type, sessionId, 'processing');

        // Confirm delayed payment (e.g., bank debit)
        await confirmPayment(
          session.id,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id
        );

        logWebhookEvent(event.type, sessionId, 'success', 'Async payment confirmed');

        // Generate QR ticket and send email (Story 2.3 + 2.4)
        const asyncRegistrationId = session.metadata?.registration_id;
        if (asyncRegistrationId) {
          const ticketResult = await generateAndSendTicket(parseInt(asyncRegistrationId, 10));
          if (ticketResult.success) {
            logWebhookEvent(event.type, sessionId, 'success', `Ticket sent to guest ${ticketResult.guestId}`);
          } else {
            logWebhookEvent(event.type, sessionId, 'error', `Ticket email failed: ${ticketResult.error}`);
          }
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        sessionId = session.id;
        logWebhookEvent(event.type, sessionId, 'processing');

        // Mark payment as failed
        await cancelPayment(session.id);

        logWebhookEvent(event.type, sessionId, 'success', 'Payment marked as failed');
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        sessionId = session.id;
        logWebhookEvent(event.type, sessionId, 'processing');

        // Mark payment as failed (session timed out)
        await cancelPayment(session.id);

        logWebhookEvent(event.type, sessionId, 'success', 'Expired session handled');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        sessionId = paymentIntent.id;
        logWebhookEvent(event.type, sessionId, 'processing');

        // HIGH-3 FIX: Update payment status in database when payment intent fails
        // Find payment by stripe_payment_intent_id and mark as failed
        const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';

        try {
          // Try to find and update the payment by payment_intent_id
          const updatedPayment = await prisma.payment.updateMany({
            where: {
              stripe_payment_intent_id: paymentIntent.id,
              payment_status: PaymentStatus.pending, // Only update if still pending
            },
            data: {
              payment_status: PaymentStatus.failed,
            },
          });

          if (updatedPayment.count > 0) {
            logWebhookEvent(event.type, sessionId, 'success', `Payment marked as failed: ${failureMessage}`);
          } else {
            // Payment might not exist yet or already processed
            logWebhookEvent(event.type, sessionId, 'success', `Payment failed (no pending record found): ${failureMessage}`);
          }
        } catch (dbError) {
          // Log but don't fail the webhook - the payment status will be checked on next attempt
          logWebhookEvent(event.type, sessionId, 'error', `Failed to update payment status: ${dbError}`);
        }
        break;
      }

      default:
        // Log unhandled events but return success (to prevent Stripe retries)
        console.log(`[WEBHOOK] [INFO] Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent(eventType, sessionId, 'error', errorMessage);
    logError('[WEBHOOK] Processing failed:', error);

    // HIGH-2 FIX: Improved error handling strategy
    // - Return 200 for idempotent/expected errors (Stripe won't retry)
    // - Return 500 for transient/critical errors (Stripe will retry)

    // Errors that are safe to acknowledge (won't benefit from retry)
    const safeErrors = [
      'PAYMENT_NOT_FOUND',     // Test event or already processed
      'ALREADY_PAID',         // Idempotent - payment already confirmed
      'TICKET_ALREADY_EXISTS', // Idempotent - ticket already generated
    ];

    if (safeErrors.includes(errorMessage)) {
      return NextResponse.json({
        received: true,
        warning: errorMessage,
      });
    }

    // Transient errors that should trigger Stripe retry
    const transientErrors = [
      'ECONNREFUSED',        // Database connection issue
      'ETIMEDOUT',           // Network timeout
      'REGISTRATION_NOT_FOUND', // Might be a race condition, retry could help
    ];

    const isTransient = transientErrors.some(e =>
      errorMessage.includes(e)
    );

    if (isTransient) {
      // Return 500 so Stripe will retry
      return NextResponse.json(
        { error: 'Transient error - please retry', details: errorMessage },
        { status: 500 }
      );
    }

    // Unknown errors - log as critical but acknowledge to prevent infinite retries
    // This is a trade-off: we don't want Stripe hammering us, but we also don't want to lose events
    logError(`[WEBHOOK] CRITICAL: Unknown error processing ${eventType}. Manual investigation required.`);
    return NextResponse.json(
      { received: true, error: 'Processed with error', details: errorMessage },
      { status: 200 }
    );
  }
}
