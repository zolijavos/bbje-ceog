/**
 * Bulk Email Scheduling API
 *
 * POST /api/admin/scheduled-emails/bulk - Schedule emails for multiple guests
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { scheduleEmail } from '@/lib/services/email-scheduler';
import { DEFAULT_TEMPLATES, type TemplateSlug } from '@/lib/services/email-templates';
import { logError, logInfo } from '@/lib/utils/logger';
import { z } from 'zod';

// Valid enum values for type-safe filtering
const VALID_GUEST_TYPES = ['vip', 'paying_single', 'paying_paired', 'applicant'] as const;
const VALID_REGISTRATION_STATUSES = ['invited', 'registered', 'approved', 'declined', 'pending_approval', 'rejected'] as const;
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
const MAX_BULK_RECIPIENTS = 1000;

const bulkScheduleSchema = z.object({
  // Filter options - with enum validation to prevent injection
  filter: z.object({
    guest_types: z.array(z.enum(VALID_GUEST_TYPES)).optional(),
    registration_statuses: z.array(z.enum(VALID_REGISTRATION_STATUSES)).optional(),
    has_ticket: z.boolean().optional(),
    has_table: z.boolean().optional(),
    payment_status: z.enum(VALID_PAYMENT_STATUSES).optional(),
  }).optional(),

  // Or specific guest IDs
  guest_ids: z.array(z.number().int().positive()).optional(),

  // Email details
  template_slug: z.string().refine(
    (val) => val in DEFAULT_TEMPLATES,
    { message: 'Invalid template slug' }
  ),
  scheduled_for: z.string().datetime(),
  variables: z.record(z.string()).optional(),
});

/**
 * POST - Bulk schedule emails
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const validation = await validateBody(request, bulkScheduleSchema);
    if (!validation.success) return validation.response;

    const { filter, guest_ids, template_slug, scheduled_for, variables } = validation.data;
    const scheduledDate = new Date(scheduled_for);

    // Validate date is in future
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    let guests;

    if (guest_ids && guest_ids.length > 0) {
      // Use specific guest IDs
      guests = await prisma.guest.findMany({
        where: { id: { in: guest_ids } },
        select: { id: true, name: true, email: true },
      });
    } else if (filter) {
      // Build filter query
      const where: Record<string, unknown> = {};

      if (filter.guest_types && filter.guest_types.length > 0) {
        where.guest_type = { in: filter.guest_types };
      }

      if (filter.registration_statuses && filter.registration_statuses.length > 0) {
        where.registration_status = { in: filter.registration_statuses };
      }

      if (filter.has_ticket === true) {
        where.registration = { qr_code_hash: { not: null } };
      } else if (filter.has_ticket === false) {
        where.OR = [
          { registration: null },
          { registration: { qr_code_hash: null } },
        ];
      }

      if (filter.has_table === true) {
        where.table_assignment = { isNot: null };
      } else if (filter.has_table === false) {
        where.table_assignment = null;
      }

      if (filter.payment_status) {
        where.registration = {
          ...((where.registration as object) || {}),
          payment: { payment_status: filter.payment_status },
        };
      }

      guests = await prisma.guest.findMany({
        where,
        select: { id: true, name: true, email: true },
        take: MAX_BULK_RECIPIENTS + 1, // +1 to detect if limit exceeded
      });
    } else {
      return NextResponse.json(
        { error: 'Either guest_ids or filter must be provided' },
        { status: 400 }
      );
    }

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No guests match the criteria' },
        { status: 400 }
      );
    }

    // Prevent unbounded queries - limit recipients per bulk operation
    if (guests.length > MAX_BULK_RECIPIENTS) {
      return NextResponse.json(
        {
          error: `Too many recipients. Maximum ${MAX_BULK_RECIPIENTS} per bulk operation. ` +
            `Found ${guests.length}+ matching guests. Please use more specific filters.`,
        },
        { status: 400 }
      );
    }

    // Check for existing pending emails for same template/guest
    const existingEmails = await prisma.scheduledEmail.findMany({
      where: {
        guest_id: { in: guests.map(g => g.id) },
        template_slug,
        status: 'pending',
      },
      select: { guest_id: true },
    });

    const existingGuestIds = new Set(existingEmails.map(e => e.guest_id));
    const guestsToSchedule = guests.filter(g => !existingGuestIds.has(g.id));

    // Schedule emails
    const results = await Promise.all(
      guestsToSchedule.map(async (guest) => {
        const guestVariables = {
          ...variables,
          guestName: guest.name,
        };

        return scheduleEmail({
          guestId: guest.id,
          templateSlug: template_slug as TemplateSlug,
          scheduledFor: scheduledDate,
          variables: guestVariables,
          scheduleType: 'bulk',
          createdBy: auth.session.user.id,
        });
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    logInfo(`[SCHEDULER] Bulk scheduled ${successful.length} emails for ${template_slug} by user ${auth.session.user.id}`);

    return NextResponse.json({
      success: true,
      scheduled: successful.length,
      failed: failed.length,
      skipped: existingGuestIds.size,
      total_guests: guests.length,
      ids: successful.map((r) => r.id),
    });
  } catch (error) {
    logError('[SCHEDULED-EMAILS] Error bulk scheduling:', error);
    return NextResponse.json(
      { error: 'Failed to bulk schedule emails' },
      { status: 500 }
    );
  }
}
