/**
 * Guest Service Unit Tests
 *
 * Tests for: lib/services/guest.ts
 *
 * Coverage targets:
 * - getGuestList() - Paginated guest list with filters
 * - getGuestById() - Get single guest by ID
 * - createGuest() - Create new guest
 * - updateGuest() - Update existing guest
 * - deleteGuest() - Delete guest with cascade
 * - getGuestStats() - Get guest statistics
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma
const mockTransaction = vi.fn();
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    guest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    emailLog: {
      deleteMany: vi.fn(),
    },
    checkin: {
      deleteMany: vi.fn(),
    },
    tableAssignment: {
      deleteMany: vi.fn(),
    },
    registration: {
      deleteMany: vi.fn(),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { prisma } from '@/lib/db/prisma';
import {
  getGuestList,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats,
} from '@/lib/services/guest';

describe('Guest Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockReset();

    // Default transaction mock
    mockTransaction.mockImplementation(async (fn) => {
      const txMock = {
        emailLog: { deleteMany: vi.fn().mockResolvedValue({}) },
        checkin: { deleteMany: vi.fn().mockResolvedValue({}) },
        tableAssignment: { deleteMany: vi.fn().mockResolvedValue({}) },
        registration: { deleteMany: vi.fn().mockResolvedValue({}) },
        guest: { delete: vi.fn().mockResolvedValue({ id: 1 }) },
      };
      return fn(txMock);
    });
  });

  // ============================================
  // getGuestList() Tests
  // ============================================
  describe('getGuestList', () => {
    const mockGuests = [
      {
        id: 1,
        email: 'guest1@example.com',
        name: 'Guest One',
        guest_type: 'vip',
        registration_status: 'registered',
        created_at: new Date(),
        updated_at: new Date(),
        table_assignment: { table: { name: 'Table 1' }, seat_number: 1 },
        registration: { id: 1, ticket_type: 'vip_free' },
      },
      {
        id: 2,
        email: 'guest2@example.com',
        name: 'Guest Two',
        guest_type: 'paying_single',
        registration_status: 'invited',
        created_at: new Date(),
        updated_at: new Date(),
        table_assignment: null,
        registration: null,
      },
    ];

    it('should return paginated guest list', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.guest.count as Mock).mockResolvedValue(50);

      const result = await getGuestList({ page: 1, limit: 25 });

      expect(result.guests).toEqual(mockGuests);
      expect(result.total).toBe(50);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(25);
      expect(result.totalPages).toBe(2);
    });

    it('should use default pagination values', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([]);
      (prisma.guest.count as Mock).mockResolvedValue(0);

      const result = await getGuestList();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(25);
    });

    it('should filter by search term', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([mockGuests[0]]);
      (prisma.guest.count as Mock).mockResolvedValue(1);

      await getGuestList({ search: 'guest1' });

      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'guest1' } },
              { email: { contains: 'guest1' } },
            ],
          }),
        })
      );
    });

    it('should filter by guest type', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([mockGuests[0]]);
      (prisma.guest.count as Mock).mockResolvedValue(1);

      await getGuestList({ type: 'vip' });

      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            guest_type: 'vip',
          }),
        })
      );
    });

    it('should not filter by type when "all"', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.guest.count as Mock).mockResolvedValue(2);

      await getGuestList({ type: 'all' });

      const call = (prisma.guest.findMany as Mock).mock.calls[0][0];
      expect(call.where.guest_type).toBeUndefined();
    });

    it('should filter by registration status', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([mockGuests[0]]);
      (prisma.guest.count as Mock).mockResolvedValue(1);

      await getGuestList({ status: 'registered' });

      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            registration_status: 'registered',
          }),
        })
      );
    });

    it('should not filter by status when "all"', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.guest.count as Mock).mockResolvedValue(2);

      await getGuestList({ status: 'all' });

      const call = (prisma.guest.findMany as Mock).mock.calls[0][0];
      expect(call.where.registration_status).toBeUndefined();
    });

    it('should apply correct pagination skip', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([]);
      (prisma.guest.count as Mock).mockResolvedValue(100);

      await getGuestList({ page: 3, limit: 10 });

      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3-1) * 10
          take: 10,
        })
      );
    });

    it('should calculate correct total pages', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([]);
      (prisma.guest.count as Mock).mockResolvedValue(57);

      const result = await getGuestList({ limit: 10 });

      expect(result.totalPages).toBe(6); // ceil(57/10)
    });
  });

  // ============================================
  // getGuestById() Tests
  // ============================================
  describe('getGuestById', () => {
    const mockGuest = {
      id: 1,
      email: 'guest@example.com',
      name: 'Test Guest',
      registration: { id: 1 },
      table_assignment: { table: { id: 1, name: 'Table 1' } },
      email_logs: [],
    };

    it('should return guest with relations', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);

      const result = await getGuestById(1);

      expect(result).toEqual(mockGuest);
      expect(prisma.guest.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.objectContaining({
          registration: true,
          table_assignment: expect.any(Object),
          email_logs: expect.any(Object),
        }),
      });
    });

    it('should return null if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await getGuestById(999);

      expect(result).toBeNull();
    });

    it('should limit email logs to 10', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);

      await getGuestById(1);

      expect(prisma.guest.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            email_logs: {
              orderBy: { sent_at: 'desc' },
              take: 10,
            },
          }),
        })
      );
    });
  });

  // ============================================
  // createGuest() Tests
  // ============================================
  describe('createGuest', () => {
    const newGuestData = {
      email: 'new@example.com',
      name: 'New Guest',
      guest_type: 'vip' as const,
    };

    it('should create guest successfully', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);
      (prisma.guest.create as Mock).mockResolvedValue({ id: 1, ...newGuestData });

      const result = await createGuest(newGuestData);

      expect(result.id).toBe(1);
      expect(prisma.guest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'new@example.com',
          name: 'New Guest',
          guest_type: 'vip',
          registration_status: 'invited',
        }),
      });
    });

    it('should throw EMAIL_EXISTS if email already exists', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({ id: 1 });

      await expect(createGuest(newGuestData)).rejects.toThrow('EMAIL_EXISTS');
    });

    it('should handle optional fields', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);
      (prisma.guest.create as Mock).mockResolvedValue({ id: 1 });

      await createGuest({
        ...newGuestData,
        title: 'Dr.',
        phone: '+36 1 234 5678',
        company: 'Test Corp',
        position: 'CEO',
        dietary_requirements: 'Vegetarian',
        seating_preferences: 'Near stage',
      });

      expect(prisma.guest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Dr.',
          phone: '+36 1 234 5678',
          company: 'Test Corp',
          position: 'CEO',
          dietary_requirements: 'Vegetarian',
          seating_preferences: 'Near stage',
        }),
      });
    });

    it('should set null for missing optional fields', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);
      (prisma.guest.create as Mock).mockResolvedValue({ id: 1 });

      await createGuest(newGuestData);

      expect(prisma.guest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: null,
          phone: null,
          company: null,
          position: null,
          dietary_requirements: null,
          seating_preferences: null,
        }),
      });
    });
  });

  // ============================================
  // updateGuest() Tests
  // ============================================
  describe('updateGuest', () => {
    it('should update guest successfully', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.guest.update as Mock).mockResolvedValue({
        id: 1,
        name: 'Updated Name',
      });

      const result = await updateGuest(1, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(prisma.guest.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: 'Updated Name',
          updated_at: expect.any(Date),
        }),
      });
    });

    it('should throw GUEST_NOT_FOUND if guest does not exist', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      await expect(updateGuest(999, { name: 'Test' })).rejects.toThrow('GUEST_NOT_FOUND');
    });

    it('should update multiple fields', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.guest.update as Mock).mockResolvedValue({ id: 1 });

      await updateGuest(1, {
        name: 'New Name',
        guest_type: 'paying_single',
        registration_status: 'approved',
        dietary_requirements: 'Vegan',
      });

      expect(prisma.guest.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: 'New Name',
          guest_type: 'paying_single',
          registration_status: 'approved',
          dietary_requirements: 'Vegan',
        }),
      });
    });
  });

  // ============================================
  // deleteGuest() Tests
  // ============================================
  describe('deleteGuest', () => {
    it('should delete guest and related records in transaction', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({ id: 1 });

      const txMock = {
        emailLog: { deleteMany: vi.fn().mockResolvedValue({ count: 5 }) },
        checkin: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
        tableAssignment: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
        registration: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
        guest: { delete: vi.fn().mockResolvedValue({ id: 1, name: 'Deleted Guest' }) },
      };
      mockTransaction.mockImplementation(async (fn) => fn(txMock));

      const result = await deleteGuest(1);

      expect(result).toEqual({ id: 1, name: 'Deleted Guest' });
      expect(txMock.emailLog.deleteMany).toHaveBeenCalledWith({ where: { guest_id: 1 } });
      expect(txMock.checkin.deleteMany).toHaveBeenCalledWith({ where: { guest_id: 1 } });
      expect(txMock.tableAssignment.deleteMany).toHaveBeenCalledWith({ where: { guest_id: 1 } });
      expect(txMock.registration.deleteMany).toHaveBeenCalledWith({ where: { guest_id: 1 } });
      expect(txMock.guest.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw GUEST_NOT_FOUND if guest does not exist', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      await expect(deleteGuest(999)).rejects.toThrow('GUEST_NOT_FOUND');
    });

    it('should delete records in correct order', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({ id: 1 });

      const callOrder: string[] = [];
      const txMock = {
        emailLog: { deleteMany: vi.fn().mockImplementation(() => { callOrder.push('emailLog'); return { count: 0 }; }) },
        checkin: { deleteMany: vi.fn().mockImplementation(() => { callOrder.push('checkin'); return { count: 0 }; }) },
        tableAssignment: { deleteMany: vi.fn().mockImplementation(() => { callOrder.push('tableAssignment'); return { count: 0 }; }) },
        registration: { deleteMany: vi.fn().mockImplementation(() => { callOrder.push('registration'); return { count: 0 }; }) },
        guest: { delete: vi.fn().mockImplementation(() => { callOrder.push('guest'); return { id: 1 }; }) },
      };
      mockTransaction.mockImplementation(async (fn) => fn(txMock));

      await deleteGuest(1);

      // Guest should be deleted last after all dependencies
      expect(callOrder.indexOf('guest')).toBeGreaterThan(callOrder.indexOf('emailLog'));
      expect(callOrder.indexOf('guest')).toBeGreaterThan(callOrder.indexOf('registration'));
    });
  });

  // ============================================
  // getGuestStats() Tests
  // ============================================
  describe('getGuestStats', () => {
    it('should return guest statistics', async () => {
      (prisma.guest.count as Mock).mockResolvedValue(100);
      (prisma.guest.groupBy as Mock)
        .mockResolvedValueOnce([
          { guest_type: 'vip', _count: 30 },
          { guest_type: 'paying_single', _count: 50 },
          { guest_type: 'paying_paired', _count: 20 },
        ])
        .mockResolvedValueOnce([
          { registration_status: 'invited', _count: 40 },
          { registration_status: 'registered', _count: 35 },
          { registration_status: 'approved', _count: 20 },
          { registration_status: 'declined', _count: 5 },
        ]);

      const result = await getGuestStats();

      expect(result).toEqual({
        total: 100,
        byType: {
          vip: 30,
          paying_single: 50,
          paying_paired: 20,
        },
        byStatus: {
          invited: 40,
          registered: 35,
          approved: 20,
          declined: 5,
        },
      });
    });

    it('should return zero for missing types', async () => {
      (prisma.guest.count as Mock).mockResolvedValue(10);
      (prisma.guest.groupBy as Mock)
        .mockResolvedValueOnce([{ guest_type: 'vip', _count: 10 }])
        .mockResolvedValueOnce([{ registration_status: 'invited', _count: 10 }]);

      const result = await getGuestStats();

      expect(result.byType).toEqual({
        vip: 10,
        paying_single: 0,
        paying_paired: 0,
      });
      expect(result.byStatus).toEqual({
        invited: 10,
        registered: 0,
        approved: 0,
        declined: 0,
      });
    });

    it('should handle empty database', async () => {
      (prisma.guest.count as Mock).mockResolvedValue(0);
      (prisma.guest.groupBy as Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await getGuestStats();

      expect(result.total).toBe(0);
      expect(result.byType.vip).toBe(0);
      expect(result.byStatus.invited).toBe(0);
    });
  });
});
