/**
 * Event Broadcaster Service
 *
 * In-memory pub/sub system for real-time SSE events.
 * Used to notify PWA clients when check-in occurs.
 *
 * ⚠️ PRODUCTION WARNING:
 * This in-memory implementation ONLY works with a single server instance.
 * For production deployments with multiple instances (e.g., Vercel serverless),
 * this MUST be replaced with a distributed pub/sub system:
 * - Redis Pub/Sub (recommended)
 * - Upstash Redis (for serverless)
 * - Pusher/Ably (managed service)
 *
 * Current limitation: If guest's PWA connects to instance A and check-in
 * happens on instance B, the notification won't be delivered.
 *
 * For CEO Gala 2026: Single-instance deployment is acceptable given
 * expected load (~500 guests). Monitor and upgrade if scaling needed.
 */

import { logError } from '@/lib/utils/logger';

export interface CheckinEvent {
  type: 'CHECKED_IN';
  guestId: number;
  guestName: string;
  tableName: string | null;
  tableType: string | null;
  seatNumber: number | null;
  checkedInAt: string;
}

export interface DisplayCheckinEvent {
  type: 'DISPLAY_CHECKED_IN';
  guestId: number;
  guestName: string;
  tableName: string | null;
  tableType: string | null;
  seatNumber: number | null;
  checkedInAt: string;
  dietaryRequirements: string | null;
  title: string | null;
  guestType: string;
}

export type BroadcastEvent = CheckinEvent;

type EventCallback = (event: BroadcastEvent) => void;
type DisplayEventCallback = (event: DisplayCheckinEvent) => void;

// Map of guestId -> Set of callbacks (one guest can have multiple tabs)
const subscribers = new Map<number, Set<EventCallback>>();

// Global display subscribers (large screen seating display)
const displaySubscribers = new Set<DisplayEventCallback>();

/**
 * Subscribe a guest to receive events
 * @returns unsubscribe function
 */
export function subscribeGuest(guestId: number, callback: EventCallback): () => void {
  if (!subscribers.has(guestId)) {
    subscribers.set(guestId, new Set());
  }
  subscribers.get(guestId)!.add(callback);

  // Return unsubscribe function
  return () => {
    const callbacks = subscribers.get(guestId);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        subscribers.delete(guestId);
      }
    }
  };
}

/**
 * Broadcast an event to a specific guest
 */
export function broadcastToGuest(guestId: number, event: BroadcastEvent): void {
  const callbacks = subscribers.get(guestId);
  if (callbacks) {
    callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        logError('[EVENT-BROADCASTER] Error in callback:', error);
      }
    });
  }
}

/**
 * Get number of active subscribers (for debugging)
 */
export function getSubscriberCount(): number {
  let count = 0;
  subscribers.forEach((callbacks) => {
    count += callbacks.size;
  });
  return count;
}

/**
 * Get subscribed guest IDs (for debugging)
 */
export function getSubscribedGuestIds(): number[] {
  return Array.from(subscribers.keys());
}

/**
 * Subscribe a display client to receive all check-in events
 * @returns unsubscribe function
 */
export function subscribeDisplay(callback: DisplayEventCallback): () => void {
  displaySubscribers.add(callback);
  return () => {
    displaySubscribers.delete(callback);
  };
}

/**
 * Broadcast an event to all display subscribers
 */
export function broadcastToDisplay(event: DisplayCheckinEvent): void {
  displaySubscribers.forEach((callback) => {
    try {
      callback(event);
    } catch (error) {
      logError('[EVENT-BROADCASTER] Error in display callback:', error);
    }
  });
}

/**
 * Get number of active display subscribers (for debugging)
 */
export function getDisplaySubscriberCount(): number {
  return displaySubscribers.size;
}
