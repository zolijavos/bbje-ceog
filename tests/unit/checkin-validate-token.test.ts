/**
 * Unit Tests: validateCheckinToken — All Error Paths
 *
 * Covers every branch of lib/services/checkin.ts validateCheckinToken():
 *   - TICKET_EXPIRED (JWT expired)
 *   - INVALID_TICKET (JWT malformed)
 *   - Generic verify error
 *   - REGISTRATION_NOT_FOUND (DB miss)
 *   - CANCELLED (cancelled_at set)
 *   - TOKEN_MISMATCH (qr_code_hash !== token)
 *   - Already checked in (with previousCheckin)
 *   - Valid + not checked in (happy path)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockFindUnique = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    registration: { findUnique: (...args: any[]) => mockFindUnique(...args) },
  },
}));

const mockVerifyTicketToken = vi.fn();

vi.mock('@/lib/services/qr-ticket', () => ({
  verifyTicketToken: (...args: any[]) => mockVerifyTicketToken(...args),
  validateTicket: vi.fn(),
}));

vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

import { validateCheckinToken } from '@/lib/services/checkin';

// --- Fixtures ---

function makePayload(overrides: Record<string, any> = {}) {
  return {
    registration_id: 100,
    guest_id: 1,
    ticket_type: 'vip_free',
    guest_name: 'Test Guest',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

function makeRegistration(overrides: Record<string, any> = {}) {
  return {
    id: 100,
    qr_code_hash: 'valid-token-string',
    ticket_type: 'vip_free',
    partner_first_name: null,
    partner_last_name: null,
    cancelled_at: null,
    guest: {
      id: 1,
      first_name: 'János',
      last_name: 'Kovács',
    },
    checkin: null,
    ...overrides,
  };
}

// --- Tests ---

describe('validateCheckinToken — JWT error paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P0] returns EXPIRED_TOKEN when JWT is expired', async () => {
    mockVerifyTicketToken.mockImplementation(() => {
      throw new Error('TICKET_EXPIRED');
    });

    const result = await validateCheckinToken('expired-jwt-token');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('EXPIRED_TOKEN');
    expect(result.alreadyCheckedIn).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it('[P0] returns INVALID_TOKEN when JWT is malformed', async () => {
    mockVerifyTicketToken.mockImplementation(() => {
      throw new Error('INVALID_TICKET');
    });

    const result = await validateCheckinToken('garbage-not-jwt');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_TOKEN');
    expect(result.alreadyCheckedIn).toBe(false);
  });

  it('[P1] returns INVALID_TOKEN for generic verify errors (non-Error throw)', async () => {
    mockVerifyTicketToken.mockImplementation(() => {
      throw 'some string error';
    });

    const result = await validateCheckinToken('weird-token');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_TOKEN');
    expect(result.alreadyCheckedIn).toBe(false);
  });

  it('[P1] returns INVALID_TOKEN for unknown Error subtypes', async () => {
    mockVerifyTicketToken.mockImplementation(() => {
      throw new Error('SOME_UNKNOWN_ERROR');
    });

    const result = await validateCheckinToken('unknown-error-token');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_TOKEN');
    expect(result.alreadyCheckedIn).toBe(false);
  });
});

describe('validateCheckinToken — DB lookup paths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyTicketToken.mockReturnValue(makePayload());
  });

  it('[P0] returns REGISTRATION_NOT_FOUND when registration does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await validateCheckinToken('valid-jwt');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('REGISTRATION_NOT_FOUND');
    expect(result.alreadyCheckedIn).toBe(false);
  });

  it('[P0] returns CANCELLED when registration has cancelled_at', async () => {
    mockFindUnique.mockResolvedValue(
      makeRegistration({ cancelled_at: new Date('2026-03-20T10:00:00Z') }),
    );

    const result = await validateCheckinToken('valid-jwt');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('CANCELLED');
    expect(result.alreadyCheckedIn).toBe(false);
  });

  it('[P0] returns TOKEN_MISMATCH when qr_code_hash differs from token', async () => {
    mockFindUnique.mockResolvedValue(
      makeRegistration({ qr_code_hash: 'stored-hash-abc123' }),
    );

    const result = await validateCheckinToken('different-token-value');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('TOKEN_MISMATCH');
    expect(result.alreadyCheckedIn).toBe(false);
  });
});

describe('validateCheckinToken — already checked in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyTicketToken.mockReturnValue(makePayload());
  });

  it('[P1] returns alreadyCheckedIn=true with previousCheckin data', async () => {
    const checkinDate = new Date('2026-03-21T14:30:00Z');
    mockFindUnique.mockResolvedValue(
      makeRegistration({
        qr_code_hash: 'the-token',
        checkin: {
          checked_in_at: checkinDate,
          staff_user: {
            first_name: 'Admin',
            last_name: 'Test',
          },
        },
      }),
    );

    const result = await validateCheckinToken('the-token');

    expect(result.valid).toBe(true);
    expect(result.alreadyCheckedIn).toBe(true);
    expect(result.guest).toBeDefined();
    expect(result.guest!.id).toBe(1);
    expect(result.guest!.firstName).toBe('János');
    expect(result.guest!.lastName).toBe('Kovács');
    expect(result.previousCheckin).toBeDefined();
    expect(result.previousCheckin!.checkedInAt).toBe('2026-03-21T14:30:00.000Z');
    expect(result.previousCheckin!.staffFirstName).toBe('Admin');
    expect(result.previousCheckin!.staffLastName).toBe('Test');
  });

  it('[P1] previousCheckin has null staff names when no staff user', async () => {
    mockFindUnique.mockResolvedValue(
      makeRegistration({
        qr_code_hash: 'the-token',
        checkin: {
          checked_in_at: new Date('2026-03-21T15:00:00Z'),
          staff_user: null,
        },
      }),
    );

    const result = await validateCheckinToken('the-token');

    expect(result.alreadyCheckedIn).toBe(true);
    expect(result.previousCheckin!.staffFirstName).toBeNull();
    expect(result.previousCheckin!.staffLastName).toBeNull();
  });
});

describe('validateCheckinToken — happy path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyTicketToken.mockReturnValue(makePayload());
  });

  it('[P0] returns valid=true with guest and registration data for valid token', async () => {
    mockFindUnique.mockResolvedValue(
      makeRegistration({
        qr_code_hash: 'valid-jwt',
        partner_first_name: 'Krisztina',
        partner_last_name: 'Horváth',
      }),
    );

    const result = await validateCheckinToken('valid-jwt');

    expect(result.valid).toBe(true);
    expect(result.alreadyCheckedIn).toBe(false);
    expect(result.error).toBeUndefined();
    expect(result.previousCheckin).toBeUndefined();

    // Guest shape
    expect(result.guest).toEqual({
      id: 1,
      firstName: 'János',
      lastName: 'Kovács',
      ticketType: 'vip_free',
      partnerFirstName: 'Krisztina',
      partnerLastName: 'Horváth',
    });

    // Registration shape
    expect(result.registration).toEqual({ id: 100 });
  });

  it('[P1] returns null partner names when no partner', async () => {
    mockFindUnique.mockResolvedValue(
      makeRegistration({ qr_code_hash: 'valid-jwt' }),
    );

    const result = await validateCheckinToken('valid-jwt');

    expect(result.valid).toBe(true);
    expect(result.guest!.partnerFirstName).toBeNull();
    expect(result.guest!.partnerLastName).toBeNull();
  });
});

describe('validateCheckinToken — outer catch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyTicketToken.mockReturnValue(makePayload());
  });

  it('[P1] returns INVALID_TOKEN when Prisma throws unexpected error', async () => {
    mockFindUnique.mockRejectedValue(new Error('Connection refused'));

    const result = await validateCheckinToken('valid-jwt');

    expect(result.valid).toBe(false);
    expect(result.error).toBe('INVALID_TOKEN');
    expect(result.alreadyCheckedIn).toBe(false);
  });
});
