/**
 * Scheduled Email Detail API
 *
 * GET    /api/admin/scheduled-emails/[id] - Get scheduled email details
 * DELETE /api/admin/scheduled-emails/[id] - Cancel scheduled email
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, parseIdParam, type RouteContext } from '@/lib/api';
import { cancelScheduledEmail } from '@/lib/services/email-scheduler';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';

/**
 * GET - Get scheduled email details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    const email = await prisma.scheduledEmail.findUnique({
      where: { id: idResult.id },
    });

    if (!email) {
      return NextResponse.json({ error: 'Scheduled email not found' }, { status: 404 });
    }

    // Get guest info if available
    let guest = null;
    if (email.guest_id) {
      guest = await prisma.guest.findUnique({
        where: { id: email.guest_id },
        select: { id: true, first_name: true, last_name: true, email: true },
      });
    }

    return NextResponse.json({
      ...email,
      variables: email.variables ? JSON.parse(email.variables) : null,
      guest,
    });
  } catch (error) {
    logError('[SCHEDULED-EMAILS] Error fetching email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled email' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel scheduled email
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const idResult = await parseIdParam(context);
    if (!idResult.success) return idResult.response;

    // Check if email exists and is pending
    const email = await prisma.scheduledEmail.findUnique({
      where: { id: idResult.id },
    });

    if (!email) {
      return NextResponse.json({ error: 'Scheduled email not found' }, { status: 404 });
    }

    if (email.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending emails' },
        { status: 400 }
      );
    }

    const success = await cancelScheduledEmail(idResult.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cancel email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('[SCHEDULED-EMAILS] Error cancelling email:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled email' },
      { status: 500 }
    );
  }
}
