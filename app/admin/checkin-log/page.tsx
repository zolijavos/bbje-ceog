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
import PageHeader from '../components/PageHeader';

export default async function CheckinLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Check-in Log"
        description="Entry events and check-in history"
        currentPath="/admin/checkin-log"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <CheckinLogDashboard />
      </main>
    </div>
  );
}
