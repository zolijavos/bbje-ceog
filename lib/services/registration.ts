/**
 * Registration Service Module
 * Handles guest registration flows for VIP and paid guests
 */

import { prisma } from '@/lib/db/prisma';
import { TicketType, RegistrationStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils/errors';
import { logError, logInfo } from '@/lib/utils/logger';
import { generateAndSendTicket, generateAndSendPairedTickets, sendRegistrationFeedbackEmails } from '@/lib/services/email';
import { getFullName } from '@/lib/utils/name';
import crypto from 'crypto';

/**
 * Generate ticket with retry mechanism and exponential backoff
 * Ensures VIP guests receive their tickets even if initial attempt fails
 *
 * @param registrationId - Registration ID to generate ticket for
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 */
async function generateTicketWithRetry(
  registrationId: number,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ticketResult = await generateAndSendTicket(registrationId);

      if (ticketResult.success) {
        logInfo(`[VIP_REGISTRATION] Ticket sent successfully for registration ${registrationId} (attempt ${attempt})`);
        return;
      }

      // TICKET_ALREADY_EXISTS is not an error - idempotent success
      if (ticketResult.error === 'TICKET_ALREADY_EXISTS') {
        logInfo(`[VIP_REGISTRATION] Ticket already exists for registration ${registrationId} (idempotent)`);
        return;
      }

      // Log failure and retry if not last attempt
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        logError(`[VIP_REGISTRATION] Attempt ${attempt}/${maxRetries} failed for registration ${registrationId}: ${ticketResult.error}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // Final attempt failed - log critical error
        logError(`[VIP_REGISTRATION] CRITICAL: All ${maxRetries} attempts failed for registration ${registrationId}. Last error: ${ticketResult.error}. Manual intervention required!`);
        // TODO: Consider adding admin notification or ticket_generation_failed flag
      }
    } catch (err) {
      // Unexpected error - log and retry
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        logError(`[VIP_REGISTRATION] Unexpected error on attempt ${attempt}/${maxRetries} for registration ${registrationId}:`, err);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        logError(`[VIP_REGISTRATION] CRITICAL: All ${maxRetries} attempts crashed for registration ${registrationId}. Manual intervention required!`, err);
      }
    }
  }
}

/**
 * Generate paired tickets with retry mechanism
 * Sends confirmation emails to BOTH main guest and partner with BOTH QR codes
 *
 * @param mainRegistrationId - Main guest's registration ID
 * @param partnerRegistrationId - Partner's registration ID
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 */
async function generatePairedTicketsWithRetry(
  mainRegistrationId: number,
  partnerRegistrationId: number,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateAndSendPairedTickets(mainRegistrationId, partnerRegistrationId);

      // Check if both emails were sent successfully
      if (result.mainResult.success && result.partnerResult.success) {
        logInfo(`[VIP_REGISTRATION] Paired tickets sent successfully for main=${mainRegistrationId}, partner=${partnerRegistrationId} (attempt ${attempt})`);
        return;
      }

      // Partial success - at least one email sent
      if (result.mainResult.success || result.partnerResult.success) {
        logInfo(`[VIP_REGISTRATION] Partial success for paired tickets: main=${result.mainResult.success}, partner=${result.partnerResult.success}`);
        // Don't retry if main guest email was sent
        if (result.mainResult.success) {
          logError(`[VIP_REGISTRATION] Partner email failed: ${result.partnerResult.error}. Manual intervention may be required.`);
          return;
        }
      }

      // Both failed - check for idempotent cases
      if (result.mainResult.error === 'TICKET_ALREADY_EXISTS' || result.partnerResult.error === 'TICKET_ALREADY_EXISTS') {
        logInfo(`[VIP_REGISTRATION] Tickets already exist for paired registration (idempotent)`);
        return;
      }

      // Log failure and retry if not last attempt
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        logError(`[VIP_REGISTRATION] Attempt ${attempt}/${maxRetries} failed for paired tickets. main: ${result.mainResult.error}, partner: ${result.partnerResult.error}. Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        logError(`[VIP_REGISTRATION] CRITICAL: All ${maxRetries} attempts failed for paired tickets main=${mainRegistrationId}, partner=${partnerRegistrationId}. Manual intervention required!`);
      }
    } catch (err) {
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        logError(`[VIP_REGISTRATION] Unexpected error on attempt ${attempt}/${maxRetries} for paired tickets:`, err);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        logError(`[VIP_REGISTRATION] CRITICAL: All ${maxRetries} attempts crashed for paired tickets. Manual intervention required!`, err);
      }
    }
  }
}

