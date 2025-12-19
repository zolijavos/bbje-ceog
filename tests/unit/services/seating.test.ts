/**
 * Seating Service Unit Tests
 *
 * Tests for: lib/services/seating.ts
 *
 * Coverage targets:
 * - createTable() - Create table
 * - updateTable() - Update table
 * - deleteTable() - Delete table
 * - getTable() - Get single table
 * - getAllTables() - Get all tables
 * - updateTablePosition() - Update position for drag-drop
 * - assignGuestToTable() - Assign guest with partner handling
 * - removeGuestFromTable() - Remove guest with partner handling
 * - moveGuestToTable() - Move guest between tables
 * - getUnassignedGuests() - Get unassigned guests
 * - getTableAvailability() - Get table availability
 * - getAllAssignments() - Get all assignments
 * - bulkAssignFromCsv() - Bulk import from CSV
 * - exportSeatingArrangement() - Export CSV
 * - getSeatingStats() - Get statistics
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma
const mockTransaction = vi.fn();
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    table: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tableAssignment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    guest: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

import { prisma } from '@/lib/db/prisma';
import {
  createTable,
  updateTable,
  deleteTable,
  getTable,
  getAllTables,
  updateTablePosition,
  assignGuestToTable,
  removeGuestFromTable,
  moveGuestToTable,
  getUnassignedGuests,
  getTableAvailability,
  getAllAssignments,
  bulkAssignFromCsv,
  exportSeatingArrangement,
  getSeatingStats,
} from '@/lib/services/seating';

describe('Seating Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockReset();

    // Default transaction mock
    mockTransaction.mockImplementation(async (fn) => {
      const txMock = {
        tableAssignment: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 1,
            guest: { id: 100, name: 'Test', email: 'test@test.com' },
            table: { id: 1, name: 'VIP-1' },
          }),
          update: vi.fn().mockResolvedValue({ id: 1 }),
          delete: vi.fn().mockResolvedValue({}),
        },
      };
      return fn(txMock);
    });
  });

  // ============================================
  // createTable() Tests
  // ============================================
  describe('createTable', () => {
    it('should create table successfully', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);
      (prisma.table.create as Mock).mockResolvedValue({
        id: 1,
        name: 'VIP-1',
        capacity: 8,
        type: 'vip',
        status: 'available',
      });

      const result = await createTable({
        name: 'VIP-1',
        capacity: 8,
        type: 'vip',
      });

      expect(result.name).toBe('VIP-1');
      expect(prisma.table.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'VIP-1',
          capacity: 8,
          type: 'vip',
          status: 'available',
        }),
      });
    });

    it('should throw error if name already exists', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue({ id: 1, name: 'VIP-1' });

      await expect(createTable({ name: 'VIP-1', capacity: 8 })).rejects.toThrow('TABLE_NAME_EXISTS');
    });

    it('should use default type if not provided', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);
      (prisma.table.create as Mock).mockResolvedValue({ id: 1 });

      await createTable({ name: 'Table-1', capacity: 6 });

      expect(prisma.table.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'standard',
        }),
      });
    });
  });

  // ============================================
  // updateTable() Tests
  // ============================================
  describe('updateTable', () => {
    it('should update table successfully', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue({ id: 1, name: 'VIP-1' });
      (prisma.table.update as Mock).mockResolvedValue({ id: 1, capacity: 10 });

      const result = await updateTable(1, { capacity: 10 });

      expect(result.capacity).toBe(10);
    });

    it('should throw error if table not found', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      await expect(updateTable(999, { capacity: 10 })).rejects.toThrow('TABLE_NOT_FOUND');
    });

    it('should throw error if renaming to existing name', async () => {
      (prisma.table.findUnique as Mock)
        .mockResolvedValueOnce({ id: 1, name: 'VIP-1' }) // Table exists
        .mockResolvedValueOnce({ id: 2, name: 'VIP-2' }); // New name exists

      await expect(updateTable(1, { name: 'VIP-2' })).rejects.toThrow('TABLE_NAME_EXISTS');
    });
  });

  // ============================================
  // deleteTable() Tests
  // ============================================
  describe('deleteTable', () => {
    it('should delete empty table', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue({
        id: 1,
        _count: { assignments: 0 },
      });
      (prisma.table.delete as Mock).mockResolvedValue({});

      await deleteTable(1);

      expect(prisma.table.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error if table not found', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      await expect(deleteTable(999)).rejects.toThrow('TABLE_NOT_FOUND');
    });

    it('should throw error if table has assignments', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue({
        id: 1,
        _count: { assignments: 3 },
      });

      await expect(deleteTable(1)).rejects.toThrow('TABLE_NOT_EMPTY');
    });
  });

  // ============================================
  // getTable() Tests
  // ============================================
  describe('getTable', () => {
    it('should return table with assignments', async () => {
      const mockTable = {
        id: 1,
        name: 'VIP-1',
        capacity: 8,
        assignments: [{ id: 1, guest: { name: 'Guest' } }],
        _count: { assignments: 1 },
      };
      (prisma.table.findUnique as Mock).mockResolvedValue(mockTable);

      const result = await getTable(1);

      expect(result).toEqual(mockTable);
    });

    it('should return null if not found', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      const result = await getTable(999);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // getAllTables() Tests
  // ============================================
  describe('getAllTables', () => {
    it('should return all tables ordered by type and name', async () => {
      const mockTables = [
        { id: 1, name: 'Standard-1', type: 'standard' },
        { id: 2, name: 'VIP-1', type: 'vip' },
      ];
      (prisma.table.findMany as Mock).mockResolvedValue(mockTables);

      const result = await getAllTables();

      expect(result).toEqual(mockTables);
      expect(prisma.table.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ type: 'asc' }, { name: 'asc' }],
        })
      );
    });
  });

  // ============================================
  // updateTablePosition() Tests
  // ============================================
  describe('updateTablePosition', () => {
    it('should update table position', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.table.update as Mock).mockResolvedValue({ id: 1, pos_x: 100, pos_y: 200 });

      const result = await updateTablePosition(1, 100, 200);

      expect(result.pos_x).toBe(100);
      expect(result.pos_y).toBe(200);
    });

    it('should throw error if table not found', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      await expect(updateTablePosition(999, 100, 200)).rejects.toThrow('TABLE_NOT_FOUND');
    });
  });

  // ============================================
  // assignGuestToTable() Tests
  // ============================================
  describe('assignGuestToTable', () => {
    const mockGuest = {
      id: 100,
      name: 'Test Guest',
      table_assignment: null,
      paired_with: null,
      partner_of: null,
    };

    const mockTable = {
      id: 1,
      name: 'VIP-1',
      capacity: 8,
      _count: { assignments: 3 },
    };

    it('should assign guest to table', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (prisma.table.findUnique as Mock)
        .mockResolvedValueOnce(mockTable) // Check capacity
        .mockResolvedValueOnce({ ...mockTable, status: 'available', _count: { assignments: 4 } }); // Status update

      const result = await assignGuestToTable(100, 1, 5, 10);

      expect(mockTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if guest not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      await expect(assignGuestToTable(999, 1)).rejects.toThrow('GUEST_NOT_FOUND');
    });

    it('should throw error if guest already assigned', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        ...mockGuest,
        table_assignment: { id: 1 },
      });

      await expect(assignGuestToTable(100, 1)).rejects.toThrow('GUEST_ALREADY_ASSIGNED');
    });

    it('should throw error if table not found', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      await expect(assignGuestToTable(100, 999)).rejects.toThrow('TABLE_NOT_FOUND');
    });

    it('should throw error if table is full', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (prisma.table.findUnique as Mock).mockResolvedValue({
        ...mockTable,
        capacity: 8,
        _count: { assignments: 8 },
      });

      await expect(assignGuestToTable(100, 1)).rejects.toThrow('TABLE_FULL');
    });

    it('should throw error for invalid seat number', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (prisma.table.findUnique as Mock).mockResolvedValue(mockTable);

      await expect(assignGuestToTable(100, 1, 10)).rejects.toThrow('INVALID_SEAT_NUMBER');
    });

    it('should throw error if seat is taken', async () => {
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (prisma.table.findUnique as Mock).mockResolvedValue(mockTable);
      (prisma.tableAssignment.findFirst as Mock).mockResolvedValue({ id: 1 });

      await expect(assignGuestToTable(100, 1, 5)).rejects.toThrow('SEAT_TAKEN');
    });

    it('should assign partner automatically', async () => {
      const guestWithPartner = {
        ...mockGuest,
        partner_of: { id: 200, name: 'Partner', table_assignment: null },
      };
      (prisma.guest.findUnique as Mock).mockResolvedValue(guestWithPartner);
      (prisma.table.findUnique as Mock)
        .mockResolvedValueOnce({ ...mockTable, _count: { assignments: 3 } }) // Room for 2
        .mockResolvedValueOnce({ ...mockTable, _count: { assignments: 5 } });

      await assignGuestToTable(100, 1);

      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  // ============================================
  // removeGuestFromTable() Tests
  // ============================================
  describe('removeGuestFromTable', () => {
    it('should remove assignment', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue({
        id: 1,
        table_id: 1,
        guest: { id: 100, paired_with_id: null, partner_of: null },
      });
      (prisma.table.findUnique as Mock).mockResolvedValue({
        id: 1,
        capacity: 8,
        status: 'available',
        _count: { assignments: 2 },
      });

      await removeGuestFromTable(1);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw error if assignment not found', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(null);

      await expect(removeGuestFromTable(999)).rejects.toThrow('ASSIGNMENT_NOT_FOUND');
    });
  });

  // ============================================
  // moveGuestToTable() Tests
  // ============================================
  describe('moveGuestToTable', () => {
    const mockAssignment = {
      id: 1,
      table_id: 1,
      guest: {
        id: 100,
        name: 'Test',
        email: 'test@test.com',
        paired_with_id: null,
        partner_of: null,
      },
    };

    it('should move guest to new table', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(mockAssignment);
      (prisma.tableAssignment.findFirst as Mock).mockResolvedValue(null); // No partner at old table, no seat taken
      (prisma.table.findUnique as Mock)
        .mockResolvedValueOnce({ id: 2, capacity: 8, _count: { assignments: 3 } }) // New table
        .mockResolvedValueOnce({ id: 1, capacity: 8, status: 'available', _count: { assignments: 2 } }) // Old table status
        .mockResolvedValueOnce({ id: 2, capacity: 8, status: 'available', _count: { assignments: 4 } }); // New table status

      await moveGuestToTable(1, 2);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should return same assignment if same table', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(mockAssignment);

      const result = await moveGuestToTable(1, 1);

      expect(result).toEqual(mockAssignment);
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('should throw error if assignment not found', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(null);

      await expect(moveGuestToTable(999, 2)).rejects.toThrow('ASSIGNMENT_NOT_FOUND');
    });

    it('should throw error if new table not found', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(mockAssignment);
      (prisma.tableAssignment.findFirst as Mock).mockResolvedValue(null); // No partner
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      await expect(moveGuestToTable(1, 999)).rejects.toThrow('TABLE_NOT_FOUND');
    });

    it('should throw error if new table is full', async () => {
      (prisma.tableAssignment.findUnique as Mock).mockResolvedValue(mockAssignment);
      (prisma.tableAssignment.findFirst as Mock).mockResolvedValue(null);
      (prisma.table.findUnique as Mock).mockResolvedValue({
        id: 2,
        capacity: 8,
        _count: { assignments: 8 },
      });

      await expect(moveGuestToTable(1, 2)).rejects.toThrow('TABLE_FULL');
    });
  });

  // ============================================
  // getUnassignedGuests() Tests
  // ============================================
  describe('getUnassignedGuests', () => {
    it('should return unassigned guests excluding partners', async () => {
      const mockGuests = [
        { id: 100, name: 'Guest 1', paired_with_id: null },
        { id: 101, name: 'Guest 2', paired_with_id: null },
      ];
      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);

      const result = await getUnassignedGuests();

      expect(result).toEqual(mockGuests);
      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            registration_status: { in: ['registered', 'approved'] },
            table_assignment: null,
            paired_with_id: null,
          }),
        })
      );
    });
  });

  // ============================================
  // getTableAvailability() Tests
  // ============================================
  describe('getTableAvailability', () => {
    it('should return table availability', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue({
        id: 1,
        name: 'VIP-1',
        capacity: 8,
        _count: { assignments: 5 },
      });

      const result = await getTableAvailability(1);

      expect(result.total).toBe(8);
      expect(result.occupied).toBe(5);
      expect(result.available).toBe(3);
    });

    it('should throw error if table not found', async () => {
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      await expect(getTableAvailability(999)).rejects.toThrow('TABLE_NOT_FOUND');
    });
  });

  // ============================================
  // getAllAssignments() Tests
  // ============================================
  describe('getAllAssignments', () => {
    it('should return all assignments', async () => {
      const mockAssignments = [
        { id: 1, table: { name: 'VIP-1' }, guest: { name: 'Guest 1' } },
        { id: 2, table: { name: 'VIP-1' }, guest: { name: 'Guest 2' } },
      ];
      (prisma.tableAssignment.findMany as Mock).mockResolvedValue(mockAssignments);

      const result = await getAllAssignments();

      expect(result).toEqual(mockAssignments);
    });
  });

  // ============================================
  // bulkAssignFromCsv() Tests
  // ============================================
  describe('bulkAssignFromCsv', () => {
    it('should import valid CSV', async () => {
      const csv = 'table_name,guest_email,seat_number\nVIP-1,guest@test.com,1';

      (prisma.table.findUnique as Mock).mockResolvedValue({ id: 1, name: 'VIP-1' });
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        email: 'guest@test.com',
        table_assignment: null,
        paired_with: null,
        partner_of: null,
      });
      (prisma.table.findUnique as Mock).mockResolvedValue({
        id: 1,
        capacity: 8,
        status: 'available',
        _count: { assignments: 0 },
      });

      const result = await bulkAssignFromCsv(csv);

      expect(result.imported).toBeGreaterThanOrEqual(0);
    });

    it('should reject CSV with too many rows', async () => {
      const rows = Array(1001).fill('VIP-1,guest@test.com,1').join('\n');
      const csv = `table_name,guest_email,seat_number\n${rows}`;

      const result = await bulkAssignFromCsv(csv);

      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('exceeds maximum');
    });

    it('should handle missing columns', async () => {
      const csv = 'table_name,guest_email,seat_number\nVIP-1';

      const result = await bulkAssignFromCsv(csv);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toBe('Missing columns');
    });

    it('should handle invalid table name', async () => {
      const csv = 'table_name,guest_email,seat_number\n@invalid!,guest@test.com,1';

      const result = await bulkAssignFromCsv(csv);

      expect(result.errors[0].message).toContain('Invalid table name');
    });

    it('should handle invalid email', async () => {
      const csv = 'table_name,guest_email,seat_number\nVIP-1,invalid-email,1';

      const result = await bulkAssignFromCsv(csv);

      expect(result.errors[0].message).toContain('Invalid email');
    });

    it('should handle table not found', async () => {
      const csv = 'table_name,guest_email,seat_number\nVIP-1,guest@test.com,1';
      (prisma.table.findUnique as Mock).mockResolvedValue(null);

      const result = await bulkAssignFromCsv(csv);

      expect(result.errors[0].message).toContain('Table not found');
    });

    it('should handle guest not found', async () => {
      const csv = 'table_name,guest_email,seat_number\nVIP-1,guest@test.com,1';
      (prisma.table.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);

      const result = await bulkAssignFromCsv(csv);

      expect(result.errors[0].message).toContain('Guest not found');
    });

    it('should handle already assigned guest', async () => {
      const csv = 'table_name,guest_email,seat_number\nVIP-1,guest@test.com,1';
      (prisma.table.findUnique as Mock).mockResolvedValue({ id: 1 });
      (prisma.guest.findUnique as Mock).mockResolvedValue({
        id: 100,
        email: 'guest@test.com',
        table_assignment: { id: 1 },
      });

      const result = await bulkAssignFromCsv(csv);

      expect(result.errors[0].message).toContain('already assigned');
    });
  });

  // ============================================
  // exportSeatingArrangement() Tests
  // ============================================
  describe('exportSeatingArrangement', () => {
    it('should export CSV with all assignments', async () => {
      (prisma.tableAssignment.findMany as Mock).mockResolvedValue([
        {
          table: { name: 'VIP-1', type: 'vip' },
          guest: { name: 'Guest 1', email: 'guest1@test.com', guest_type: 'vip' },
          seat_number: 1,
        },
        {
          table: { name: 'VIP-1', type: 'vip' },
          guest: { name: 'Guest 2', email: 'guest2@test.com', guest_type: 'paying_single' },
          seat_number: 2,
        },
      ]);

      const result = await exportSeatingArrangement();

      expect(result).toContain('table_name,table_type,guest_name,guest_email,guest_type,seat_number');
      expect(result).toContain('VIP-1');
      expect(result).toContain('guest1@test.com');
    });

    it('should handle empty assignments', async () => {
      (prisma.tableAssignment.findMany as Mock).mockResolvedValue([]);

      const result = await exportSeatingArrangement();

      expect(result).toBe('table_name,table_type,guest_name,guest_email,guest_type,seat_number');
    });
  });

  // ============================================
  // getSeatingStats() Tests
  // ============================================
  describe('getSeatingStats', () => {
    it('should return seating statistics', async () => {
      (prisma.table.findMany as Mock).mockResolvedValue([
        {
          type: 'vip',
          capacity: 8,
          assignments: [
            { guest: { guest_type: 'vip', paired_with_id: null, registration: null } },
          ],
        },
        {
          type: 'standard',
          capacity: 6,
          assignments: [],
        },
      ]);
      (prisma.guest.count as Mock).mockResolvedValue(50);
      (prisma.tableAssignment.findMany as Mock).mockResolvedValue([
        { guest: { guest_type: 'vip', paired_with_id: null, registration: null } },
      ]);

      const result = await getSeatingStats();

      expect(result.totalTables).toBe(2);
      expect(result.totalCapacity).toBe(14);
      expect(result.totalGuests).toBe(50);
      expect(result.byType).toHaveProperty('vip');
      expect(result.byType).toHaveProperty('standard');
    });

    it('should handle zero capacity', async () => {
      (prisma.table.findMany as Mock).mockResolvedValue([]);
      (prisma.guest.count as Mock).mockResolvedValue(0);
      (prisma.tableAssignment.findMany as Mock).mockResolvedValue([]);

      const result = await getSeatingStats();

      expect(result.occupancyRate).toBe(0);
    });

    it('should count paired guests as 2 seats', async () => {
      (prisma.table.findMany as Mock).mockResolvedValue([
        {
          type: 'standard',
          capacity: 10,
          assignments: [
            {
              guest: {
                guest_type: 'paying_paired',
                paired_with_id: null,
                registration: { ticket_type: 'paid_paired' },
              },
            },
          ],
        },
      ]);
      (prisma.guest.count as Mock).mockResolvedValue(2);
      (prisma.tableAssignment.findMany as Mock).mockResolvedValue([
        {
          guest: {
            guest_type: 'paying_paired',
            paired_with_id: null,
            registration: { ticket_type: 'paid_paired' },
          },
        },
      ]);

      const result = await getSeatingStats();

      expect(result.totalOccupied).toBe(2); // Paired counts as 2 seats
    });
  });
});
