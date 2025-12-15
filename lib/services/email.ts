/**
 * Email Service Module
 * Handles email delivery via Nodemailer SMTP with retry logic and logging
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { prisma } from '@/lib/db/prisma';
import { generateMagicLinkHash } from '@/lib/auth/magic-link';
import { getMagicLinkEmailTemplate } from '@/lib/email-templates/magic-link';
import { getTicketDeliveryEmailTemplate } from '@/lib/email-templates/ticket-delivery';
import { renderTemplate } from '@/lib/services/email-templates';
import { generateTicket, getExistingTicket, tryAcquireTicketLock } from '@/lib/services/qr-ticket';
import { logError, logInfo } from '@/lib/utils/logger';
import type { TicketType } from '@prisma/client';

// Singleton Nodemailer transport for connection pooling (thread-safe)
let transporterPromise: Promise<Transporter> | null = null;
let isInitializing = false;

/**
 * Validate required SMTP configuration
 * Throws descriptive error if any required env vars are missing
 */
function validateSmtpConfig(): void {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing SMTP configuration: ${missing.join(', ')}. ` +
      `Please set these environment variables.`
    );
  }
}

// Maximum time to wait for transporter initialization (10 seconds)
const TRANSPORTER_INIT_TIMEOUT_MS = 10000;

/**
 * Get or create the singleton Nodemailer transporter (async, thread-safe)
 *
 * Uses mutex-like pattern to prevent race conditions in serverless environments.
 * Validates SMTP configuration before creating transport.
 * Includes timeout to prevent infinite wait if initialization hangs.
 */
async function getTransporter(): Promise<Transporter> {
  // Return existing transporter if available
  if (transporterPromise) {
    return transporterPromise;
  }

  // Wait if another request is already initializing (with timeout)
  if (isInitializing) {
    const startTime = Date.now();
    while (isInitializing) {
      // Timeout protection: prevent infinite loop if initialization hangs
      if (Date.now() - startTime > TRANSPORTER_INIT_TIMEOUT_MS) {
        logError('[EMAIL] Transporter initialization timeout - forcing new initialization');
        isInitializing = false; // Force reset to allow new initialization
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (transporterPromise) return transporterPromise;
  }

  // Set initializing flag to prevent concurrent initialization
  isInitializing = true;

  try {
    // Validate SMTP config before creating transport
    validateSmtpConfig();

    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );

    return transporterPromise;
  } finally {
    isInitializing = false;
  }
}

/**
 * Email attachment interface for CID inline attachments
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string; // Content-ID for inline images
}

/**
 * Send email with retry logic (3 attempts with exponential backoff)
 * Supports CID inline attachments for images
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; error?: string }> {
  const transport = await getTransporter();
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM || 'noreply@ceogala.test',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });
      return { success: true };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logError(`Email send attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown email error',
  };
}

// Rate limit constants
const RATE_LIMIT_PER_TYPE_PER_HOUR = 5;  // Max 5 emails of same type per hour
const RATE_LIMIT_GLOBAL_PER_HOUR = 20;   // Max 20 emails total per hour per guest

/**
 * Check rate limit for guest emails
 *
 * Enforces two limits:
 * - Per-type limit: Max 5 emails of the same type per hour (e.g., max 5 magic links)
 * - Global limit: Max 20 emails total per hour per guest (prevents DoS via multiple types)
 *
 * @param guestId - Guest ID to check
 * @param emailType - Optional email type for per-type limit (if not provided, only global limit applies)
 * @returns true if within rate limit, false if exceeded
 */
export async function checkRateLimit(
  guestId: number,
  emailType?: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000);

  // Check global rate limit (all email types)
  const globalCount = await prisma.emailLog.count({
    where: {
      guest_id: guestId,
      sent_at: { gte: oneHourAgo },
    },
  });

  if (globalCount >= RATE_LIMIT_GLOBAL_PER_HOUR) {
    logInfo(`[RATE_LIMIT] Guest ${guestId} exceeded global rate limit (${globalCount}/${RATE_LIMIT_GLOBAL_PER_HOUR})`);
    return false;
  }

  // Check per-type rate limit if email type provided
  if (emailType) {
    const typeCount = await prisma.emailLog.count({
      where: {
        guest_id: guestId,
        email_type: emailType,
        sent_at: { gte: oneHourAgo },
      },
    });

    if (typeCount >= RATE_LIMIT_PER_TYPE_PER_HOUR) {
      logInfo(`[RATE_LIMIT] Guest ${guestId} exceeded ${emailType} rate limit (${typeCount}/${RATE_LIMIT_PER_TYPE_PER_HOUR})`);
      return false;
    }
  }

  return true;
}

/**
 * Log email delivery attempt to database
 */
