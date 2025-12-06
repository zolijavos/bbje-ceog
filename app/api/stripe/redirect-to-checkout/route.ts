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

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const registrationIdStr = formData.get('registration_id');

    if (!registrationIdStr || typeof registrationIdStr !== 'string') {
      return NextResponse.redirect(
        new URL('/register?error=missing_registration', request.url)
      );
    }

    const registrationId = parseInt(registrationIdStr, 10);
    if (isNaN(registrationId)) {
      return NextResponse.redirect(
        new URL('/register?error=invalid_registration', request.url)
      );
    }

    // Create checkout session
    const result = await createCheckoutSession(registrationId);

    // Redirect to Stripe Checkout
    return NextResponse.redirect(result.checkoutUrl);
  } catch (error) {
    logError('[STRIPE-REDIRECT]', error);

    // Extract registration ID for error redirect if possible
    let errorUrl = '/register?error=payment_failed';

    if (error instanceof Error) {
      if (error.message === 'REGISTRATION_NOT_FOUND') {
        errorUrl = '/register?error=registration_not_found';
      } else if (error.message === 'ALREADY_PAID') {
        errorUrl = '/register?error=already_paid';
      } else if (error.message === 'VIP_NO_PAYMENT') {
        errorUrl = '/register?error=vip_no_payment';
      }
    }

    return NextResponse.redirect(new URL(errorUrl, request.url));
  }
}
