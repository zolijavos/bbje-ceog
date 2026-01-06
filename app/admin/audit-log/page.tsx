import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import PageHeader from '../components/PageHeader';
import AuditLogList from './AuditLogList';

export const metadata = {
  title: 'Audit Log | CEO Gala Admin',
  description: 'View admin activity log',
};

export default async function AuditLogPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Only admins can view audit logs
  if (session.user.role !== 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader
        title="Audit Log"
        description="Track all admin activities and changes"
        currentPath="/admin/audit-log"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <AuditLogList />
      </main>
    </div>
  );
}
