/**
 * POST /api/email/send-magic-link
 * Send magic link invitation emails to guests
 *
 * Request body: { guest_ids: number[] }
 * Response: { success: boolean, sent: number, failed: number, errors: Array<{ guest_id: number, error: string }> }
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth/session';
import { sendBulkMagicLinkEmails } from '@/lib/services/email';
import { logError } from '@/lib/utils/logger';

// Request body schema
const SendMagicLinkSchema = z.object({
  guest_ids: z.array(z.number().int().positive()).min(1).max(100),
});

export async function POST(request: Request) {
  try {
    // Validate admin session
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin login required.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const parseResult = SendMagicLinkSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parseResult.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { guest_ids } = parseResult.data;

    // Send emails
    const result = await sendBulkMagicLinkEmails(guest_ids);

    return NextResponse.json(result, {
      status: result.success ? 200 : 207, // 207 Multi-Status for partial success
    });
  } catch (error) {
    logError('[SEND-MAGIC-LINK]', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
