/**
 * Email Service Unit Tests
 *
 * Tests for: lib/services/email.ts
 *
 * Coverage targets:
 * - sendEmail() - with retry logic
 * - checkRateLimit() - per-type and global limits
 * - logEmailDelivery() - email logging
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock nodemailer before imports
const mockSendMail = vi.fn();
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    emailLog: {
      count: vi.fn(),
      create: vi.fn(),
    },
    guest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    registration: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

// Mock other services
vi.mock('@/lib/auth/magic-link', () => ({
  generateMagicLinkHash: vi.fn().mockReturnValue('mock-hash-123'),
}));

vi.mock('@/lib/email-templates/magic-link', () => ({
  getMagicLinkEmailTemplate: vi.fn().mockReturnValue({
    subject: 'Magic Link',
    html: '<p>Click here</p>',
    text: 'Click here',
  }),
}));

vi.mock('@/lib/email-templates/ticket-delivery', () => ({
  getTicketDeliveryEmailTemplate: vi.fn().mockReturnValue({
    subject: 'Your Ticket',
    html: '<p>Ticket</p>',
    text: 'Ticket',
  }),
}));

vi.mock('@/lib/services/email-templates', () => ({
  renderTemplate: vi.fn().mockResolvedValue({
    subject: 'Test Subject',
    html: '<p>Test</p>',
    text: 'Test',
  }),
}));

vi.mock('@/lib/services/qr-ticket', () => ({
  generateTicket: vi.fn().mockResolvedValue({
    token: 'mock-token',
    qrCodeDataUrl: 'data:image/png;base64,mock',
  }),
  getExistingTicket: vi.fn(),
  tryAcquireTicketLock: vi.fn().mockResolvedValue(true),
}));

// Set environment variables before importing
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'password';
process.env.SMTP_FROM = 'noreply@test.com';

import { prisma } from '@/lib/db/prisma';
import { sendEmail, checkRateLimit } from '@/lib/services/email';

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockReset();
  });

  // ============================================
  // sendEmail() Tests
  // ============================================
  describe('sendEmail', () => {
    it('should send email successfully on first attempt', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'test-123' });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<p>Test</p>',
        })
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      mockSendMail
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockResolvedValueOnce({ messageId: 'test-123' });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP error');
      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });

    it('should include text version if provided', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>HTML</p>',
        text: 'Plain text',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Plain text',
        })
      );
    });

    it('should include attachments if provided', async () => {
      mockSendMail.mockResolvedValueOnce({});

      const attachments = [
        {
          filename: 'ticket.png',
          content: Buffer.from('mock-image'),
          cid: 'qr-code',
        },
      ];

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        attachments,
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments,
        })
      );
    });

    it('should use SMTP_FROM as sender', async () => {
      mockSendMail.mockResolvedValueOnce({});

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
        })
      );
    });
  });

  // ============================================
  // checkRateLimit() Tests
  // ============================================
  describe('checkRateLimit', () => {
    it('should allow request when under global limit', async () => {
      (prisma.emailLog.count as Mock).mockResolvedValue(5);

      const result = await checkRateLimit(1);

      expect(result).toBe(true);
    });

    it('should block when global limit exceeded (20/hour)', async () => {
      (prisma.emailLog.count as Mock).mockResolvedValue(20);

      const result = await checkRateLimit(1);

      expect(result).toBe(false);
    });

    it('should allow when under per-type limit', async () => {
      (prisma.emailLog.count as Mock)
        .mockResolvedValueOnce(10) // Global count
        .mockResolvedValueOnce(3); // Type count

      const result = await checkRateLimit(1, 'magic_link');

      expect(result).toBe(true);
    });

    it('should block when per-type limit exceeded (5/hour)', async () => {
      (prisma.emailLog.count as Mock)
        .mockResolvedValueOnce(10) // Global count
        .mockResolvedValueOnce(5); // Type count at limit

      const result = await checkRateLimit(1, 'magic_link');

      expect(result).toBe(false);
    });

    it('should check global limit first', async () => {
      (prisma.emailLog.count as Mock)
        .mockResolvedValueOnce(25) // Global exceeds
        .mockResolvedValueOnce(2); // Type under limit

      const result = await checkRateLimit(1, 'magic_link');

      expect(result).toBe(false);
      // Should not even check type limit
      expect(prisma.emailLog.count).toHaveBeenCalledTimes(1);
    });

    it('should use correct time window (1 hour ago)', async () => {
      (prisma.emailLog.count as Mock).mockResolvedValue(0);

      await checkRateLimit(1, 'test_type');

      const call = (prisma.emailLog.count as Mock).mock.calls[0][0];
      const sentAtFilter = call.where.sent_at.gte;

      // Should be approximately 1 hour ago
      const oneHourAgo = Date.now() - 3600000;
      expect(sentAtFilter.getTime()).toBeCloseTo(oneHourAgo, -3);
    });

    it('should filter by guest_id', async () => {
      (prisma.emailLog.count as Mock).mockResolvedValue(0);

      await checkRateLimit(123);

      expect(prisma.emailLog.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            guest_id: 123,
          }),
        })
      );
    });

    it('should filter by email_type when provided', async () => {
      (prisma.emailLog.count as Mock).mockResolvedValue(0);

      await checkRateLimit(1, 'ticket_delivery');

      // Second call should filter by type
      const secondCall = (prisma.emailLog.count as Mock).mock.calls[1][0];
      expect(secondCall.where.email_type).toBe('ticket_delivery');
    });
  });
});
