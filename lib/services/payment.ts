/**
 * Payment Service
 *
 * Handles Stripe payment operations and payment record management.
 */

import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { PaymentStatus, PaymentMethod, TicketType } from '@prisma/client';

// Initialize Stripe with secret key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Ticket prices in HUF fillér (smallest unit for Stripe)
// Stripe requires amounts in smallest currency unit (fillér for HUF)
// 1 HUF = 100 fillér
const TICKET_PRICES_FILLER: Record<TicketType, number> = {
  paid_single: 10000000, // 100,000 Ft = 10,000,000 fillér
  paid_paired: 15000000, // 150,000 Ft = 15,000,000 fillér
  vip_free: 0,
};

// Convert fillér to HUF for database storage (Prisma stores as integer HUF)
function fillerToHUF(filler: number): number {
  return Math.round(filler / 100);
}

// Convert HUF to fillér for Stripe
function hufToFiller(huf: number): number {
  return huf * 100;
}

/**
 * Format HUF amount for display (exported for use in components)
 * @param huf - Amount in HUF
 * @returns Formatted string (e.g., "20,000 Ft")
 */
export function formatHUF(huf: number): string {
  return `${huf.toLocaleString('hu-HU')} Ft`;
}

// Ticket names for display
const TICKET_NAMES: Record<TicketType, string> = {
  paid_single: 'CEO Gála 2026 - Single Ticket',
  paid_paired: 'CEO Gála 2026 - Paired Ticket',
  vip_free: 'CEO Gála 2026 - VIP Ticket',
};

/**
 * Create a Stripe Checkout Session for a registration
 *
 * @param registrationId - The registration ID to create checkout for
 * @returns Checkout session URL and ID
 */
