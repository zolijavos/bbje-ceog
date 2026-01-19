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

// Header image path for confirmation emails
const HEADER_IMAGE_PATH = 'public/images/email-header.jpg';

/**
 * Validate header image exists at startup (warning only, not fatal)
 */
function validateHeaderImage(): void {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), HEADER_IMAGE_PATH);
    if (!fs.existsSync(fullPath)) {
      logError(`[EMAIL] Warning: Header image not found at ${HEADER_IMAGE_PATH}. Confirmation emails will be sent without header image.`);
    }
  } catch {
    // Ignore errors during validation - will fail gracefully at runtime
  }
}

// Validate header image on module load
validateHeaderImage();

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

    // 4. Update guest record - set status to 'invited' when magic link is sent
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        magic_link_hash: hash,
        magic_link_expires_at: expiresAt,
        registration_status: 'invited',
      },
    });

    // 5. Compose email (try DB template first, fallback to hardcoded)
    const appUrl = process.env.APP_URL || 'https://ceogala.mflevents.space';
    const magicLinkUrl = `${appUrl}/register?code=${hash}&email=${encodeURIComponent(guest.email)}`;

    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await renderTemplate('magic_link', {
        guestName: guest.name,
        magicLinkUrl,
        baseUrl: appUrl,
      });
      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    } catch {
      // Fallback to hardcoded template
      const fallback = getMagicLinkEmailTemplate({
        guestName: guest.name,
        magicLinkUrl,
        baseUrl: appUrl,
      });
      subject = 'Invitation to the CEO Gala 2026';
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
        subject: 'CEO Gála 2026 - Registration Invitation',
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
 * Send confirmation email with QR code(s) to main guest
 *
 * For guests with partners: includes BOTH QR codes (main + partner)
 * For single guests: includes only their QR code
 *
 * @param registrationId - Main guest's registration ID
 * @param qrDataUrl - Main guest's QR code data URL
 * @param partnerQrDataUrl - Partner's QR code data URL (optional)
 * @param partnerRegistrationId - Partner's registration ID (optional, for fetching partner data)
 */
export async function sendTicketEmail(
  registrationId: number,
  qrDataUrl?: string,
  partnerQrDataUrl?: string,
  partnerRegistrationId?: number
): Promise<EmailResult> {
  try {
    // 1. Lookup registration with guest and partner info
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        guest: {
          include: {
            paired_with: true, // Get partner guest record if exists
          },
        },
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

    // 2. Generate check-in QR code if not provided
    let guestQrCode = qrDataUrl;
    if (!guestQrCode) {
      const ticket = await generateTicket(registrationId);
      guestQrCode = ticket.qrCodeDataUrl;
    }

    // 3. Determine if guest has a partner
    const hasPartner = !!(registration.partner_name || registration.guest.paired_with);
    let partnerName = registration.partner_name || registration.guest.paired_with?.name || '';
    let partnerQrCode = partnerQrDataUrl;

    // If partner exists but QR not provided, try to generate it
    if (hasPartner && !partnerQrCode && partnerRegistrationId) {
      try {
        const partnerTicket = await generateTicket(partnerRegistrationId);
        partnerQrCode = partnerTicket.qrCodeDataUrl;
      } catch {
        logError(`[TICKET_EMAIL] Failed to generate partner QR for registration ${partnerRegistrationId}`);
      }
    }

    // 4. Prepare CID references for inline images
    const guestQrCid = 'guestqr@ceogala.hu';
    const partnerQrCid = 'partnerqr@ceogala.hu';
    const headerImageCid = 'header@ceogala.hu';
    const guestQrCidRef = `cid:${guestQrCid}`;
    const partnerQrCidRef = hasPartner && partnerQrCode ? `cid:${partnerQrCid}` : '';
    const headerImageCidRef = `cid:${headerImageCid}`;

    // 5. Compose email using new confirmation template
    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await renderTemplate('ticket_delivery', {
        guestName: registration.guest.name,
        guestTitle: registration.guest.title || '',
        partnerName: partnerName || undefined,
        guestQrCode: guestQrCidRef,
        partnerQrCode: partnerQrCidRef || undefined,
        hasPartner: hasPartner ? 'true' : undefined,
        headerImage: headerImageCidRef,
      });
      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    } catch {
      // Fallback to hardcoded template (legacy format)
      const fallback = getTicketDeliveryEmailTemplate({
        guestName: registration.guest.name,
        ticketType: registration.ticket_type,
        qrCodeDataUrl: guestQrCidRef,
        partnerName: partnerName || undefined,
      });
      subject = fallback.subject;
      html = fallback.html;
      text = fallback.text;
    }

    // 6. Prepare images as CID inline attachments
    const guestQrBuffer = dataUrlToBuffer(guestQrCode);
    const attachments: EmailAttachment[] = [
      {
        filename: 'guest-qrcode.png',
        content: guestQrBuffer,
        contentType: 'image/png',
        cid: guestQrCid,
      },
    ];

    // Add partner QR if exists
    if (hasPartner && partnerQrCode) {
      const partnerQrBuffer = dataUrlToBuffer(partnerQrCode);
      attachments.push({
        filename: 'partner-qrcode.png',
        content: partnerQrBuffer,
        contentType: 'image/png',
        cid: partnerQrCid,
      });
    }

    // Add header image
    try {
      const fs = await import('fs');
      const path = await import('path');
      const headerImagePath = path.join(process.cwd(), HEADER_IMAGE_PATH);
      const headerImageBuffer = fs.readFileSync(headerImagePath);
      attachments.push({
        filename: 'email-header.jpg',
        content: headerImageBuffer,
        contentType: 'image/jpeg',
        cid: headerImageCid,
      });
    } catch (headerErr) {
      logError('[TICKET_EMAIL] Failed to load header image:', headerErr);
    }

    // 7. Send email with inline attachments
    const result = await sendEmail({
      to: registration.guest.email,
      subject,
      html,
      text,
      attachments,
    });

    // 8. Log delivery
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
      logError(`[TICKET_EMAIL] Failed to send confirmation to ${registration.guest.email}: ${result.error}`);
    } else {
      logInfo(`[TICKET_EMAIL] Confirmation sent successfully to ${registration.guest.email}`);
    }

    return {
      success: result.success,
      guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[TICKET_EMAIL] Error sending confirmation for registration ${registrationId}:`, errorMessage);

    return {
      success: false,
      guestId: 0,
      error: errorMessage,
    };
  }
}

/**
 * Send confirmation email to partner guest
 *
 * Includes BOTH QR codes (partner's own + main guest's)
 * Uses partner_ticket_delivery template with different cancellation instructions
 *
 * @param partnerRegistrationId - Partner's registration ID
 * @param mainGuestRegistrationId - Main guest's registration ID
 * @param partnerQrDataUrl - Partner's QR code data URL
 * @param mainGuestQrDataUrl - Main guest's QR code data URL
 */
export async function sendPartnerTicketEmail(
  partnerRegistrationId: number,
  mainGuestRegistrationId: number,
  partnerQrDataUrl?: string,
  mainGuestQrDataUrl?: string
): Promise<EmailResult> {
  try {
    // 1. Lookup partner registration with guest data
    const partnerRegistration = await prisma.registration.findUnique({
      where: { id: partnerRegistrationId },
      include: {
        guest: true,
      },
    });

    // 2. Lookup main guest registration
    const mainGuestRegistration = await prisma.registration.findUnique({
      where: { id: mainGuestRegistrationId },
      include: {
        guest: true,
      },
    });

    if (!partnerRegistration || !partnerRegistration.guest) {
      return {
        success: false,
        guestId: 0,
        error: 'PARTNER_REGISTRATION_NOT_FOUND',
      };
    }

    if (!mainGuestRegistration || !mainGuestRegistration.guest) {
      return {
        success: false,
        guestId: 0,
        error: 'MAIN_GUEST_REGISTRATION_NOT_FOUND',
      };
    }

    const partnerId = partnerRegistration.guest.id;

    // 3. Generate QR codes if not provided
    let partnerQrCode = partnerQrDataUrl;
    if (!partnerQrCode) {
      const ticket = await generateTicket(partnerRegistrationId);
      partnerQrCode = ticket.qrCodeDataUrl;
    }

    let mainGuestQrCode = mainGuestQrDataUrl;
    if (!mainGuestQrCode) {
      const ticket = await generateTicket(mainGuestRegistrationId);
      mainGuestQrCode = ticket.qrCodeDataUrl;
    }

    // 4. Prepare CID references for inline images
    const partnerQrCid = 'partnerqr@ceogala.hu';
    const mainGuestQrCid = 'mainguestqr@ceogala.hu';
    const headerImageCid = 'header@ceogala.hu';
    const partnerQrCidRef = `cid:${partnerQrCid}`;
    const mainGuestQrCidRef = `cid:${mainGuestQrCid}`;
    const headerImageCidRef = `cid:${headerImageCid}`;

    // 5. Compose email using partner confirmation template
    let subject: string;
    let html: string;
    let text: string;

    try {
      const rendered = await renderTemplate('partner_ticket_delivery', {
        partnerName: partnerRegistration.guest.name,
        partnerTitle: partnerRegistration.guest.title || '',
        mainGuestName: mainGuestRegistration.guest.name,
        mainGuestTitle: mainGuestRegistration.guest.title || '',
        partnerQrCode: partnerQrCidRef,
        mainGuestQrCode: mainGuestQrCidRef,
        headerImage: headerImageCidRef,
      });
      subject = rendered.subject;
      html = rendered.html;
      text = rendered.text;
    } catch {
      // Fallback to basic template format
      const fallback = getTicketDeliveryEmailTemplate({
        guestName: partnerRegistration.guest.name,
        ticketType: partnerRegistration.ticket_type,
        qrCodeDataUrl: partnerQrCidRef,
        partnerName: mainGuestRegistration.guest.name,
      });
      subject = fallback.subject;
      html = fallback.html;
      text = fallback.text;
    }

    // 6. Prepare images as CID inline attachments
    const partnerQrBuffer = dataUrlToBuffer(partnerQrCode);
    const mainGuestQrBuffer = dataUrlToBuffer(mainGuestQrCode);

    const attachments: EmailAttachment[] = [
      {
        filename: 'your-qrcode.png',
        content: partnerQrBuffer,
        contentType: 'image/png',
        cid: partnerQrCid,
      },
      {
        filename: 'partner-qrcode.png',
        content: mainGuestQrBuffer,
        contentType: 'image/png',
        cid: mainGuestQrCid,
      },
    ];

    // Add header image
    try {
      const fs = await import('fs');
      const path = await import('path');
      const headerImagePath = path.join(process.cwd(), HEADER_IMAGE_PATH);
      const headerImageBuffer = fs.readFileSync(headerImagePath);
      attachments.push({
        filename: 'email-header.jpg',
        content: headerImageBuffer,
        contentType: 'image/jpeg',
        cid: headerImageCid,
      });
    } catch (headerErr) {
      logError('[PARTNER_TICKET_EMAIL] Failed to load header image:', headerErr);
    }

    // 7. Send email with inline attachments
    const result = await sendEmail({
      to: partnerRegistration.guest.email,
      subject,
      html,
      text,
      attachments,
    });

    // 8. Log delivery
    await logEmailDelivery({
      guestId: partnerId,
      recipient: partnerRegistration.guest.email,
      subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'partner_ticket_delivery',
      htmlBody: html,
      textBody: text,
    });

    if (!result.success) {
      logError(`[PARTNER_TICKET_EMAIL] Failed to send confirmation to ${partnerRegistration.guest.email}: ${result.error}`);
    } else {
      logInfo(`[PARTNER_TICKET_EMAIL] Confirmation sent successfully to ${partnerRegistration.guest.email}`);
    }

    return {
      success: result.success,
      guestId: partnerId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[PARTNER_TICKET_EMAIL] Error sending confirmation for partner registration ${partnerRegistrationId}:`, errorMessage);

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
 * @param partnerRegistrationId - Optional partner's registration ID (for paired confirmation)
 */
export async function generateAndSendTicket(
  registrationId: number,
  partnerRegistrationId?: number
): Promise<EmailResult> {
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

    // We have the lock - now generate the main guest's ticket
    const mainTicket = await generateTicket(registrationId);

    // If partner registration provided, generate partner's ticket too
    let partnerQrDataUrl: string | undefined;
    if (partnerRegistrationId) {
      try {
        // Also acquire lock for partner ticket
        const partnerAcquired = await tryAcquireTicketLock(partnerRegistrationId);
        if (partnerAcquired) {
          const partnerTicket = await generateTicket(partnerRegistrationId);
          partnerQrDataUrl = partnerTicket.qrCodeDataUrl;
        } else {
          // Partner ticket might already exist - try to get it
          const existingPartnerTicket = await getExistingTicket(partnerRegistrationId);
          if (existingPartnerTicket) {
            partnerQrDataUrl = existingPartnerTicket.qrCodeDataUrl;
          }
        }
      } catch (error) {
        logError(`[TICKET] Error generating partner ticket for registration ${partnerRegistrationId}:`, error);
      }
    }

    // Send confirmation email to main guest (with both QR codes if partner exists)
    return await sendTicketEmail(
      registrationId,
      mainTicket.qrCodeDataUrl,
      partnerQrDataUrl,
      partnerRegistrationId
    );
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
 * Generate and send paired confirmation emails (main guest + partner)
 *
 * This function handles the complete flow for paired registrations:
 * 1. Generates both QR codes
 * 2. Sends confirmation email to main guest (with both QRs)
 * 3. Sends confirmation email to partner (with both QRs)
 *
 * @param mainRegistrationId - Main guest's registration ID
 * @param partnerRegistrationId - Partner's registration ID
 */
export async function generateAndSendPairedTickets(
  mainRegistrationId: number,
  partnerRegistrationId: number
): Promise<{ mainResult: EmailResult; partnerResult: EmailResult }> {
  logInfo(`[PAIRED_TICKETS] Starting paired ticket generation for main=${mainRegistrationId}, partner=${partnerRegistrationId}`);

  let mainQrDataUrl: string | undefined;
  let partnerQrDataUrl: string | undefined;

  // 1. Generate main guest's QR code
  try {
    const mainAcquired = await tryAcquireTicketLock(mainRegistrationId);
    if (mainAcquired) {
      const mainTicket = await generateTicket(mainRegistrationId);
      mainQrDataUrl = mainTicket.qrCodeDataUrl;
    } else {
      const existing = await getExistingTicket(mainRegistrationId);
      if (existing) {
        mainQrDataUrl = existing.qrCodeDataUrl;
        logInfo(`[PAIRED_TICKETS] Main guest ticket already exists, using existing QR`);
      }
    }
  } catch (error) {
    logError(`[PAIRED_TICKETS] Error generating main guest ticket:`, error);
  }

  // 2. Generate partner's QR code
  try {
    const partnerAcquired = await tryAcquireTicketLock(partnerRegistrationId);
    if (partnerAcquired) {
      const partnerTicket = await generateTicket(partnerRegistrationId);
      partnerQrDataUrl = partnerTicket.qrCodeDataUrl;
    } else {
      const existing = await getExistingTicket(partnerRegistrationId);
      if (existing) {
        partnerQrDataUrl = existing.qrCodeDataUrl;
        logInfo(`[PAIRED_TICKETS] Partner ticket already exists, using existing QR`);
      }
    }
  } catch (error) {
    logError(`[PAIRED_TICKETS] Error generating partner ticket:`, error);
  }

  // 3. Send confirmation email to main guest (with both QRs)
  let mainResult: EmailResult = { success: false, guestId: 0, error: 'QR generation failed' };
  if (mainQrDataUrl) {
    mainResult = await sendTicketEmail(
      mainRegistrationId,
      mainQrDataUrl,
      partnerQrDataUrl,
      partnerRegistrationId
    );
  }

  // 4. Send confirmation email to partner (with both QRs)
  let partnerResult: EmailResult = { success: false, guestId: 0, error: 'QR generation failed' };
  if (partnerQrDataUrl && mainQrDataUrl) {
    partnerResult = await sendPartnerTicketEmail(
      partnerRegistrationId,
      mainRegistrationId,
      partnerQrDataUrl,
      mainQrDataUrl
    );
  }

  logInfo(`[PAIRED_TICKETS] Completed: main=${mainResult.success}, partner=${partnerResult.success}`);

  return { mainResult, partnerResult };
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

/**
 * Send registration feedback email to main guest (immediately after registration)
 * Shows all submitted data for review before official confirmation
 */
export async function sendRegistrationFeedbackEmail(params: {
  guestId: number;
  guestEmail: string;
  guestTitle?: string;
  guestName: string;
  guestCompany?: string;
  guestPhone?: string;
  guestDiet?: string;
  guestSeating?: string;
  hasPartner: boolean;
  partnerTitle?: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  partnerDiet?: string;
  partnerSeating?: string;
}): Promise<EmailResult> {
  try {
    const appUrl = process.env.APP_URL || 'https://ceogala.mflevents.space';
    const headerImageUrl = `${appUrl}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg`;

    const rendered = await renderTemplate('registration_feedback', {
      guestTitle: params.guestTitle || '',
      guestName: params.guestName,
      guestCompany: params.guestCompany || '-',
      guestPhone: params.guestPhone || '-',
      guestEmail: params.guestEmail,
      guestDiet: params.guestDiet || 'No special requirements',
      guestSeating: params.guestSeating || 'No preferences',
      hasPartner: params.hasPartner ? 'Yes' : 'No',
      partnerTitle: params.partnerTitle || '',
      partnerName: params.partnerName || '',
      partnerPhone: params.partnerPhone || '-',
      partnerEmail: params.partnerEmail || '-',
      partnerDiet: params.partnerDiet || 'No special requirements',
      partnerSeating: params.partnerSeating || 'No preferences',
      headerImage: headerImageUrl,
      baseUrl: appUrl,
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
      emailType: 'registration_feedback',
      htmlBody: rendered.html,
      textBody: rendered.text,
    });

    if (result.success) {
      logInfo(`[REGISTRATION_FEEDBACK] Email sent to ${params.guestEmail}`);
    } else {
      logError(`[REGISTRATION_FEEDBACK] Failed to send email to ${params.guestEmail}: ${result.error}`);
    }

    return {
      success: result.success,
      guestId: params.guestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[REGISTRATION_FEEDBACK] Error sending email:`, errorMessage);
    return { success: false, guestId: params.guestId, error: errorMessage };
  }
}

/**
 * Send registration feedback email to partner (immediately after main guest registration)
 * Informs partner they've been registered by main guest
 */
export async function sendRegistrationFeedbackPartnerEmail(params: {
  partnerId?: number; // May not have a guest record yet
  partnerEmail: string;
  partnerTitle?: string;
  partnerName: string;
  partnerCompany?: string;
  partnerPhone?: string;
  partnerDiet?: string;
  partnerSeating?: string;
  mainGuestTitle?: string;
  mainGuestName: string;
  mainGuestId: number;
}): Promise<EmailResult> {
  try {
    const appUrl = process.env.APP_URL || 'https://ceogala.mflevents.space';
    const headerImageUrl = `${appUrl}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg`;

    const rendered = await renderTemplate('registration_feedback_partner', {
      partnerTitle: params.partnerTitle || '',
      partnerName: params.partnerName,
      partnerCompany: params.partnerCompany || '-',
      partnerPhone: params.partnerPhone || '-',
      partnerEmail: params.partnerEmail,
      partnerDiet: params.partnerDiet || 'No special requirements',
      partnerSeating: params.partnerSeating || 'No preferences',
      mainGuestTitle: params.mainGuestTitle || '',
      mainGuestName: params.mainGuestName,
      headerImage: headerImageUrl,
      baseUrl: appUrl,
    });

    const result = await sendEmail({
      to: params.partnerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    // Log with main guest ID if partner doesn't have their own guest record
    await logEmailDelivery({
      guestId: params.partnerId || params.mainGuestId,
      recipient: params.partnerEmail,
      subject: rendered.subject,
      success: result.success,
      errorMessage: result.error,
      emailType: 'registration_feedback_partner',
      htmlBody: rendered.html,
      textBody: rendered.text,
    });

    if (result.success) {
      logInfo(`[REGISTRATION_FEEDBACK_PARTNER] Email sent to ${params.partnerEmail} (registered by ${params.mainGuestName})`);
    } else {
      logError(`[REGISTRATION_FEEDBACK_PARTNER] Failed to send email to ${params.partnerEmail}: ${result.error}`);
    }

    return {
      success: result.success,
      guestId: params.partnerId || params.mainGuestId,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`[REGISTRATION_FEEDBACK_PARTNER] Error sending email:`, errorMessage);
    return { success: false, guestId: params.partnerId || params.mainGuestId, error: errorMessage };
  }
}

/**
 * Send both registration feedback emails (main guest + partner if applicable)
 * Call this after VIP registration to send acknowledgment emails
 */
export async function sendRegistrationFeedbackEmails(params: {
  guestId: number;
  guestEmail: string;
  guestTitle?: string;
  guestName: string;
  guestCompany?: string;
  guestPhone?: string;
  guestDiet?: string;
  guestSeating?: string;
  hasPartner: boolean;
  partnerGuestId?: number;
  partnerTitle?: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerEmail?: string;
  partnerDiet?: string;
  partnerSeating?: string;
}): Promise<{ mainResult: EmailResult; partnerResult?: EmailResult }> {
  // Send feedback to main guest
  const mainResult = await sendRegistrationFeedbackEmail({
    guestId: params.guestId,
    guestEmail: params.guestEmail,
    guestTitle: params.guestTitle,
    guestName: params.guestName,
    guestCompany: params.guestCompany,
    guestPhone: params.guestPhone,
    guestDiet: params.guestDiet,
    guestSeating: params.guestSeating,
    hasPartner: params.hasPartner,
    partnerTitle: params.partnerTitle,
    partnerName: params.partnerName,
    partnerPhone: params.partnerPhone,
    partnerEmail: params.partnerEmail,
    partnerDiet: params.partnerDiet,
    partnerSeating: params.partnerSeating,
  });

  // Send feedback to partner if they have an email
  let partnerResult: EmailResult | undefined;
  if (params.hasPartner && params.partnerEmail && params.partnerName) {
    partnerResult = await sendRegistrationFeedbackPartnerEmail({
      partnerId: params.partnerGuestId,
      partnerEmail: params.partnerEmail,
      partnerTitle: params.partnerTitle,
      partnerName: params.partnerName,
      partnerCompany: params.guestCompany, // Partner typically shares company with main guest
      partnerPhone: params.partnerPhone,
      partnerDiet: params.partnerDiet,
      partnerSeating: params.partnerSeating,
      mainGuestTitle: params.guestTitle,
      mainGuestName: params.guestName,
      mainGuestId: params.guestId,
    });
  }

  return { mainResult, partnerResult };
}
