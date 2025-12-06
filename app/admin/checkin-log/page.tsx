/**
 * Admin Check-in Log Dashboard
 *
 * Displays check-in statistics and paginated log of all check-ins.
 * Story 3.4: Admin Check-in Log Dashboard
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import CheckinLogDashboard from './CheckinLogDashboard';

export default async function CheckinLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Beléptetési napló
            </h1>
            <a
              href="/admin/guests"
              className="text-blue-600 hover:text-blue-800"
            >
              &larr; Vissza a vendéglistához
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CheckinLogDashboard />
      </main>
    </div>
  );
}
