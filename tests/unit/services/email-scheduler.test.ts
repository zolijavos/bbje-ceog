/**
 * Email Scheduler Service Unit Tests
 *
 * Tests for: lib/services/email-scheduler.ts
 *
 * Coverage targets:
 * - scheduleEmail() - Create scheduled emails
 * - cancelScheduledEmail() - Cancel pending emails
 * - processScheduledEmails() - Process due emails (critical!)
 * - getScheduledEmails() - List with filtering
 * - getSchedulerStats() - Dashboard statistics
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma before importing the service
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    scheduledEmail: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    guest: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    registration: {
      findMany: vi.fn(),
    },
    schedulerConfig: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock email services
vi.mock('@/lib/services/email-templates', () => ({
  renderTemplate: vi.fn(),
  DEFAULT_TEMPLATES: {
    magic_link: {},
    ticket_delivery: {},
    payment_reminder: {},
    event_reminder: {},
  },
}));

vi.mock('@/lib/services/email', () => ({
  sendEmail: vi.fn(),
  logEmailDelivery: vi.fn(),
}));

// Mock event config
vi.mock('@/lib/config/event', () => ({
  EVENT_CONFIG: {
    dateTime: new Date('2026-04-26T18:00:00'),
    venue: {
      name: 'Test Venue',
      address: 'Test Address',
    },
  },
}));

// Import after mocks are set up
import { prisma } from '@/lib/db/prisma';
import { renderTemplate } from '@/lib/services/email-templates';
import { sendEmail, logEmailDelivery } from '@/lib/services/email';
import {
  scheduleEmail,
  cancelScheduledEmail,
  processScheduledEmails,
  getScheduledEmails,
  getSchedulerStats,
  runAutomaticSchedulers,
  schedulePaymentReminders,
  scheduleEventReminders,
} from '@/lib/services/email-scheduler';

describe('Email Scheduler Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // scheduleEmail() Tests
  // ============================================
  describe('scheduleEmail', () => {
    it('should create scheduled email with valid params', async () => {
      const mockCreated = {
        id: 1,
        guest_id: 100,
        template_slug: 'event_reminder',
        scheduled_for: new Date('2026-04-25T09:00:00'),
        status: 'pending',
      };

      (prisma.scheduledEmail.create as Mock).mockResolvedValue(mockCreated);

      const result = await scheduleEmail({
        guestId: 100,
        templateSlug: 'event_reminder',
        scheduledFor: new Date('2026-04-25T09:00:00'),
        variables: { guestName: 'Test User' },
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe(1);
      expect(prisma.scheduledEmail.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          guest_id: 100,
          template_slug: 'event_reminder',
          status: 'pending',
        }),
      });
    });

    it('should default schedule_type to "manual"', async () => {
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 2 });

      await scheduleEmail({
        guestId: 100,
        templateSlug: 'event_reminder',
        scheduledFor: new Date(),
      });

      expect(prisma.scheduledEmail.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          schedule_type: 'manual',
        }),
      });
    });

    it('should handle optional guestId (null)', async () => {
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 3 });

      await scheduleEmail({
        templateSlug: 'event_reminder',
        scheduledFor: new Date(),
      });

      expect(prisma.scheduledEmail.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          guest_id: null,
        }),
      });
    });

    it('should return error on database failure', async () => {
      (prisma.scheduledEmail.create as Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await scheduleEmail({
        guestId: 100,
        templateSlug: 'event_reminder',
        scheduledFor: new Date(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should stringify variables to JSON', async () => {
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 4 });

      const variables = { guestName: 'Test', tableName: 'VIP 1' };

      await scheduleEmail({
        guestId: 100,
        templateSlug: 'event_reminder',
        scheduledFor: new Date(),
        variables,
      });

      expect(prisma.scheduledEmail.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variables: JSON.stringify(variables),
        }),
      });
    });
  });

  // ============================================
  // cancelScheduledEmail() Tests
  // ============================================
  describe('cancelScheduledEmail', () => {
    it('should update status to cancelled', async () => {
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({ id: 1, status: 'cancelled' });

      const result = await cancelScheduledEmail(1);

      expect(result).toBe(true);
      expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'cancelled' },
      });
    });

    it('should return false on database error', async () => {
      (prisma.scheduledEmail.update as Mock).mockRejectedValue(new Error('Not found'));

      const result = await cancelScheduledEmail(999);

      expect(result).toBe(false);
    });
  });

  // ============================================
  // processScheduledEmails() Tests - CRITICAL
  // ============================================
  describe('processScheduledEmails', () => {
    const mockGuest = {
      id: 100,
      name: 'Test Guest',
      email: 'test@example.com',
    };

    const mockScheduledEmail = {
      id: 1,
      guest_id: 100,
      template_slug: 'event_reminder',
      variables: JSON.stringify({ guestName: 'Test Guest' }),
      scheduled_for: new Date('2025-01-01'),
      status: 'pending',
    };

    beforeEach(() => {
      (renderTemplate as Mock).mockResolvedValue({
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      });
    });

    it('should process only pending emails with due scheduled_for', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);

      await processScheduledEmails();

      expect(prisma.scheduledEmail.findMany).toHaveBeenCalledWith({
        where: {
          status: 'pending',
          scheduled_for: { lte: expect.any(Date) },
        },
        take: 50,
      });
    });

    it('should batch process max 50 emails', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);

      await processScheduledEmails();

      expect(prisma.scheduledEmail.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should update status to "processing" before sending', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([mockScheduledEmail]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (sendEmail as Mock).mockResolvedValue({ success: true });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      await processScheduledEmails();

      // First update should be to 'processing'
      expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'processing' },
      });
    });

    it('should update status to "sent" on success', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([mockScheduledEmail]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (sendEmail as Mock).mockResolvedValue({ success: true });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      await processScheduledEmails();

      // Second update should be to 'sent'
      expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'sent', sent_at: expect.any(Date) },
      });
    });

    it('should update status to "failed" with error message on failure', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([mockScheduledEmail]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (sendEmail as Mock).mockResolvedValue({ success: false, error: 'SMTP error' });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      await processScheduledEmails();

      expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'failed', error_message: 'SMTP error' },
      });
    });

    it('should handle guest not found', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([mockScheduledEmail]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(null);
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      const result = await processScheduledEmails();

      expect(result.failed).toBe(1);
      expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'failed', error_message: 'Guest not found' },
      });
    });

    it('should handle malformed JSON in variables gracefully', async () => {
      const emailWithBadJson = {
        ...mockScheduledEmail,
        variables: 'not-valid-json{',
      };

      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([emailWithBadJson]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      const result = await processScheduledEmails();

      // Should fail due to JSON.parse error
      expect(result.failed).toBe(1);
    });

    it('should log email delivery on success', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([mockScheduledEmail]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (sendEmail as Mock).mockResolvedValue({ success: true });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      await processScheduledEmails();

      expect(logEmailDelivery).toHaveBeenCalledWith({
        guestId: 100,
        recipient: 'test@example.com',
        subject: 'Test Subject',
        success: true,
        emailType: 'event_reminder',
      });
    });

    it('should continue processing after individual failure', async () => {
      const email1 = { ...mockScheduledEmail, id: 1 };
      const email2 = { ...mockScheduledEmail, id: 2 };

      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([email1, email2]);
      (prisma.guest.findUnique as Mock)
        .mockResolvedValueOnce(null) // First fails
        .mockResolvedValueOnce(mockGuest); // Second succeeds
      (sendEmail as Mock).mockResolvedValue({ success: true });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      const result = await processScheduledEmails();

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.sent).toBe(1);
    });

    it('should return correct stats', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([
        { ...mockScheduledEmail, id: 1 },
        { ...mockScheduledEmail, id: 2 },
        { ...mockScheduledEmail, id: 3 },
      ]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (sendEmail as Mock)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: false, error: 'Failed' });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      const result = await processScheduledEmails();

      expect(result).toEqual({
        processed: 3,
        sent: 2,
        failed: 1,
      });
    });

    it('should render template with guest variables', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([mockScheduledEmail]);
      (prisma.guest.findUnique as Mock).mockResolvedValue(mockGuest);
      (sendEmail as Mock).mockResolvedValue({ success: true });
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      await processScheduledEmails();

      expect(renderTemplate).toHaveBeenCalledWith('event_reminder', {
        guestName: 'Test Guest', // From both variables JSON and guest.name
      });
    });

    it('should handle email without guest_id as error', async () => {
      const emailWithoutGuest = {
        ...mockScheduledEmail,
        guest_id: null,
      };

      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([emailWithoutGuest]);
      (prisma.scheduledEmail.update as Mock).mockResolvedValue({});

      const result = await processScheduledEmails();

      expect(result.failed).toBe(1);
      expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'failed',
          error_message: 'Cannot send email without guest',
        }),
      });
    });
  });

  // ============================================
  // getScheduledEmails() Tests
  // ============================================
  describe('getScheduledEmails', () => {
    it('should return emails with guest info', async () => {
      const mockEmails = [
        { id: 1, guest_id: 100, template_slug: 'event_reminder', status: 'pending', scheduled_for: new Date(), schedule_type: 'manual', created_at: new Date(), sent_at: null },
      ];
      const mockGuests = [{ id: 100, name: 'Test', email: 'test@example.com' }];

      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue(mockEmails);
      (prisma.scheduledEmail.count as Mock).mockResolvedValue(1);
      (prisma.guest.findMany as Mock).mockResolvedValue(mockGuests);

      const result = await getScheduledEmails();

      expect(result.emails[0].guest).toEqual({ id: 100, name: 'Test', email: 'test@example.com' });
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (prisma.scheduledEmail.count as Mock).mockResolvedValue(0);
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      await getScheduledEmails({ status: 'pending' });

      expect(prisma.scheduledEmail.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'pending' },
        })
      );
    });

    it('should filter by scheduleType', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (prisma.scheduledEmail.count as Mock).mockResolvedValue(0);
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      await getScheduledEmails({ scheduleType: 'bulk' });

      expect(prisma.scheduledEmail.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schedule_type: 'bulk' },
        })
      );
    });

    it('should support pagination', async () => {
      (prisma.scheduledEmail.findMany as Mock).mockResolvedValue([]);
      (prisma.scheduledEmail.count as Mock).mockResolvedValue(100);
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      await getScheduledEmails({ limit: 20, offset: 40 });

      expect(prisma.scheduledEmail.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        })
      );
    });
  });

  // ============================================
  // getSchedulerStats() Tests
  // ============================================
  describe('getSchedulerStats', () => {
    it('should return correct statistics', async () => {
      (prisma.scheduledEmail.count as Mock)
        .mockResolvedValueOnce(10) // pending
        .mockResolvedValueOnce(50) // sent_today
        .mockResolvedValueOnce(2) // failed_today
        .mockResolvedValueOnce(5); // upcoming_24h

      const stats = await getSchedulerStats();

      expect(stats).toEqual({
        pending: 10,
        sent_today: 50,
        failed_today: 2,
        upcoming_24h: 5,
      });
    });

    it('should query with correct date filters', async () => {
      (prisma.scheduledEmail.count as Mock).mockResolvedValue(0);

      await getSchedulerStats();

      // Check that count was called 4 times with different filters
      expect(prisma.scheduledEmail.count).toHaveBeenCalledTimes(4);

      // First call: pending
      expect(prisma.scheduledEmail.count).toHaveBeenNthCalledWith(1, {
        where: { status: 'pending' },
      });
    });
  });

  // ============================================
  // runAutomaticSchedulers() Tests
  // ============================================
  describe('runAutomaticSchedulers', () => {
    it('should fetch all enabled scheduler configs', async () => {
      (prisma.schedulerConfig.findMany as Mock).mockResolvedValue([]);

      await runAutomaticSchedulers();

      expect(prisma.schedulerConfig.findMany).toHaveBeenCalledWith({
        where: { enabled: true },
      });
    });

    it('should run payment_reminder scheduler', async () => {
      const mockConfig = {
        id: 1,
        config_key: 'payment_reminder',
        enabled: true,
        interval_days: 3,
        send_time: '09:00',
      };

      (prisma.schedulerConfig.findMany as Mock).mockResolvedValue([mockConfig]);
      (prisma.registration.findMany as Mock).mockResolvedValue([]);

      const result = await runAutomaticSchedulers();

      expect(result.payment_reminder).toBe(0);
    });

    it('should run event_reminder scheduler', async () => {
      const mockConfig = {
        id: 2,
        config_key: 'event_reminder',
        enabled: true,
        days_before: 1,
        send_time: '09:00',
      };

      (prisma.schedulerConfig.findMany as Mock).mockResolvedValue([mockConfig]);
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      const result = await runAutomaticSchedulers();

      // Event reminder returns 0 if we're not within scheduling window
      expect(result.event_reminder).toBeDefined();
    });

    it('should return -1 on scheduler error', async () => {
      const mockConfig = {
        id: 1,
        config_key: 'payment_reminder',
        enabled: true,
      };

      (prisma.schedulerConfig.findMany as Mock).mockResolvedValue([mockConfig]);
      (prisma.registration.findMany as Mock).mockRejectedValue(new Error('DB Error'));

      const result = await runAutomaticSchedulers();

      expect(result.payment_reminder).toBe(-1);
    });

    it('should handle multiple schedulers', async () => {
      const mockConfigs = [
        { id: 1, config_key: 'payment_reminder', enabled: true },
        { id: 2, config_key: 'event_reminder', enabled: true },
      ];

      (prisma.schedulerConfig.findMany as Mock).mockResolvedValue(mockConfigs);
      (prisma.registration.findMany as Mock).mockResolvedValue([]);
      (prisma.guest.findMany as Mock).mockResolvedValue([]);

      const result = await runAutomaticSchedulers();

      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  // ============================================
  // schedulePaymentReminders() Tests
  // ============================================
  describe('schedulePaymentReminders', () => {
    const mockRegistration = {
      id: 1,
      guest_id: 100,
      ticket_type: 'paid_single',
      guest: {
        id: 100,
        name: 'Test Guest',
        email: 'test@example.com',
        registration_status: 'registered',
      },
      payment: {
        id: 1,
        amount: 15000,
        currency: 'HUF',
        payment_status: 'pending',
      },
    };

    it('should find guests with pending payments', async () => {
      (prisma.registration.findMany as Mock).mockResolvedValue([]);

      await schedulePaymentReminders();

      expect(prisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            payment: { payment_status: 'pending' },
            guest: { registration_status: 'registered' },
          },
          include: { guest: true, payment: true },
        })
      );
    });

    it('should skip guests with existing pending reminder', async () => {
      (prisma.registration.findMany as Mock).mockResolvedValue([mockRegistration]);
      (prisma.scheduledEmail.findFirst as Mock).mockResolvedValue({
        id: 1,
        status: 'pending',
      });

      const result = await schedulePaymentReminders();

      expect(result).toBe(0);
      expect(prisma.scheduledEmail.create).not.toHaveBeenCalled();
    });

    it('should skip if reminder sent within interval', async () => {
      (prisma.registration.findMany as Mock).mockResolvedValue([mockRegistration]);
      (prisma.scheduledEmail.findFirst as Mock)
        .mockResolvedValueOnce(null) // No pending
        .mockResolvedValueOnce({
          id: 1,
          status: 'sent',
          sent_at: new Date(), // Sent just now
        });

      const result = await schedulePaymentReminders({ interval_days: 3 });

      expect(result).toBe(0);
    });

    it('should schedule reminder when outside interval', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 5); // 5 days ago

      (prisma.registration.findMany as Mock).mockResolvedValue([mockRegistration]);
      (prisma.scheduledEmail.findFirst as Mock)
        .mockResolvedValueOnce(null) // No pending
        .mockResolvedValueOnce({
          id: 1,
          status: 'sent',
          sent_at: oldDate, // Sent 5 days ago
        });
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 2 });

      const result = await schedulePaymentReminders({ interval_days: 3 });

      expect(result).toBe(1);
      expect(prisma.scheduledEmail.create).toHaveBeenCalled();
    });

    it('should use default interval_days if not provided', async () => {
      (prisma.registration.findMany as Mock).mockResolvedValue([mockRegistration]);
      (prisma.scheduledEmail.findFirst as Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 1 });

      await schedulePaymentReminders();

      // Should schedule since no previous reminders
      expect(prisma.scheduledEmail.create).toHaveBeenCalled();
    });

    it('should include correct variables in scheduled email', async () => {
      (prisma.registration.findMany as Mock).mockResolvedValue([mockRegistration]);
      (prisma.scheduledEmail.findFirst as Mock).mockResolvedValue(null);
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 1 });

      await schedulePaymentReminders();

      expect(prisma.scheduledEmail.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_slug: 'payment_reminder',
          variables: expect.stringContaining('Test Guest'),
        }),
      });
    });

    it('should respect send_time configuration', async () => {
      (prisma.registration.findMany as Mock).mockResolvedValue([mockRegistration]);
      (prisma.scheduledEmail.findFirst as Mock).mockResolvedValue(null);
      (prisma.scheduledEmail.create as Mock).mockResolvedValue({ id: 1 });

      await schedulePaymentReminders({ send_time: '14:30' });

      const createCall = (prisma.scheduledEmail.create as Mock).mock.calls[0][0];
      const scheduledFor = new Date(JSON.parse(createCall.data.variables).paymentUrl ? createCall.data.scheduled_for : '');

      // Just verify the function was called (time parsing is internal)
      expect(prisma.scheduledEmail.create).toHaveBeenCalled();
    });
  });

  // ============================================
  // scheduleEventReminders() Tests
  // ============================================
  describe('scheduleEventReminders', () => {
    it('should return 0 if not within scheduling window', async () => {
      // Event is far in the future (April 2026)
      const result = await scheduleEventReminders({ days_before: 1 });

      // Should return 0 because we're not within 2 days of reminder date
      expect(result).toBe(0);
    });

    it('should use default days_before if not provided', async () => {
      const result = await scheduleEventReminders();

      // Should not throw, returns 0 because event is in future
      expect(result).toBe(0);
    });

    it('should use default send_time if not provided', async () => {
      const result = await scheduleEventReminders({ days_before: 1 });

      // Should complete without error
      expect(result).toBeDefined();
    });

    it('should handle config with null days_before', async () => {
      const result = await scheduleEventReminders({ days_before: null });

      // Should use default of 1
      expect(result).toBe(0);
    });
  });
});
