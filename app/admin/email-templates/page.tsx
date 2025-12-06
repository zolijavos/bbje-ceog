/**
 * Admin Email Templates Page
 *
 * Allows administrators to view and edit email templates.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Link from 'next/link';
import EmailTemplatesDashboard from './EmailTemplatesDashboard';

export default async function EmailTemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Email Templates
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Customize email content sent to guests
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <EmailTemplatesDashboard />
      </main>
    </div>
  );
}
