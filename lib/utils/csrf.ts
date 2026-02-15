/**
 * CSRF Protection Utilities
 *
 * Provides origin-based CSRF protection for API routes.
 * Validates that requests come from the same origin.
 */

import { NextRequest } from 'next/server';

/**
 * Validate CSRF protection by checking Origin/Referer headers
 *
 * @param request - NextRequest object
 * @returns Whether the request passes CSRF validation
 */
export function validateCsrf(request: NextRequest): boolean {
  // Allow GET, HEAD, OPTIONS requests (safe methods)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(request.method)) {
    return true;
  }

  // Get the origin or referer header
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // For server-side requests (e.g., from Server Components), there may be no origin
  // Allow these if there's no origin/referer (internal requests)
  if (!origin && !referer) {
    return true;
  }

  // Get the expected host from the request URL
  const expectedHost = request.nextUrl.host;
  const expectedOrigin = `${request.nextUrl.protocol}//${expectedHost}`;

  // Check origin header
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === expectedHost) {
        return true;
      }
    } catch {
      // Invalid origin URL
      return false;
    }
  }

  // Fall back to referer check
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === expectedHost) {
        return true;
      }
    } catch {
      // Invalid referer URL
      return false;
    }
  }

  return false;
}

/**
 * Create a JSON response for CSRF validation failure
 */
export function csrfErrorResponse() {
  return new Response(
    JSON.stringify({ error: 'CSRF validation failed' }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
