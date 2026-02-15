import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import ImportForm from './ImportForm';
import PageHeader from '../../components/PageHeader';

export default async function ImportPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader
        title="CSV Import"
        description="Import guests from CSV file"
        backHref="/admin/guests"
        backLabel="Guest List"
        currentPath="/admin/guests/import"
      />

      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Import guests from CSV file
          </h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              CSV Format
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              The CSV file must contain the following columns (phone, company, position are optional):
            </p>
            <div className="bg-white p-3 rounded border border-blue-200 font-mono text-xs">
              <div className="text-gray-500 mb-1">email,name,guest_type,phone,company,position</div>
              <div>john.smith@example.com,John Smith,vip,+36 30 123 4567,Acme Corp,CEO</div>
              <div>jane.doe@example.com,Jane Doe,paying_single,+36 20 987 6543,Tech Ltd,CTO</div>
              <div>bob.wilson@example.com,Bob Wilson,paying_paired,+36 70 555 1234,Global Inc,CFO</div>
            </div>
            <p className="text-sm text-blue-700 mt-3">
              <strong>guest_type values:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside ml-2">
              <li>
                <code className="bg-blue-100 px-1 rounded">vip</code> - VIP
                guest (free entry)
              </li>
              <li>
                <code className="bg-blue-100 px-1 rounded">paying_single</code>{' '}
                - Paying guest (single ticket)
              </li>
              <li>
                <code className="bg-blue-100 px-1 rounded">paying_paired</code>{' '}
                - Paying guest (paired ticket)
              </li>
            </ul>
          </div>

          <ImportForm />

          <div className="mt-6 text-sm text-gray-500">
            <p>
              <strong>Notes:</strong>
            </p>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
              <li>Maximum 10,000 rows can be imported at once</li>
              <li>Maximum file size: 5MB</li>
              <li>Duplicate email addresses will be skipped</li>
              <li>Invalid rows will be flagged during import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
