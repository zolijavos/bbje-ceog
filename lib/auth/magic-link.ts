/**
 * Magic Link Utilities
 * Hash generation and validation for passwordless guest authentication
 */

import crypto from 'crypto';

const MAGIC_LINK_EXPIRY_HOURS = 72;
const MAGIC_LINK_EXPIRY_MINUTES = MAGIC_LINK_EXPIRY_HOURS * 60; // 72 hours

/**
 * Generate a magic link hash and expiry timestamp
 *
 * Algorithm: SHA-256(email + APP_SECRET + timestamp)
 * Expiry: 72 hours from generation
 *
 * @param email - Guest email address
 * @returns Object containing hash and expiry date
 */
export function generateMagicLinkHash(email: string): {
  hash: string;
  expiresAt: Date;
} {
  const appSecret = process.env.APP_SECRET;

  if (!appSecret || appSecret.length < 64) {
    throw new Error('APP_SECRET must be at least 64 characters');
  }

  const timestamp = Date.now().toString();
  const dataToHash = `${email}${appSecret}${timestamp}`;

  const hash = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex');

  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

  return { hash, expiresAt };
}

// Error types for detailed validation responses
export type MagicLinkErrorType =
  | 'not_found'
  | 'no_link'
  | 'invalid'
  | 'expired';

export interface MagicLinkValidationResult {
  valid: boolean;
  errorType?: MagicLinkErrorType;
  error?: string;
  guest?: {
    id: number;
    name: string;
    email: string;
    guestType: string;
    status: string;
  };
}

/**
 * Validate a magic link hash against stored guest data
 *
 * Checks:
 * 1. Guest exists with matching email
 * 2. Stored hash matches provided hash
 * 3. Magic link has not expired
 *
 * @param hash - The hash from the magic link URL
 * @param email - Guest email from the URL
 * @returns Validation result with guest data if valid, or detailed error type
 */
export async function validateMagicLink(
  hash: string,
  email: string
): Promise<MagicLinkValidationResult> {
  const { prisma } = await import('@/lib/db/prisma');

  // Find guest by email
  const guest = await prisma.guest.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      guest_type: true,
      registration_status: true,
      magic_link_hash: true,
      magic_link_expires_at: true,
    },
  });

  if (!guest) {
    return {
      valid: false,
      errorType: 'not_found',
      error: 'The provided email address was not found on the guest list',
    };
  }

  if (!guest.magic_link_hash || !guest.magic_link_expires_at) {
    return {
      valid: false,
      errorType: 'no_link',
      error: 'No active invitation link for this email address',
    };
  }

  // Check expiry first (before hash comparison for better UX)
  if (new Date() > guest.magic_link_expires_at) {
    return {
      valid: false,
      errorType: 'expired',
      error: 'The invitation link has expired (invalid after 72 hours)',
    };
  }

  // Compare hash (timing-safe comparison)
  try {
    const hashMatch = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(guest.magic_link_hash)
    );

    if (!hashMatch) {
      return {
        valid: false,
        errorType: 'invalid',
        error: 'Invalid invitation link',
      };
    }
  } catch {
    // Buffer length mismatch means invalid hash
    return {
      valid: false,
      errorType: 'invalid',
      error: 'Invalid invitation link',
    };
  }

  return {
    valid: true,
    guest: {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      guestType: guest.guest_type,
      status: guest.registration_status,
    },
  };
}

/**
 * Clear magic link hash after successful use (single-use)
 * Called after successful registration/validation
 */
export async function clearMagicLink(guestId: number): Promise<void> {
  const { prisma } = await import('@/lib/db/prisma');

  await prisma.guest.update({
    where: { id: guestId },
    data: {
      magic_link_hash: null,
      magic_link_expires_at: null,
    },
  });
}
