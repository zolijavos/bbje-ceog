/**
 * Admin Email Templates Page
 *
 * Allows administrators to view and edit email templates.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import EmailTemplatesDashboard from './EmailTemplatesDashboard';
import PageHeader from '../components/PageHeader';

export default async function EmailTemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader
        title="Email Templates"
        description="Customize email content sent to guests"
        currentPath="/admin/email-templates"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <EmailTemplatesDashboard />
      </main>
    </div>
  );
}
