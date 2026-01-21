/**
 * Email Scheduler Service
 *
 * Handles scheduling, processing, and automatic email triggers:
 * - Manual scheduling from admin UI
 * - Bulk scheduling
 * - Configurable automatic rules (payment_reminder, event_reminder, etc.)
 */

import { prisma } from '@/lib/db/prisma';
import { renderTemplate, type TemplateSlug } from '@/lib/services/email-templates';
import { sendEmail, logEmailDelivery } from '@/lib/services/email';
import { logInfo, logError } from '@/lib/utils/logger';
import { EVENT_CONFIG } from '@/lib/config/event';
import { getFullName } from '@/lib/utils/name';
import type { ScheduledEmailStatus, Guest } from '@prisma/client';

// Extract event constants for convenience
const EVENT_DATE = EVENT_CONFIG.dateTime;
const EVENT_VENUE = EVENT_CONFIG.venue.name;
const EVENT_ADDRESS = EVENT_CONFIG.venue.address;

/**
 * Schedule an email for later delivery
 */
export async function scheduleEmail(params: {
  guestId?: number;
  templateSlug: TemplateSlug;
  scheduledFor: Date;
  variables?: Record<string, string | undefined>;
  scheduleType?: string;
  createdBy?: number;
}): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const scheduled = await prisma.scheduledEmail.create({
      data: {
        guest_id: params.guestId || null,
        template_slug: params.templateSlug,
        scheduled_for: params.scheduledFor,
        variables: params.variables ? JSON.stringify(params.variables) : null,
        schedule_type: params.scheduleType || 'manual',
        created_by: params.createdBy || null,
        status: 'pending',
      },
    });

    logInfo(`[SCHEDULER] Email scheduled: ${params.templateSlug} for ${params.scheduledFor.toISOString()}`);
    return { success: true, id: scheduled.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('[SCHEDULER] Failed to schedule email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Cancel a scheduled email
 */
export async function cancelScheduledEmail(id: number): Promise<boolean> {
  try {
    await prisma.scheduledEmail.update({
      where: { id },
      data: { status: 'cancelled' },
    });
    logInfo(`[SCHEDULER] Email cancelled: ${id}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Process pending scheduled emails that are due
 */
export async function processScheduledEmails(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();
  const stats = { processed: 0, sent: 0, failed: 0 };

  // Find pending emails that are due
  const pendingEmails = await prisma.scheduledEmail.findMany({
    where: {
      status: 'pending',
      scheduled_for: { lte: now },
    },
    take: 50, // Process in batches
  });

  for (const scheduled of pendingEmails) {
    stats.processed++;

    // Mark as processing
    await prisma.scheduledEmail.update({
      where: { id: scheduled.id },
      data: { status: 'processing' },
    });

    try {
      // Get guest if specified
      let guest: Guest | null = null;
      if (scheduled.guest_id) {
        guest = await prisma.guest.findUnique({
          where: { id: scheduled.guest_id },
        });

        if (!guest) {
          throw new Error('Guest not found');
        }
      }

      // Parse variables
      const storedVariables = scheduled.variables
        ? JSON.parse(scheduled.variables)
        : {};

      // Build variables with guest data
      const variables: Record<string, string | undefined> = {
        ...storedVariables,
      };

      if (guest) {
        variables.guestName = getFullName(guest.first_name, guest.last_name);
        // Add other guest fields as needed
      }

      // Render template
      const rendered = await renderTemplate(
        scheduled.template_slug as TemplateSlug,
        variables
      );

      // Send email - guest may have been deleted after scheduling
      if (!guest) {
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: { status: 'failed', error_message: 'Guest no longer exists' },
        });
        stats.failed++;
        continue;
      }

      const result = await sendEmail({
        to: guest.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      if (result.success) {
        await prisma.scheduledEmail.update({
          where: { id: scheduled.id },
          data: { status: 'sent', sent_at: new Date() },
        });

        await logEmailDelivery({
          guestId: guest.id,
          recipient: guest.email,
          subject: rendered.subject,
          success: true,
          emailType: scheduled.template_slug,
        });

        stats.sent++;
        logInfo(`[SCHEDULER] Sent scheduled email ${scheduled.id} to ${guest.email}`);
      } else {
        throw new Error(result.error || 'Send failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.scheduledEmail.update({
        where: { id: scheduled.id },
        data: { status: 'failed', error_message: errorMessage },
      });

      stats.failed++;
      logError(`[SCHEDULER] Failed to process email ${scheduled.id}:`, errorMessage);
    }
  }

  if (stats.processed > 0) {
    logInfo(`[SCHEDULER] Processed ${stats.processed} emails: ${stats.sent} sent, ${stats.failed} failed`);
  }

  return stats;
}

/**
 * Run all automatic schedulers based on SchedulerConfig
 */
export async function runAutomaticSchedulers(): Promise<{
  [key: string]: number;
}> {
  const results: Record<string, number> = {};

  // Get all enabled scheduler configs
  const configs = await prisma.schedulerConfig.findMany({
    where: { enabled: true },
  });

  for (const config of configs) {
    try {
      let scheduled = 0;

      switch (config.config_key) {
        case 'payment_reminder':
          scheduled = await schedulePaymentReminders(config);
          break;
        case 'event_reminder':
        case 'event_reminder_e10':
        case 'event_reminder_e7':
          scheduled = await scheduleEventReminders(config);
          break;
        case 'noshow_payment_request':
          scheduled = await scheduleNoShowPaymentRequests(config);
          break;
        default:
          // Generic scheduler for custom configs
          scheduled = await scheduleGenericEmails(config);
      }

      results[config.config_key] = scheduled;
    } catch (error) {
      logError(`[SCHEDULER] Error running ${config.config_key}:`, error);
      results[config.config_key] = -1; // Error indicator
    }
  }

  return results;
}

/**
 * Schedule payment reminders for guests with pending payments
 */
export async function schedulePaymentReminders(config?: {
  interval_days?: number | null;
  send_time?: string;
  target_status?: string | null;
  target_types?: string | null;
}): Promise<number> {
  const intervalDays = config?.interval_days || 3;
  const sendTime = config?.send_time || '09:00';
  const [hours, minutes] = sendTime.split(':').map(Number);

  // Parse target filters from config
  const targetStatuses = config?.target_status ? JSON.parse(config.target_status) : null;
  const targetTypes = config?.target_types ? JSON.parse(config.target_types) : null;

  // Find guests with pending payments who haven't received a reminder recently
  const intervalAgo = new Date(Date.now() - intervalDays * 24 * 60 * 60 * 1000);

  // Build guest where clause with target filters (AND with default logic)
  const guestWhere: Record<string, unknown> = {
    registration_status: targetStatuses?.length > 0
      ? { in: targetStatuses }
      : 'registered',
  };

  if (targetTypes?.length > 0) {
    guestWhere.guest_type = { in: targetTypes };
  }

  const pendingPayments = await prisma.registration.findMany({
    where: {
      payment: {
        payment_status: 'pending',
      },
      guest: guestWhere,
    },
    include: {
      guest: true,
      payment: true,
    },
  });

  let scheduled = 0;

  for (const reg of pendingPayments) {
    // Check if already has a pending reminder
    const existingReminder = await prisma.scheduledEmail.findFirst({
      where: {
        guest_id: reg.guest_id,
        template_slug: 'payment_reminder',
        status: 'pending',
      },
    });

    if (existingReminder) continue;

    // Check last sent reminder
    const lastReminder = await prisma.scheduledEmail.findFirst({
      where: {
        guest_id: reg.guest_id,
        template_slug: 'payment_reminder',
        status: 'sent',
      },
      orderBy: { sent_at: 'desc' },
    });

    if (lastReminder && lastReminder.sent_at && lastReminder.sent_at > intervalAgo) {
      continue; // Already sent within interval
    }

    // Schedule for tomorrow at configured time
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 1);
    scheduledFor.setHours(hours, minutes, 0, 0);

    const ticketLabels: Record<string, string> = {
      paid_single: 'Single Ticket',
      paid_paired: 'Paired Ticket',
      vip_free: 'VIP Ticket',
    };

    await scheduleEmail({
      guestId: reg.guest_id,
      templateSlug: 'payment_reminder',
      scheduledFor,
      variables: {
        guestName: getFullName(reg.guest.first_name, reg.guest.last_name),
        ticketType: ticketLabels[reg.ticket_type] || reg.ticket_type,
        amount: reg.payment ? `${Number(reg.payment.amount).toLocaleString('hu-HU')} ${reg.payment.currency}` : 'N/A',
        paymentUrl: `${process.env.APP_URL || 'https://ceogala.mflevents.space'}/status?guestId=${reg.guest_id}`,
      },
      scheduleType: 'payment_reminder',
    });

    scheduled++;
  }

  if (scheduled > 0) {
    logInfo(`[SCHEDULER] Scheduled ${scheduled} payment reminder emails`);
  }

  return scheduled;
}

/**
 * Schedule event reminders based on configuration
 */
export async function scheduleEventReminders(config?: {
  days_before?: number | null;
  send_time?: string;
  target_status?: string | null;
  target_types?: string | null;
}): Promise<number> {
  const daysBefore = config?.days_before ?? 1;
  const sendTime = config?.send_time || '09:00';
  const [hours, minutes] = sendTime.split(':').map(Number);

  // Parse target filters from config
  const targetStatuses = config?.target_status ? JSON.parse(config.target_status) : null;
  const targetTypes = config?.target_types ? JSON.parse(config.target_types) : null;

  const eventDate = EVENT_DATE;
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  reminderDate.setHours(hours, minutes, 0, 0);

  const now = new Date();

  // Only schedule if we're within 2 days of the reminder date and haven't passed it
  const twoDaysBefore = new Date(reminderDate);
  twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

  if (now < twoDaysBefore || now > reminderDate) {
    return 0; // Not time to schedule yet, or already past
  }

  // Build where clause with target filters (AND with default logic)
  const guestWhere: Record<string, unknown> = {
    registration_status: targetStatuses?.length > 0
      ? { in: targetStatuses }
      : { in: ['registered', 'approved'] },
    registration: {
      qr_code_hash: { not: null }, // Has a ticket
    },
  };

  if (targetTypes?.length > 0) {
    guestWhere.guest_type = { in: targetTypes };
  }

  // Find all registered guests with tickets
  const registeredGuests = await prisma.guest.findMany({
    where: guestWhere,
    include: {
      registration: true,
      table_assignment: {
        include: { table: true },
      },
    },
  });

  let scheduled = 0;

  for (const guest of registeredGuests) {
    // Check if already scheduled
    const existing = await prisma.scheduledEmail.findFirst({
      where: {
        guest_id: guest.id,
        template_slug: 'event_reminder',
        status: { in: ['pending', 'sent'] },
      },
    });

    if (existing) continue;

    // Build cancel URL for last-chance cancellation reminder
    const appUrl = process.env.APP_URL || 'https://ceogala.mflevents.space';
    const cancelUrl = `${appUrl}/pwa/cancel`;

    await scheduleEmail({
      guestId: guest.id,
      templateSlug: 'event_reminder',
      scheduledFor: reminderDate,
      variables: {
        guestName: getFullName(guest.first_name, guest.last_name),
        eventDate: eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        eventTime: eventDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventVenue: EVENT_VENUE,
        eventAddress: EVENT_ADDRESS,
        tableName: guest.table_assignment?.table?.name,
        cancelUrl: cancelUrl,
      },
      scheduleType: 'event_reminder',
    });

    scheduled++;
  }

  if (scheduled > 0) {
    logInfo(`[SCHEDULER] Scheduled ${scheduled} event reminder emails`);
  }

  return scheduled;
}

/**
 * Schedule no-show payment requests for guests who didn't attend
 * Runs only after the event date
 */
export async function scheduleNoShowPaymentRequests(config?: {
  days_after?: number | null;
  send_time?: string;
  no_show_fee?: string;
  target_status?: string | null;
  target_types?: string | null;
}): Promise<number> {
  const daysAfter = config?.days_after ?? 1;
  const sendTime = config?.send_time || '10:00';
  const noShowFee = config?.no_show_fee || '50,000 HUF';
  const [hours, minutes] = sendTime.split(':').map(Number);

  // Parse target filters from config
  const targetStatuses = config?.target_status ? JSON.parse(config.target_status) : null;
  const targetTypes = config?.target_types ? JSON.parse(config.target_types) : null;

  const eventDate = EVENT_DATE;
  const now = new Date();

  // Only run after the event
  if (now < eventDate) {
    return 0;
  }

  // Calculate when to send (days after event)
  const scheduledFor = new Date(eventDate);
  scheduledFor.setDate(scheduledFor.getDate() + daysAfter);
  scheduledFor.setHours(hours, minutes, 0, 0);

  // Don't schedule if we've already passed the scheduled time
  if (now > scheduledFor) {
    // Check if we're within 24 hours after scheduled time (grace period)
    const gracePeriodEnd = new Date(scheduledFor);
    gracePeriodEnd.setHours(gracePeriodEnd.getHours() + 24);
    if (now > gracePeriodEnd) {
      return 0;
    }
    // Set to send immediately
    scheduledFor.setTime(Date.now() + 60000); // 1 minute from now
  }

  // Build where clause with target filters (AND with default logic)
  const guestWhere: Record<string, unknown> = {
    registration_status: targetStatuses?.length > 0
      ? { in: targetStatuses }
      : { in: ['registered', 'approved'] },
    registration: {
      qr_code_hash: { not: null }, // Has ticket
      cancelled_at: null, // Not cancelled
    },
    checkin: null, // Not checked in
  };

  if (targetTypes?.length > 0) {
    guestWhere.guest_type = { in: targetTypes };
  }

  // Find no-show guests: registered/approved + has ticket + not checked in + not cancelled
  const noShowGuests = await prisma.guest.findMany({
    where: guestWhere,
    include: {
      registration: true,
    },
  });

  let scheduled = 0;

  for (const guest of noShowGuests) {
    // Check if already scheduled
    const existing = await prisma.scheduledEmail.findFirst({
      where: {
        guest_id: guest.id,
        template_slug: 'noshow_payment_request',
        status: { in: ['pending', 'sent'] },
      },
    });

    if (existing) continue;

    const ticketLabels: Record<string, string> = {
      paid_single: 'Single Ticket',
      paid_paired: 'Paired Ticket',
      vip_free: 'VIP Ticket',
    };

    const paymentDeadline = new Date(eventDate);
    paymentDeadline.setDate(paymentDeadline.getDate() + 14); // 2 weeks to pay

    await scheduleEmail({
      guestId: guest.id,
      templateSlug: 'noshow_payment_request',
      scheduledFor,
      variables: {
        guestName: getFullName(guest.first_name, guest.last_name),
        eventDate: eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        ticketType: ticketLabels[guest.registration?.ticket_type || ''] || 'Standard Ticket',
        noShowFee: noShowFee,
        paymentDeadline: paymentDeadline.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        paymentUrl: `${process.env.APP_URL || 'https://ceogala.mflevents.space'}/noshow-payment?guestId=${guest.id}`,
      },
      scheduleType: 'noshow_payment_request',
    });

    scheduled++;
  }

  if (scheduled > 0) {
    logInfo(`[SCHEDULER] Scheduled ${scheduled} no-show payment request emails`);
  }

  return scheduled;
}

/**
 * Generic email scheduler for custom configurations
 */
async function scheduleGenericEmails(config: {
  config_key: string;
  template_slug: string;
  days_before?: number | null;
  days_after?: number | null;
  send_time?: string;
  target_status?: string | null;
  target_types?: string | null;
}): Promise<number> {
  const sendTime = config.send_time || '09:00';
  const [hours, minutes] = sendTime.split(':').map(Number);

  // Calculate scheduled date
  let scheduledFor = new Date();
  if (config.days_before) {
    const eventDate = EVENT_DATE;
    scheduledFor = new Date(eventDate);
    scheduledFor.setDate(scheduledFor.getDate() - config.days_before);
  } else if (config.days_after) {
    scheduledFor.setDate(scheduledFor.getDate() + config.days_after);
  } else {
    scheduledFor.setDate(scheduledFor.getDate() + 1);
  }
  scheduledFor.setHours(hours, minutes, 0, 0);

  const now = new Date();
  if (now > scheduledFor) {
    return 0; // Already past scheduled time
  }

  // Build where clause based on target filters
  const where: Record<string, unknown> = {};

  if (config.target_status) {
    const statuses = JSON.parse(config.target_status);
    if (statuses.length > 0) {
      where.registration_status = { in: statuses };
    }
  }

  if (config.target_types) {
    const types = JSON.parse(config.target_types);
    if (types.length > 0) {
      where.guest_type = { in: types };
    }
  }

  const guests = await prisma.guest.findMany({
    where,
    select: { id: true, first_name: true, last_name: true },
  });

  let scheduled = 0;

  for (const guest of guests) {
    // Check if already scheduled
    const existing = await prisma.scheduledEmail.findFirst({
      where: {
        guest_id: guest.id,
        template_slug: config.template_slug,
        schedule_type: config.config_key,
        status: { in: ['pending', 'sent'] },
      },
    });

    if (existing) continue;

    await scheduleEmail({
      guestId: guest.id,
      templateSlug: config.template_slug as TemplateSlug,
      scheduledFor,
      variables: {
        guestName: getFullName(guest.first_name, guest.last_name),
      },
      scheduleType: config.config_key,
    });

    scheduled++;
  }

  if (scheduled > 0) {
    logInfo(`[SCHEDULER] Scheduled ${scheduled} ${config.config_key} emails`);
  }

  return scheduled;
}

/**
 * Get scheduled emails with filtering
 */
export async function getScheduledEmails(params?: {
  status?: ScheduledEmailStatus;
  scheduleType?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  emails: Array<{
    id: number;
    guest_id: number | null;
    template_slug: string;
    scheduled_for: Date;
    status: ScheduledEmailStatus;
    schedule_type: string;
    created_at: Date;
    sent_at: Date | null;
    guest?: { first_name: string; last_name: string; email: string } | null;
  }>;
  total: number;
}> {
  const where: Record<string, unknown> = {};

  if (params?.status) {
    where.status = params.status;
  }
  if (params?.scheduleType) {
    where.schedule_type = params.scheduleType;
  }

  const [emails, total] = await Promise.all([
    prisma.scheduledEmail.findMany({
      where,
      orderBy: { scheduled_for: 'asc' },
      take: params?.limit || 50,
      skip: params?.offset || 0,
      select: {
        id: true,
        guest_id: true,
        template_slug: true,
        scheduled_for: true,
        status: true,
        schedule_type: true,
        created_at: true,
        sent_at: true,
      },
    }),
    prisma.scheduledEmail.count({ where }),
  ]);

  // Fetch guest info for emails with guest_id
  const guestIds = emails.filter(e => e.guest_id).map(e => e.guest_id as number);
  const guests = await prisma.guest.findMany({
    where: { id: { in: guestIds } },
    select: { id: true, first_name: true, last_name: true, email: true },
  });
  const guestMap = new Map(guests.map(g => [g.id, g]));

  return {
    emails: emails.map(e => ({
      ...e,
      guest: e.guest_id ? guestMap.get(e.guest_id) || null : null,
    })),
    total,
  };
}

/**
 * Get scheduler statistics
 */
export async function getSchedulerStats(): Promise<{
  pending: number;
  sent_today: number;
  failed_today: number;
  upcoming_24h: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [pending, sentToday, failedToday, upcoming24h] = await Promise.all([
    prisma.scheduledEmail.count({ where: { status: 'pending' } }),
    prisma.scheduledEmail.count({
      where: {
        status: 'sent',
        sent_at: { gte: today, lt: tomorrow },
      },
    }),
    prisma.scheduledEmail.count({
      where: {
        status: 'failed',
        created_at: { gte: today },
      },
    }),
    prisma.scheduledEmail.count({
      where: {
        status: 'pending',
        scheduled_for: { lte: in24h },
      },
    }),
  ]);

  return {
    pending,
    sent_today: sentToday,
    failed_today: failedToday,
    upcoming_24h: upcoming24h,
  };
}

/**
 * Initialize default scheduler configurations
 */
export async function initializeDefaultConfigs(): Promise<void> {
  const defaultConfigs = [
    {
      config_key: 'payment_reminder',
      name: 'Payment Reminder',
      description: 'Automatic reminder for guests with pending payments',
      template_slug: 'payment_reminder',
      interval_days: 3,
      send_time: '09:00',
      enabled: true,
    },
    {
      config_key: 'event_reminder',
      name: 'Event Reminder (1 day before)',
      description: 'Reminder sent 1 day before the event',
      template_slug: 'event_reminder',
      days_before: 1,
      send_time: '09:00',
      enabled: true,
    },
    {
      config_key: 'event_reminder_e10',
      name: 'Event Reminder (10 days before)',
      description: 'First reminder sent 10 days before the event',
      template_slug: 'event_reminder_e10',
      days_before: 10,
      send_time: '09:00',
      enabled: true,
    },
    {
      config_key: 'event_reminder_e7',
      name: 'Event Reminder (7 days before)',
      description: 'Second reminder sent 7 days before the event',
      template_slug: 'event_reminder_e7',
      days_before: 7,
      send_time: '09:00',
      enabled: true,
    },
    {
      config_key: 'noshow_payment_request',
      name: 'No-Show Payment Request',
      description: 'Payment request sent to guests who did not attend or cancel',
      template_slug: 'noshow_payment_request',
      days_after: 1, // 1 day after event
      send_time: '10:00',
      enabled: false, // Disabled by default - admin must enable
    },
  ];

  for (const config of defaultConfigs) {
    const existing = await prisma.schedulerConfig.findUnique({
      where: { config_key: config.config_key },
    });

    if (!existing) {
      await prisma.schedulerConfig.create({
        data: config,
      });
      logInfo(`[SCHEDULER] Created default config: ${config.config_key}`);
    }
  }
}
