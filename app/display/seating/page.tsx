/**
 * Live Seating Display Page
 *
 * Full-screen display for large screens showing real-time
 * seating arrangement with check-in status updates via SSE.
 * Admin-only access (middleware + server component role check).
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import SeatingDisplay from './SeatingDisplay';

export default async function SeatingDisplayPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  if ((session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login');
  }

  return <SeatingDisplay />;
}
