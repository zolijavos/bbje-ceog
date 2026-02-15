'use client';

import Link from 'next/link';
import { ArrowLeft, Question } from '@phosphor-icons/react';

// Help anchor mapping for each admin page
const helpAnchors: Record<string, string> = {
  '/admin/guests': 'guest-list',
  '/admin/guests/import': 'csv-import',
  '/admin/applicants': 'applications',
  '/admin/seating': 'seating',
  '/admin/tables': 'tables',
  '/admin/checkin-log': 'checkin',
  '/admin/statistics': 'statistics',
  '/admin/email-templates': 'email-templates',
  '/admin/scheduled-emails': 'scheduled-emails',
  '/admin/payments': 'payments',
};

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  currentPath: string;
}

export default function PageHeader({
  title,
  description,
  backHref = '/admin',
  backLabel = 'Dashboard',
  currentPath,
}: PageHeaderProps) {
  const helpAnchor = helpAnchors[currentPath] || '';
  const helpLink = helpAnchor ? `/admin/help#${helpAnchor}` : '/admin/help';

  return (
    <header className="bg-white dark:bg-neutral-800 shadow dark:shadow-neutral-900/50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left side: Back button + Title */}
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Help link */}
          <Link
            href={helpLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
            title="Help for this page"
          >
            <Question size={18} weight="duotone" />
            <span className="hidden sm:inline">Help</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
