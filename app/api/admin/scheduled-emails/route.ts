/**
 * Scheduled Emails API
 *
 * GET  /api/admin/scheduled-emails - List scheduled emails
 * POST /api/admin/scheduled-emails - Create new scheduled email
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody } from '@/lib/api';
import {
  getScheduledEmails,
  scheduleEmail,
  getSchedulerStats,
} from '@/lib/services/email-scheduler';
import { DEFAULT_TEMPLATES, type TemplateSlug } from '@/lib/services/email-templates';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';
import { getDisplayName } from '@/lib/utils/name';
import { z } from 'zod';

/**
 * GET - List scheduled emails with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'sent' | 'failed' | 'cancelled' | null;
    const scheduleType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeStats = searchParams.get('stats') === 'true';

    const result = await getScheduledEmails({
      status: status || undefined,
      scheduleType: scheduleType || undefined,
      limit,
      offset,
    });

    const response: Record<string, unknown> = {
      emails: result.emails,
      total: result.total,
      limit,
      offset,
    };

    if (includeStats) {
      response.stats = await getSchedulerStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    logError('[SCHEDULED-EMAILS] Error listing emails:', error);
    return NextResponse.json(
      { error: 'Failed to list scheduled emails' },
      { status: 500 }
    );
  }
}

const scheduleSchema = z.object({
  guest_id: z.number().optional(),
  guest_ids: z.array(z.number()).optional(), // For bulk scheduling
  template_slug: z.string().refine(
    (val) => val in DEFAULT_TEMPLATES,
    { message: 'Invalid template slug' }
  ),
  scheduled_for: z.string().datetime(), // ISO datetime
  variables: z.record(z.string()).optional(),
});

/**
 * POST - Schedule new email(s)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const validation = await validateBody(request, scheduleSchema);
    if (!validation.success) return validation.response;

    const { guest_id, guest_ids, template_slug, scheduled_for, variables } = validation.data;
    const scheduledDate = new Date(scheduled_for);

    // Validate date is in future
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Handle bulk scheduling
    const targetGuestIds = guest_ids || (guest_id ? [guest_id] : []);

    if (targetGuestIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one guest_id is required' },
        { status: 400 }
      );
    }

    // Verify guests exist
    const guests = await prisma.guest.findMany({
      where: { id: { in: targetGuestIds } },
      select: { id: true, first_name: true, last_name: true, title: true, email: true },
    });

    if (guests.length !== targetGuestIds.length) {
      return NextResponse.json(
        { error: 'Some guests not found' },
        { status: 400 }
      );
    }

    // Schedule emails
    const results = await Promise.all(
      guests.map(async (guest) => {
        const guestVariables = {
          ...variables,
          guestName: getDisplayName(guest.first_name, guest.last_name, guest.title),
        };

        return scheduleEmail({
          guestId: guest.id,
          templateSlug: template_slug as TemplateSlug,
          scheduledFor: scheduledDate,
          variables: guestVariables,
          scheduleType: 'manual',
          createdBy: auth.session.user.id,
        });
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
      success: true,
      scheduled: successful.length,
      failed: failed.length,
      ids: successful.map((r) => r.id),
    });
  } catch (error) {
    logError('[SCHEDULED-EMAILS] Error scheduling email:', error);
    return NextResponse.json(
      { error: 'Failed to schedule email' },
      { status: 500 }
    );
  }
}
