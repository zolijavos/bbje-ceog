/**
 * Registration Submit API
 *
 * POST /api/registration/submit
 *
 * Handles paid guest registration form submission.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPaidRegistration, PaidRegistrationData, BillingInfoData } from '@/lib/services/registration';
import { logError } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/prisma';

interface BillingInfoInput {
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

interface SubmitBody {
  guest_id: number;
  ticket_type: 'paid_single' | 'paid_paired';
  billing_info: BillingInfoInput;
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

export async function POST(request: NextRequest) {
  try {
    const body: SubmitBody = await request.json();
    const {
      guest_id,
      ticket_type,
      billing_info,
      partner_first_name,
      partner_last_name,
      partner_email,
      partner_phone,
      partner_company,
      partner_position,
      partner_dietary_requirements,
      partner_seating_preferences,
      partner_gdpr_consent,
      title,
      phone,
      company,
      position,
      dietary_requirements,
      seating_preferences,
      gdpr_consent,
      cancellation_accepted,
    } = body;

    // Validate required fields
    if (!guest_id || typeof guest_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'guest_id is required' },
        { status: 400 }
      );
    }

    if (!ticket_type || !['paid_single', 'paid_paired'].includes(ticket_type)) {
      return NextResponse.json(
        { success: false, error: 'ticket_type must be "paid_single" or "paid_paired"' },
        { status: 400 }
      );
    }

    // Validate required profile fields
    if (!phone || phone.trim().length < 9) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!company || company.trim().length < 1) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }
    if (!position || position.trim().length < 1) {
      return NextResponse.json(
        { success: false, error: 'Position is required' },
        { status: 400 }
      );
    }

    // Validate billing info
    if (!billing_info || typeof billing_info !== 'object') {
      return NextResponse.json(
        { success: false, error: 'billing_info is required' },
        { status: 400 }
      );
    }

    if (!billing_info.billing_first_name || billing_info.billing_first_name.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Billing first name is required' },
        { status: 400 }
      );
    }

    if (!billing_info.billing_last_name || billing_info.billing_last_name.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Billing last name is required' },
        { status: 400 }
      );
    }

    if (!billing_info.address_line1 || billing_info.address_line1.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Address is required (min. 5 characters)' },
        { status: 400 }
      );
    }

    if (!billing_info.city || billing_info.city.length < 2) {
      return NextResponse.json(
        { success: false, error: 'City is required' },
        { status: 400 }
      );
    }

    // Validate Hungarian postal code (4 digits)
    if (!billing_info.postal_code || !/^[0-9]{4}$/.test(billing_info.postal_code)) {
      return NextResponse.json(
        { success: false, error: 'Postal code must be 4 digits' },
        { status: 400 }
      );
    }

    // Validate Hungarian tax number format if provided
    if (billing_info.tax_number && !/^[0-9]{8}-[0-9]-[0-9]{2}$/.test(billing_info.tax_number)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tax number format (e.g.: 12345678-1-42)' },
        { status: 400 }
      );
    }

    // Validate consent fields
    if (gdpr_consent !== true) {
      return NextResponse.json(
        { success: false, error: 'GDPR consent is required' },
        { status: 400 }
      );
    }

    if (cancellation_accepted !== true) {
      return NextResponse.json(
        { success: false, error: 'Acceptance of cancellation terms is required' },
        { status: 400 }
      );
    }

    // Validate partner info for paired tickets
    if (ticket_type === 'paid_paired') {
      if (!partner_first_name || typeof partner_first_name !== 'string' || partner_first_name.length < 1) {
        return NextResponse.json(
          { success: false, error: 'Partner first name is required for paired tickets' },
          { status: 400 }
        );
      }

      if (!partner_last_name || typeof partner_last_name !== 'string' || partner_last_name.length < 1) {
        return NextResponse.json(
          { success: false, error: 'Partner last name is required for paired tickets' },
          { status: 400 }
        );
      }

      if (!partner_email || typeof partner_email !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Partner email is required for paired tickets' },
          { status: 400 }
        );
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(partner_email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid partner email format' },
          { status: 400 }
        );
      }

      // Fetch the main guest to compare emails
      const mainGuest = await prisma.guest.findUnique({
        where: { id: guest_id },
        select: { email: true }
      });

      // Check: Partner email cannot be the same as main guest's email
      if (mainGuest && partner_email.toLowerCase() === mainGuest.email.toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            error: 'A partner email címe nem egyezhet meg a saját email címeddel',
            field: 'partner_email'
          },
          { status: 400 }
        );
      }

      // Check: Partner email must be unique (not already registered as guest)
      const existingGuest = await prisma.guest.findUnique({
        where: { email: partner_email.toLowerCase() }
      });

      if (existingGuest) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ez az email cím már regisztrálva van a rendszerben. Kérjük, adj meg másik email címet a partnered számára.',
            field: 'partner_email'
          },
          { status: 409 }
        );
      }

      // Check: Partner email must not be used as partner in another registration
      const existingPartnerRegistration = await prisma.registration.findFirst({
        where: {
          partner_email: partner_email.toLowerCase()
        }
      });

      if (existingPartnerRegistration) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ez az email cím már használatban van egy másik regisztrációnál. Kérjük, adj meg másik email címet a partnered számára.',
            field: 'partner_email'
          },
          { status: 409 }
        );
      }

      // Partner GDPR consent validation
      if (!partner_gdpr_consent) {
        return NextResponse.json(
          { success: false, error: 'Partner GDPR consent is required' },
          { status: 400 }
        );
      }
    }

    // Process paid registration
    const registrationData: PaidRegistrationData = {
      guest_id,
      ticket_type,
      billing_info: {
        billing_first_name: billing_info.billing_first_name,
        billing_last_name: billing_info.billing_last_name,
        company_name: billing_info.company_name || null,
        tax_number: billing_info.tax_number || null,
        address_line1: billing_info.address_line1,
        address_line2: billing_info.address_line2 || null,
        city: billing_info.city,
        postal_code: billing_info.postal_code,
        country: billing_info.country || 'HU',
      },
      partner_first_name: partner_first_name || null,
      partner_last_name: partner_last_name || null,
      partner_email: partner_email || null,
      partner_phone: partner_phone || null,
      partner_company: partner_company || null,
      partner_position: partner_position || null,
      partner_dietary_requirements: partner_dietary_requirements || null,
      partner_seating_preferences: partner_seating_preferences || null,
      partner_gdpr_consent: partner_gdpr_consent || null,
      title: title || null,
      phone: phone || null,
      company: company || null,
      position: position || null,
      dietary_requirements: dietary_requirements || null,
      seating_preferences: seating_preferences || null,
      gdpr_consent,
      cancellation_accepted,
    };

    const result = await processPaidRegistration(registrationData);

    if (!result.success) {
      // Return 409 for already registered
      if (result.error === 'Already registered for this event') {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            status: result.status,
            registrationId: result.registrationId,
          },
          { status: 409 }
        );
      }

      // Return 403 for non-paying guest
      if (result.error === 'This page is only available for paying guests') {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 403 }
        );
      }

      // Return 404 for guest not found
      if (result.error === 'Guest not found') {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 404 }
        );
      }

      // Generic error
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      status: result.status,
      registrationId: result.registrationId,
      message: 'Registration saved successfully!',
    });
  } catch (error) {
    logError('[REGISTRATION-SUBMIT]', error);

    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
