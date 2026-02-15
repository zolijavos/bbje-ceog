/**
 * Check-in Submit API
 *
 * POST /api/checkin/submit
 *
 * Records a check-in event for a validated registration.
 * Story 3.3: Check-in Recording & Duplicate Prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { submitCheckin } from '@/lib/services/checkin';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

// Request validation schema
const submitRequestSchema = z.object({
  registrationId: z.number().int().positive('Registration ID must be a positive integer'),
  override: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Require staff/admin authentication for all check-in operations
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Staff authentication required',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const validationResult = submitRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { registrationId, override } = validationResult.data;

    // Use authenticated user's ID for tracking
    const staffUserId = session.user.id;

    // Submit the check-in
    const result = await submitCheckin(registrationId, staffUserId, override);

    if (!result.success) {
      return NextResponse.json(result, { status: 200 }); // 200 because it's a valid response
    }

    return NextResponse.json(result);
  } catch (error) {
    logError('[CHECKIN-SUBMIT]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
