/**
 * Logger Utility
 *
 * Development-aware logging to avoid console pollution in production.
 * In production, only errors are logged. In development, all levels work.
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Log information (development only)
 */
export function logInfo(...args: any[]): void {
  if (isDev) {
    console.log(...args);
  }
}

/**
 * Log errors (always logged, even in production)
 */
export function logError(...args: any[]): void {
  console.error(...args);
}

/**
 * Log warnings (development only)
 */
export function logWarn(...args: any[]): void {
  if (isDev) {
    console.warn(...args);
  }
}

/**
 * Log debug info (development only)
 */
export function logDebug(...args: any[]): void {
  if (isDev) {
    console.debug(...args);
  }
}

/**
 * Structured logger with context
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(...args: any[]): void {
    if (isDev) {
      console.log(`[${this.context}]`, ...args);
    }
  }

  error(...args: any[]): void {
    console.error(`[${this.context}]`, ...args);
  }

  warn(...args: any[]): void {
    if (isDev) {
      console.warn(`[${this.context}]`, ...args);
    }
  }

  debug(...args: any[]): void {
    if (isDev) {
      console.debug(`[${this.context}]`, ...args);
    }
  }
}

/**
 * Create a logger instance with context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
