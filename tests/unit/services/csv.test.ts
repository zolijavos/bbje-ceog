/**
 * CSV Service Unit Tests
 *
 * Tests for: lib/services/csv.ts
 *
 * Coverage targets:
 * - parseCSV() - Parse CSV content
 * - validateCSVRow() - Validate individual rows
 * - checkDuplicateEmails() - Check DB duplicates
 * - findCSVDuplicates() - Find duplicates in CSV
 * - importGuestsFromCSV() - Full import flow
 * - bulkInsertGuests() - Bulk database insert
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    guest: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db/prisma';
import {
  parseCSV,
  validateCSVRow,
  checkDuplicateEmails,
  findCSVDuplicates,
  importGuestsFromCSV,
  bulkInsertGuests,
  type CSVRow,
} from '@/lib/services/csv';

describe('CSV Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // parseCSV() Tests
  // ============================================
  describe('parseCSV', () => {
    it('should parse valid CSV content', () => {
      const csvContent = `email,name,guest_type
john@example.com,John Doe,vip
jane@example.com,Jane Smith,paying_single`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.rows[0]).toEqual({
        email: 'john@example.com',
        name: 'John Doe',
        guest_type: 'vip',
        phone: undefined,
        company: undefined,
        position: undefined,
      });
    });

    it('should handle semicolon delimiter', () => {
      const csvContent = `email;name;guest_type
john@example.com;John Doe;vip`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe('john@example.com');
    });

    it('should handle tab delimiter', () => {
      const csvContent = `email\tname\tguest_type
john@example.com\tJohn Doe\tvip`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('John Doe');
    });

    it('should normalize header names to lowercase', () => {
      const csvContent = `EMAIL,Name,GUEST_TYPE
john@example.com,John Doe,vip`;

      const result = parseCSV(csvContent);

      expect(result.rows[0].email).toBe('john@example.com');
    });

    it('should handle alternative column names', () => {
      const csvContent = `e-mail,name,type,telephone,organization,beosztás
john@example.com,John Doe,vip,+36 1 234 5678,Test Corp,CEO`;

      const result = parseCSV(csvContent);

      expect(result.rows[0]).toEqual({
        email: 'john@example.com',
        name: 'John Doe',
        guest_type: 'vip',
        phone: '+36 1 234 5678',
        company: 'Test Corp',
        position: 'CEO',
      });
    });

    it('should skip empty lines', () => {
      const csvContent = `email,name,guest_type
john@example.com,John Doe,vip

jane@example.com,Jane Smith,paying_single

`;

      const result = parseCSV(csvContent);

      expect(result.rows).toHaveLength(2);
    });

    it('should handle optional fields', () => {
      const csvContent = `email,name,guest_type,phone,company,position
john@example.com,John Doe,vip,+36 1 234 5678,Test Corp,CEO`;

      const result = parseCSV(csvContent);

      expect(result.rows[0].phone).toBe('+36 1 234 5678');
      expect(result.rows[0].company).toBe('Test Corp');
      expect(result.rows[0].position).toBe('CEO');
    });

    it('should handle missing optional fields', () => {
      const csvContent = `email,name,guest_type
john@example.com,John Doe,vip`;

      const result = parseCSV(csvContent);

      expect(result.rows[0].phone).toBeUndefined();
      expect(result.rows[0].company).toBeUndefined();
    });
  });

  // ============================================
  // validateCSVRow() Tests
  // ============================================
  describe('validateCSVRow', () => {
    it('should validate valid row', () => {
      const row: CSVRow = {
        email: 'john@example.com',
        name: 'John Doe',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const row: CSVRow = {
        email: 'invalid-email',
        name: 'John Doe',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('email');
      expect(result.errors[0].row).toBe(2);
    });

    it('should reject empty email', () => {
      const row: CSVRow = {
        email: '',
        name: 'John Doe',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(false);
    });

    it('should reject name too short', () => {
      const row: CSVRow = {
        email: 'john@example.com',
        name: 'J',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('2 characters');
    });

    it('should reject invalid guest type', () => {
      const row: CSVRow = {
        email: 'john@example.com',
        name: 'John Doe',
        guest_type: 'invalid_type',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Invalid guest type');
    });

    it('should accept all valid guest types', () => {
      const types = ['vip', 'paying_single', 'paying_paired'];

      types.forEach((guest_type) => {
        const row: CSVRow = {
          email: 'john@example.com',
          name: 'John Doe',
          guest_type,
        };
        const result = validateCSVRow(row, 2);
        expect(result.valid).toBe(true);
      });
    });

    it('should trim whitespace from name', () => {
      // Note: Email validation happens before trim, so whitespace in email fails validation
      const row: CSVRow = {
        email: 'john@example.com',
        name: '  John Doe  ',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(true);
      expect(result.data?.name).toBe('John Doe');
    });

    it('should lowercase and trim email', () => {
      const row: CSVRow = {
        email: 'JOHN@EXAMPLE.COM',
        name: 'John Doe',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.valid).toBe(true);
      expect(result.data?.email).toBe('john@example.com');
    });

    it('should include email in error if available', () => {
      const row: CSVRow = {
        email: 'john@example.com',
        name: 'J',
        guest_type: 'vip',
      };

      const result = validateCSVRow(row, 2);

      expect(result.errors[0].email).toBe('john@example.com');
    });
  });

  // ============================================
  // checkDuplicateEmails() Tests
  // ============================================
  describe('checkDuplicateEmails', () => {
    it('should return set of existing emails', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([
        { email: 'john@example.com' },
        { email: 'jane@example.com' },
      ]);

      const result = await checkDuplicateEmails([
        'john@example.com',
        'jane@example.com',
        'new@example.com',
      ]);

      expect(result.has('john@example.com')).toBe(true);
      expect(result.has('jane@example.com')).toBe(true);
      expect(result.has('new@example.com')).toBe(false);
    });

    it('should return empty set when no duplicates', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      const result = await checkDuplicateEmails(['new@example.com']);

      expect(result.size).toBe(0);
    });

    it('should lowercase emails for comparison', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([
        { email: 'JOHN@EXAMPLE.COM' },
      ]);

      const result = await checkDuplicateEmails(['john@example.com']);

      expect(result.has('john@example.com')).toBe(true);
    });
  });

  // ============================================
  // findCSVDuplicates() Tests
  // ============================================
  describe('findCSVDuplicates', () => {
    it('should find duplicate emails in CSV', () => {
      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John 1', guest_type: 'vip' },
        { email: 'jane@example.com', name: 'Jane', guest_type: 'vip' },
        { email: 'john@example.com', name: 'John 2', guest_type: 'paying_single' },
      ];

      const result = findCSVDuplicates(rows);

      expect(result.has('john@example.com')).toBe(true);
      expect(result.has('jane@example.com')).toBe(false);
    });

    it('should return empty set when no duplicates', () => {
      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John', guest_type: 'vip' },
        { email: 'jane@example.com', name: 'Jane', guest_type: 'vip' },
      ];

      const result = findCSVDuplicates(rows);

      expect(result.size).toBe(0);
    });

    it('should be case insensitive', () => {
      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John 1', guest_type: 'vip' },
        { email: 'JOHN@EXAMPLE.COM', name: 'John 2', guest_type: 'vip' },
      ];

      const result = findCSVDuplicates(rows);

      expect(result.has('john@example.com')).toBe(true);
    });

    it('should handle multiple duplicates', () => {
      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John 1', guest_type: 'vip' },
        { email: 'john@example.com', name: 'John 2', guest_type: 'vip' },
        { email: 'john@example.com', name: 'John 3', guest_type: 'vip' },
      ];

      const result = findCSVDuplicates(rows);

      expect(result.size).toBe(1);
      expect(result.has('john@example.com')).toBe(true);
    });
  });

  // ============================================
  // importGuestsFromCSV() Tests
  // ============================================
  describe('importGuestsFromCSV', () => {
    beforeEach(() => {
      (prisma.guest.findMany as Mock).mockResolvedValue([]);
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 0 });
    });

    it('should import valid CSV successfully', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 2 });

      const csvContent = `email,name,guest_type
john@example.com,John Doe,vip
jane@example.com,Jane Smith,paying_single`;

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(2);
      expect(result.total).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject CSV exceeding max rows', async () => {
      // Generate CSV with 10001 rows (exceeds MAX_ROWS = 10000)
      let csvContent = 'email,name,guest_type\n';
      for (let i = 0; i < 10001; i++) {
        csvContent += `user${i}@example.com,User ${i},vip\n`;
      }

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors[0].message).toContain('Maximum 10000 rows');
    });

    it('should report validation errors', async () => {
      const csvContent = `email,name,guest_type
invalid-email,John Doe,vip
jane@example.com,J,paying_single
bob@example.com,Bob,invalid_type`;

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should skip DB duplicates and report errors', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([
        { email: 'existing@example.com' },
      ]);
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const csvContent = `email,name,guest_type
existing@example.com,Existing Guest,vip
new@example.com,New Guest,vip`;

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.errors.some((e) => e.message.includes('already exists'))).toBe(true);
    });

    it('should skip CSV duplicates and keep first occurrence', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const csvContent = `email,name,guest_type
john@example.com,John First,vip
john@example.com,John Second,paying_single
jane@example.com,Jane,vip`;

      const result = await importGuestsFromCSV(csvContent);

      // Should report duplicate error for second John
      expect(result.errors.some((e) => e.message.includes('Duplicate email in CSV'))).toBe(true);
    });

    it('should handle empty CSV', async () => {
      const csvContent = `email,name,guest_type`;

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should handle database errors', async () => {
      (prisma.guest.createMany as Mock).mockRejectedValue(new Error('DB connection failed'));

      const csvContent = `email,name,guest_type
john@example.com,John Doe,vip`;

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Database error'))).toBe(true);
    });

    it('should return success with errors for partial import', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([
        { email: 'existing@example.com' },
      ]);
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const csvContent = `email,name,guest_type
existing@example.com,Existing,vip
new@example.com,New Guest,vip`;

      const result = await importGuestsFromCSV(csvContent);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  // ============================================
  // bulkInsertGuests() Tests
  // ============================================
  describe('bulkInsertGuests', () => {
    it('should bulk insert guests', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 3 });

      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John Doe', guest_type: 'vip' },
        { email: 'jane@example.com', name: 'Jane Smith', guest_type: 'paying_single' },
        { email: 'bob@example.com', name: 'Bob Brown', guest_type: 'paying_paired' },
      ];

      const result = await bulkInsertGuests(rows);

      expect(result).toBe(3);
      expect(prisma.guest.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            email: 'john@example.com',
            name: 'John Doe',
            guest_type: 'vip',
            registration_status: 'pending',
          }),
        ]),
        skipDuplicates: false,
      });
    });

    it('should set registration_status to pending (not yet invited)', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John Doe', guest_type: 'vip' },
      ];

      await bulkInsertGuests(rows);

      const callArg = (prisma.guest.createMany as Mock).mock.calls[0][0];
      expect(callArg.data[0].registration_status).toBe('pending');
    });

    it('should handle optional fields', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const rows: CSVRow[] = [
        {
          email: 'john@example.com',
          name: 'John Doe',
          guest_type: 'vip',
          phone: '+36 1 234 5678',
          company: 'Test Corp',
          position: 'CEO',
        },
      ];

      await bulkInsertGuests(rows);

      const callArg = (prisma.guest.createMany as Mock).mock.calls[0][0];
      expect(callArg.data[0].phone).toBe('+36 1 234 5678');
      expect(callArg.data[0].company).toBe('Test Corp');
      expect(callArg.data[0].position).toBe('CEO');
    });

    it('should set null for missing optional fields', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const rows: CSVRow[] = [
        { email: 'john@example.com', name: 'John Doe', guest_type: 'vip' },
      ];

      await bulkInsertGuests(rows);

      const callArg = (prisma.guest.createMany as Mock).mock.calls[0][0];
      expect(callArg.data[0].phone).toBeNull();
      expect(callArg.data[0].company).toBeNull();
      expect(callArg.data[0].position).toBeNull();
    });

    it('should trim and lowercase email', async () => {
      (prisma.guest.createMany as Mock).mockResolvedValue({ count: 1 });

      const rows: CSVRow[] = [
        { email: '  JOHN@EXAMPLE.COM  ', name: '  John Doe  ', guest_type: 'vip' },
      ];

      await bulkInsertGuests(rows);

      const callArg = (prisma.guest.createMany as Mock).mock.calls[0][0];
      expect(callArg.data[0].email).toBe('john@example.com');
      expect(callArg.data[0].name).toBe('John Doe');
    });
  });
});
