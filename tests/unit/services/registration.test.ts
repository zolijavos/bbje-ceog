/**
 * Registration Service Unit Tests
 *
 * Tests for: lib/services/registration.ts
 *
 * Coverage targets:
 * - generatePWAAuthCode() - PWA auth code generation
 * - processVIPRegistration() - VIP registration flow
 * - checkGuestRegistration() - Check if already registered
 * - getGuestForRegistration() - Get guest details
 * - processPaidRegistration() - Paid registration flow
 * - getGuestStatus() - Get guest status for dashboard
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma
const mockTransaction = vi.fn();
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    guest: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    registration: {
      create: vi.fn(),
      update: vi.fn(),
    },
    billingInfo: {
      create: vi.fn(),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

// Mock email service
vi.mock('@/lib/services/email', () => ({
  generateAndSendTicket: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock error utils
vi.mock('@/lib/utils/errors', () => ({
  getErrorMessage: vi.fn((e) => e.message || 'Unknown error'),
}));

// Mock crypto for consistent auth code generation in tests
vi.mock('crypto', () => ({
  default: {
    randomInt: vi.fn(() => 0), // Always returns first character
  },
}));

import { prisma } from '@/lib/db/prisma';
import {
  generatePWAAuthCode,
  processVIPRegistration,
  checkGuestRegistration,
  getGuestForRegistration,
  processPaidRegistration,
  getGuestStatus,
} from '@/lib/services/registration';

describe('Registration Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockReset();

    // Default transaction mock
    mockTransaction.mockImplementation(async (fn) => {
      const txMock = {
        guest: {
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          update: vi.fn().mockResolvedValue({}),
          create: vi.fn().mockResolvedValue({ id: 200 }),
        },
        registration: {
          create: vi.fn().mockResolvedValue({ id: 1 }),
        },
        billingInfo: {
          create: vi.fn().mockResolvedValue({ id: 1 }),
        },
      };
      return fn(txMock);
    });
  });

  // ============================================
  // generatePWAAuthCode() Tests
  // ============================================
  describe('generatePWAAuthCode', () => {
    it('should generate code in CEOG-XXXXXX format', () => {
      const code = generatePWAAuthCode();

      expect(code).toMatch(/^CEOG-[A-Z0-9]{6}$/);
    });

    it('should generate 6 character suffix', () => {
      const code = generatePWAAuthCode();
      const suffix = code.replace('CEOG-', '');

      expect(suffix).toHaveLength(6);
    });

    it('should only use allowed character set', () => {
      // The character set is defined in registration.ts:
      // 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' - excludes I, O, 0, 1
      // With crypto.randomInt mocked to return 0, we get 'A' each time
      const code = generatePWAAuthCode();

      // Verify code only contains allowed characters
      const allowedPattern = /^CEOG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
      expect(code).toMatch(allowedPattern);
    });
  });

  // ============================================
  // processVIPRegistration() Tests
  // ============================================
  describe('processVIPRegistration', () => {
    const mockVIPGuest = {
      id: 100,
      name: 'VIP Guest',
      email: 'vip@example.com',
      guest_type: 'vip',
      registration_status: 'invited',
      registration: null,
    };

    it('should return error if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await processVIPRegistration({
        guest_id: 999,
        attendance: 'confirm',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Guest not found');
    });

    it('should return error if guest is not VIP', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockVIPGuest,
        guest_type: 'paying_single',
      });

      const result = await processVIPRegistration({
        guest_id: 100,
        attendance: 'confirm',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('This page is only accessible to VIP guests');
    });

    it('should return error if already registered', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockVIPGuest,
        registration: { id: 1 },
        registration_status: 'approved',
      });

      const result = await processVIPRegistration({
        guest_id: 100,
        attendance: 'confirm',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already registered for this event');
    });

    it('should handle decline attendance', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockVIPGuest);
      (prisma.guest.update as Mock).mockResolvedValue({});

      const result = await processVIPRegistration({
        guest_id: 100,
        attendance: 'decline',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('declined');
      expect(prisma.guest.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: { registration_status: 'declined' },
      });
    });

    it('should create registration on confirm', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockVIPGuest);
      (prisma.guest.findFirst as Mock).mockResolvedValue(null); // No collision

      const result = await processVIPRegistration({
        guest_id: 100,
        attendance: 'confirm',
        gdpr_consent: true,
        cancellation_accepted: true,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('approved');
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should update guest profile on confirm', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockVIPGuest);
      (prisma.guest.findFirst as Mock).mockResolvedValue(null);

      await processVIPRegistration({
        guest_id: 100,
        attendance: 'confirm',
        title: 'Dr.',
        phone: '+36701234567',
        company: 'Test Corp',
        position: 'CEO',
        dietary_requirements: 'Vegetarian',
        seating_preferences: 'Near stage',
      });

      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  // ============================================
  // checkGuestRegistration() Tests
  // ============================================
  describe('checkGuestRegistration', () => {
    it('should return null if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await checkGuestRegistration(999);

      expect(result).toBeNull();
    });

    it('should return registration status for registered guest', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        registration_status: 'approved',
        registration: {
          id: 1,
          ticket_type: 'vip_free',
        },
      });

      const result = await checkGuestRegistration(100);

      expect(result).toEqual({
        isRegistered: true,
        status: 'approved',
        registrationId: 1,
        ticketType: 'vip_free',
      });
    });

    it('should return isRegistered=false for unregistered guest', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        registration_status: 'invited',
        registration: null,
      });

      const result = await checkGuestRegistration(100);

      expect(result).toEqual({
        isRegistered: false,
        status: 'invited',
        registrationId: undefined,
        ticketType: undefined,
      });
    });
  });

  // ============================================
  // getGuestForRegistration() Tests
  // ============================================
  describe('getGuestForRegistration', () => {
    it('should return guest details', async () => {
      const mockGuest = {
        id: 100,
        name: 'Test Guest',
        email: 'test@example.com',
        guest_type: 'vip',
        registration_status: 'invited',
        registration: null,
      };
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);

      const result = await getGuestForRegistration(100);

      expect(result).toEqual(mockGuest);
      expect(prisma.guest.findUnique).toHaveBeenCalledWith({
        where: { id: 100 },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          guest_type: true,
        }),
      });
    });

    it('should return null if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await getGuestForRegistration(999);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // processPaidRegistration() Tests
  // ============================================
  describe('processPaidRegistration', () => {
    const mockPaidGuest = {
      id: 100,
      name: 'Paid Guest',
      email: 'paid@example.com',
      guest_type: 'paying_single',
      registration_status: 'invited',
      registration: null,
    };

    const validPaidData = {
      guest_id: 100,
      ticket_type: 'paid_single' as const,
      billing_info: {
        billing_name: 'Test User',
        address_line1: 'Test Street 1',
        city: 'Budapest',
        postal_code: '1111',
      },
      gdpr_consent: true,
      cancellation_accepted: true,
    };

    it('should return error if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await processPaidRegistration(validPaidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Guest not found');
    });

    it('should return error if guest is VIP', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockPaidGuest,
        guest_type: 'vip',
      });

      const result = await processPaidRegistration(validPaidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('This page is only accessible to paying guests');
    });

    it('should return error if already registered', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockPaidGuest,
        registration: { id: 1 },
        registration_status: 'registered',
      });

      const result = await processPaidRegistration(validPaidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already registered for this event');
    });

    it('should require partner info for paired tickets', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockPaidGuest,
        guest_type: 'paying_paired',
      });

      const result = await processPaidRegistration({
        ...validPaidData,
        ticket_type: 'paid_paired',
        // No partner_name or partner_email
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Partner details are required for paired tickets');
    });

    it('should create registration for single ticket', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockPaidGuest);
      (prisma.guest.findFirst as Mock).mockResolvedValue(null);

      const result = await processPaidRegistration(validPaidData);

      expect(result.success).toBe(true);
      expect(result.status).toBe('registered');
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should create registration with partner for paired ticket', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockPaidGuest,
        guest_type: 'paying_paired',
      });
      (prisma.guest.findFirst as Mock).mockResolvedValue(null);

      const result = await processPaidRegistration({
        ...validPaidData,
        ticket_type: 'paid_paired',
        partner_name: 'Partner Name',
        partner_email: 'partner@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  // ============================================
  // getGuestStatus() Tests
  // ============================================
  describe('getGuestStatus', () => {
    it('should return error if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await getGuestStatus(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Guest not found');
    });

    it('should return VIP guest status with implicit paid status', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        name: 'VIP Guest',
        email: 'vip@example.com',
        guest_type: 'vip',
        registration_status: 'approved',
        registration: {
          id: 1,
          ticket_type: 'vip_free',
          registered_at: new Date(),
          partner_name: null,
          qr_code_hash: 'token123',
          payment: null,
        },
      });

      const result = await getGuestStatus(100);

      expect(result.success).toBe(true);
      expect(result.guest?.guestType).toBe('vip');
      expect(result.payment?.status).toBe('paid');
      expect(result.ticket?.available).toBe(true);
    });

    it('should return paid guest status with payment info', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        name: 'Paid Guest',
        email: 'paid@example.com',
        guest_type: 'paying_single',
        registration_status: 'approved',
        registration: {
          id: 1,
          ticket_type: 'paid_single',
          registered_at: new Date(),
          partner_name: null,
          qr_code_hash: 'token456',
          payment: {
            payment_status: 'paid',
            payment_method: 'card',
            paid_at: new Date(),
          },
        },
      });

      const result = await getGuestStatus(100);

      expect(result.success).toBe(true);
      expect(result.payment?.status).toBe('paid');
      expect(result.ticket?.available).toBe(true);
    });

    it('should return ticket not available if not paid', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        name: 'Paid Guest',
        email: 'paid@example.com',
        guest_type: 'paying_single',
        registration_status: 'registered',
        registration: {
          id: 1,
          ticket_type: 'paid_single',
          registered_at: new Date(),
          partner_name: null,
          qr_code_hash: null,
          payment: {
            payment_status: 'pending',
            payment_method: 'card',
            paid_at: null,
          },
        },
      });

      const result = await getGuestStatus(100);

      expect(result.success).toBe(true);
      expect(result.ticket?.available).toBe(false);
    });

    it('should return null registration for unregistered guest', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        name: 'New Guest',
        email: 'new@example.com',
        guest_type: 'paying_single',
        registration_status: 'invited',
        registration: null,
      });

      const result = await getGuestStatus(100);

      expect(result.success).toBe(true);
      expect(result.registration).toBeNull();
      expect(result.ticket?.available).toBe(false);
    });
  });
});
