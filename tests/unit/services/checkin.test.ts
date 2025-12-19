/**
 * Check-in Service Unit Tests
 *
 * Tests for: lib/services/checkin.ts
 *
 * Coverage targets:
 * - validateCheckinToken() - QR token validation
 * - submitCheckin() - Record check-in event
 * - getCheckinStatus() - Get check-in status
 * - getCheckinLog() - Get check-in log with filters
 * - getCheckinStats() - Get check-in statistics
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Set QR_SECRET before any imports that use it
process.env.QR_SECRET = 'a'.repeat(64);
process.env.EVENT_DATE = '2026-03-27';

// Mock qr-ticket service
vi.mock('@/lib/services/qr-ticket', () => ({
  verifyTicketToken: vi.fn(),
  validateTicket: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    registration: {
      findUnique: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    checkin: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    tableAssignment: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock event broadcaster
vi.mock('@/lib/services/event-broadcaster', () => ({
  broadcastToGuest: vi.fn(),
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

import { prisma } from '@/lib/db/prisma';
import { verifyTicketToken } from '@/lib/services/qr-ticket';
import { broadcastToGuest } from '@/lib/services/event-broadcaster';
import {
  validateCheckinToken,
  submitCheckin,
  getCheckinStatus,
  getCheckinLog,
  getCheckinStats,
} from '@/lib/services/checkin';

describe('Check-in Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // validateCheckinToken() Tests
  // ============================================
  describe('validateCheckinToken', () => {
    const mockPayload = {
      registration_id: 1,
      guest_id: 100,
      ticket_type: 'vip_free',
      guest_name: 'Test Guest',
    };

    const mockRegistration = {
      id: 1,
      ticket_type: 'vip_free',
      partner_name: null,
      qr_code_hash: 'valid-token',
      guest: {
        id: 100,
        name: 'Test Guest',
      },
      checkin: null,
    };

    it('should return valid for valid token', async () => {
      (verifyTicketToken as Mock).mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);

      const result = await validateCheckinToken('valid-token');

      expect(result.valid).toBe(true);
      expect(result.guest?.name).toBe('Test Guest');
      expect(result.alreadyCheckedIn).toBe(false);
    });

    it('should return error for expired token', async () => {
      (verifyTicketToken as Mock).mockImplementation(() => {
        throw new Error('TICKET_EXPIRED');
      });

      const result = await validateCheckinToken('expired-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('EXPIRED_TOKEN');
    });

    it('should return error for invalid token', async () => {
      (verifyTicketToken as Mock).mockImplementation(() => {
        throw new Error('INVALID_TICKET');
      });

      const result = await validateCheckinToken('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_TOKEN');
    });

    it('should return error for registration not found', async () => {
      (verifyTicketToken as Mock).mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      const result = await validateCheckinToken('valid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('REGISTRATION_NOT_FOUND');
    });

    it('should return error for token mismatch', async () => {
      (verifyTicketToken as Mock).mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        qr_code_hash: 'different-token',
      });

      const result = await validateCheckinToken('valid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOKEN_MISMATCH');
    });

    it('should indicate already checked in', async () => {
      (verifyTicketToken as Mock).mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        checkin: {
          checked_in_at: new Date('2024-01-15T10:00:00Z'),
          staff_user: { name: 'Staff User' },
        },
      });

      const result = await validateCheckinToken('valid-token');

      expect(result.valid).toBe(true);
      expect(result.alreadyCheckedIn).toBe(true);
      expect(result.previousCheckin?.staffName).toBe('Staff User');
    });
  });

  // ============================================
  // submitCheckin() Tests
  // ============================================
  describe('submitCheckin', () => {
    const mockRegistration = {
      id: 1,
      guest: { id: 100, name: 'Test Guest' },
      checkin: null,
    };

    it('should create check-in successfully', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);
      (prisma.checkin.create as Mock).mockResolvedValue({
        id: 1,
        checked_in_at: new Date(),
      });
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(null);

      const result = await submitCheckin(1, 10);

      expect(result.success).toBe(true);
      expect(result.checkinId).toBe(1);
      expect(prisma.checkin.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          registration_id: 1,
          guest_id: 100,
          staff_user_id: 10,
          is_override: false,
        }),
      });
    });

    it('should return error for registration not found', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      const result = await submitCheckin(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('REGISTRATION_NOT_FOUND');
    });

    it('should return error for guest not found', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        id: 1,
        guest: null,
        checkin: null,
      });

      const result = await submitCheckin(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GUEST_NOT_FOUND');
    });

    it('should return error if already checked in without override', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        checkin: { id: 1 },
      });

      const result = await submitCheckin(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_CHECKED_IN');
    });

    it('should allow override check-in', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        checkin: { id: 1 },
      });
      (prisma.checkin.delete as Mock).mockResolvedValue({});
      (prisma.checkin.create as Mock).mockResolvedValue({
        id: 2,
        checked_in_at: new Date(),
      });
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(null);

      const result = await submitCheckin(1, 10, true);

      expect(result.success).toBe(true);
      expect(prisma.checkin.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.checkin.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          is_override: true,
        }),
      });
    });

    it('should broadcast check-in event to guest', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);
      (prisma.checkin.create as Mock).mockResolvedValue({
        id: 1,
        checked_in_at: new Date(),
      });
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue({
        table: { name: 'VIP-1', type: 'vip' },
        seat_number: 5,
      });

      await submitCheckin(1);

      expect(broadcastToGuest).toHaveBeenCalledWith(
        100,
        expect.objectContaining({
          type: 'CHECKED_IN',
          guestId: 100,
          tableName: 'VIP-1',
        })
      );
    });
  });

  // ============================================
  // getCheckinStatus() Tests
  // ============================================
  describe('getCheckinStatus', () => {
    it('should return check-in status', async () => {
      const mockCheckin = {
        id: 1,
        registration_id: 1,
        checked_in_at: new Date(),
        staff_user: { name: 'Staff', email: 'staff@test.com' },
        guest: { name: 'Guest', email: 'guest@test.com' },
      };
      (prisma.checkin.findUnique as Mock).mockResolvedValue(mockCheckin);

      const result = await getCheckinStatus(1);

      expect(result).toEqual(mockCheckin);
      expect(prisma.checkin.findUnique).toHaveBeenCalledWith({
        where: { registration_id: 1 },
        include: expect.any(Object),
      });
    });

    it('should return null if not checked in', async () => {
      (prisma.checkin.findUnique as Mock).mockResolvedValue(null);

      const result = await getCheckinStatus(999);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // getCheckinLog() Tests
  // ============================================
  describe('getCheckinLog', () => {
    it('should return paginated check-in log', async () => {
      const mockCheckins = [
        { id: 1, guest: { name: 'Guest 1' } },
        { id: 2, guest: { name: 'Guest 2' } },
      ];
      (prisma.checkin.findMany as Mock).mockResolvedValue(mockCheckins);
      (prisma.checkin.count as Mock).mockResolvedValue(50);

      const result = await getCheckinLog({ page: 1, limit: 10 });

      expect(result.checkins).toEqual(mockCheckins);
      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(5);
    });

    it('should apply date range filter', async () => {
      (prisma.checkin.findMany as Mock).mockResolvedValue([]);
      (prisma.checkin.count as Mock).mockResolvedValue(0);

      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-01-31');

      await getCheckinLog({ dateFrom, dateTo });

      expect(prisma.checkin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            checked_in_at: {
              gte: dateFrom,
              lte: dateTo,
            },
          }),
        })
      );
    });

    it('should apply search filter', async () => {
      (prisma.checkin.findMany as Mock).mockResolvedValue([]);
      (prisma.checkin.count as Mock).mockResolvedValue(0);

      await getCheckinLog({ search: 'test' });

      expect(prisma.checkin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            guest: {
              OR: [
                { name: { contains: 'test' } },
                { email: { contains: 'test' } },
              ],
            },
          }),
        })
      );
    });

    it('should use default pagination values', async () => {
      (prisma.checkin.findMany as Mock).mockResolvedValue([]);
      (prisma.checkin.count as Mock).mockResolvedValue(0);

      await getCheckinLog({});

      expect(prisma.checkin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 50,
        })
      );
    });
  });

  // ============================================
  // getCheckinStats() Tests
  // ============================================
  describe('getCheckinStats', () => {
    it('should return check-in statistics', async () => {
      (prisma.checkin.count as Mock).mockResolvedValue(100);
      (prisma.registration.groupBy as Mock).mockResolvedValue([
        { ticket_type: 'vip_free', _count: 30 },
        { ticket_type: 'paid_single', _count: 50 },
        { ticket_type: 'paid_paired', _count: 20 },
      ]);
      (prisma.checkin.findMany as Mock).mockResolvedValue([
        { guest: { name: 'Guest 1' }, registration: { ticket_type: 'vip_free' }, checked_in_at: new Date() },
      ]);
      (prisma.registration.count as Mock).mockResolvedValue(150);

      const result = await getCheckinStats();

      expect(result.totalCheckins).toBe(100);
      expect(result.totalRegistrations).toBe(150);
      expect(result.checkinRate).toBeCloseTo(66.67, 1);
      expect(result.byTicketType.vip_free).toBe(30);
      expect(result.byTicketType.paid_single).toBe(50);
      expect(result.recentCheckins).toHaveLength(1);
    });

    it('should handle zero registrations', async () => {
      (prisma.checkin.count as Mock).mockResolvedValue(0);
      (prisma.registration.groupBy as Mock).mockResolvedValue([]);
      (prisma.checkin.findMany as Mock).mockResolvedValue([]);
      (prisma.registration.count as Mock).mockResolvedValue(0);

      const result = await getCheckinStats();

      expect(result.checkinRate).toBe(0);
      expect(result.byTicketType.vip_free).toBe(0);
    });
  });
});
