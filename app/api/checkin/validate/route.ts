/**
 * Check-in Validation API
 *
 * POST /api/checkin/validate
 *
 * Validates a QR code token and returns guest details for check-in.
 * Story 3.1: QR Code Validation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { validateCheckinToken } from '@/lib/services/checkin';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

// Request validation schema
const validateRequestSchema = z.object({
  qrToken: z.string().min(1, 'QR token is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Require staff/admin authentication for check-in operations
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { valid: false, error: 'UNAUTHORIZED', message: 'Staff authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const validationResult = validateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'INVALID_REQUEST',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { qrToken } = validationResult.data;

    // Validate the QR token
    const result = await validateCheckinToken(qrToken);

    // Return appropriate status code based on result
    if (!result.valid) {
      return NextResponse.json(result, { status: 200 }); // 200 because it's a valid API response
    }

    return NextResponse.json(result);
  } catch (error) {
    logError('[CHECKIN-VALIDATE]', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'INTERNAL_ERROR',
        alreadyCheckedIn: false,
      },
      { status: 500 }
    );
  }
}
