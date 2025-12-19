/**
 * Event Broadcaster Service Unit Tests
 *
 * Tests for: lib/services/event-broadcaster.ts
 *
 * Coverage targets:
 * - subscribeGuest() - Subscribe to events and return unsubscribe function
 * - broadcastToGuest() - Broadcast events to subscribers
 * - getSubscriberCount() - Get total subscriber count
 * - getSubscribedGuestIds() - Get list of subscribed guest IDs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
}));

import {
  subscribeGuest,
  broadcastToGuest,
  getSubscriberCount,
  getSubscribedGuestIds,
  type CheckinEvent,
} from '@/lib/services/event-broadcaster';

describe('Event Broadcaster Service', () => {
  // Note: The service uses an in-memory Map, so we need to clean up between tests
  // by unsubscribing all registered callbacks
  let unsubscribeFunctions: (() => void)[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    // Unsubscribe all previous subscriptions
    unsubscribeFunctions.forEach((unsub) => unsub());
    unsubscribeFunctions = [];
  });

  // ============================================
  // subscribeGuest() Tests
  // ============================================
  describe('subscribeGuest', () => {
    it('should subscribe a guest and return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeGuest(1, callback);
      unsubscribeFunctions.push(unsubscribe);

      expect(typeof unsubscribe).toBe('function');
      expect(getSubscribedGuestIds()).toContain(1);
    });

    it('should allow multiple subscriptions for same guest', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = subscribeGuest(1, callback1);
      const unsub2 = subscribeGuest(1, callback2);
      unsubscribeFunctions.push(unsub1, unsub2);

      expect(getSubscriberCount()).toBe(2);
    });

    it('should allow subscriptions for different guests', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = subscribeGuest(1, callback1);
      const unsub2 = subscribeGuest(2, callback2);
      unsubscribeFunctions.push(unsub1, unsub2);

      expect(getSubscribedGuestIds()).toContain(1);
      expect(getSubscribedGuestIds()).toContain(2);
      expect(getSubscriberCount()).toBe(2);
    });

    it('should unsubscribe correctly', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeGuest(1, callback);

      // Unsubscribe
      unsubscribe();

      expect(getSubscribedGuestIds()).not.toContain(1);
      expect(getSubscriberCount()).toBe(0);
    });

    it('should remove guest from map when last subscription removed', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = subscribeGuest(1, callback1);
      const unsub2 = subscribeGuest(1, callback2);

      // Remove first subscription
      unsub1();
      expect(getSubscribedGuestIds()).toContain(1);
      expect(getSubscriberCount()).toBe(1);

      // Remove second subscription
      unsub2();
      expect(getSubscribedGuestIds()).not.toContain(1);
      expect(getSubscriberCount()).toBe(0);
    });

    it('should handle unsubscribe called multiple times safely', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeGuest(1, callback);

      // Call unsubscribe multiple times
      unsubscribe();
      unsubscribe();
      unsubscribe();

      // Should not throw and count should be 0
      expect(getSubscriberCount()).toBe(0);
    });
  });

  // ============================================
  // broadcastToGuest() Tests
  // ============================================
  describe('broadcastToGuest', () => {
    const mockEvent: CheckinEvent = {
      type: 'CHECKED_IN',
      guestId: 1,
      guestName: 'Test Guest',
      tableName: 'Table 1',
      tableType: 'VIP',
      seatNumber: 5,
      checkedInAt: '2026-03-27T18:00:00Z',
    };

    it('should broadcast event to subscribed guest', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeGuest(1, callback);
      unsubscribeFunctions.push(unsubscribe);

      broadcastToGuest(1, mockEvent);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(mockEvent);
    });

    it('should broadcast to all callbacks for same guest', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      const unsub1 = subscribeGuest(1, callback1);
      const unsub2 = subscribeGuest(1, callback2);
      const unsub3 = subscribeGuest(1, callback3);
      unsubscribeFunctions.push(unsub1, unsub2, unsub3);

      broadcastToGuest(1, mockEvent);

      expect(callback1).toHaveBeenCalledWith(mockEvent);
      expect(callback2).toHaveBeenCalledWith(mockEvent);
      expect(callback3).toHaveBeenCalledWith(mockEvent);
    });

    it('should only broadcast to target guest', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = subscribeGuest(1, callback1);
      const unsub2 = subscribeGuest(2, callback2);
      unsubscribeFunctions.push(unsub1, unsub2);

      broadcastToGuest(1, mockEvent);

      expect(callback1).toHaveBeenCalledWith(mockEvent);
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should do nothing if guest has no subscribers', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeGuest(1, callback);
      unsubscribeFunctions.push(unsubscribe);

      // Broadcast to non-subscribed guest
      broadcastToGuest(999, mockEvent);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const successCallback = vi.fn();

      const unsub1 = subscribeGuest(1, errorCallback);
      const unsub2 = subscribeGuest(1, successCallback);
      unsubscribeFunctions.push(unsub1, unsub2);

      // Should not throw
      expect(() => broadcastToGuest(1, mockEvent)).not.toThrow();

      // Both callbacks should have been called
      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();
    });

    it('should broadcast event with null optional fields', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeGuest(1, callback);
      unsubscribeFunctions.push(unsubscribe);

      const eventWithNulls: CheckinEvent = {
        type: 'CHECKED_IN',
        guestId: 1,
        guestName: 'Test Guest',
        tableName: null,
        tableType: null,
        seatNumber: null,
        checkedInAt: '2026-03-27T18:00:00Z',
      };

      broadcastToGuest(1, eventWithNulls);

      expect(callback).toHaveBeenCalledWith(eventWithNulls);
    });
  });

  // ============================================
  // getSubscriberCount() Tests
  // ============================================
  describe('getSubscriberCount', () => {
    it('should return 0 when no subscribers', () => {
      expect(getSubscriberCount()).toBe(0);
    });

    it('should count all subscriptions across guests', () => {
      const unsub1 = subscribeGuest(1, vi.fn());
      const unsub2 = subscribeGuest(1, vi.fn());
      const unsub3 = subscribeGuest(2, vi.fn());
      const unsub4 = subscribeGuest(3, vi.fn());
      unsubscribeFunctions.push(unsub1, unsub2, unsub3, unsub4);

      expect(getSubscriberCount()).toBe(4);
    });

    it('should decrease count after unsubscribe', () => {
      const unsub1 = subscribeGuest(1, vi.fn());
      const unsub2 = subscribeGuest(2, vi.fn());
      unsubscribeFunctions.push(unsub2);

      expect(getSubscriberCount()).toBe(2);

      unsub1();
      expect(getSubscriberCount()).toBe(1);
    });
  });

  // ============================================
  // getSubscribedGuestIds() Tests
  // ============================================
  describe('getSubscribedGuestIds', () => {
    it('should return empty array when no subscribers', () => {
      expect(getSubscribedGuestIds()).toEqual([]);
    });

    it('should return unique guest IDs', () => {
      const unsub1 = subscribeGuest(1, vi.fn());
      const unsub2 = subscribeGuest(1, vi.fn()); // Same guest, multiple subscriptions
      const unsub3 = subscribeGuest(2, vi.fn());
      const unsub4 = subscribeGuest(5, vi.fn());
      unsubscribeFunctions.push(unsub1, unsub2, unsub3, unsub4);

      const guestIds = getSubscribedGuestIds();

      expect(guestIds).toHaveLength(3);
      expect(guestIds).toContain(1);
      expect(guestIds).toContain(2);
      expect(guestIds).toContain(5);
    });

    it('should remove guest ID when all subscriptions removed', () => {
      const unsub1 = subscribeGuest(1, vi.fn());
      const unsub2 = subscribeGuest(2, vi.fn());
      unsubscribeFunctions.push(unsub2);

      expect(getSubscribedGuestIds()).toContain(1);

      unsub1();

      expect(getSubscribedGuestIds()).not.toContain(1);
      expect(getSubscribedGuestIds()).toContain(2);
    });
  });
});