export async function createCheckoutSession(registrationId: number): Promise<{
  checkoutUrl: string;
  sessionId: string;
}> {
  // Load registration with guest and existing payment
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { guest: true, payment: true },
  });

  if (!registration) {
    throw new Error('REGISTRATION_NOT_FOUND');
  }

  if (!registration.guest) {
    throw new Error('GUEST_NOT_FOUND');
  }

  // VIP guests don't need to pay
  if (registration.ticket_type === 'vip_free') {
    throw new Error('VIP_NO_PAYMENT');
  }

  // Check if already paid
  if (registration.payment?.payment_status === PaymentStatus.paid) {
    throw new Error('ALREADY_PAID');
  }

  // Determine ticket type and price
  const ticketType = registration.ticket_type;
  const unitAmountFiller = TICKET_PRICES_FILLER[ticketType];
  const productName = TICKET_NAMES[ticketType];

  // Build success and cancel URLs
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ceogala.mflevents.space';

  // DEBUG: Log the URL construction
  console.log('[PAYMENT] APP_URL env:', process.env.APP_URL);
  console.log('[PAYMENT] NEXT_PUBLIC_APP_URL env:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('[PAYMENT] Using baseUrl:', baseUrl);

  const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/payment/cancel?registration_id=${registrationId}`;

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: registration.guest.email,
    line_items: [
      {
        price_data: {
          currency: 'huf',
          product_data: {
            name: productName,
            description: `Guest: ${registration.guest.name}`,
          },
          unit_amount: unitAmountFiller, // Stripe expects fillér (smallest unit)
        },
        quantity: 1,
      },
    ],
    metadata: {
      registration_id: registration.id.toString(),
      guest_id: registration.guest.id.toString(),
      ticket_type: ticketType,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error('CHECKOUT_SESSION_FAILED');
  }

  // Create or update payment record with pending status
  if (registration.payment) {
    // Update existing payment record
    await prisma.payment.update({
      where: { id: registration.payment.id },
      data: {
        stripe_session_id: session.id,
        payment_status: PaymentStatus.pending,
      },
    });
  } else {
    // Create new payment record
    await prisma.payment.create({
      data: {
        registration_id: registration.id,
        stripe_session_id: session.id,
        amount: fillerToHUF(unitAmountFiller), // Convert fillér → HUF for DB storage
        currency: 'HUF',
        payment_status: PaymentStatus.pending,
        payment_method: PaymentMethod.card,
      },
    });
  }

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

/**
 * Confirm a payment after successful Stripe webhook
 *
 * @param sessionId - Stripe Checkout Session ID
 * @param paymentIntentId - Stripe Payment Intent ID
 * @returns Updated payment record
 */
export async function confirmPayment(
  sessionId: string,
  paymentIntentId?: string
) {
  // Find payment by session ID
  const payment = await prisma.payment.findUnique({
    where: { stripe_session_id: sessionId },
    include: { registration: { include: { guest: true } } },
  });

  if (!payment) {
    throw new Error('PAYMENT_NOT_FOUND');
  }

  // Check if already confirmed (idempotency)
  if (payment.payment_status === PaymentStatus.paid) {
    return payment;
  }

  // Update payment and guest registration status in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        payment_status: PaymentStatus.paid,
        stripe_payment_intent_id: paymentIntentId || null,
        paid_at: new Date(),
      },
    });

    // Update guest registration status to approved (paid)
    if (payment.registration?.guest_id) {
      await tx.guest.update({
        where: { id: payment.registration.guest_id },
        data: {
          registration_status: 'approved',
        },
      });
    }

    return updatedPayment;
  });

  return result;
}

/**
 * Handle a cancelled/failed payment
 *
 * @param sessionId - Stripe Checkout Session ID
 */
export async function cancelPayment(sessionId: string) {
  const payment = await prisma.payment.findUnique({
    where: { stripe_session_id: sessionId },
  });

  if (!payment) {
    return; // No record to update
  }

  // Only update if still pending
  if (payment.payment_status === PaymentStatus.pending) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        payment_status: PaymentStatus.failed,
      },
    });
  }
}

/**
 * Get payment status for a registration
 *
 * @param registrationId - Registration ID
 * @returns Payment record or null
 */
export async function getPaymentByRegistration(registrationId: number) {
  return prisma.payment.findFirst({
    where: { registration_id: registrationId },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Approve a manual bank transfer payment (admin action)
 *
 * @param registrationId - Registration ID to approve
 * @returns Updated payment record
 */
export async function approveManualPayment(registrationId: number) {
  // Find registration with existing payment
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { payment: true, guest: true },
  });

  if (!registration) {
    throw new Error('REGISTRATION_NOT_FOUND');
  }

  // Determine amount based on ticket type
  const ticketType = registration.ticket_type;
  const amountFiller = TICKET_PRICES_FILLER[ticketType];
  const amountHUF = fillerToHUF(amountFiller); // Convert fillér → HUF for DB

  // Update or create payment in transaction
  const result = await prisma.$transaction(async (tx) => {
    let updatedPayment;

    if (registration.payment) {
      // Update existing payment
      updatedPayment = await tx.payment.update({
        where: { id: registration.payment.id },
        data: {
          payment_status: PaymentStatus.paid,
          payment_method: PaymentMethod.bank_transfer,
          paid_at: new Date(),
        },
      });
    } else {
      // Create new payment record
      updatedPayment = await tx.payment.create({
        data: {
          registration_id: registrationId,
          amount: amountHUF, // Store in HUF
          currency: 'HUF',
          payment_status: PaymentStatus.paid,
          payment_method: PaymentMethod.bank_transfer,
          paid_at: new Date(),
        },
      });
    }

    // Update guest registration status to approved
    if (registration.guest_id) {
      await tx.guest.update({
        where: { id: registration.guest_id },
        data: {
          registration_status: 'approved',
        },
      });
    }

    return updatedPayment;
  });

  return result;
}

/**
 * Construct Stripe webhook event from request
 *
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @returns Verified Stripe event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('WEBHOOK_SECRET_NOT_CONFIGURED');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Export Stripe instance for direct use if needed
export { stripe };
