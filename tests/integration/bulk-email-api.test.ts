/**
 * Bulk Email API Integration Tests
 *
 * Tests for: POST /api/admin/scheduled-emails/bulk
 *
 * Coverage:
 * - Filter-based scheduling (guest_types, registration_statuses)
 * - Specific guest_ids scheduling
 * - MAX_BULK_RECIPIENTS limit (1000)
 * - Deduplication of existing pending emails
 * - Validation (template_slug, scheduled_for)
 * - Authorization (admin role required)
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Next.js request/response - must be defined inline for hoisting
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

// Mock auth - admin by default (inline for hoisting)
vi.mock('@/lib/api', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    success: true,
    session: { user: { id: 1, email: 'admin@test.com', role: 'admin' } },
  }),
  validateBody: vi.fn().mockImplementation(async (req, schema) => {
    const body = await req.json();
    try {
      const data = schema.parse(body);
      return { success: true, data };
    } catch {
      return {
        success: false,
        response: { data: { error: 'Validation failed' }, status: 400 },
      };
    }
  }),
}));

// Helper to create mock request
const mockRequest = (body: unknown, headers: Record<string, string> = {}) => ({
  json: vi.fn().mockResolvedValue(body),
  headers: new Map(Object.entries(headers)),
});

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    guest: {
      findMany: vi.fn(),
    },
    scheduledEmail: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock email scheduler
vi.mock('@/lib/services/email-scheduler', () => ({
  scheduleEmail: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

// Mock email templates
vi.mock('@/lib/services/email-templates', () => ({
  DEFAULT_TEMPLATES: {
    magic_link: {},
    ticket_delivery: {},
    payment_reminder: {},
    event_reminder: {},
  },
}));

import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { scheduleEmail } from '@/lib/services/email-scheduler';

describe('Bulk Email API', () => {
  // Helper to create future date
  const futureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth to admin
    (requireAuth as Mock).mockResolvedValue({
      success: true,
      session: { user: { id: 1, email: 'admin@test.com', role: 'admin' } },
    });
  });

  describe('Authorization', () => {
    it('should require authentication', async () => {
      (requireAuth as Mock).mockResolvedValue({
        success: false,
        response: { data: { error: 'Unauthorized' }, status: 401 },
      });

      // Import dynamically to use fresh mocks
      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(401);
    });

    it('should require admin role (reject staff)', async () => {
      (requireAuth as Mock).mockResolvedValue({
        success: true,
        session: { user: { id: 2, email: 'staff@test.com', role: 'staff' } },
      });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid guest_types enum values', async () => {
      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['invalid_type'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(400);
    });

    it('should reject invalid template_slug', async () => {
      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'nonexistent_template',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(400);
    });

    it('should reject past scheduled_for date', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([{ id: 1, name: 'Test', email: 'test@test.com' }]);

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: pastDate.toISOString(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('future');
    });

    it('should require either filter or guest_ids', async () => {
      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
        // No filter or guest_ids
      });

      const result = await POST(request as any);

      expect(result.status).toBe(400);
    });
  });

  describe('Filter-based Scheduling', () => {
    it('should schedule emails for filtered guest types', async () => {
      const mockGuests = [
        { id: 1, name: 'VIP 1', email: 'vip1@test.com' },
        { id: 2, name: 'VIP 2', email: 'vip2@test.com' },
      ];

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]); // No existing
      (scheduleEmail as Mock).mockResolvedValue({ success: true, id: 1 });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(200);
      expect(result.data.scheduled).toBe(2);
      expect(scheduleEmail).toHaveBeenCalledTimes(2);
    });

    it('should filter by registration_statuses', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([
        { id: 1, name: 'Registered', email: 'reg@test.com' },
      ]);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (scheduleEmail as Mock).mockResolvedValue({ success: true, id: 1 });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { registration_statuses: ['registered', 'approved'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      await POST(request as any);

      expect(prisma.guest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            registration_status: { in: ['registered', 'approved'] },
          }),
        })
      );
    });
  });

  describe('Guest ID Scheduling', () => {
    it('should schedule for specific guest_ids', async () => {
      const mockGuests = [
        { id: 1, name: 'Guest 1', email: 'g1@test.com' },
        { id: 2, name: 'Guest 2', email: 'g2@test.com' },
      ];

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (scheduleEmail as Mock).mockResolvedValue({ success: true, id: 1 });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        guest_ids: [1, 2],
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(200);
      expect(result.data.scheduled).toBe(2);
    });
  });

  describe('Recipient Limits', () => {
    it('should enforce MAX_BULK_RECIPIENTS limit (1000)', async () => {
      // Create 1001 mock guests
      const mockGuests = Array.from({ length: 1001 }, (_, i) => ({
        id: i + 1,
        name: `Guest ${i + 1}`,
        email: `g${i + 1}@test.com`,
      }));

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('1000');
    });

    it('should return error when no guests match filter', async () => {
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('No guests');
    });
  });

  describe('Deduplication', () => {
    it('should skip guests with existing pending emails for same template', async () => {
      const mockGuests = [
        { id: 1, name: 'Guest 1', email: 'g1@test.com' },
        { id: 2, name: 'Guest 2', email: 'g2@test.com' },
        { id: 3, name: 'Guest 3', email: 'g3@test.com' },
      ];

      // Guest 1 and 2 already have pending emails
      const existingEmails = [
        { guest_id: 1 },
        { guest_id: 2 },
      ];

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue(existingEmails);
      (scheduleEmail as Mock).mockResolvedValue({ success: true, id: 1 });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.status).toBe(200);
      expect(result.data.scheduled).toBe(1); // Only guest 3
      expect(result.data.skipped).toBe(2); // Guests 1 and 2
      expect(scheduleEmail).toHaveBeenCalledTimes(1);
    });

    it('should report skipped count in response', async () => {
      const mockGuests = [{ id: 1, name: 'Guest 1', email: 'g1@test.com' }];
      const existingEmails = [{ guest_id: 1 }];

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue(existingEmails);

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.data.total_guests).toBe(1);
      expect(result.data.skipped).toBe(1);
      expect(result.data.scheduled).toBe(0);
    });
  });

  describe('Variable Handling', () => {
    it('should include guestName in variables', async () => {
      const mockGuests = [{ id: 1, name: 'Test Guest', email: 'test@test.com' }];

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (scheduleEmail as Mock).mockResolvedValue({ success: true, id: 1 });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
        variables: { customField: 'value' },
      });

      await POST(request as any);

      expect(scheduleEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            guestName: 'Test Guest',
            customField: 'value',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should report failed scheduled emails', async () => {
      const mockGuests = [
        { id: 1, name: 'Guest 1', email: 'g1@test.com' },
        { id: 2, name: 'Guest 2', email: 'g2@test.com' },
      ];

      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (scheduleEmail as Mock)
        .mockResolvedValueOnce({ success: true, id: 1 })
        .mockResolvedValueOnce({ success: false, error: 'DB error' });

      const { POST } = await import('@/app/api/admin/scheduled-emails/bulk/route');

      const request = mockRequest({
        filter: { guest_types: ['vip'] },
        template_slug: 'event_reminder',
        scheduled_for: futureDate(),
      });

      const result = await POST(request as any);

      expect(result.data.scheduled).toBe(1);
      expect(result.data.failed).toBe(1);
    });
  });
});
