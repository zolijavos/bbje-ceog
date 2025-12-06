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
import { generateAndSendTicket } from '@/lib/services/email';
import { logError } from '@/lib/utils/logger';
import Stripe from 'stripe';

// Webhook event log for debugging
function logWebhookEvent(eventType: string, sessionId: string, status: 'processing' | 'success' | 'error', details?: string) {
  const timestamp = new Date().toISOString();
  const logLevel = status === 'error' ? 'ERROR' : 'INFO';
  console.log(`[${timestamp}] [WEBHOOK] [${logLevel}] ${eventType} | session: ${sessionId} | status: ${status}${details ? ` | ${details}` : ''}`);
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

        // Payment failed - we need to find the session by payment_intent_id
        // For now, log it as the cancelPayment works by session_id
        const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
        logWebhookEvent(event.type, sessionId, 'success', `Payment failed: ${failureMessage}`);
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

    // Still return 200 for most errors to prevent infinite retries
    // Only signature/parsing errors should return 400
    if (errorMessage === 'PAYMENT_NOT_FOUND') {
      // Payment not found is acceptable - might be a test event or already processed
      return NextResponse.json({ received: true, warning: 'Payment not found' });
    }

    logError('[WEBHOOK] Processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