/**
 * Generate a unique PWA auth code for guests
 * Format: CEOG-XXXXXX (6 alphanumeric characters)
 */
export function generatePWAAuthCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars: I, O, 0, 1
  let code = 'CEOG-';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }
  return code;
}

/**
 * Generate unique PWA auth code with retry for collisions
 */
async function generateUniquePWAAuthCode(maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const code = generatePWAAuthCode();
    const existing = await prisma.guest.findFirst({
      where: { pwa_auth_code: code },
    });
    if (!existing) {
      return code;
    }
  }
  // Fallback: add timestamp suffix
  return `CEOG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * VIP Registration Result
 */
export interface VIPRegistrationResult {
  success: boolean;
  registrationId?: number;
  status?: RegistrationStatus;
  error?: string;
}

/**
 * Guest Registration Status Check Result
 */
export interface RegistrationCheckResult {
  isRegistered: boolean;
  status: RegistrationStatus;
  registrationId?: number;
  ticketType?: TicketType;
}

/**
 * VIP Registration Data with profile fields
 */
export interface VIPRegistrationInput {
  guest_id: number;
  attendance: 'confirm' | 'decline';
  title?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  dietary_requirements?: string | null;
  seating_preferences?: string | null;
  gdpr_consent?: boolean;
  cancellation_accepted?: boolean;
  // Partner fields (optional for VIP - free partner)
  has_partner?: boolean;
  partner_title?: string | null;
  partner_first_name?: string | null;
  partner_last_name?: string | null;
  partner_email?: string | null;
  partner_phone?: string | null;
  partner_company?: string | null;
  partner_position?: string | null;
  partner_dietary_requirements?: string | null;
  partner_seating_preferences?: string | null;
  partner_gdpr_consent?: boolean | null;
}

/**
 * Process invited guest registration
 *
 * For invited guests (guest_type = 'invited'):
 * - confirm: Update status to 'registered', create registration with ticket_type='vip_free'
 * - decline: Update status to 'declined', no registration record
 *
 * @param data - VIP registration input data with optional profile fields
 * @returns VIPRegistrationResult
 */
export async function processVIPRegistration(
  data: VIPRegistrationInput
): Promise<VIPRegistrationResult> {
  const { guest_id: guestId, attendance } = data;
  try {
    // 1. Get guest and verify they are invited
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { registration: true },
    });

    if (!guest) {
      return {
        success: false,
        error: 'Guest not found',
      };
    }

    // Invited guests get free tickets
    if (guest.guest_type !== 'invited') {
      return {
        success: false,
        error: 'This page is only accessible to invited guests',
      };
    }

    // 2. Check if already registered
    if (guest.registration) {
      return {
        success: false,
        error: 'You have already registered for this event',
        status: guest.registration_status,
        registrationId: guest.registration.id,
      };
    }

    // 3. Handle decline
    if (attendance === 'decline') {
      await prisma.guest.update({
        where: { id: guestId },
        data: {
          registration_status: 'declined',
        },
      });

      return {
        success: true,
        status: 'declined',
      };
    }

    // 4. Handle confirm - create registration and update status with profile data
    // Generate PWA auth codes before transaction (to avoid using prisma inside tx)
    const pwaAuthCode = await generateUniquePWAAuthCode();
    const partnerPwaAuthCode = data.has_partner ? await generateUniquePWAAuthCode() : null;

    const result = await prisma.$transaction(async (tx) => {
      // Update guest profile and status with PWA auth code
      // VIP guests are immediately approved (no payment required)
      await tx.guest.update({
        where: { id: guestId },
        data: {
          title: data.title || null,
          phone: data.phone || null,
          company: data.company || null,
          position: data.position || null,
          dietary_requirements: data.dietary_requirements || null,
          seating_preferences: data.seating_preferences || null,
          registration_status: 'registered',
          pwa_auth_code: pwaAuthCode,
        },
      });

      // Create registration record with consent fields and optional partner info
      const registration = await tx.registration.create({
        data: {
          guest_id: guestId,
          ticket_type: 'vip_free',
          gdpr_consent: data.gdpr_consent ?? false,
          gdpr_consent_at: data.gdpr_consent ? new Date() : null,
          cancellation_accepted: data.cancellation_accepted ?? false,
          cancellation_accepted_at: data.cancellation_accepted ? new Date() : null,
          // Store partner info in registration (for reference)
          partner_title: data.has_partner ? data.partner_title : null,
          partner_first_name: data.has_partner ? data.partner_first_name : null,
          partner_last_name: data.has_partner ? data.partner_last_name : null,
          partner_email: data.has_partner ? data.partner_email : null,
        },
      });

      // For VIP with partner: Create partner as separate Guest record linked to main guest
      // Partner also gets their own Registration and ticket
      let partnerRegistrationId: number | null = null;

      if (data.has_partner && data.partner_first_name && data.partner_last_name && data.partner_email && partnerPwaAuthCode) {
        // Trim partner inputs
        const trimmedPartnerFirstName = data.partner_first_name.trim();
        const trimmedPartnerLastName = data.partner_last_name.trim();
        const trimmedPartnerEmail = data.partner_email.trim().toLowerCase();

        // Check if partner already exists as guest (include registration to check if already registered)
        const existingPartner = await tx.guest.findUnique({
          where: { email: trimmedPartnerEmail },
          include: { registration: true },
        });

        let partnerId: number;
        let partnerAlreadyRegistered = false;

        if (!existingPartner) {
          // Create new partner guest linked to main guest
          const newPartner = await tx.guest.create({
            data: {
              email: trimmedPartnerEmail,
              first_name: trimmedPartnerFirstName,
              last_name: trimmedPartnerLastName,
              guest_type: guest.guest_type, // Partner inherits same guest type (vip/invited)
              registration_status: 'registered', // Auto-registered through main guest
              paired_with_id: guestId, // Link to main guest
              pwa_auth_code: partnerPwaAuthCode,
              // Partner profile fields
              title: data.partner_title || null,
              phone: data.partner_phone || null,
              company: data.partner_company || null,
              position: data.partner_position || null,
              dietary_requirements: data.partner_dietary_requirements || null,
              seating_preferences: data.partner_seating_preferences || null,
            },
          });
          partnerId = newPartner.id;
        } else {
          // Link existing guest as partner and update their profile if provided
          // Check if partner already has a registration
          partnerAlreadyRegistered = !!existingPartner.registration;

          await tx.guest.update({
            where: { id: existingPartner.id },
            data: {
              paired_with_id: guestId,
              registration_status: 'registered',
              pwa_auth_code: existingPartner.pwa_auth_code || partnerPwaAuthCode,
              // Update partner profile fields if provided (don't overwrite existing data)
              phone: data.partner_phone || existingPartner.phone,
              company: data.partner_company || existingPartner.company,
              position: data.partner_position || existingPartner.position,
              dietary_requirements: data.partner_dietary_requirements || existingPartner.dietary_requirements,
              seating_preferences: data.partner_seating_preferences || existingPartner.seating_preferences,
            },
          });
          partnerId = existingPartner.id;

          // If partner already has registration, use their existing registration ID
          if (partnerAlreadyRegistered && existingPartner.registration) {
            partnerRegistrationId = existingPartner.registration.id;
          }
        }

        // Create Registration for partner only if they don't already have one
        if (!partnerAlreadyRegistered) {
          const partnerRegistration = await tx.registration.create({
            data: {
              guest_id: partnerId,
              ticket_type: 'vip_free',
              gdpr_consent: data.partner_gdpr_consent ?? false,
              gdpr_consent_at: data.partner_gdpr_consent ? new Date() : null,
              partner_first_name: null,
              partner_last_name: null,
              partner_email: null,
            },
          });
          partnerRegistrationId = partnerRegistration.id;
        }
      }

      return { registration, partnerRegistrationId };
    });

    // Send registration feedback emails (confirmation of received data)
    // Fire-and-forget: don't block the response, emails are not critical for registration success
    void (async () => {
      try {
        const feedbackResult = await sendRegistrationFeedbackEmails({
          guestId: guestId,
          guestEmail: guest.email,
          guestTitle: data.title || undefined,
          guestFirstName: guest.first_name,
          guestLastName: guest.last_name,
          guestCompany: data.company || undefined,
          guestPhone: data.phone || undefined,
          guestDiet: data.dietary_requirements || undefined,
          guestSeating: data.seating_preferences || undefined,
          hasPartner: data.has_partner || false,
          partnerTitle: data.partner_title || undefined,
          partnerFirstName: data.partner_first_name || undefined,
          partnerLastName: data.partner_last_name || undefined,
          partnerPhone: data.partner_phone || undefined,
          partnerEmail: data.partner_email || undefined,
          partnerDiet: data.partner_dietary_requirements || undefined,
          partnerSeating: data.partner_seating_preferences || undefined,
        });

        if (feedbackResult.mainResult.success) {
          logInfo(`[VIP_REGISTRATION] Feedback email sent to main guest ${guestId}`);
        } else {
          logError(`[VIP_REGISTRATION] Failed to send feedback email to main guest: ${feedbackResult.mainResult.error}`);
        }

        if (data.has_partner && feedbackResult.partnerResult) {
          if (feedbackResult.partnerResult.success) {
            logInfo(`[VIP_REGISTRATION] Feedback email sent to partner ${data.partner_email}`);
          } else {
            logError(`[VIP_REGISTRATION] Failed to send feedback email to partner: ${feedbackResult.partnerResult.error}`);
          }
        }
      } catch (feedbackError) {
        // Log error but don't fail registration - feedback email is not critical
        logError('[VIP_REGISTRATION] Error sending feedback emails:', feedbackError);
      }
    })();

    // Generate QR ticket and send confirmation email(s)
    // For paired registrations: both guests get emails with BOTH QR codes
    // DELAY: Wait 5 minutes after feedback email before sending QR confirmation
    const QR_EMAIL_DELAY_MS = 5 * 60 * 1000; // 5 minutes

    if (result.partnerRegistrationId) {
      // Paired registration - send both confirmation emails with both QR codes
      logInfo(`[VIP_REGISTRATION] Scheduling paired tickets for main=${result.registration.id}, partner=${result.partnerRegistrationId} (delay: 5 min)`);
      setTimeout(() => {
        void generatePairedTicketsWithRetry(result.registration.id, result.partnerRegistrationId!, 3);
      }, QR_EMAIL_DELAY_MS);
    } else {
      // Single registration - send confirmation email with just their QR code
      logInfo(`[VIP_REGISTRATION] Scheduling ticket for registration ${result.registration.id} (delay: 5 min)`);
      setTimeout(() => {
        void generateTicketWithRetry(result.registration.id, 3);
      }, QR_EMAIL_DELAY_MS);
    }

    return {
      success: true,
      registrationId: result.registration.id,
      status: 'registered',
    };
  } catch (error) {
    logError('VIP registration error:', error);

    // Handle Prisma unique constraint error (guest already has registration)
    if (
      error instanceof Error &&
      error.message.includes('Unique constraint failed') &&
      error.message.includes('guest_id')
    ) {
      // Try to get existing registration ID
      const existingReg = await prisma.registration.findUnique({
        where: { guest_id: guestId },
        select: { id: true },
      });

      return {
        success: false,
        error: 'Already registered for this event',
        status: 'registered',
        registrationId: existingReg?.id,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Check if a guest is already registered
 *
 * @param guestId - The ID of the guest
 * @returns Registration check result
 */
export async function checkGuestRegistration(
  guestId: number
): Promise<RegistrationCheckResult | null> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { registration: true },
  });

  if (!guest) {
    return null;
  }

  return {
    isRegistered: guest.registration !== null,
    status: guest.registration_status,
    registrationId: guest.registration?.id,
    ticketType: guest.registration?.ticket_type,
  };
}

/**
 * Get guest details for registration page
 *
 * @param guestId - The ID of the guest
 * @returns Guest details or null
 */
export async function getGuestForRegistration(guestId: number) {
  return prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      guest_type: true,
      registration_status: true,
      registration: {
        select: {
          id: true,
          ticket_type: true,
          registered_at: true,
        },
      },
    },
  });
}

/**
 * Billing Info Data for BillingInfo model
 */
export interface BillingInfoData {
  billing_first_name: string;
  billing_last_name: string;
  company_name?: string | null;
  tax_number?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postal_code: string;
  country?: string;
}

/**
 * Paid Registration Form Data
 */
export interface PaidRegistrationData {
  guest_id: number;
  ticket_type: 'paid_single' | 'paid_paired';
  billing_info: BillingInfoData;
  partner_title?: string | null;
  partner_first_name?: string | null;
  partner_last_name?: string | null;
  partner_email?: string | null;
  partner_phone?: string | null;
  partner_company?: string | null;
  partner_position?: string | null;
  partner_dietary_requirements?: string | null;
  partner_seating_preferences?: string | null;
  partner_gdpr_consent?: boolean | null;
  // Profile fields
  title?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  dietary_requirements?: string | null;
  seating_preferences?: string | null;
  // Consent fields
  gdpr_consent: boolean;
  cancellation_accepted: boolean;
}

/**
 * Paid Registration Result
 */
export interface PaidRegistrationResult {
  success: boolean;
  registrationId?: number;
  status?: RegistrationStatus;
  error?: string;
}

/**
 * Process paid guest registration
 *
 * For paid guests (guest_type = 'paying_single' or 'paying_paired'):
 * - Validates guest type
 * - Creates registration with billing and optional partner info
 * - Updates guest status to 'registered'
 *
 * @param data - Form data with billing and partner info
 * @returns PaidRegistrationResult
 */
export async function processPaidRegistration(
  data: PaidRegistrationData
): Promise<PaidRegistrationResult> {
  try {
    // 1. Get guest and verify they are a paying guest
    const guest = await prisma.guest.findUnique({
      where: { id: data.guest_id },
      include: { registration: true },
    });

    if (!guest) {
      return {
        success: false,
        error: 'Guest not found',
      };
    }

    if (guest.guest_type !== 'paying_single' && guest.guest_type !== 'paying_paired') {
      return {
        success: false,
        error: 'This page is only accessible to paying guests',
      };
    }

    // 2. Check if already registered
    if (guest.registration) {
      return {
        success: false,
        error: 'You have already registered for this event',
        status: guest.registration_status,
        registrationId: guest.registration.id,
      };
    }

    // 3. Validate paired ticket requires partner info
    if (data.ticket_type === 'paid_paired') {
      if (!data.partner_first_name || !data.partner_last_name || !data.partner_email) {
        return {
          success: false,
          error: 'Partner details are required for paired tickets',
        };
      }
    }

    // 4. Create registration, billing info, partner guest (if paired), and update guest status
    // Generate PWA auth code for guest app access
    const pwaAuthCode = await generateUniquePWAAuthCode();

    const result = await prisma.$transaction(async (tx) => {
      // Update guest profile fields with PWA auth code
      await tx.guest.update({
        where: { id: data.guest_id },
        data: {
          title: data.title || null,
          phone: data.phone || null,
          company: data.company || null,
          position: data.position || null,
          dietary_requirements: data.dietary_requirements || null,
          seating_preferences: data.seating_preferences || null,
          registration_status: 'registered',
          pwa_auth_code: pwaAuthCode,
        },
      });

      // Create registration record
      const registration = await tx.registration.create({
        data: {
          guest_id: data.guest_id,
          ticket_type: data.ticket_type,
          partner_title: data.partner_title || null,
          partner_first_name: data.partner_first_name || null,
          partner_last_name: data.partner_last_name || null,
          partner_email: data.partner_email || null,
          gdpr_consent: data.gdpr_consent,
          gdpr_consent_at: data.gdpr_consent ? new Date() : null,
          cancellation_accepted: data.cancellation_accepted,
          cancellation_accepted_at: data.cancellation_accepted ? new Date() : null,
        },
      });

      // Create billing info record
      await tx.billingInfo.create({
        data: {
          registration_id: registration.id,
          billing_first_name: data.billing_info.billing_first_name,
          billing_last_name: data.billing_info.billing_last_name,
          company_name: data.billing_info.company_name || null,
          tax_number: data.billing_info.tax_number || null,
          address_line1: data.billing_info.address_line1,
          address_line2: data.billing_info.address_line2 || null,
          city: data.billing_info.city,
          postal_code: data.billing_info.postal_code,
          country: data.billing_info.country || 'HU',
        },
      });

      // For paired tickets: Create partner as separate Guest record linked to main guest
      if (data.ticket_type === 'paid_paired' && data.partner_first_name && data.partner_last_name && data.partner_email) {
        // Check if partner already exists as guest
        const existingPartner = await tx.guest.findUnique({
          where: { email: data.partner_email },
        });

        if (!existingPartner) {
          // Create new partner guest linked to main guest with profile fields
          await tx.guest.create({
            data: {
              email: data.partner_email,
              first_name: data.partner_first_name,
              last_name: data.partner_last_name,
              guest_type: 'paying_paired',
              registration_status: 'registered', // Auto-registered through main guest
              paired_with_id: data.guest_id, // Link to main guest
              // Partner profile fields
              phone: data.partner_phone || null,
              company: data.partner_company || null,
              position: data.partner_position || null,
              dietary_requirements: data.partner_dietary_requirements || null,
              seating_preferences: data.partner_seating_preferences || null,
            },
          });
        } else {
          // Link existing guest as partner and update their profile if provided
          await tx.guest.update({
            where: { id: existingPartner.id },
            data: {
              paired_with_id: data.guest_id,
              registration_status: 'registered',
              // Update partner profile fields if provided (don't overwrite existing data)
              phone: data.partner_phone || existingPartner.phone,
              company: data.partner_company || existingPartner.company,
              position: data.partner_position || existingPartner.position,
              dietary_requirements: data.partner_dietary_requirements || existingPartner.dietary_requirements,
              seating_preferences: data.partner_seating_preferences || existingPartner.seating_preferences,
            },
          });
        }
      }

      return registration;
    });

    return {
      success: true,
      registrationId: result.id,
      status: 'registered',
    };
  } catch (error) {
    logError('Paid registration error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Guest Status Response Interface
 */
export interface GuestStatusResult {
  success: boolean;
  error?: string;
  guest?: {
    firstName: string;
    lastName: string;
    email: string;
    guestType: string;
  };
  registration?: {
    id: number;
    ticketType: TicketType;
    registeredAt: Date;
    partnerFirstName: string | null;
    partnerLastName: string | null;
  } | null;
  payment?: {
    status: PaymentStatus;
    method: PaymentMethod | null;
    paidAt: Date | null;
  } | null;
  ticket?: {
    available: boolean;
    qrCodeHash: string | null;
  };
}

/**
 * Get guest status for status dashboard page
 * Returns registration, payment, and ticket information
 *
 * @param guestId - The ID of the guest
 * @returns GuestStatusResult with all status information
 */
export async function getGuestStatus(guestId: number): Promise<GuestStatusResult> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        guest_type: true,
        registration_status: true,
        registration: {
          select: {
            id: true,
            ticket_type: true,
            registered_at: true,
            partner_first_name: true,
            partner_last_name: true,
            qr_code_hash: true,
            payment: {
              select: {
                payment_status: true,
                payment_method: true,
                paid_at: true,
              },
            },
          },
        },
      },
    });

    if (!guest) {
      return {
        success: false,
        error: 'Guest not found',
      };
    }

    // Determine ticket availability
    // Invited guests get free tickets
    const isInvited = guest.guest_type === 'invited';
    const isPaid = guest.registration?.payment?.payment_status === 'paid';
    const hasQRCode = !!guest.registration?.qr_code_hash;
    const ticketAvailable = isInvited || (isPaid && hasQRCode);

    return {
      success: true,
      guest: {
        firstName: guest.first_name,
        lastName: guest.last_name,
        email: guest.email,
        guestType: guest.guest_type,
      },
      registration: guest.registration
        ? {
            id: guest.registration.id,
            ticketType: guest.registration.ticket_type,
            registeredAt: guest.registration.registered_at,
            partnerFirstName: guest.registration.partner_first_name,
            partnerLastName: guest.registration.partner_last_name,
          }
        : null,
      payment: guest.registration?.payment
        ? {
            status: guest.registration.payment.payment_status,
            method: guest.registration.payment.payment_method,
            paidAt: guest.registration.payment.paid_at,
          }
        : isInvited
        ? {
            // Invited guests have implicit "paid" status (free ticket)
            status: 'paid' as PaymentStatus,
            method: null,
            paidAt: guest.registration?.registered_at || null,
          }
        : null,
      ticket: {
        available: ticketAvailable,
        qrCodeHash: guest.registration?.qr_code_hash || null,
      },
    };
  } catch (error) {
    logError('Get guest status error:', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