export async function logEmailDelivery(params: {
  guestId: number;
  recipient: string;
  subject: string;
  success: boolean;
  errorMessage?: string;
  emailType?: string;
  htmlBody?: string;
  textBody?: string;
}): Promise<void> {
  await prisma.emailLog.create({
    data: {
      guest_id: params.guestId,
      email_type: params.emailType || 'magic_link',
      recipient: params.recipient,
      subject: params.subject,
      html_body: params.htmlBody || null,
      text_body: params.textBody || null,
      status: params.success ? 'sent' : 'failed',
      error_message: params.errorMessage || null,
    },
  });
}

/**
 * Result type for email operations
 */
export type EmailResult = {
  success: boolean;
  guestId: number;
  error?: string;
};

/**
 * Send magic link email to a guest
 *
 * 1. Lookup guest by ID
 * 2. Check rate limit (unless bypassed)
 * 3. Generate magic link hash
 * 4. Update guest record with hash and expiry
 * 5. Compose and send email
 * 6. Log delivery attempt
 *
 * @param guestId - Guest ID to send email to
 * @param options - Optional settings
 * @param options.bypassRateLimit - Skip rate limit check (for expired link requests)
 */
export async function sendMagicLinkEmail(
  guestId: number,
  options: { bypassRateLimit?: boolean } = {}
): Promise<EmailResult> {
  try {
    // 1. Lookup guest
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      return {
        success: false,
        guestId,
        error: 'Guest not found',
      };
    }

    // 2. Check rate limit (unless bypassed)
    if (!options.bypassRateLimit) {
      const withinLimit = await checkRateLimit(guestId, 'magic_link');
      if (!withinLimit) {
        return {
          success: false,
          guestId,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }
    }

    // 3. Generate magic link hash
    const { hash, expiresAt } = generateMagicLinkHash(guest.email);

    // 4. Update guest record
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        magic_link_hash: hash,
        magic_link_expires_at: expiresAt,
      },
    });

    // 5. Compose email (try DB template first, fallback to hardcoded)
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const magicLinkUrl = `${appUrl}/register?code=${hash}&email=${encodeURIComponent(guest.email)}`;

    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await renderTemplate('magic_link', {
        guestName: guest.name,
        magicLinkUrl,
      });
      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    } catch {
      // Fallback to hardcoded template
      const fallback = getMagicLinkEmailTemplate({
        guestName: guest.name,
        magicLinkUrl,
      });
      subject = 'CEO Gala - Registration Invitation';
      html = fallback.html;
      text = fallback.text;
    }

    // 6. Send email
    const result = await sendEmail({
      to: guest.email,
      subject,
      html,
      text,
    });

    // 7. Log delivery
    await logEmailDelivery({
      guestId,
      recipient: guest.email,
      subject,
      success: result.success,
      errorMessage: result.error,
      htmlBody: html,
      textBody: text,
    });

    return {
      success: result.success,
      guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log failed attempt
    try {
      await logEmailDelivery({
        guestId,
        recipient: 'unknown',
        subject: 'CEO Gala - Registration Invitation',
        success: false,
        errorMessage,
      });
    } catch {
      logError('Failed to log email delivery error');
    }

    return {
      success: false,
      guestId,
      error: errorMessage,
    };
  }
}

/**
 * Send magic link emails to multiple guests
 * Returns summary of sent and failed emails
 */
export async function sendBulkMagicLinkEmails(guestIds: number[]): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ guest_id: number; error: string }>;
}> {
  const results = await Promise.all(
    guestIds.map(guestId => sendMagicLinkEmail(guestId))
  );

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errors = results
    .filter(r => !r.success)
    .map(r => ({
      guest_id: r.guestId,
      error: r.error || 'Unknown error',
    }));

  return {
    success: failed === 0,
    sent,
    failed,
    errors,
  };
}

/**
 * Convert base64 data URL to Buffer for email attachment
 * @param dataUrl - Data URL like "data:image/png;base64,XXXX..."
 * @returns Buffer containing the image data
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  // Extract base64 portion after the comma
  const base64Data = dataUrl.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}

/**
 * Send e-ticket email with QR code to a guest
 *
 * 1. Lookup registration with guest data
 * 2. Generate QR code (or use provided)
 * 3. Compose email with inline QR using CID attachment
 * 4. Send via Nodemailer with QR as inline attachment
 * 5. Log delivery attempt
 *
 * @param registrationId - Registration ID to send ticket for
 * @param qrDataUrl - Optional pre-generated QR code data URL (generates if not provided)
 */
