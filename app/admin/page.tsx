import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import Link from 'next/link';
import {
  CaretRight,
  Users,
  UploadSimple,
  CheckCircle,
  Chair,
  ChartBar,
  Question,
  EnvelopeSimple,
  UserPlus,
} from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="py-10">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="page-header">
          <h1 className="font-display text-3xl font-semibold text-neutral-800">
            Dashboard
          </h1>
          <p className="mt-2 text-neutral-500 font-sans">
            Welcome, {session?.user?.name}!
          </p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DashboardCard
                title="Guest List"
                description="Manage guests, send invitations"
                href="/admin/guests"
                Icon={Users}
              />
              <DashboardCard
                title="Applications"
                description="Review attendance applications"
                href="/admin/applicants"
                Icon={UserPlus}
              />
              <DashboardCard
                title="Table Seating"
                description="Manage seating arrangement"
                href="/admin/seating"
                Icon={Chair}
              />
              <DashboardCard
                title="Statistics"
                description="View event statistics and reports"
                href="/admin/statistics"
                Icon={ChartBar}
              />
              <DashboardCard
                title="CSV Import"
                description="Bulk guest import"
                href="/admin/guests/import"
                Icon={UploadSimple}
              />
              <DashboardCard
                title="Email Templates"
                description="Customize email content"
                href="/admin/email-templates"
                Icon={EnvelopeSimple}
              />
              <DashboardCard
                title="Check-in Log"
                description="Entry events"
                href="/admin/checkin-log"
                Icon={CheckCircle}
              />
              <DashboardCard
                title="Help & Guide"
                description="Admin user guide and FAQ"
                href="/admin/help"
                Icon={Question}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  Icon,
  disabled = false
}: {
  title: string;
  description: string;
  href: string;
  Icon: Icon;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`panel panel-hover overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon size={32} weight="duotone" className="text-gray-500" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="font-display text-lg font-medium text-neutral-800">
                {title}
              </dt>
              <dd className="mt-1 text-sm text-neutral-500 font-sans">{description}</dd>
            </dl>
          </div>
        </div>
      </div>
      {!disabled && (
        <div className="px-6 py-3 bg-neutral-50/50 border-t border-neutral-300/10">
          <span className="text-sm font-sans text-accent-teal font-medium flex items-center">
            Open
            <CaretRight size={16} weight="bold" className="ml-1" />
          </span>
        </div>
      )}
    </div>
  );

  if (disabled) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
