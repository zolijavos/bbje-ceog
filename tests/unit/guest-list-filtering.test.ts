import { describe, it, expect } from 'vitest';

/**
 * Guest list filtering and sorting logic tests
 *
 * Tests the filtering and sorting logic used in GuestList.tsx
 */

type MagicLinkCategory = 'ready' | 'warning' | 'recent' | 'never';

interface TestGuest {
  id: number;
  name: string;
  email: string;
  guestType: string;
  status: string;
  paymentStatus: string | null;
  lastMagicLinkAt: string | null;
  magicLinkCount: number;
  magicLinkCategory: MagicLinkCategory;
  createdAt: string;
  cancelledAt: string | null;
  hasRegistration: boolean;
  hasCheckedIn: boolean;
}

// Sample guests for testing
const createTestGuests = (): TestGuest[] => {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 1,
      name: 'Alice Ready',
      email: 'alice@test.com',
      guestType: 'invited',
      status: 'invited',
      paymentStatus: null,
      lastMagicLinkAt: threeDaysAgo,
      magicLinkCount: 2,
      magicLinkCategory: 'ready',
      createdAt: '2024-01-01T00:00:00Z',
      cancelledAt: null,
      hasRegistration: false,
      hasCheckedIn: false,
    },
    {
      id: 2,
      name: 'Bob Recent',
      email: 'bob@test.com',
      guestType: 'paying_single',
      status: 'registered',
      paymentStatus: 'paid',
      lastMagicLinkAt: oneHourAgo,
      magicLinkCount: 1,
      magicLinkCategory: 'recent',
      createdAt: '2024-01-02T00:00:00Z',
      cancelledAt: null,
      hasRegistration: true,
      hasCheckedIn: false,
    },
    {
      id: 3,
      name: 'Charlie Never',
      email: 'charlie@test.com',
      guestType: 'invited',
      status: 'invited',
      paymentStatus: null,
      lastMagicLinkAt: null,
      magicLinkCount: 0,
      magicLinkCategory: 'never',
      createdAt: '2024-01-03T00:00:00Z',
      cancelledAt: null,
      hasRegistration: false,
      hasCheckedIn: false,
    },
    {
      id: 4,
      name: 'Diana Cancelled',
      email: 'diana@test.com',
      guestType: 'paying_paired',
      status: 'registered',
      paymentStatus: 'paid',
      lastMagicLinkAt: threeDaysAgo,
      magicLinkCount: 3,
      magicLinkCategory: 'ready',
      createdAt: '2024-01-04T00:00:00Z',
      cancelledAt: '2024-01-10T00:00:00Z',
      hasRegistration: true,
      hasCheckedIn: false,
    },
  ];
};

// Magic link filter implementation (same as GuestList.tsx)
const filterByMagicLink = (guests: TestGuest[], filter: string): TestGuest[] => {
  if (filter === 'all') return guests;

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  switch (filter) {
    case 'ready':
      return guests.filter(g => {
        if (!g.lastMagicLinkAt) return true; // Never sent = ready
        return new Date(g.lastMagicLinkAt) < fortyEightHoursAgo;
      });
    case 'recent':
      return guests.filter(g => {
        if (!g.lastMagicLinkAt) return false;
        return new Date(g.lastMagicLinkAt) >= fortyEightHoursAgo;
      });
    case 'never':
      return guests.filter(g => !g.lastMagicLinkAt);
    case 'sendable':
      return guests.filter(g => {
        if (!g.lastMagicLinkAt) return true;
        return new Date(g.lastMagicLinkAt) < fortyEightHoursAgo;
      });
    default:
      return guests;
  }
};

// Sorting implementation (same as GuestList.tsx)
type SortColumn = 'name' | 'type' | 'status' | 'payment' | 'lastMagicLink' | 'magicLinkCount' | 'createdAt';

