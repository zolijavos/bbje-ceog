/**
 * Ticket Generation API
 *
 * POST /api/ticket/generate - Generate QR ticket for a registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateTicket, getExistingTicket } from '@/lib/services/qr-ticket';
import { logError } from '@/lib/utils/logger';

const generateSchema = z.object({
  registration_id: z.number().int().positive(),
  regenerate: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = generateSchema.safeParse(body);

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

    const { registration_id, regenerate } = validationResult.data;

    // Check for existing ticket if not regenerating
    if (!regenerate) {
      const existingTicket = await getExistingTicket(registration_id);
      if (existingTicket) {
        return NextResponse.json({
          success: true,
          message: 'Existing ticket retrieved',
          ticket: {
            token: existingTicket.token,
            qr_code_data_url: existingTicket.qrCodeDataUrl,
          },
        });
      }
    }

    // Generate new ticket
    const ticket = await generateTicket(registration_id);

    return NextResponse.json({
      success: true,
      message: regenerate ? 'Ticket regenerated' : 'Ticket generated',
      ticket: {
        token: ticket.token,
        qr_code_data_url: ticket.qrCodeDataUrl,
      },
    });
  } catch (error) {
    logError('[TICKET-GENERATE]', error);

    if (error instanceof Error) {
      if (error.message === 'REGISTRATION_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'Registration not found' },
          { status: 404 }
        );
      }
      if (error.message === 'GUEST_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'Guest not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate ticket' },
      { status: 500 }
    );
  }
}
