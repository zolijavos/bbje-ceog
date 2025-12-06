/**
 * Admin Seating Map Dashboard
 *
 * Interactive seating management with drag-drop support.
 * Story 4.4: Interactive Drag-and-Drop Seating Map
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Link from 'next/link';
import SeatingDashboard from './SeatingDashboard';

export default async function SeatingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Seating Arrangement
            </h1>
            <div className="flex gap-4 items-center">
              <Link
                href="/admin/tables"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Manage Tables
              </Link>
              <Link
                href="/admin/guests"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Guest List
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <SeatingDashboard />
      </main>
    </div>
  );
}
