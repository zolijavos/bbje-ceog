/**
 * Stripe Checkout Session API
 *
 * POST /api/stripe/create-checkout - Create a Stripe Checkout Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/services/payment';
import { z } from 'zod';
import { logError } from '@/lib/utils/logger';

// Request validation schema
const createCheckoutSchema = z.object({
  registration_id: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCheckoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { registration_id } = validationResult.data;

    // Create checkout session
    const result = await createCheckoutSession(registration_id);

    return NextResponse.json({
      success: true,
      checkout_url: result.checkoutUrl,
      session_id: result.sessionId,
    });
  } catch (error) {
    logError('[STRIPE-CHECKOUT]', error);

    // Handle specific errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'REGISTRATION_NOT_FOUND':
          return NextResponse.json(
            { success: false, error: 'Regisztracio nem talalhato' },
            { status: 404 }
          );
        case 'GUEST_NOT_FOUND':
          return NextResponse.json(
            { success: false, error: 'Vendeg nem talalhato' },
            { status: 404 }
          );
        case 'ALREADY_PAID':
          return NextResponse.json(
            { success: false, error: 'A fizetes mar megtortent' },
            { status: 409 }
          );
        case 'CHECKOUT_SESSION_FAILED':
          return NextResponse.json(
            { success: false, error: 'Nem sikerult letrehozni a fizetesi munkamenetet' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Hiba tortent a fizetes inditasakor' },
      { status: 500 }
    );
  }
}
