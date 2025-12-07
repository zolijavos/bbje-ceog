import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ApplicantList from './ApplicantList';
import { UserPlus } from '@phosphor-icons/react/dist/ssr';
import PageHeader from '../components/PageHeader';

export default async function ApplicantsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch applicants (guests with pending_approval or rejected status)
  const applicants = await prisma.guest.findMany({
    where: {
      guest_type: 'applicant',
    },
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
      phone: true,
      company: true,
      position: true,
      dietary_requirements: true,
      seating_preferences: true,
      registration_status: true,
      rejection_reason: true,
      applied_at: true,
      created_at: true,
    },
    orderBy: [
      { registration_status: 'asc' }, // pending_approval first
      { applied_at: 'desc' },
    ],
  });

  // Transform for client component
  const applicantData = applicants.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    title: a.title,
    phone: a.phone,
    company: a.company,
    position: a.position,
    dietaryRequirements: a.dietary_requirements,
    seatingPreferences: a.seating_preferences,
    status: a.registration_status,
    rejectionReason: a.rejection_reason,
    appliedAt: a.applied_at?.toISOString() || a.created_at.toISOString(),
  }));

  // Count pending
  const pendingCount = applicantData.filter((a) => a.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <PageHeader
        title="Applications"
        description="Review attendance applications"
        currentPath="/admin/applicants"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats bar */}
        <div className="flex items-center justify-end gap-4 mb-6">
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              {pendingCount} pending review
            </span>
          )}
          <span className="text-sm text-gray-500" data-testid="applicant-count">
            {applicantData.length} total applications
          </span>
        </div>
        {applicantData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-500 mb-4">
              When guests apply to attend through the public application form, they will appear here for review.
            </p>
            <p className="text-sm text-gray-400">
              Public application URL: <code className="bg-gray-100 px-2 py-1 rounded">/apply</code>
            </p>
          </div>
        ) : (
          <ApplicantList applicants={applicantData} />
        )}
      </main>
    </div>
  );
}
