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
import { generateTicket, getExistingTicket } from '@/lib/services/qr-ticket';
import { logError, logInfo } from '@/lib/utils/logger';
import type { TicketType } from '@prisma/client';

// Singleton Nodemailer transport for connection pooling (thread-safe with Promise)
let transporterPromise: Promise<Transporter> | null = null;

/**
 * Get or create the singleton Nodemailer transporter (async, thread-safe)
 *
 * Uses Promise-based lazy initialization to prevent race conditions in serverless environments.
 */
async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) {
    return transporterPromise;
  }

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
}

/**
 * Send email with retry logic (3 attempts with exponential backoff)
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
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

/**
 * Check rate limit for guest emails
 * Max 5 emails per guest per hour (database-backed via email_logs)
 */
export async function checkRateLimit(guestId: number): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 3600000);

  const recentEmails = await prisma.emailLog.count({
    where: {
      guest_id: guestId,
      email_type: 'magic_link',
      sent_at: { gte: oneHourAgo },
    },
  });

  return recentEmails < 5;
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
  emailType?: 'magic_link' | 'ticket_delivery';
}): Promise<void> {
  await prisma.emailLog.create({
    data: {
      guest_id: params.guestId,
      email_type: params.emailType || 'magic_link',
      recipient: params.recipient,
      subject: params.subject,
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
      const withinLimit = await checkRateLimit(guestId);
      if (!withinLimit) {
        return {
          success: false,
          guestId,
          error: 'Rate limit exceeded. Maximum 5 emails per hour.',
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
 * Send e-ticket email with QR code to a guest
 *
 * 1. Lookup registration with guest data
 * 2. Generate QR code (or use provided)
 * 3. Compose email with inline QR
 * 4. Send via Nodemailer
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

    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await renderTemplate('ticket_delivery', {
        guestName: registration.guest.name,
        ticketType: ticketTypeLabel,
        qrCodeDataUrl: qrCode,
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
        qrCodeDataUrl: qrCode,
        partnerName: registration.partner_name || undefined,
      });
      subject = fallback.subject;
      html = fallback.html;
      text = fallback.text;
    }

    // 4. Send email
    const result = await sendEmail({
      to: registration.guest.email,
      subject,
      html,
      text,
    });

    // 5. Log delivery
    await logEmailDelivery({
      guestId,
      recipient: registration.guest.email,
      subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'ticket_delivery',
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
 * IDEMPOTENT: If ticket already exists, returns early without re-sending email.
 * This prevents duplicate emails from Stripe webhook retries.
 *
 * @param registrationId - Registration ID
 */
export async function generateAndSendTicket(registrationId: number): Promise<EmailResult> {
  try {
    // Check if ticket already exists (idempotency check)
    const existingTicket = await getExistingTicket(registrationId);
    if (existingTicket) {
      logInfo(`[TICKET] Ticket already exists for registration ${registrationId} (idempotent)`);
      return {
        success: false,
        guestId: 0,
        error: 'TICKET_ALREADY_EXISTS',
      };
    }

    // Generate new QR ticket
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
