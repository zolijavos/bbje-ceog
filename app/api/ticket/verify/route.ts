/**
 * Ticket Verification API
 *
 * POST /api/ticket/verify - Verify a QR ticket token
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateTicket } from '@/lib/services/qr-ticket';
import { logError } from '@/lib/utils/logger';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = verifySchema.safeParse(body);

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

    const { token } = validationResult.data;

    // Validate ticket
    const result = await validateTicket(token);

    if (!result.isValid) {
      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        TICKET_EXPIRED: 'A jegy lejart',
        INVALID_TICKET: 'Ervenytelen jegy',
        REGISTRATION_NOT_FOUND: 'A regisztracio nem talalhato',
        TOKEN_MISMATCH: 'A jegy nem ervenyes (token mismatch)',
        UNKNOWN_ERROR: 'Ismeretlen hiba',
      };

      return NextResponse.json({
        success: false,
        valid: false,
        error: errorMessages[result.error || 'UNKNOWN_ERROR'] || result.error,
        error_code: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      registration: result.registration,
    });
  } catch (error) {
    logError('[TICKET-VERIFY]', error);

    return NextResponse.json(
      { success: false, error: 'Failed to verify ticket' },
      { status: 500 }
    );
  }
}
