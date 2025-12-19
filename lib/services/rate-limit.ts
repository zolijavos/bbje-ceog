/**
 * Rate Limiting Service
 *
 * Database-based rate limiting for production environments.
 * Survives server restarts and works across multiple instances.
 */

import { prisma } from '@/lib/db/prisma';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check rate limit for a given key
 *
 * @param key - Unique identifier (e.g., "auth:email@example.com")
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining attempts
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();

  // Clean up expired entries periodically (1% chance per request)
  if (Math.random() < 0.01) {
    await cleanupExpiredEntries();
  }

  // Find existing entry
  const entry = await prisma.rateLimitEntry.findUnique({
    where: { key },
  });

  // No entry exists or entry has expired
  if (!entry || entry.expires_at < now) {
    const expiresAt = new Date(now.getTime() + config.windowMs);

    // Create or update entry with first attempt
    await prisma.rateLimitEntry.upsert({
      where: { key },
      create: {
        key,
        attempts: 1,
        expires_at: expiresAt,
      },
      update: {
        attempts: 1,
        expires_at: expiresAt,
      },
    });

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: expiresAt,
    };
  }

  // Entry exists and is still valid
  if (entry.attempts >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.expires_at,
    };
  }

  // Increment attempts
  const updated = await prisma.rateLimitEntry.update({
    where: { key },
    data: {
      attempts: { increment: 1 },
    },
  });

  return {
    allowed: true,
    remaining: config.maxAttempts - updated.attempts,
    resetAt: entry.expires_at,
  };
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimitEntry.deleteMany({
    where: { key },
  });
}

/**
 * Clean up expired rate limit entries
 */
export async function cleanupExpiredEntries(): Promise<number> {
  const result = await prisma.rateLimitEntry.deleteMany({
    where: {
      expires_at: { lt: new Date() },
    },
  });
  return result.count;
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  AUTH: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  EMAIL: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  API: {
    maxAttempts: 30, // Reduced from 100 to prevent DoS attacks
    windowMs: 60 * 1000, // 1 minute
  },
  // IP-based rate limit for magic link requests (stricter)
  MAGIC_LINK_IP: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour - max 10 requests per IP per hour
  },
} as const;
