import { getServerSession as getNextAuthServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';

/**
 * Get the current server session
 * Wrapper around NextAuth getServerSession for easier imports
 */
export async function getServerSession() {
  return getNextAuthServerSession(authOptions);
}

/**
 * Require authentication for a server component
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

/**
 * Require specific role for a server component
 * Redirects to login if not authenticated or wrong role
 */
export async function requireRole(role: 'admin' | 'staff') {
  const session = await requireAuth();

  if (session.user.role !== role) {
    redirect('/admin');
  }

  return session;
}
