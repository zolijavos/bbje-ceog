/**
 * Printable Seating Plan Page
 *
 * Clean A4-optimized layout showing all tables with guest lists.
 * Admin-only access. Print via Ctrl+P or the print button.
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import PrintableSeating from './PrintableSeating';

export default async function PrintableSeatingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  if ((session.user as { role?: string }).role !== 'admin') {
    redirect('/admin/login');
  }

  return <PrintableSeating />;
}