const sortGuests = (
  guests: TestGuest[],
  sortColumn: SortColumn,
  sortDirection: 'asc' | 'desc'
): TestGuest[] => {
  return [...guests].sort((a, b) => {
    let comparison = 0;
    switch (sortColumn) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.guestType.localeCompare(b.guestType);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'payment':
        comparison = (a.paymentStatus || '').localeCompare(b.paymentStatus || '');
        break;
      case 'lastMagicLink':
        const aTime = a.lastMagicLinkAt ? new Date(a.lastMagicLinkAt).getTime() : 0;
        const bTime = b.lastMagicLinkAt ? new Date(b.lastMagicLinkAt).getTime() : 0;
        comparison = aTime - bTime;
        break;
      case 'magicLinkCount':
        comparison = (a.magicLinkCount || 0) - (b.magicLinkCount || 0);
        break;
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

describe('Guest List Magic Link Filtering', () => {
  it('returns all guests when filter is "all"', () => {
    const guests = createTestGuests();
    const result = filterByMagicLink(guests, 'all');
    expect(result).toHaveLength(4);
  });

  it('returns guests with 48h+ or never sent when filter is "ready"', () => {
    const guests = createTestGuests();
    const result = filterByMagicLink(guests, 'ready');
    // Alice (3 days ago), Charlie (never), Diana (3 days ago)
    expect(result).toHaveLength(3);
    expect(result.map(g => g.name)).toContain('Alice Ready');
    expect(result.map(g => g.name)).toContain('Charlie Never');
    expect(result.map(g => g.name)).toContain('Diana Cancelled');
    expect(result.map(g => g.name)).not.toContain('Bob Recent');
  });

  it('returns only guests with recent magic link when filter is "recent"', () => {
    const guests = createTestGuests();
    const result = filterByMagicLink(guests, 'recent');
    // Only Bob (1 hour ago)
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob Recent');
  });

  it('returns only guests who never received magic link when filter is "never"', () => {
    const guests = createTestGuests();
    const result = filterByMagicLink(guests, 'never');
    // Only Charlie
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie Never');
  });

  it('returns guests ready to send (48h+ or never) when filter is "sendable"', () => {
    const guests = createTestGuests();
    const result = filterByMagicLink(guests, 'sendable');
    // Same as 'ready': Alice, Charlie, Diana
    expect(result).toHaveLength(3);
    expect(result.map(g => g.name)).not.toContain('Bob Recent');
  });
});

describe('Guest List Sorting', () => {
  it('sorts by name ascending', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'name', 'asc');
    expect(result[0].name).toBe('Alice Ready');
    expect(result[1].name).toBe('Bob Recent');
    expect(result[2].name).toBe('Charlie Never');
    expect(result[3].name).toBe('Diana Cancelled');
  });

  it('sorts by name descending', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'name', 'desc');
    expect(result[0].name).toBe('Diana Cancelled');
    expect(result[3].name).toBe('Alice Ready');
  });

  it('sorts by guest type', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'type', 'asc');
    // invited comes before paying_paired which comes before paying_single
    expect(result[0].guestType).toBe('invited');
    expect(result[1].guestType).toBe('invited');
    expect(result[2].guestType).toBe('paying_paired');
    expect(result[3].guestType).toBe('paying_single');
  });

  it('sorts by magic link count ascending', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'magicLinkCount', 'asc');
    expect(result[0].magicLinkCount).toBe(0);
    expect(result[1].magicLinkCount).toBe(1);
    expect(result[2].magicLinkCount).toBe(2);
    expect(result[3].magicLinkCount).toBe(3);
  });

  it('sorts by magic link count descending', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'magicLinkCount', 'desc');
    expect(result[0].magicLinkCount).toBe(3);
    expect(result[3].magicLinkCount).toBe(0);
  });

  it('sorts by createdAt descending (default)', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'createdAt', 'desc');
    expect(result[0].name).toBe('Diana Cancelled'); // Most recent
    expect(result[3].name).toBe('Alice Ready'); // Oldest
  });

  it('handles null payment status when sorting', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'payment', 'asc');
    // Empty string (null) comes before 'paid'
    expect(result[0].paymentStatus).toBeNull();
    expect(result[1].paymentStatus).toBeNull();
    expect(result[2].paymentStatus).toBe('paid');
    expect(result[3].paymentStatus).toBe('paid');
  });

  it('handles null lastMagicLinkAt when sorting', () => {
    const guests = createTestGuests();
    const result = sortGuests(guests, 'lastMagicLink', 'asc');
    // Null (0 timestamp) comes first
    expect(result[0].name).toBe('Charlie Never');
  });
});