export async function sendTicketEmail(
  registrationId: number,
  qrDataUrl?: string
): Promise<EmailResult> {
  try {
    // 1. Lookup registration with guest
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        guest: true,
      },
    });

    if (!registration) {
      return {
        success: false,
        guestId: 0,
        error: 'REGISTRATION_NOT_FOUND',
      };
    }

    if (!registration.guest) {
      return {
        success: false,
        guestId: 0,
        error: 'GUEST_NOT_FOUND',
      };
    }

    const guestId = registration.guest.id;

    // 2. Generate QR code if not provided
    let qrCode = qrDataUrl;
    if (!qrCode) {
      const ticket = await generateTicket(registrationId);
      qrCode = ticket.qrCodeDataUrl;
    }

    // 3. Compose email (try DB template first, fallback to hardcoded)
    const ticketTypeLabels: Record<TicketType, string> = {
      vip_free: 'VIP Ticket',
      paid_single: 'Single Ticket',
      paid_paired: 'Paired Ticket',
    };
    const ticketTypeLabel = ticketTypeLabels[registration.ticket_type] || registration.ticket_type;

    // Use CID reference for inline image instead of data URL
    const qrCodeCid = 'qrcode@ceogala.hu';
    const qrCodeCidRef = `cid:${qrCodeCid}`;

    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await renderTemplate('ticket_delivery', {
        guestName: registration.guest.name,
        ticketType: ticketTypeLabel,
        qrCodeDataUrl: qrCodeCidRef, // Use CID reference
        partnerName: registration.partner_name || undefined,
      });
      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    } catch {
      // Fallback to hardcoded template
      const fallback = getTicketDeliveryEmailTemplate({
        guestName: registration.guest.name,
        ticketType: registration.ticket_type,
        qrCodeDataUrl: qrCodeCidRef, // Use CID reference
        partnerName: registration.partner_name || undefined,
      });
      subject = fallback.subject;
      html = fallback.html;
      text = fallback.text;
    }

    // 4. Prepare QR code as CID inline attachment
    const qrCodeBuffer = dataUrlToBuffer(qrCode);
    const attachments: EmailAttachment[] = [
      {
        filename: 'qrcode.png',
        content: qrCodeBuffer,
        contentType: 'image/png',
        cid: qrCodeCid, // Content-ID for inline reference
      },
    ];

    // 5. Send email with inline attachment
    const result = await sendEmail({
      to: registration.guest.email,
      subject,
      html,
      text,
      attachments,
    });

    // 6. Log delivery
    await logEmailDelivery({
      guestId,
      recipient: registration.guest.email,
      subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'ticket_delivery',
      htmlBody: html,
      textBody: text,
    });

    if (!result.success) {
      logError(`[TICKET_EMAIL] Failed to send ticket to ${registration.guest.email}: ${result.error}`);
    } else {
      logInfo(`[TICKET_EMAIL] Ticket sent successfully to ${registration.guest.email}`);
    }

    return {
      success: result.success,
      guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[TICKET_EMAIL] Error sending ticket for registration ${registrationId}:`, errorMessage);

    return {
      success: false,
      guestId: 0,
      error: errorMessage,
    };
  }
}

/**
 * Generate QR ticket and send email for a registration
 * Combines QR generation (Story 2.3) and email delivery (Story 2.4)
 *
 * IDEMPOTENT: Uses atomic lock to prevent duplicate ticket generation.
 * This prevents duplicate emails from Stripe webhook retries and concurrent requests.
 *
 * @param registrationId - Registration ID
 */
export async function generateAndSendTicket(registrationId: number): Promise<EmailResult> {
  try {
    // Atomic idempotency check - try to acquire lock for ticket generation
    // Uses updateMany with WHERE qr_code_hash IS NULL to prevent TOCTOU race condition
    const acquired = await tryAcquireTicketLock(registrationId);

    if (!acquired) {
      // Either ticket already exists or registration not found
      const existingTicket = await getExistingTicket(registrationId);
      if (existingTicket) {
        logInfo(`[TICKET] Ticket already exists for registration ${registrationId} (idempotent)`);
        return {
          success: false,
          guestId: 0,
          error: 'TICKET_ALREADY_EXISTS',
        };
      }
      // Registration not found
      logError(`[TICKET] Failed to acquire lock for registration ${registrationId}`);
      return {
        success: false,
        guestId: 0,
        error: 'REGISTRATION_NOT_FOUND',
      };
    }

    // We have the lock - now generate the ticket
    const ticket = await generateTicket(registrationId);

    // Send email with the QR code
    return await sendTicketEmail(registrationId, ticket.qrCodeDataUrl);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[TICKET] Error generating and sending ticket for registration ${registrationId}:`, errorMessage);

    return {
      success: false,
      guestId: 0,
      error: errorMessage,
    };
  }
}

/**
 * Send payment confirmation email to a guest
 */
