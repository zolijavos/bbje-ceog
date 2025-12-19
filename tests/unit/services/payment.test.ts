/**
 * Payment Service Unit Tests
 *
 * Tests for: lib/services/payment.ts
 *
 * Coverage targets:
 * - createCheckoutSession() - Stripe session creation
 * - confirmPayment() - Payment confirmation
 * - cancelPayment() - Payment cancellation
 * - approveManualPayment() - Bank transfer approval
 * - getPaymentByRegistration() - Payment lookup
 * - formatHUF() - Currency formatting
 * - constructWebhookEvent() - Webhook verification
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Stripe before imports
const mockCheckoutSessionsCreate = vi.fn();
const mockWebhooksConstructEvent = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    checkout: {
      sessions: {
        create: mockCheckoutSessionsCreate,
      },
    },
    webhooks: {
      constructEvent: mockWebhooksConstructEvent,
    },
  })),
}));

// Mock Prisma
const mockTransaction = vi.fn();
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    registration: {
      findUnique: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    guest: {
      update: vi.fn(),
    },
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => mockTransaction(fn),
  },
}));

// Set required env before import
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.APP_URL = 'http://localhost:3000';

import { prisma } from '@/lib/db/prisma';

// Dynamic import after mocks
let paymentModule: typeof import('@/lib/services/payment');

describe('Payment Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockCheckoutSessionsCreate.mockReset();
    mockWebhooksConstructEvent.mockReset();
    mockTransaction.mockReset();

    // Mock transaction to execute callback
    mockTransaction.mockImplementation(async (fn) => {
      const txMock = {
        payment: {
          update: vi.fn().mockResolvedValue({ id: 1 }),
          create: vi.fn().mockResolvedValue({ id: 1 }),
        },
        guest: {
          update: vi.fn().mockResolvedValue({}),
        },
      };
      return fn(txMock);
    });

    // Re-import module
    vi.resetModules();
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
    paymentModule = await import('@/lib/services/payment');
  });

  // ============================================
  // formatHUF() Tests
  // ============================================
  describe('formatHUF', () => {
    it('should format amount with Hungarian locale', () => {
      expect(paymentModule.formatHUF(100000)).toMatch(/100[\s\u00a0]?000\s*Ft/);
    });

    it('should format zero amount', () => {
      expect(paymentModule.formatHUF(0)).toBe('0 Ft');
    });

    it('should format large amounts', () => {
      const result = paymentModule.formatHUF(1500000);
      expect(result).toContain('Ft');
    });
  });

  // ============================================
  // createCheckoutSession() Tests
  // ============================================
  describe('createCheckoutSession', () => {
    const mockRegistration = {
      id: 1,
      ticket_type: 'paid_single',
      guest: {
        id: 100,
        name: 'Test Guest',
        email: 'test@example.com',
      },
      payment: null,
    };

    it('should create Stripe checkout session', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);
      (prisma.payment.create as Mock).mockResolvedValue({ id: 1 });
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const result = await paymentModule.createCheckoutSession(1);

      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_123');
      expect(result.sessionId).toBe('cs_test_123');
    });

    it('should throw REGISTRATION_NOT_FOUND', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      await expect(paymentModule.createCheckoutSession(999)).rejects.toThrow('REGISTRATION_NOT_FOUND');
    });

    it('should throw GUEST_NOT_FOUND', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        guest: null,
      });

      await expect(paymentModule.createCheckoutSession(1)).rejects.toThrow('GUEST_NOT_FOUND');
    });

    it('should throw VIP_NO_PAYMENT for VIP guests', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        ticket_type: 'vip_free',
      });

      await expect(paymentModule.createCheckoutSession(1)).rejects.toThrow('VIP_NO_PAYMENT');
    });

    it('should throw ALREADY_PAID if payment exists', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        payment: { payment_status: 'paid' },
      });

      await expect(paymentModule.createCheckoutSession(1)).rejects.toThrow('ALREADY_PAID');
    });

    it('should create payment record', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);
      (prisma.payment.create as Mock).mockResolvedValue({ id: 1 });
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      await paymentModule.createCheckoutSession(1);

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          registration_id: 1,
          stripe_session_id: 'cs_test_123',
          payment_status: 'pending',
          payment_method: 'card',
          currency: 'HUF',
        }),
      });
    });

    it('should update existing payment record', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        payment: { id: 5, payment_status: 'pending' },
      });
      (prisma.payment.update as Mock).mockResolvedValue({ id: 5 });
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_new',
        url: 'https://checkout.stripe.com/pay/cs_test_new',
      });

      await paymentModule.createCheckoutSession(1);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: expect.objectContaining({
          stripe_session_id: 'cs_test_new',
          payment_status: 'pending',
        }),
      });
    });
  });

  // ============================================
  // confirmPayment() Tests
  // ============================================
  describe('confirmPayment', () => {
    const mockPayment = {
      id: 1,
      stripe_session_id: 'cs_test_123',
      payment_status: 'pending',
      registration: {
        id: 1,
        guest_id: 100,
        guest: { id: 100, name: 'Test' },
      },
    };

    it('should confirm payment successfully', async () => {
      (prisma.payment.findUnique as Mock).mockResolvedValue(mockPayment);

      const result = await paymentModule.confirmPayment('cs_test_123', 'pi_test_123');

      expect(result).toBeDefined();
      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw PAYMENT_NOT_FOUND', async () => {
      (prisma.payment.findUnique as Mock).mockResolvedValue(null);

      await expect(paymentModule.confirmPayment('invalid_session')).rejects.toThrow('PAYMENT_NOT_FOUND');
    });

    it('should be idempotent for already paid', async () => {
      const paidPayment = { ...mockPayment, payment_status: 'paid' };
      (prisma.payment.findUnique as Mock).mockResolvedValue(paidPayment);

      const result = await paymentModule.confirmPayment('cs_test_123');

      expect(result).toEqual(paidPayment);
      expect(mockTransaction).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // cancelPayment() Tests
  // ============================================
  describe('cancelPayment', () => {
    it('should update payment to failed', async () => {
      (prisma.payment.findUnique as Mock).mockResolvedValue({
        id: 1,
        payment_status: 'pending',
      });
      (prisma.payment.update as Mock).mockResolvedValue({});

      await paymentModule.cancelPayment('cs_test_123');

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { payment_status: 'failed' },
      });
    });

    it('should do nothing if payment not found', async () => {
      (prisma.payment.findUnique as Mock).mockResolvedValue(null);

      await paymentModule.cancelPayment('invalid');

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });

    it('should not update if already paid', async () => {
      (prisma.payment.findUnique as Mock).mockResolvedValue({
        id: 1,
        payment_status: 'paid',
      });

      await paymentModule.cancelPayment('cs_test_123');

      expect(prisma.payment.update).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // getPaymentByRegistration() Tests
  // ============================================
  describe('getPaymentByRegistration', () => {
    it('should return payment for registration', async () => {
      const mockPayment = { id: 1, amount: 100000 };
      (prisma.payment.findFirst as Mock).mockResolvedValue(mockPayment);

      const result = await paymentModule.getPaymentByRegistration(1);

      expect(result).toEqual(mockPayment);
      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: { registration_id: 1 },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return null if no payment', async () => {
      (prisma.payment.findFirst as Mock).mockResolvedValue(null);

      const result = await paymentModule.getPaymentByRegistration(999);

      expect(result).toBeNull();
    });
  });

  // ============================================
  // approveManualPayment() Tests
  // ============================================
  describe('approveManualPayment', () => {
    const mockRegistration = {
      id: 1,
      ticket_type: 'paid_single',
      guest_id: 100,
      guest: { id: 100 },
      payment: null,
    };

    it('should approve and create payment record', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);

      await paymentModule.approveManualPayment(1);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should throw REGISTRATION_NOT_FOUND', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      await expect(paymentModule.approveManualPayment(999)).rejects.toThrow('REGISTRATION_NOT_FOUND');
    });

    it('should update existing payment record', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        payment: { id: 5 },
      });

      await paymentModule.approveManualPayment(1);

      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  // ============================================
  // constructWebhookEvent() Tests
  // ============================================
  describe('constructWebhookEvent', () => {
    it('should construct webhook event', () => {
      const mockEvent = { id: 'evt_123', type: 'checkout.session.completed' };
      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const result = paymentModule.constructWebhookEvent('payload', 'sig_123');

      expect(result).toEqual(mockEvent);
      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        'payload',
        'sig_123',
        'whsec_test_mock'
      );
    });

    it('should throw if webhook secret not configured', async () => {
      // Temporarily remove webhook secret
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      vi.resetModules();
      const freshModule = await import('@/lib/services/payment');

      expect(() => freshModule.constructWebhookEvent('payload', 'sig')).toThrow('WEBHOOK_SECRET_NOT_CONFIGURED');

      // Restore
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    });
  });
});
