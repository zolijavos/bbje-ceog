/**
 * CEO Gála 2025 - Event Configuration
 * Centralized configuration for event-related constants
 */

export const EVENT_CONFIG = {
  // Event details
  name: 'CEO Gála 2025',
  year: 2025,

  // Event timing
  date: '2025-02-15',
  startTime: '18:00',
  dateTime: new Date('2025-02-15T18:00:00'),

  // QR code expiry (end of event day)
  ticketExpiry: new Date('2025-02-15T23:59:59'),

  // Venue
  venue: {
    name: 'Marriott Hotel Budapest',
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
  return '2025. február 15., szombat';
}

/**
 * Format event time for display
 */
export function formatEventTime(): string {
  return `${EVENT_CONFIG.startTime} - Kapunyitás`;
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
