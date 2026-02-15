/**
 * Admin Statistics Dashboard
 *
 * Comprehensive overview of CEO Gala 2026 event metrics.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import StatisticsContent from './StatisticsContent';
import PageHeader from '../components/PageHeader';

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Event Statistics"
        description="Comprehensive overview of CEO Gala 2026"
        currentPath="/admin/statistics"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <StatisticsContent />
      </main>
    </div>
  );
}
