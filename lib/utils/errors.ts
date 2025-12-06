/**
 * Error Handling Utilities
 *
 * Centralized error handling helpers to avoid repetitive try-catch patterns.
 */

/**
 * Sensitive patterns that should never be exposed in error messages
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api.?key/i,
  /credential/i,
  /connection.*string/i,
  /database.*url/i,
];

/**
 * Sanitizes error message to prevent information leakage
 */
function sanitizeErrorMessage(message: string): string {
  // Check if message contains sensitive information
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(message)) {
      return 'An internal error occurred';
    }
  }

  // Remove file paths that might reveal server structure
  const sanitized = message.replace(/\/[^\s]+\.(ts|js|tsx|jsx)/g, '[file]');

  // Remove line numbers
  return sanitized.replace(/:\d+:\d+/g, '');
}

/**
 * Extracts error message from unknown error type
 * In production, sensitive information is sanitized
 */
export function getErrorMessage(error: unknown, sanitize: boolean = true): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'An unknown error occurred';
  }

  // Only sanitize in production
  if (sanitize && process.env.NODE_ENV === 'production') {
    return sanitizeErrorMessage(message);
  }

  return message;
}

/**
 * Generic error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * Generic success response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

/**
 * Union type for service responses
 */
export type ServiceResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(error: unknown): ErrorResponse {
  return {
    success: false,
    error: getErrorMessage(error),
  };
}

/**
 * Creates a standardized success response object
 */
export function createSuccessResponse<T>(data?: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Logs error with context (development only)
 */
export function logError(context: string, error: unknown): void {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.error(`[${context}] Error:`, error);
  }
}

/**
 * Type guard to check if response is error
 */
export function isErrorResponse<T>(
  response: ServiceResponse<T>
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Type guard to check if response is success
 */
export function isSuccessResponse<T>(
  response: ServiceResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}
