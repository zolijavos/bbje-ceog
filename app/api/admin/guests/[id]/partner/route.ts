/**
 * Admin Partner Management API
 *
 * POST /api/admin/guests/[id]/partner - Remove or replace partner
 *   Body: { action: 'remove' } | { action: 'replace', partner: { first_name, last_name, email, ... } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, parseIdParam, errorResponse, type RouteContext } from '@/lib/api';
import { removePartner, replacePartner, type PartnerData } from '@/lib/services/partner';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

const partnerDataSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(127),
  last_name: z.string().min(1, 'Last name is required').max(127),
  email: z.string().email('Invalid email format').max(255),
  title: z.string().max(50).optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  position: z.string().max(255).optional(),
  dietary_requirements: z.string().max(2000).optional(),
});

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('remove') }),
  z.object({ action: z.literal('replace'), partner: partnerDataSchema }),
]);

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Admin-only endpoint
    const auth = await requireAdmin();
    if (!auth.success) {
      return auth.response;
    }

    // Parse guest ID
    const idResult = await parseIdParam(context);
    if (!idResult.success) {
      return idResult.response;
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('INVALID_JSON', 'Invalid request body');
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { data } = validation;

    if (data.action === 'remove') {
      const result = await removePartner(idResult.id);
      return NextResponse.json(result);
    }

    if (data.action === 'replace') {
      const p = data.partner;
      const partnerData: PartnerData = {
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        title: p.title,
        phone: p.phone,
        company: p.company,
        position: p.position,
        dietary_requirements: p.dietary_requirements,
      };
      const result = await replacePartner(idResult.id, partnerData);
      return NextResponse.json(result);
    }

    return errorResponse('INVALID_ACTION', 'Invalid action');
  } catch (error) {
    logError('Partner action error:', error);

    if (error instanceof Error) {
      const errWithCode = error as Error & { code?: string; partnerOf?: string };
      const code = errWithCode.code;

      switch (code) {
        case 'GUEST_NOT_FOUND':
          return errorResponse('GUEST_NOT_FOUND', 'Vendeg nem talalhato');
        case 'NO_PARTNER':
          return NextResponse.json(
            { success: false, error: 'Guest has no partner', code: 'NO_PARTNER' },
            { status: 400 }
          );
        case 'PARTNER_CHECKED_IN':
          return NextResponse.json(
            { success: false, error: 'Partner already checked in', code: 'PARTNER_CHECKED_IN' },
            { status: 409 }
          );
        case 'SELF_PAIRING':
          return NextResponse.json(
            { success: false, error: 'Cannot pair with self', code: 'SELF_PAIRING' },
            { status: 400 }
          );
        case 'ALREADY_PARTNER':
          return NextResponse.json(
            { success: false, error: error.message, code: 'ALREADY_PARTNER', partnerOf: errWithCode.partnerOf },
            { status: 400 }
          );
        case 'EMAIL_EXISTS':
          return NextResponse.json(
            { success: false, error: 'Email already registered as independent guest', code: 'EMAIL_EXISTS' },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process partner action' },
      { status: 500 }
    );
  }
}
