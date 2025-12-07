/**
 * Admin Authentication Utilities
 *
 * Centralized authentication helpers for API routes to eliminate
 * repeated auth checks across 25+ admin endpoints.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * Session with user data
 */
export interface AuthSession {
  user: {
    id: number;
    email: string;
    name?: string;
    role: 'admin' | 'staff';
  };
}

/**
 * Result of authentication check - discriminated union for type narrowing
 */
export type AuthResult =
  | { success: true; session: AuthSession; response?: never }
  | { success: false; session?: never; response: NextResponse };

/**
 * Check if request is from authenticated admin/staff user
 *
 * Usage:
 * ```typescript
 * const auth = await requireAuth();
 * if (!auth.success) return auth.response;
 * // auth.session is now available
 * ```
 *
 * @returns AuthResult with session or error response
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return {
    success: true as const,
    session: session as AuthSession,
  };
}

/**
 * Check if request is from admin user (not just staff)
 *
 * @returns AuthResult with session or error response
 */
export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth();

  if (!auth.success) {
    return auth;
  }

  if (auth.session.user.role !== 'admin') {
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return auth;
}
