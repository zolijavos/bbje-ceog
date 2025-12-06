/**
 * Application Constants
 *
 * Centralized configuration for magic numbers and limits
 */

// ========================================
// RATE LIMITING
// ========================================

export const RATE_LIMIT = {
  /** Max failed auth attempts before lockout */
  AUTH_MAX_ATTEMPTS: 5,
  /** Auth lockout window in milliseconds (5 minutes) */
  AUTH_WINDOW_MS: 5 * 60 * 1000,

  /** Max emails per guest per hour */
  EMAIL_MAX_PER_HOUR: 5,
  /** Email rate limit window in milliseconds (1 hour) */
  EMAIL_WINDOW_MS: 60 * 60 * 1000,

  /** Max API requests per minute (general) */
  API_MAX_PER_MINUTE: 100,
  /** API rate limit window in milliseconds (1 minute) */
  API_WINDOW_MS: 60 * 1000,
} as const;

// ========================================
// MAGIC LINK
// ========================================

export const MAGIC_LINK = {
  /** Expiry time in minutes */
  EXPIRY_MINUTES: 5,
  /** Minimum secret length */
  MIN_SECRET_LENGTH: 64,
} as const;

// ========================================
// JWT / QR TICKETS
// ========================================

export const QR_TICKET = {
  /** JWT algorithm */
  ALGORITHM: 'HS256' as const,
  /** Minimum secret length */
  MIN_SECRET_LENGTH: 64,
  /** Default expiry in hours */
  DEFAULT_EXPIRY_HOURS: 48,
} as const;

// ========================================
// SESSION
// ========================================

export const SESSION = {
  /** Session max age in seconds (24 hours) */
  MAX_AGE_SECONDS: 24 * 60 * 60,
  /** bcrypt cost factor */
  BCRYPT_COST: 12,
} as const;

// ========================================
// EMAIL
// ========================================

export const EMAIL = {
  /** Max retry attempts for sending */
  MAX_RETRIES: 3,
  /** Initial retry delay in ms */
  RETRY_DELAY_MS: 1000,
  /** Retry backoff multiplier */
  RETRY_BACKOFF: 2,
} as const;

// ========================================
// CSV IMPORT
// ========================================

export const CSV_IMPORT = {
  /** Max rows per import */
  MAX_ROWS: 1000,
  /** Max field length */
  MAX_FIELD_LENGTH: 255,
  /** Max table name length */
  MAX_TABLE_NAME_LENGTH: 100,
} as const;

// ========================================
// PAGINATION
// ========================================

export const PAGINATION = {
  /** Default page size */
  DEFAULT_LIMIT: 25,
  /** Max page size */
  MAX_LIMIT: 100,
} as const;

// ========================================
// VALIDATION
// ========================================

export const VALIDATION = {
  /** Max email length */
  MAX_EMAIL_LENGTH: 255,
  /** Max name length */
  MAX_NAME_LENGTH: 255,
  /** Max notes length */
  MAX_NOTES_LENGTH: 1000,
} as const;

// ========================================
// EVENT
// ========================================

export const EVENT = {
  /** Event year */
  YEAR: 2026,
  /** Default event date (can be overridden by env) */
  DEFAULT_DATE: '2026-03-27',
} as const;
