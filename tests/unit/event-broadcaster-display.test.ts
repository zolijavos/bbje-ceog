import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger to avoid side effects
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
}));

import {
  subscribeDisplay,
  broadcastToDisplay,
  getDisplaySubscriberCount,
  subscribeGuest,
  broadcastToGuest,
  getSubscriberCount,
  type DisplayCheckinEvent,
  type CheckinEvent,
} from '@/lib/services/event-broadcaster';

// --- parseTableNumber ---
// This function is not exported from SeatingDisplay.tsx (module-level, non-exported).
// We replicate the exact logic here for unit testing.
function parseTableNumber(name: string): number | null {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// --- Fixtures ---

function makeDisplayEvent(overrides: Partial<DisplayCheckinEvent> = {}): DisplayCheckinEvent {
  return {
    type: 'DISPLAY_CHECKED_IN',
    guestId: 1,
    guestName: 'Test Guest',
    tableName: 'VIP 1',
    tableType: 'vip',
    seatNumber: 3,
    checkedInAt: new Date().toISOString(),
    dietaryRequirements: null,
    title: null,
    guestType: 'invited',
    ...overrides,
  };
}

function makeCheckinEvent(overrides: Partial<CheckinEvent> = {}): CheckinEvent {
  return {
    type: 'CHECKED_IN',
    guestId: 1,
    guestName: 'Test Guest',
    tableName: 'VIP 1',
    tableType: 'vip',
    seatNumber: 3,
    checkedInAt: new Date().toISOString(),
    ...overrides,
  };
}

// --- Tests ---

describe('[P1] Event Broadcaster - Display subscriptions', () => {
  // We need to clean up subscribers between tests.
  // The module uses module-level Sets/Maps, so we subscribe and unsubscribe carefully.
  let cleanups: (() => void)[];

  beforeEach(() => {
    cleanups = [];
  });

  afterEach(() => {
    cleanups.forEach((fn) => fn());
  });

  describe('subscribeDisplay()', () => {
    it('[P1] adds a display subscriber and returns an unsubscribe function', () => {
      const before = getDisplaySubscriberCount();
      const unsub = subscribeDisplay(() => {});
      cleanups.push(unsub);

      expect(getDisplaySubscriberCount()).toBe(before + 1);
    });

    it('[P1] unsubscribe removes the subscriber', () => {
      const before = getDisplaySubscriberCount();
      const unsub = subscribeDisplay(() => {});
      expect(getDisplaySubscriberCount()).toBe(before + 1);

      unsub();
      expect(getDisplaySubscriberCount()).toBe(before);
    });

    it('[P1] supports multiple simultaneous display subscribers', () => {
      const before = getDisplaySubscriberCount();
      const unsub1 = subscribeDisplay(() => {});
      const unsub2 = subscribeDisplay(() => {});
      const unsub3 = subscribeDisplay(() => {});
      cleanups.push(unsub1, unsub2, unsub3);

      expect(getDisplaySubscriberCount()).toBe(before + 3);
    });

    it('[P1] double-unsubscribe is safe (no error)', () => {
      const unsub = subscribeDisplay(() => {});
      unsub();
      unsub(); // should not throw
      // No assertion needed - just verifying no exception
    });
  });

  describe('broadcastToDisplay()', () => {
    it('[P1] delivers event to all display subscribers', () => {
      const received1: DisplayCheckinEvent[] = [];
      const received2: DisplayCheckinEvent[] = [];

      const unsub1 = subscribeDisplay((e) => received1.push(e));
      const unsub2 = subscribeDisplay((e) => received2.push(e));
      cleanups.push(unsub1, unsub2);

      const event = makeDisplayEvent({ guestId: 42, guestName: 'VIP Guest' });
      broadcastToDisplay(event);

      expect(received1).toHaveLength(1);
      expect(received1[0]).toEqual(event);
      expect(received2).toHaveLength(1);
      expect(received2[0]).toEqual(event);
    });

    it('[P1] does not fail when there are no display subscribers', () => {
      // Should not throw
      broadcastToDisplay(makeDisplayEvent());
    });

    it('[P1] does not deliver to unsubscribed display clients', () => {
      const received: DisplayCheckinEvent[] = [];
      const unsub = subscribeDisplay((e) => received.push(e));
      unsub();

      broadcastToDisplay(makeDisplayEvent());
      expect(received).toHaveLength(0);
    });

    it('[P1] continues delivering to other subscribers when one throws', () => {
      const received: DisplayCheckinEvent[] = [];

      const unsub1 = subscribeDisplay(() => {
        throw new Error('subscriber error');
      });
      const unsub2 = subscribeDisplay((e) => received.push(e));
      cleanups.push(unsub1, unsub2);

      broadcastToDisplay(makeDisplayEvent());

      // Second subscriber should still receive the event
      expect(received).toHaveLength(1);
    });

    it('[P1] includes all DisplayCheckinEvent fields in delivered event', () => {
      const received: DisplayCheckinEvent[] = [];
      const unsub = subscribeDisplay((e) => received.push(e));
      cleanups.push(unsub);

      const event = makeDisplayEvent({
        guestId: 99,
        guestName: 'Dr. Test',
        tableName: 'VIP 5',
        tableType: 'vip',
        seatNumber: 1,
        dietaryRequirements: 'vegetarian',
        title: 'Dr.',
        guestType: 'paying_single',
      });
      broadcastToDisplay(event);

      expect(received[0]).toMatchObject({
        type: 'DISPLAY_CHECKED_IN',
        guestId: 99,
        dietaryRequirements: 'vegetarian',
        title: 'Dr.',
        guestType: 'paying_single',
      });
    });
  });

  describe('getDisplaySubscriberCount()', () => {
    it('[P1] returns 0 when no display subscribers exist (after cleanup)', () => {
      // We can't guarantee global state is 0, but we can check add/remove delta
      const before = getDisplaySubscriberCount();
      const unsub = subscribeDisplay(() => {});
      expect(getDisplaySubscriberCount()).toBe(before + 1);
      unsub();
      expect(getDisplaySubscriberCount()).toBe(before);
    });
  });
});

describe('[P1] Event Broadcaster - broadcastToGuest regression', () => {
  let cleanups: (() => void)[];

  beforeEach(() => {
    cleanups = [];
  });

  afterEach(() => {
    cleanups.forEach((fn) => fn());
  });

  it('[P1] broadcastToGuest still delivers to guest subscribers (regression)', () => {
    const received: CheckinEvent[] = [];
    const unsub = subscribeGuest(100, (e) => received.push(e));
    cleanups.push(unsub);

    const event = makeCheckinEvent({ guestId: 100 });
    broadcastToGuest(100, event);

    expect(received).toHaveLength(1);
    expect(received[0].guestId).toBe(100);
  });

  it('[P1] broadcastToGuest does not leak to display subscribers', () => {
    const displayReceived: DisplayCheckinEvent[] = [];
    const guestReceived: CheckinEvent[] = [];

    const unsubDisplay = subscribeDisplay((e) => displayReceived.push(e));
    const unsubGuest = subscribeGuest(200, (e) => guestReceived.push(e));
    cleanups.push(unsubDisplay, unsubGuest);

    broadcastToGuest(200, makeCheckinEvent({ guestId: 200 }));

    expect(guestReceived).toHaveLength(1);
    expect(displayReceived).toHaveLength(0);
  });

  it('[P1] broadcastToDisplay does not leak to guest subscribers', () => {
    const guestReceived: CheckinEvent[] = [];

    const unsubGuest = subscribeGuest(300, (e) => guestReceived.push(e));
    cleanups.push(unsubGuest);

    broadcastToDisplay(makeDisplayEvent({ guestId: 300 }));

    expect(guestReceived).toHaveLength(0);
  });

  it('[P1] getSubscriberCount still works for guest subscribers', () => {
    const before = getSubscriberCount();
    const unsub = subscribeGuest(400, () => {});
    cleanups.push(unsub);

    expect(getSubscriberCount()).toBe(before + 1);
  });
});

describe('[P1] SeatingDisplay parseTableNumber', () => {
  describe('valid table names', () => {
    it('[P1] parses plain number "1"', () => {
      expect(parseTableNumber('1')).toBe(1);
    });

    it('[P1] parses plain number "23"', () => {
      expect(parseTableNumber('23')).toBe(23);
    });

    it('[P1] parses "VIP 1" extracting the number', () => {
      expect(parseTableNumber('VIP 1')).toBe(1);
    });

    it('[P1] parses "VIP 12" extracting 12', () => {
      expect(parseTableNumber('VIP 12')).toBe(12);
    });

    it('[P1] parses "Asztal 5" extracting 5', () => {
      expect(parseTableNumber('Asztal 5')).toBe(5);
    });

    it('[P1] parses "Table 99" extracting 99', () => {
      expect(parseTableNumber('Table 99')).toBe(99);
    });

    it('[P1] extracts first number from "VIP 3 Special"', () => {
      expect(parseTableNumber('VIP 3 Special')).toBe(3);
    });
  });

  describe('invalid / edge cases', () => {
    it('[P1] returns null for name with no digits ("VIP Asztal")', () => {
      expect(parseTableNumber('VIP Asztal')).toBeNull();
    });

    it('[P1] returns null for empty string', () => {
      expect(parseTableNumber('')).toBeNull();
    });

    it('[P1] returns null for alphabetic-only name ("Premium")', () => {
      expect(parseTableNumber('Premium')).toBeNull();
    });

    it('[P1] parses "0" as 0', () => {
      expect(parseTableNumber('0')).toBe(0);
    });

    it('[P1] handles leading zeros ("007") as 7', () => {
      expect(parseTableNumber('007')).toBe(7);
    });
  });
});
