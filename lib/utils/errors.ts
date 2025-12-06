/**
 * Error Handling Utilities
 *
 * Centralized error handling helpers to avoid repetitive try-catch patterns.
 */

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
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
