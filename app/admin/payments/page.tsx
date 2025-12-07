/**
 * Admin Payments Dashboard
 *
 * Displays payment history with statistics, filtering, and pagination.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import PaymentsDashboard from './PaymentsDashboard';
import PageHeader from '../components/PageHeader';

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Payment History"
        description="View payments and revenue"
        currentPath="/admin/payments"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <PaymentsDashboard />
      </main>
    </div>
  );
}
