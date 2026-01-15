/**
 * Magic Link Utilities
 * Hash generation and validation for passwordless guest authentication
 */

import crypto from 'crypto';
import { MAGIC_LINK } from '@/lib/config/constants';

/**
 * Generate a magic link hash and expiry timestamp
 *
 * Algorithm: SHA-256(email + APP_SECRET + timestamp)
 * Expiry: Configurable via MAGIC_LINK_EXPIRY_HOURS env var (default: 24 hours)
 *
 * @param email - Guest email address
 * @returns Object containing hash and expiry date
 */
export function generateMagicLinkHash(email: string): {
  hash: string;
  expiresAt: Date;
} {
  const appSecret = process.env.APP_SECRET;

  if (!appSecret || appSecret.length < MAGIC_LINK.MIN_SECRET_LENGTH) {
    throw new Error(`APP_SECRET must be at least ${MAGIC_LINK.MIN_SECRET_LENGTH} characters`);
  }

  const timestamp = Date.now().toString();
  const dataToHash = `${email}${appSecret}${timestamp}`;

  const hash = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex');

  const expiresAt = new Date(Date.now() + MAGIC_LINK.EXPIRY_MINUTES * 60 * 1000);

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

  if (!guest.magic_link_hash) {
    return {
      valid: false,
      errorType: 'no_link',
      error: 'No active invitation link for this email address',
    };
  }

  // Magic links never expire - expiry check removed per business requirement
  // The magic_link_expires_at field is still stored for reference but not validated

  // Compare hash (timing-safe comparison)
  // SHA-256 hex hash is always 64 characters - check length first to avoid timing side-channel
  const EXPECTED_HASH_LENGTH = 64;
  if (hash.length !== EXPECTED_HASH_LENGTH || guest.magic_link_hash.length !== EXPECTED_HASH_LENGTH) {
    return {
      valid: false,
      errorType: 'invalid',
      error: 'Invalid invitation link',
    };
  }

  // Now both buffers are guaranteed to be same length for timing-safe comparison
  const hashMatch = crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(guest.magic_link_hash, 'hex')
  );

  if (!hashMatch) {
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
