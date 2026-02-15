import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { logInfo, logError } from '@/lib/utils/logger';

/**
 * POST /api/apply
 *
 * Public endpoint for non-invited guests to apply to attend the CEO Gala.
 * Creates a new guest record with status 'pending_approval'.
 */

// Phone number validation regex (international format)
const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;

const applySchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  title: z.string().max(50).nullable().optional(),
  phone: z.string().min(9, 'Phone number is required').regex(phoneRegex, 'Invalid phone number format'),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  dietary_requirements: z.string().max(500).nullable().optional(),
  seating_preferences: z.string().max(500).nullable().optional(),
  gdpr_consent: z.boolean().refine((val) => val === true, 'GDPR consent is required'),
});

// Simple in-memory rate limiting (per IP, 5 applications per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';

    if (!checkRateLimit(ip)) {
      logInfo(`[APPLY] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Too many applications. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = applySchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errors}` },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if email already exists
    const existingGuest = await prisma.guest.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingGuest) {
      // Check status to give appropriate message
      if (existingGuest.registration_status === 'pending_approval') {
        return NextResponse.json(
          { error: 'An application with this email is already pending review.' },
          { status: 409 }
        );
      } else if (existingGuest.registration_status === 'rejected') {
        return NextResponse.json(
          { error: 'A previous application with this email was not accepted.' },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { error: 'This email is already registered. Please use the registration link from your invitation email.' },
          { status: 409 }
        );
      }
    }

    // Create new applicant guest
    const guest = await prisma.guest.create({
      data: {
        email: data.email.toLowerCase(),
        first_name: data.first_name,
        last_name: data.last_name,
        title: data.title || null,
        phone: data.phone,
        company: data.company,
        position: data.position,
        dietary_requirements: data.dietary_requirements || null,
        seating_preferences: data.seating_preferences || null,
        guest_type: 'applicant',
        registration_status: 'pending_approval',
        applied_at: new Date(),
      },
    });

    // Log the application
    logInfo(`[APPLY] New application received: ${guest.email} (ID: ${guest.id})`);

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        guest_id: guest.id,
      },
      { status: 201 }
    );
  } catch (error) {
    logError('[APPLY] Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    );
  }
}
