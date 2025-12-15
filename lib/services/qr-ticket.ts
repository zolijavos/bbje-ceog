/**
 * QR Ticket Service
 *
 * Handles JWT token generation and QR code creation for event tickets.
 */

import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { prisma } from '@/lib/db/prisma';
import { TicketType } from '@prisma/client';

// JWT secret for signing tickets
const QR_SECRET = process.env.QR_SECRET;
if (!QR_SECRET || QR_SECRET.length < 64) {
  throw new Error('QR_SECRET environment variable is required and must be at least 64 characters');
}

// Event date for ticket expiry (default: Friday, March 27, 2026)
const EVENT_DATE = process.env.EVENT_DATE || '2026-03-27';

/**
 * JWT payload structure for ticket tokens
 */
export interface TicketPayload {
  registration_id: number;
  guest_id: number;
  ticket_type: TicketType;
  guest_name: string;
  iat: number;
  exp: number;
}

/**
 * Calculate ticket expiry time (event day + 24 hours)
 */
function calculateExpiry(): number {
  const eventDate = new Date(EVENT_DATE);
  // Set to end of event day + 24 hours buffer
  eventDate.setHours(23, 59, 59, 999);
  eventDate.setDate(eventDate.getDate() + 1);
  return Math.floor(eventDate.getTime() / 1000);
}

/**
 * Generate a JWT token for a registration
 *
 * @param registrationId - Registration ID to generate token for
 * @returns JWT token string
 */
export async function generateTicketToken(registrationId: number): Promise<string> {
  // Load registration with guest
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { guest: true },
  });

  if (!registration) {
    throw new Error('REGISTRATION_NOT_FOUND');
  }

  if (!registration.guest) {
    throw new Error('GUEST_NOT_FOUND');
  }

  // Build payload
  const payload: Omit<TicketPayload, 'iat' | 'exp'> = {
    registration_id: registration.id,
    guest_id: registration.guest.id,
    ticket_type: registration.ticket_type,
    guest_name: registration.guest.name,
  };

  // Calculate expiry
  const exp = calculateExpiry();
  const now = Math.floor(Date.now() / 1000);

  // Validate expiry is in the future
  if (exp <= now) {
    throw new Error('EVENT_ALREADY_PASSED');
  }

  const expiresInSeconds = exp - now;

  // Generate JWT
  const token = jwt.sign(payload, QR_SECRET, {
    expiresIn: expiresInSeconds,
    algorithm: 'HS256',
  });

  // Store token in database
  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      qr_code_hash: token,
      qr_code_generated_at: new Date(),
    },
  });

  return token;
}

/**
 * Atomically try to acquire ticket generation lock
 * Returns true if this call acquired the lock, false if ticket already exists
 *
 * Uses atomic updateMany with WHERE qr_code_hash IS NULL to prevent TOCTOU race condition
 */
export async function tryAcquireTicketLock(registrationId: number): Promise<boolean> {
  const result = await prisma.registration.updateMany({
    where: {
      id: registrationId,
      qr_code_hash: null, // Only update if no ticket exists
    },
    data: {
      qr_code_generated_at: new Date(), // Mark as "being generated"
    },
  });

  return result.count > 0;
}

/**
 * Generate QR code image as Data URL (base64 PNG)
 *
 * @param token - JWT token to encode in QR
 * @returns Base64 encoded PNG data URL
 */
export async function generateQRCodeDataURL(token: string): Promise<string> {
  const options = {
    errorCorrectionLevel: 'M' as const,
    type: 'image/png' as const,
    quality: 0.92,
    margin: 2,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  };

  return QRCode.toDataURL(token, options);
}

/**
 * Generate QR code image as Buffer (PNG)
 *
 * @param token - JWT token to encode in QR
 * @returns PNG image buffer
 */
export async function generateQRCodeBuffer(token: string): Promise<Buffer> {
  const options = {
    errorCorrectionLevel: 'M' as const,
    type: 'png' as const,
    quality: 0.92,
    margin: 2,
    width: 300,
  };

  return QRCode.toBuffer(token, options);
}

/**
 * Generate ticket (JWT + QR) for a registration
 *
 * @param registrationId - Registration ID
 * @returns Token and QR code data URL
 */
export async function generateTicket(registrationId: number): Promise<{
  token: string;
  qrCodeDataUrl: string;
}> {
  const token = await generateTicketToken(registrationId);
  const qrCodeDataUrl = await generateQRCodeDataURL(token);

  return { token, qrCodeDataUrl };
}

/**
 * Verify a ticket token
 *
 * @param token - JWT token from QR code
 * @returns Decoded payload if valid
 * @throws Error if invalid or expired
 */
export function verifyTicketToken(token: string): TicketPayload {
  try {
    const decoded = jwt.verify(token, QR_SECRET, {
      algorithms: ['HS256'],
    });

    return decoded as TicketPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TICKET_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_TICKET');
    }
    throw error;
  }
}

/**
 * Check if a token is valid and matches database record
 *
 * @param token - JWT token to verify
 * @returns Registration data if valid
 */
export async function validateTicket(token: string): Promise<{
  isValid: boolean;
  registration?: {
    id: number;
    ticket_type: TicketType;
    guest: {
      id: number;
      name: string;
      email: string;
    };
  };
  error?: string;
}> {
  try {
    // Verify JWT signature and expiry
    const payload = verifyTicketToken(token);

    // Check if token matches database
    const registration = await prisma.registration.findUnique({
      where: { id: payload.registration_id },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      return { isValid: false, error: 'REGISTRATION_NOT_FOUND' };
    }

    // HIGH-4 FIX: Proper null check instead of non-null assertion
    // Guest should always exist for a valid registration, but handle edge case
    if (!registration.guest) {
      return { isValid: false, error: 'GUEST_NOT_FOUND' };
    }

    // Verify token matches stored token
    if (registration.qr_code_hash !== token) {
      return { isValid: false, error: 'TOKEN_MISMATCH' };
    }

    return {
      isValid: true,
      registration: {
        id: registration.id,
        ticket_type: registration.ticket_type,
        guest: registration.guest,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'UNKNOWN_ERROR' };
  }
}

/**
 * Regenerate ticket token for a registration
 * Useful when guest needs a new ticket or token is compromised
 *
 * @param registrationId - Registration ID
 * @returns New token and QR code
 */
export async function regenerateTicket(registrationId: number): Promise<{
  token: string;
  qrCodeDataUrl: string;
}> {
  // Simply generate a new ticket - this will overwrite the old one
  return generateTicket(registrationId);
}

/**
 * Get existing ticket for a registration (if any)
 *
 * @param registrationId - Registration ID
 * @returns Existing token and QR code, or null if not generated
 */
export async function getExistingTicket(registrationId: number): Promise<{
  token: string;
  qrCodeDataUrl: string;
} | null> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: {
      qr_code_hash: true,
      qr_code_generated_at: true,
    },
  });

  if (!registration?.qr_code_hash) {
    return null;
  }

  // Generate QR code from existing token
  const qrCodeDataUrl = await generateQRCodeDataURL(registration.qr_code_hash);

  return {
    token: registration.qr_code_hash,
    qrCodeDataUrl,
  };
}
