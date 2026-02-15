/**
 * Registration Confirmation API
 *
 * POST /api/registration/confirm
 *
 * Handles VIP guest registration confirmation or decline.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processVIPRegistration } from '@/lib/services/registration';
import { logError } from '@/lib/utils/logger';

interface ConfirmBody {
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
  // Partner fields (optional for VIP)
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

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmBody = await request.json();
    const { guest_id, attendance, title, phone, company, position, dietary_requirements, seating_preferences, gdpr_consent, cancellation_accepted, has_partner, partner_title, partner_first_name, partner_last_name, partner_email, partner_phone, partner_company, partner_position, partner_dietary_requirements, partner_seating_preferences, partner_gdpr_consent } = body;

    // Validate required fields
    if (!guest_id || typeof guest_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'guest_id is required' },
        { status: 400 }
      );
    }

    if (!attendance || !['confirm', 'decline'].includes(attendance)) {
      return NextResponse.json(
        { success: false, error: 'attendance must be "confirm" or "decline"' },
        { status: 400 }
      );
    }

    // Validate required profile fields for confirmation
    if (attendance === 'confirm') {
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

      // Validate partner fields if bringing a partner
      if (has_partner) {
        if (!partner_first_name || typeof partner_first_name !== 'string' || partner_first_name.trim().length < 1) {
          return NextResponse.json(
            { success: false, error: 'Partner first name is required' },
            { status: 400 }
          );
        }
        if (!partner_last_name || typeof partner_last_name !== 'string' || partner_last_name.trim().length < 1) {
          return NextResponse.json(
            { success: false, error: 'Partner last name is required' },
            { status: 400 }
          );
        }
        if (!partner_email || typeof partner_email !== 'string') {
          return NextResponse.json(
            { success: false, error: 'Partner email is required' },
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
        // Partner GDPR consent validation
        if (!partner_gdpr_consent) {
          return NextResponse.json(
            { success: false, error: 'Partner GDPR consent is required' },
            { status: 400 }
          );
        }
      }
    }

    // Prevent self-registration as partner (must fetch guest email first)
    if (has_partner && partner_email) {
      const { prisma } = await import('@/lib/db/prisma');
      const guest = await prisma.guest.findUnique({
        where: { id: guest_id },
        select: { email: true },
      });
      if (guest && guest.email.toLowerCase() === partner_email.trim().toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Partner email cannot be the same as your own email' },
          { status: 400 }
        );
      }
    }

    // Process VIP registration with all profile data
    const result = await processVIPRegistration({
      guest_id,
      attendance,
      title,
      phone,
      company,
      position,
      dietary_requirements,
      seating_preferences,
      gdpr_consent,
      cancellation_accepted,
      // Partner info (optional for VIP)
      has_partner,
      partner_title: has_partner ? partner_title : null,
      partner_first_name: has_partner ? partner_first_name : null,
      partner_last_name: has_partner ? partner_last_name : null,
      partner_email: has_partner ? partner_email : null,
      partner_phone: has_partner ? partner_phone : null,
      partner_company: has_partner ? partner_company : null,
      partner_position: has_partner ? partner_position : null,
      partner_dietary_requirements: has_partner ? partner_dietary_requirements : null,
      partner_seating_preferences: has_partner ? partner_seating_preferences : null,
      partner_gdpr_consent: has_partner ? partner_gdpr_consent : null,
    });

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

      // Return 403 for non-invited guests
      if (result.error === 'This page is only accessible to invited guests') {
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
      message:
        attendance === 'confirm'
          ? 'Attendance confirmed successfully!'
          : 'Response recorded. Thank you!',
    });
  } catch (error) {
    logError('[REGISTRATION-CONFIRM]', error);

    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
