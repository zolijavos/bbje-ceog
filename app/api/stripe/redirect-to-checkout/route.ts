/**
 * Stripe Redirect to Checkout API
 *
 * POST /api/stripe/redirect-to-checkout - Form handler that creates checkout and redirects
 *
 * This endpoint handles form POST submissions and redirects to Stripe Checkout.
 * Used by the payment button on the registration success page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/services/payment';
import { logError } from '@/lib/utils/logger';

// Get the base URL for redirects - use APP_URL to avoid localhost issues behind proxy
function getBaseUrl(request: NextRequest): string {
  // Prefer APP_URL environment variable (most reliable behind reverse proxy)
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  // Fallback: try to construct from X-Forwarded headers
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'http';

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Last resort: use request.url (may be localhost behind proxy)
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    // Parse form data
    const formData = await request.formData();
    const registrationIdStr = formData.get('registration_id');

    if (!registrationIdStr || typeof registrationIdStr !== 'string') {
      return NextResponse.redirect(`${baseUrl}/register?error=missing_registration`);
    }

    const registrationId = parseInt(registrationIdStr, 10);
    if (isNaN(registrationId)) {
      return NextResponse.redirect(`${baseUrl}/register?error=invalid_registration`);
    }

    // Create checkout session
    const result = await createCheckoutSession(registrationId);

    // Redirect to Stripe Checkout
    return NextResponse.redirect(result.checkoutUrl);
  } catch (error) {
    logError('[STRIPE-REDIRECT]', error);

    // Extract registration ID for error redirect if possible
    let errorPath = '/register?error=payment_failed';

    if (error instanceof Error) {
      if (error.message === 'REGISTRATION_NOT_FOUND') {
        errorPath = '/register?error=registration_not_found';
      } else if (error.message === 'ALREADY_PAID') {
        errorPath = '/register?error=already_paid';
      } else if (error.message === 'VIP_NO_PAYMENT') {
        errorPath = '/register?error=vip_no_payment';
      }
    }

    return NextResponse.redirect(`${baseUrl}${errorPath}`);
  }
}
