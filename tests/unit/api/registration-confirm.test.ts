/**
 * Registration Confirm API Route Tests
 *
 * Tests for: app/api/registration/confirm/route.ts
 *
 * Coverage targets:
 * - CR-2: Self-registration vulnerability prevention
 * - CR-3: Partner GDPR consent validation
 * - CR-8: Rate limiting
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { NextRequest } from 'next/server';

// Mock rate limit
const mockCheckRateLimit = vi.fn();
vi.mock('@/lib/services/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  RATE_LIMITS: {
    AUTH: { maxAttempts: 5, windowMs: 60000 },
  },
}));

// Mock prisma
const mockPrismaGuest = {
  findUnique: vi.fn(),
};
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    guest: mockPrismaGuest,
  },
}));

// Mock registration service
const mockProcessVIPRegistration = vi.fn();
vi.mock('@/lib/services/registration', () => ({
  processVIPRegistration: (...args: unknown[]) => mockProcessVIPRegistration(...args),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Import route handler AFTER mocks
import { POST } from '@/app/api/registration/confirm/route';

describe('Registration Confirm API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: rate limit allows
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 4, resetAt: new Date() });
  });

  // Helper to create NextRequest
  function createRequest(body: Record<string, unknown>, headers?: Record<string, string>): NextRequest {
    return new NextRequest('http://localhost/api/registration/confirm', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        ...headers,
      },
    });
  }

  // ============================================
  // CR-8: Rate Limiting Tests
  // ============================================
  describe('Rate Limiting (CR-8)', () => {
    it('should return 429 when rate limit exceeded', async () => {
      mockCheckRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 60000),
      });

      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Too many requests');
    });

    it('should extract IP from x-forwarded-for header', async () => {
      const request = createRequest(
        { guest_id: 100, attendance: 'confirm' },
        { 'x-forwarded-for': '10.0.0.1, 192.168.1.1' }
      );

      await POST(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'registration-confirm:10.0.0.1',
        expect.anything()
      );
    });

    it('should fallback to x-real-ip header', async () => {
      const request = new NextRequest('http://localhost/api/registration/confirm', {
        method: 'POST',
        body: JSON.stringify({ guest_id: 100, attendance: 'confirm' }),
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': '172.16.0.1',
        },
      });

      await POST(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'registration-confirm:172.16.0.1',
        expect.anything()
      );
    });
  });

  // ============================================
  // CR-2: Self-Registration Prevention Tests
  // ============================================
  describe('Self-Registration Prevention (CR-2)', () => {
    it('should reject when partner email equals guest email', async () => {
      mockPrismaGuest.findUnique.mockResolvedValue({
        id: 100,
        email: 'guest@example.com',
      });

      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Same Person',
        partner_email: 'guest@example.com', // Same as guest
        partner_gdpr_consent: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Partner email cannot be the same');
    });

    it('should reject case-insensitive email match', async () => {
      mockPrismaGuest.findUnique.mockResolvedValue({
        id: 100,
        email: 'guest@example.com',
      });

      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Same Person',
        partner_email: 'GUEST@EXAMPLE.COM', // Same but uppercase
        partner_gdpr_consent: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Partner email cannot be the same');
    });

    it('should reject emails with whitespace as invalid format', async () => {
      // Note: Email format validation runs BEFORE self-registration check
      // Emails with leading/trailing whitespace fail regex validation
      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Same Person',
        partner_email: '  guest@example.com  ', // Whitespace fails email regex
        partner_gdpr_consent: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      // Whitespace in email fails format validation before self-registration check
      expect(data.error).toContain('Invalid partner email format');
    });

    it('should allow different partner email', async () => {
      mockPrismaGuest.findUnique.mockResolvedValue({
        id: 100,
        email: 'guest@example.com',
      });
      mockProcessVIPRegistration.mockResolvedValue({
        success: true,
        registrationId: 1,
        status: 'approved',
      });

      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Different Person',
        partner_email: 'partner@example.com', // Different email
        partner_gdpr_consent: true,
        gdpr_consent: true,
        cancellation_accepted: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // CR-3: Partner GDPR Consent Validation Tests
  // ============================================
  describe('Partner GDPR Consent (CR-3)', () => {
    it('should reject when partner GDPR consent is missing', async () => {
      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Partner Name',
        partner_email: 'partner@example.com',
        // partner_gdpr_consent missing
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Partner GDPR consent is required');
    });

    it('should reject when partner GDPR consent is false', async () => {
      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Partner Name',
        partner_email: 'partner@example.com',
        partner_gdpr_consent: false,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Partner GDPR consent is required');
    });

    it('should not require partner GDPR when has_partner is false', async () => {
      mockProcessVIPRegistration.mockResolvedValue({
        success: true,
        registrationId: 1,
        status: 'approved',
      });

      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: false,
        gdpr_consent: true,
        cancellation_accepted: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // Validation Tests
  // ============================================
  describe('Input Validation', () => {
    it('should require guest_id', async () => {
      const request = createRequest({
        attendance: 'confirm',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('guest_id is required');
    });

    it('should require valid attendance value', async () => {
      const request = createRequest({
        guest_id: 100,
        attendance: 'maybe',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('attendance must be');
    });

    it('should require phone for confirmation', async () => {
      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        company: 'Test Corp',
        position: 'CEO',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Phone');
    });

    it('should validate partner email format', async () => {
      const request = createRequest({
        guest_id: 100,
        attendance: 'confirm',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        has_partner: true,
        partner_name: 'Partner Name',
        partner_email: 'invalid-email',
        partner_gdpr_consent: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid partner email format');
    });
  });
});
