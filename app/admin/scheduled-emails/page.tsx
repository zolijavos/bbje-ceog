import ScheduledEmailsDashboard from './ScheduledEmailsDashboard';
import PageHeader from '../components/PageHeader';

export const metadata = {
  title: 'Scheduled Emails - Admin',
};

export default function ScheduledEmailsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Scheduled Emails"
        description="View and manage scheduled email deliveries"
        currentPath="/admin/scheduled-emails"
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ScheduledEmailsDashboard />
      </main>
    </div>
  );
}
