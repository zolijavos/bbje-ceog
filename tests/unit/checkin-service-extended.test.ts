/**
 * Unit Tests: Check-in Service — Extended Coverage
 *
 * Tests for lib/services/checkin.ts focusing on:
 *   - submitCheckin guestDetails response shape
 *   - DisplayCheckinEvent extended fields (dietary, title, guestType)
 *   - Cancelled registration handling
 *   - Override logic (delete + recreate)
 *   - Edge cases: missing guest, missing table assignment
 *
 * Uses Vitest mocking for Prisma and event-broadcaster.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

// Mock Prisma
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockTransaction = vi.fn();
const mockTableAssignmentFindUnique = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    registration: { findUnique: (...args: any[]) => mockFindUnique(...args) },
    checkin: {
      create: (...args: any[]) => mockCreate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
    guest: { update: (...args: any[]) => mockUpdate(...args) },
    tableAssignment: { findUnique: (...args: any[]) => mockTableAssignmentFindUnique(...args) },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}));

// Mock event broadcaster
const mockBroadcastToGuest = vi.fn();
const mockBroadcastToDisplay = vi.fn();

vi.mock('@/lib/services/event-broadcaster', () => ({
  broadcastToGuest: (...args: any[]) => mockBroadcastToGuest(...args),
  broadcastToDisplay: (...args: any[]) => mockBroadcastToDisplay(...args),
}));

// Mock QR ticket
vi.mock('@/lib/services/qr-ticket', () => ({
  verifyTicketToken: vi.fn(),
  validateTicket: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock errors util
vi.mock('@/lib/utils/errors', () => ({
  getErrorMessage: (e: any) => (e instanceof Error ? e.message : String(e)),
}));

import { submitCheckin } from '@/lib/services/checkin';

// --- Fixtures ---

function makeRegistration(overrides: Record<string, any> = {}) {
  return {
    id: 100,
    qr_code_hash: 'valid-token',
    ticket_type: 'vip_free',
    partner_first_name: null,
    partner_last_name: null,
    cancelled_at: null,
    guest: {
      id: 1,
      first_name: 'János',
      last_name: 'Kovács',
      title: 'Dr.',
      dietary_requirements: 'vegetarian',
      guest_type: 'invited',
      email: 'janos@test.hu',
    },
    checkin: null,
    ...overrides,
  };
}

function makeCheckin(overrides: Record<string, any> = {}) {
  return {
    id: 50,
    checked_in_at: new Date('2026-03-21T14:00:00Z'),
    registration_id: 100,
    guest_id: 1,
    staff_user_id: 10,
    is_override: false,
    ...overrides,
  };
}

function makeTableAssignment(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    table_id: 1,
    guest_id: 1,
    seat_number: 3,
    table: { name: 'VIP 1', type: 'vip' },
    ...overrides,
  };
}

// --- Tests ---

describe('submitCheckin — guestDetails response', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P1] returns guestDetails with title, dietary, tableName, guestType, guestName on success', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockResolvedValue([makeCheckin(), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(makeTableAssignment());

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(true);
    expect(result.guestDetails).toBeDefined();
    expect(result.guestDetails).toEqual({
      title: 'Dr.',
      dietaryRequirements: 'vegetarian',
      tableName: 'VIP 1',
      guestType: 'invited',
      guestName: 'János Kovács',
    });
  });

  it('[P1] guestDetails has null tableName when guest has no table assignment', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockResolvedValue([makeCheckin(), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(null); // no assignment

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(true);
    expect(result.guestDetails!.tableName).toBeNull();
  });

  it('[P1] guestDetails has null title and null dietary when guest has none', async () => {
    const reg = makeRegistration({
      guest: {
        id: 2,
        first_name: 'Éva',
        last_name: 'Nagy',
        title: null,
        dietary_requirements: null,
        guest_type: 'paying_single',
        email: 'eva@test.hu',
      },
    });
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockResolvedValue([makeCheckin({ id: 51, guest_id: 2 }), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(null);

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(true);
    expect(result.guestDetails!.title).toBeNull();
    expect(result.guestDetails!.dietaryRequirements).toBeNull();
    expect(result.guestDetails!.guestType).toBe('paying_single');
    expect(result.guestDetails!.guestName).toBe('Éva Nagy');
  });
});

describe('submitCheckin — cancelled registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P0] returns REGISTRATION_CANCELLED for cancelled registration', async () => {
    const reg = makeRegistration({ cancelled_at: new Date('2026-03-20T12:00:00Z') });
    mockFindUnique.mockResolvedValue(reg);

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('REGISTRATION_CANCELLED');
    // Should NOT create checkin record
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('[P0] returns REGISTRATION_NOT_FOUND for non-existent registration', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await submitCheckin(999, 10, false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('REGISTRATION_NOT_FOUND');
  });

  it('[P0] returns GUEST_NOT_FOUND when registration has no guest', async () => {
    mockFindUnique.mockResolvedValue(makeRegistration({ guest: null }));

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('GUEST_NOT_FOUND');
  });
});

describe('submitCheckin — duplicate and override', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P0] returns ALREADY_CHECKED_IN when already checked in without override', async () => {
    const reg = makeRegistration({ checkin: makeCheckin() });
    mockFindUnique.mockResolvedValue(reg);

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('ALREADY_CHECKED_IN');
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('[P1] override deletes existing checkin then creates new one', async () => {
    const existingCheckin = makeCheckin();
    const reg = makeRegistration({ checkin: existingCheckin });
    mockFindUnique.mockResolvedValue(reg);
    mockDelete.mockResolvedValue({});
    mockTransaction.mockResolvedValue([makeCheckin({ id: 51, is_override: true }), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(makeTableAssignment());

    const result = await submitCheckin(100, 10, true);

    expect(result.success).toBe(true);
    // Delete was called with the existing checkin id
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: existingCheckin.id } });
    // New checkin was created via transaction
    expect(mockTransaction).toHaveBeenCalled();
  });
});

describe('submitCheckin — event broadcasting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P1] broadcasts DisplayCheckinEvent with extended fields (dietary, title, guestType)', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    const checkin = makeCheckin();
    mockTransaction.mockResolvedValue([checkin, {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(makeTableAssignment());

    await submitCheckin(100, 10, false);

    expect(mockBroadcastToDisplay).toHaveBeenCalledTimes(1);
    const displayEvent = mockBroadcastToDisplay.mock.calls[0][0];

    expect(displayEvent.type).toBe('DISPLAY_CHECKED_IN');
    expect(displayEvent.guestId).toBe(1);
    expect(displayEvent.guestName).toBe('János Kovács');
    expect(displayEvent.tableName).toBe('VIP 1');
    expect(displayEvent.tableType).toBe('vip');
    expect(displayEvent.seatNumber).toBe(3);
    expect(displayEvent.dietaryRequirements).toBe('vegetarian');
    expect(displayEvent.title).toBe('Dr.');
    expect(displayEvent.guestType).toBe('invited');
    expect(displayEvent.checkedInAt).toBeDefined();
  });

  it('[P1] broadcasts CheckinEvent to guest (without extended fields)', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockResolvedValue([makeCheckin(), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(makeTableAssignment());

    await submitCheckin(100, 10, false);

    expect(mockBroadcastToGuest).toHaveBeenCalledTimes(1);
    const [guestId, guestEvent] = mockBroadcastToGuest.mock.calls[0];

    expect(guestId).toBe(1);
    expect(guestEvent.type).toBe('CHECKED_IN');
    expect(guestEvent.guestName).toBe('János Kovács');
    expect(guestEvent.tableName).toBe('VIP 1');
    // Guest event does NOT have dietary/title/guestType
    expect(guestEvent).not.toHaveProperty('dietaryRequirements');
    expect(guestEvent).not.toHaveProperty('title');
    expect(guestEvent).not.toHaveProperty('guestType');
  });

  it('[P1] display event has null table fields when guest is unassigned', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockResolvedValue([makeCheckin(), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(null); // no table assignment

    await submitCheckin(100, 10, false);

    const displayEvent = mockBroadcastToDisplay.mock.calls[0][0];
    expect(displayEvent.tableName).toBeNull();
    expect(displayEvent.tableType).toBeNull();
    expect(displayEvent.seatNumber).toBeNull();
  });

  it('[P1] no broadcast occurs when check-in fails (cancelled reg)', async () => {
    const reg = makeRegistration({ cancelled_at: new Date() });
    mockFindUnique.mockResolvedValue(reg);

    await submitCheckin(100, 10, false);

    expect(mockBroadcastToGuest).not.toHaveBeenCalled();
    expect(mockBroadcastToDisplay).not.toHaveBeenCalled();
  });

  it('[P1] no broadcast occurs when check-in fails (already checked in, no override)', async () => {
    const reg = makeRegistration({ checkin: makeCheckin() });
    mockFindUnique.mockResolvedValue(reg);

    await submitCheckin(100, 10, false);

    expect(mockBroadcastToGuest).not.toHaveBeenCalled();
    expect(mockBroadcastToDisplay).not.toHaveBeenCalled();
  });
});

describe('submitCheckin — checkinId in response', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P1] returns numeric checkinId on successful check-in', async () => {
    mockFindUnique.mockResolvedValue(makeRegistration());
    mockTransaction.mockResolvedValue([makeCheckin({ id: 77 }), {}]);
    mockTableAssignmentFindUnique.mockResolvedValue(null);

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(true);
    expect(result.checkinId).toBe(77);
    expect(typeof result.checkinId).toBe('number');
  });

  it('[P1] does not return checkinId on failure', async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await submitCheckin(999, 10, false);

    expect(result.success).toBe(false);
    expect(result.checkinId).toBeUndefined();
  });
});

describe('submitCheckin — unique constraint error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('[P1] Prisma unique constraint error returns ALREADY_CHECKED_IN', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockRejectedValue(new Error('Unique constraint failed on the fields: (registration_id)'));

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('ALREADY_CHECKED_IN');
  });

  it('[P1] generic Prisma error returns error message', async () => {
    const reg = makeRegistration();
    mockFindUnique.mockResolvedValue(reg);
    mockTransaction.mockRejectedValue(new Error('Database connection lost'));

    const result = await submitCheckin(100, 10, false);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection lost');
  });
});
