/**
 * Route Parameter Utilities
 *
 * Centralized route parameter parsing and validation to eliminate
 * repeated ID extraction patterns across dynamic routes.
 */

import { NextResponse } from 'next/server';

/**
 * Route context type for Next.js dynamic routes
 */
export interface RouteContext<T extends Record<string, string> = { id: string }> {
  params: Promise<T>;
}

/**
 * Result of ID parameter extraction - discriminated union for type narrowing
 */
export type IdParseResult =
  | { success: true; id: number; response?: never }
  | { success: false; id?: never; response: NextResponse };

/**
 * Extract and validate numeric ID from route params
 *
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest, context: RouteContext) {
 *   const result = await parseIdParam(context);
 *   if (!result.success) return result.response;
 *   const { id } = result;
 *   // id is now a validated number
 * }
 * ```
 *
 * @param context - Next.js route context with params
 * @param paramName - Name of the parameter (default: 'id')
 * @returns Parsed ID or error response
 */
export async function parseIdParam(
  context: RouteContext,
  paramName: string = 'id'
): Promise<IdParseResult> {
  const params = await context.params;
  const value = params[paramName];
  const id = parseInt(value, 10);

  if (isNaN(id) || id <= 0) {
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, error: `Invalid ${paramName}` },
        { status: 400 }
      ),
    };
  }

  return {
    success: true as const,
    id,
  };
}

/**
 * Parse pagination parameters from URL search params
 *
 * @param searchParams - URL search params
 * @param defaults - Default values
 * @returns Pagination parameters
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number; offset: number } {
  const { page: defaultPage = 1, limit: defaultLimit = 25, maxLimit = 100 } = defaults;

  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaultPage), 10));
  const requestedLimit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}