export async function sendPaymentConfirmationEmail(params: {
  guestId: number;
  guestName: string;
  guestEmail: string;
  ticketType: string;
  amount: string;
  paymentDate: string;
  transactionId?: string;
}): Promise<EmailResult> {
  try {
    const rendered = await renderTemplate('payment_confirmation', {
      guestName: params.guestName,
      ticketType: params.ticketType,
      amount: params.amount,
      paymentDate: params.paymentDate,
      transactionId: params.transactionId,
    });

    const result = await sendEmail({
      to: params.guestEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await logEmailDelivery({
      guestId: params.guestId,
      recipient: params.guestEmail,
      subject: rendered.subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'payment_confirmation',
      htmlBody: rendered.html,
      textBody: rendered.text,
    });

    if (result.success) {
      logInfo(`[PAYMENT_CONFIRMATION] Email sent to ${params.guestEmail}`);
    } else {
      logError(`[PAYMENT_CONFIRMATION] Failed to send email to ${params.guestEmail}: ${result.error}`);
    }

    return {
      success: result.success,
      guestId: params.guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[PAYMENT_CONFIRMATION] Error sending email:`, errorMessage);
    return { success: false, guestId: params.guestId, error: errorMessage };
  }
}

/**
 * Send payment reminder email to a guest
 */
export async function sendPaymentReminderEmail(params: {
  guestId: number;
  guestName: string;
  guestEmail: string;
  ticketType: string;
  amount: string;
  paymentUrl: string;
  dueDate?: string;
}): Promise<EmailResult> {
  try {
    const rendered = await renderTemplate('payment_reminder', {
      guestName: params.guestName,
      ticketType: params.ticketType,
      amount: params.amount,
      paymentUrl: params.paymentUrl,
      dueDate: params.dueDate,
    });

    const result = await sendEmail({
      to: params.guestEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await logEmailDelivery({
      guestId: params.guestId,
      recipient: params.guestEmail,
      subject: rendered.subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'payment_reminder',
      htmlBody: rendered.html,
      textBody: rendered.text,
    });

    if (result.success) {
      logInfo(`[PAYMENT_REMINDER] Email sent to ${params.guestEmail}`);
    } else {
      logError(`[PAYMENT_REMINDER] Failed to send email to ${params.guestEmail}: ${result.error}`);
    }

    return {
      success: result.success,
      guestId: params.guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[PAYMENT_REMINDER] Error sending email:`, errorMessage);
    return { success: false, guestId: params.guestId, error: errorMessage };
  }
}

/**
 * Send table assignment notification email to a guest
 */
export async function sendTableAssignmentEmail(params: {
  guestId: number;
  guestName: string;
  guestEmail: string;
  tableName: string;
  seatNumber?: string;
  tablemates?: string;
}): Promise<EmailResult> {
  try {
    const rendered = await renderTemplate('table_assignment', {
      guestName: params.guestName,
      tableName: params.tableName,
      seatNumber: params.seatNumber,
      tablemates: params.tablemates,
    });

    const result = await sendEmail({
      to: params.guestEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await logEmailDelivery({
      guestId: params.guestId,
      recipient: params.guestEmail,
      subject: rendered.subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'table_assignment',
      htmlBody: rendered.html,
      textBody: rendered.text,
    });

    if (result.success) {
      logInfo(`[TABLE_ASSIGNMENT] Email sent to ${params.guestEmail}`);
    } else {
      logError(`[TABLE_ASSIGNMENT] Failed to send email to ${params.guestEmail}: ${result.error}`);
    }

    return {
      success: result.success,
      guestId: params.guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[TABLE_ASSIGNMENT] Error sending email:`, errorMessage);
    return { success: false, guestId: params.guestId, error: errorMessage };
  }
}

/**
 * Send event reminder email to a guest (typically 1 day before event)
 */
export async function sendEventReminderEmail(params: {
  guestId: number;
  guestName: string;
  guestEmail: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventAddress?: string;
  tableName?: string;
}): Promise<EmailResult> {
  try {
    const rendered = await renderTemplate('event_reminder', {
      guestName: params.guestName,
      eventDate: params.eventDate,
      eventTime: params.eventTime,
      eventVenue: params.eventVenue,
      eventAddress: params.eventAddress,
      tableName: params.tableName,
    });

    const result = await sendEmail({
      to: params.guestEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    await logEmailDelivery({
      guestId: params.guestId,
      recipient: params.guestEmail,
      subject: rendered.subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'event_reminder',
      htmlBody: rendered.html,
      textBody: rendered.text,
    });

    if (result.success) {
      logInfo(`[EVENT_REMINDER] Email sent to ${params.guestEmail}`);
    } else {
      logError(`[EVENT_REMINDER] Failed to send email to ${params.guestEmail}: ${result.error}`);
    }

    return {
      success: result.success,
      guestId: params.guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[EVENT_REMINDER] Error sending email:`, errorMessage);
    return { success: false, guestId: params.guestId, error: errorMessage };
  }
}
