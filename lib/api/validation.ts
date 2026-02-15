/**
 * Validation Response Utilities
 *
 * Centralized validation error handling to eliminate repeated
 * Zod validation response patterns across API routes.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  success: false;
  error: string;
  details: Record<string, string[]>;
}

/**
 * Create a standardized validation error response
 *
 * @param error - Zod validation error
 * @returns NextResponse with 400 status and error details
 */
export function validationErrorResponse(error: z.ZodError): NextResponse<ValidationErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: error.flatten().fieldErrors as Record<string, string[]>,
    },
    { status: 400 }
  );
}

/**
 * Validation result type - discriminated union for type narrowing
 */
export type ValidationResult<T> =
  | { success: true; data: T; response?: never }
  | { success: false; data?: never; response: NextResponse };

/**
 * Validate request body against schema and return parsed data or error response
 *
 * Usage:
 * ```typescript
 * const result = await validateBody(request, mySchema);
 * if (!result.success) return result.response;
 * // result.data is now typed and validated
 * ```
 *
 * @param request - NextRequest object
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false as const,
        response: validationErrorResponse(result.error),
      };
    }

    return {
      success: true as const,
      data: result.data,
    };
  } catch {
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Common error code to HTTP status mapping
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  // Not found errors
  GUEST_NOT_FOUND: 404,
  TABLE_NOT_FOUND: 404,
  REGISTRATION_NOT_FOUND: 404,
  ASSIGNMENT_NOT_FOUND: 404,
  TEMPLATE_NOT_FOUND: 404,
  PAYMENT_NOT_FOUND: 404,

  // Conflict errors
  EMAIL_EXISTS: 409,
  TABLE_NAME_EXISTS: 409,
  GUEST_ALREADY_ASSIGNED: 409,
  ALREADY_CHECKED_IN: 409,
  ALREADY_PAID: 409,
  ALREADY_REGISTERED: 409,

  // Validation errors
  TABLE_FULL: 400,
  SEAT_TAKEN: 400,
  INVALID_SEAT_NUMBER: 400,
  TABLE_NOT_EMPTY: 400,
  VIP_NO_PAYMENT: 400,

  // Auth errors
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

/**
 * Create error response with appropriate HTTP status based on error code
 *
 * @param errorCode - Service error code (e.g., 'GUEST_NOT_FOUND')
 * @param message - Optional human-readable message
 * @returns NextResponse with appropriate status
 */
export function errorResponse(
  errorCode: string,
  message?: string
): NextResponse {
  const status = ERROR_STATUS_MAP[errorCode] || 400;
  return NextResponse.json(
    {
      success: false,
      error: errorCode,
      message: message || errorCode.replace(/_/g, ' ').toLowerCase(),
    },
    { status }
  );
}
