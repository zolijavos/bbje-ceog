/**
 * PWA Auth Service Unit Tests
 *
 * Tests for: lib/services/pwa-auth.ts
 *
 * Coverage targets:
 * - verifyPWASession() - JWT session verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original env
const originalEnv = process.env.APP_SECRET;

// Mock jwt
const mockVerify = vi.fn();
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: (...args: unknown[]) => mockVerify(...args),
  },
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
}));

// Dynamic import for fresh module
let pwaAuthModule: typeof import('@/lib/services/pwa-auth');

describe('PWA Auth Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockVerify.mockReset();
    vi.resetModules();

    // Set APP_SECRET before import
    process.env.APP_SECRET = 'test-secret-key-for-pwa-sessions';
    pwaAuthModule = await import('@/lib/services/pwa-auth');
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.APP_SECRET = originalEnv;
    } else {
      delete process.env.APP_SECRET;
    }
  });

  // ============================================
  // verifyPWASession() Tests
  // ============================================
  describe('verifyPWASession', () => {
    it('should return decoded session for valid token', () => {
      const mockPayload = {
        guestId: 100,
        registrationId: 1,
        email: 'guest@example.com',
        iat: 1234567890,
        exp: 1234567890 + 86400,
      };

      mockVerify.mockReturnValue(mockPayload);

      const result = pwaAuthModule.verifyPWASession('valid-token');

      expect(result).toEqual({
        guestId: 100,
        registrationId: 1,
        email: 'guest@example.com',
      });
      expect(mockVerify).toHaveBeenCalledWith('valid-token', 'test-secret-key-for-pwa-sessions');
    });

    it('should return null for invalid token', () => {
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = pwaAuthModule.verifyPWASession('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      mockVerify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const result = pwaAuthModule.verifyPWASession('expired-token');

      expect(result).toBeNull();
    });

    it('should return null if APP_SECRET is not configured', async () => {
      // Re-import without APP_SECRET
      delete process.env.APP_SECRET;
      vi.resetModules();
      const freshModule = await import('@/lib/services/pwa-auth');

      const result = freshModule.verifyPWASession('any-token');

      expect(result).toBeNull();
      expect(mockVerify).not.toHaveBeenCalled();
    });

    it('should handle malformed token gracefully', () => {
      mockVerify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      const result = pwaAuthModule.verifyPWASession('malformed.token');

      expect(result).toBeNull();
    });

    it('should extract only required fields from payload', () => {
      const mockPayload = {
        guestId: 42,
        registrationId: 5,
        email: 'test@test.com',
        iat: 1234567890,
        exp: 1234567890 + 86400,
        extraField: 'should be ignored',
        anotherExtra: 123,
      };

      mockVerify.mockReturnValue(mockPayload);

      const result = pwaAuthModule.verifyPWASession('valid-token');

      expect(result).toEqual({
        guestId: 42,
        registrationId: 5,
        email: 'test@test.com',
      });
      // Extra fields should not be included
      expect(result).not.toHaveProperty('extraField');
      expect(result).not.toHaveProperty('anotherExtra');
    });
  });
});
