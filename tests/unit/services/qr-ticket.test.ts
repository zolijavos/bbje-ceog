/**
 * QR Ticket Service Unit Tests
 *
 * Tests for: lib/services/qr-ticket.ts
 *
 * Coverage targets:
 * - generateTicketToken() - JWT generation
 * - verifyTicketToken() - JWT verification
 * - validateTicket() - Full validation with DB
 * - generateQRCodeDataURL() - QR code generation
 * - tryAcquireTicketLock() - Atomic lock acquisition
 * - getExistingTicket() - Retrieve existing ticket
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Set environment variables BEFORE any imports
process.env.QR_SECRET = 'a'.repeat(64); // 64 character secret
process.env.EVENT_DATE = '2026-03-27';

// Mock jwt
const mockSign = vi.fn();
const mockVerify = vi.fn();
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: (...args: unknown[]) => mockSign(...args),
    verify: (...args: unknown[]) => mockVerify(...args),
    TokenExpiredError: class TokenExpiredError extends Error {
      constructor() {
        super('Token expired');
        this.name = 'TokenExpiredError';
      }
    },
    JsonWebTokenError: class JsonWebTokenError extends Error {
      constructor(msg: string) {
        super(msg);
        this.name = 'JsonWebTokenError';
      }
    },
  },
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockQRCode'),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-qr-buffer')),
  },
}));

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    registration: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db/prisma';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

// Dynamic import to use mocks
let qrTicketModule: typeof import('@/lib/services/qr-ticket');

describe('QR Ticket Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSign.mockReset();
    mockVerify.mockReset();

    // Re-import module to get fresh instance
    vi.resetModules();
    process.env.QR_SECRET = 'a'.repeat(64);
    process.env.EVENT_DATE = '2026-03-27';
    qrTicketModule = await import('@/lib/services/qr-ticket');
  });

  // ============================================
  // generateTicketToken() Tests
  // ============================================
  describe('generateTicketToken', () => {
    const mockRegistration = {
      id: 1,
      ticket_type: 'paid_single',
      guest: {
        id: 100,
        name: 'Test Guest',
        email: 'test@example.com',
      },
    };

    it('should generate JWT token for valid registration', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);
      (prisma.registration.update as Mock).mockResolvedValue({});
      mockSign.mockReturnValue('mock-jwt-token');

      const token = await qrTicketModule.generateTicketToken(1);

      expect(token).toBe('mock-jwt-token');
      expect(mockSign).toHaveBeenCalledWith(
        expect.objectContaining({
          registration_id: 1,
          guest_id: 100,
          ticket_type: 'paid_single',
          guest_name: 'Test Guest',
        }),
        expect.any(String),
        expect.objectContaining({
          algorithm: 'HS256',
        })
      );
    });

    it('should throw REGISTRATION_NOT_FOUND if not exists', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      await expect(qrTicketModule.generateTicketToken(999)).rejects.toThrow('REGISTRATION_NOT_FOUND');
    });

    it('should throw GUEST_NOT_FOUND if guest missing', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        id: 1,
        guest: null,
      });

      await expect(qrTicketModule.generateTicketToken(1)).rejects.toThrow('GUEST_NOT_FOUND');
    });

    it('should store token in database', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);
      (prisma.registration.update as Mock).mockResolvedValue({});
      mockSign.mockReturnValue('stored-token');

      await qrTicketModule.generateTicketToken(1);

      expect(prisma.registration.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          qr_code_hash: 'stored-token',
          qr_code_generated_at: expect.any(Date),
        },
      });
    });
  });

  // ============================================
  // verifyTicketToken() Tests
  // ============================================
  describe('verifyTicketToken', () => {
    it('should return decoded payload for valid token', () => {
      const mockPayload = {
        registration_id: 1,
        guest_id: 100,
        ticket_type: 'paid_single',
        guest_name: 'Test Guest',
        iat: 1234567890,
        exp: 1234567890 + 86400,
      };

      mockVerify.mockReturnValue(mockPayload);

      const result = qrTicketModule.verifyTicketToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockVerify).toHaveBeenCalledWith('valid-token', expect.any(String), {
        algorithms: ['HS256'],
      });
    });

    it('should throw TICKET_EXPIRED for expired token', () => {
      const TokenExpiredError = jwt.TokenExpiredError;
      mockVerify.mockImplementation(() => {
        throw new TokenExpiredError();
      });

      expect(() => qrTicketModule.verifyTicketToken('expired-token')).toThrow('TICKET_EXPIRED');
    });

    it('should throw INVALID_TICKET for invalid token', () => {
      const JsonWebTokenError = jwt.JsonWebTokenError;
      mockVerify.mockImplementation(() => {
        throw new JsonWebTokenError('invalid signature');
      });

      expect(() => qrTicketModule.verifyTicketToken('invalid-token')).toThrow('INVALID_TICKET');
    });
  });

  // ============================================
  // validateTicket() Tests
  // ============================================
  describe('validateTicket', () => {
    const mockPayload = {
      registration_id: 1,
      guest_id: 100,
      ticket_type: 'paid_single',
      guest_name: 'Test Guest',
    };

    const mockRegistration = {
      id: 1,
      ticket_type: 'paid_single',
      qr_code_hash: 'valid-token',
      guest: {
        id: 100,
        name: 'Test Guest',
        email: 'test@example.com',
      },
    };

    it('should return valid for matching token', async () => {
      mockVerify.mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue(mockRegistration);

      const result = await qrTicketModule.validateTicket('valid-token');

      expect(result.isValid).toBe(true);
      expect(result.registration).toEqual({
        id: 1,
        ticket_type: 'paid_single',
        guest: {
          id: 100,
          name: 'Test Guest',
          email: 'test@example.com',
        },
      });
    });

    it('should return invalid for token mismatch', async () => {
      mockVerify.mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        qr_code_hash: 'different-token',
      });

      const result = await qrTicketModule.validateTicket('valid-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('TOKEN_MISMATCH');
    });

    it('should return invalid for missing registration', async () => {
      mockVerify.mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      const result = await qrTicketModule.validateTicket('valid-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('REGISTRATION_NOT_FOUND');
    });

    it('should return invalid for missing guest', async () => {
      mockVerify.mockReturnValue(mockPayload);
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        ...mockRegistration,
        guest: null,
      });

      const result = await qrTicketModule.validateTicket('valid-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GUEST_NOT_FOUND');
    });

    it('should return error for expired token', async () => {
      mockVerify.mockImplementation(() => {
        throw new Error('TICKET_EXPIRED');
      });

      const result = await qrTicketModule.validateTicket('expired-token');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('TICKET_EXPIRED');
    });
  });

  // ============================================
  // generateQRCodeDataURL() Tests
  // ============================================
  describe('generateQRCodeDataURL', () => {
    it('should generate QR code data URL', async () => {
      const result = await qrTicketModule.generateQRCodeDataURL('test-token');

      expect(result).toBe('data:image/png;base64,mockQRCode');
      expect(QRCode.toDataURL).toHaveBeenCalledWith('test-token', expect.objectContaining({
        width: 300,
        margin: 2,
      }));
    });
  });

  // ============================================
  // generateQRCodeBuffer() Tests
  // ============================================
  describe('generateQRCodeBuffer', () => {
    it('should generate QR code buffer', async () => {
      const result = await qrTicketModule.generateQRCodeBuffer('test-token');

      expect(result).toBeInstanceOf(Buffer);
      expect(QRCode.toBuffer).toHaveBeenCalledWith('test-token', expect.any(Object));
    });
  });

  // ============================================
  // tryAcquireTicketLock() Tests
  // ============================================
  describe('tryAcquireTicketLock', () => {
    it('should return true when lock acquired', async () => {
      (prisma.registration.updateMany as Mock).mockResolvedValue({ count: 1 });

      const result = await qrTicketModule.tryAcquireTicketLock(1);

      expect(result).toBe(true);
      expect(prisma.registration.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          qr_code_hash: null,
        },
        data: {
          qr_code_generated_at: expect.any(Date),
        },
      });
    });

    it('should return false when ticket already exists', async () => {
      (prisma.registration.updateMany as Mock).mockResolvedValue({ count: 0 });

      const result = await qrTicketModule.tryAcquireTicketLock(1);

      expect(result).toBe(false);
    });
  });

  // ============================================
  // getExistingTicket() Tests
  // ============================================
  describe('getExistingTicket', () => {
    it('should return existing ticket', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        qr_code_hash: 'existing-token',
        qr_code_generated_at: new Date(),
      });

      const result = await qrTicketModule.getExistingTicket(1);

      expect(result).toEqual({
        token: 'existing-token',
        qrCodeDataUrl: 'data:image/png;base64,mockQRCode',
      });
    });

    it('should return null if no ticket exists', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue({
        qr_code_hash: null,
        qr_code_generated_at: null,
      });

      const result = await qrTicketModule.getExistingTicket(1);

      expect(result).toBeNull();
    });

    it('should return null if registration not found', async () => {
      (prisma.registration.findUnique as Mock).mockResolvedValue(null);

      const result = await qrTicketModule.getExistingTicket(999);

      expect(result).toBeNull();
    });
  });
});
