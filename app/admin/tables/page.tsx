/**
 * Admin Tables Dashboard
 *
 * Table CRUD operations and overview.
 * Story 4.1: Table CRUD Operations
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Link from 'next/link';
import TablesDashboard from './TablesDashboard';
import { MapTrifold } from '@phosphor-icons/react/dist/ssr';
import PageHeader from '../components/PageHeader';

export default async function TablesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Table Management"
        description="Create and manage event tables"
        backHref="/admin/seating"
        backLabel="Seating"
        currentPath="/admin/tables"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 mb-4 justify-end">
          <Link
            href="/admin/seating"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <MapTrifold size={18} weight="duotone" className="mr-2" />
            Seating Map
          </Link>
        </div>
        <TablesDashboard />
      </main>
    </div>
  );
}
