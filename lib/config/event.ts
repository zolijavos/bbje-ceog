/**
 * CEO Gála 2026 - Event Configuration
 * Centralized configuration for event-related constants
 */

export const EVENT_CONFIG = {
  // Event details
  name: 'CEO Gála 2026',
  year: 2026,

  // Event timing
  date: '2026-04-26',
  startTime: '18:00',
  dateTime: new Date('2026-04-26T18:00:00'),

  // QR code expiry (end of event day)
  ticketExpiry: new Date('2026-04-26T23:59:59'),

  // Venue
  venue: {
    name: 'Corinthia Hotel Budapest',
    address: 'Budapest, Apáczai Csere János u. 4, 1052',
  },

  // Dress code
  dressCode: 'Black tie',

  // Contact
  contactEmail: 'info@ceogala.hu',
} as const;

/**
 * Format event date for display (Hungarian)
 */
export function formatEventDate(): string {
  return 'Sunday, April 26, 2026';
}

/**
 * Format event time for display
 */
export function formatEventTime(): string {
  return `${EVENT_CONFIG.startTime} - Doors open`;
}

/**
 * Calculate days until event
 */
export function getDaysUntilEvent(): number {
  const today = new Date();
  const diffTime = EVENT_CONFIG.dateTime.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if event is today
 */
export function isEventToday(): boolean {
  return getDaysUntilEvent() <= 0;
}
