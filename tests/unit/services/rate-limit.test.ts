/**
 * Rate Limiting Service Unit Tests
 *
 * Tests for: lib/services/rate-limit.ts
 *
 * Coverage targets:
 * - checkRateLimit() - Main rate limiting logic
 * - resetRateLimit() - Clear rate limit for key
 * - cleanupExpiredEntries() - Periodic cleanup
 * - RATE_LIMITS - Predefined configurations
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma before importing the service
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    rateLimitEntry: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Import after mocks are set up
import { prisma } from '@/lib/db/prisma';
import {
  checkRateLimit,
  resetRateLimit,
  cleanupExpiredEntries,
  RATE_LIMITS,
} from '@/lib/services/rate-limit';

describe('Rate Limiting Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random to control cleanup trigger
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.01, so no cleanup
  });

  // ============================================
  // checkRateLimit() Tests
  // ============================================
  describe('checkRateLimit', () => {
    const config = { maxAttempts: 5, windowMs: 60000 };

    it('should allow first request and create entry', async () => {
      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(null);
      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});

      const result = await checkRateLimit('test:key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1
      expect(prisma.rateLimitEntry.upsert).toHaveBeenCalledWith({
        where: { key: 'test:key' },
        create: expect.objectContaining({
          key: 'test:key',
          attempts: 1,
        }),
        update: expect.objectContaining({
          attempts: 1,
        }),
      });
    });

    it('should allow request when entry expired', async () => {
      const expiredEntry = {
        key: 'test:key',
        attempts: 10,
        expires_at: new Date(Date.now() - 1000), // Expired 1 second ago
      };

      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(expiredEntry);
      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});

      const result = await checkRateLimit('test:key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block when max attempts reached', async () => {
      const maxedEntry = {
        key: 'test:key',
        attempts: 5,
        expires_at: new Date(Date.now() + 60000), // Still valid
      };

      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(maxedEntry);

      const result = await checkRateLimit('test:key', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(prisma.rateLimitEntry.update).not.toHaveBeenCalled();
    });

    it('should increment attempts for valid entry', async () => {
      const validEntry = {
        key: 'test:key',
        attempts: 2,
        expires_at: new Date(Date.now() + 60000),
      };

      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(validEntry);
      (prisma.rateLimitEntry.update as Mock).mockResolvedValue({
        ...validEntry,
        attempts: 3,
      });

      const result = await checkRateLimit('test:key', config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 3
      expect(prisma.rateLimitEntry.update).toHaveBeenCalledWith({
        where: { key: 'test:key' },
        data: { attempts: { increment: 1 } },
      });
    });

    it('should return correct resetAt time', async () => {
      const expiresAt = new Date(Date.now() + 60000);
      const validEntry = {
        key: 'test:key',
        attempts: 3,
        expires_at: expiresAt,
      };

      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(validEntry);
      (prisma.rateLimitEntry.update as Mock).mockResolvedValue({
        ...validEntry,
        attempts: 4,
      });

      const result = await checkRateLimit('test:key', config);

      expect(result.resetAt).toEqual(expiresAt);
    });

    it('should trigger cleanup with 1% probability', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.005); // < 0.01, trigger cleanup

      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(null);
      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});
      (prisma.rateLimitEntry.deleteMany as Mock).mockResolvedValue({ count: 0 });

      await checkRateLimit('test:key', config);

      expect(prisma.rateLimitEntry.deleteMany).toHaveBeenCalled();
    });

    it('should not trigger cleanup with 99% probability', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.01, no cleanup

      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(null);
      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});

      await checkRateLimit('test:key', config);

      expect(prisma.rateLimitEntry.deleteMany).not.toHaveBeenCalled();
    });

    it('should handle different keys independently', async () => {
      const key1Entry = { key: 'key1', attempts: 4, expires_at: new Date(Date.now() + 60000) };

      (prisma.rateLimitEntry.findUnique as Mock)
        .mockResolvedValueOnce(key1Entry)
        .mockResolvedValueOnce(null);
      (prisma.rateLimitEntry.update as Mock).mockResolvedValue({ ...key1Entry, attempts: 5 });
      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});

      const result1 = await checkRateLimit('key1', config);
      const result2 = await checkRateLimit('key2', config);

      expect(result1.remaining).toBe(0); // key1 at max
      expect(result2.remaining).toBe(4); // key2 fresh
    });
  });

  // ============================================
  // resetRateLimit() Tests
  // ============================================
  describe('resetRateLimit', () => {
    it('should delete entry for given key', async () => {
      (prisma.rateLimitEntry.deleteMany as Mock).mockResolvedValue({ count: 1 });

      await resetRateLimit('test:key');

      expect(prisma.rateLimitEntry.deleteMany).toHaveBeenCalledWith({
        where: { key: 'test:key' },
      });
    });

    it('should not throw if key does not exist', async () => {
      (prisma.rateLimitEntry.deleteMany as Mock).mockResolvedValue({ count: 0 });

      await expect(resetRateLimit('nonexistent:key')).resolves.not.toThrow();
    });
  });

  // ============================================
  // cleanupExpiredEntries() Tests
  // ============================================
  describe('cleanupExpiredEntries', () => {
    it('should delete expired entries', async () => {
      (prisma.rateLimitEntry.deleteMany as Mock).mockResolvedValue({ count: 5 });

      const result = await cleanupExpiredEntries();

      expect(result).toBe(5);
      expect(prisma.rateLimitEntry.deleteMany).toHaveBeenCalledWith({
        where: {
          expires_at: { lt: expect.any(Date) },
        },
      });
    });

    it('should return 0 when no expired entries', async () => {
      (prisma.rateLimitEntry.deleteMany as Mock).mockResolvedValue({ count: 0 });

      const result = await cleanupExpiredEntries();

      expect(result).toBe(0);
    });
  });

  // ============================================
  // RATE_LIMITS Configuration Tests
  // ============================================
  describe('RATE_LIMITS', () => {
    it('should have AUTH config', () => {
      expect(RATE_LIMITS.AUTH).toEqual({
        maxAttempts: 5,
        windowMs: 5 * 60 * 1000, // 5 minutes
      });
    });

    it('should have EMAIL config', () => {
      expect(RATE_LIMITS.EMAIL).toEqual({
        maxAttempts: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
      });
    });

    it('should have API config', () => {
      expect(RATE_LIMITS.API).toEqual({
        maxAttempts: 30,
        windowMs: 60 * 1000, // 1 minute
      });
    });

    it('should have MAGIC_LINK_IP config', () => {
      expect(RATE_LIMITS.MAGIC_LINK_IP).toEqual({
        maxAttempts: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
      });
    });
  });

  // ============================================
  // Integration-style Tests
  // ============================================
  describe('Rate Limit Scenarios', () => {
    const authConfig = RATE_LIMITS.AUTH;

    it('should block after 5 failed login attempts', async () => {
      // Simulate 5 attempts
      const createEntry = (attempts: number) => ({
        key: 'auth:user@test.com',
        attempts,
        expires_at: new Date(Date.now() + authConfig.windowMs),
      });

      (prisma.rateLimitEntry.findUnique as Mock)
        .mockResolvedValueOnce(null) // 1st
        .mockResolvedValueOnce(createEntry(1)) // 2nd
        .mockResolvedValueOnce(createEntry(2)) // 3rd
        .mockResolvedValueOnce(createEntry(3)) // 4th
        .mockResolvedValueOnce(createEntry(4)) // 5th - allowed
        .mockResolvedValueOnce(createEntry(5)); // 6th - blocked

      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});
      (prisma.rateLimitEntry.update as Mock).mockImplementation(async ({ where }) => {
        const current = (prisma.rateLimitEntry.findUnique as Mock).mock.results.slice(-1)[0]?.value;
        return { ...current, attempts: (current?.attempts || 0) + 1 };
      });

      // First 5 attempts should be allowed
      for (let i = 0; i < 5; i++) {
        const result = await checkRateLimit('auth:user@test.com', authConfig);
        expect(result.allowed).toBe(true);
      }

      // 6th attempt should be blocked
      const result = await checkRateLimit('auth:user@test.com', authConfig);
      expect(result.allowed).toBe(false);
    });

    it('should reset on successful login', async () => {
      (prisma.rateLimitEntry.deleteMany as Mock).mockResolvedValue({ count: 1 });
      (prisma.rateLimitEntry.findUnique as Mock).mockResolvedValue(null);
      (prisma.rateLimitEntry.upsert as Mock).mockResolvedValue({});

      // Simulate successful login clearing rate limit
      await resetRateLimit('auth:user@test.com');

      // Next attempt should start fresh
      const result = await checkRateLimit('auth:user@test.com', authConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });
});
