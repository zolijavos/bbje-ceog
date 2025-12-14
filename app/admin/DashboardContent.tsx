'use client';

import Link from 'next/link';
import {
  CaretRight,
  Users,
  UploadSimple,
  CheckCircle,
  Chair,
  ChartBar,
  EnvelopeSimple,
  UserPlus,
  Clock,
  CurrencyDollar,
  UsersThree,
  CalendarCheck,
  Chats,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DashboardContent({ userName }: { userName?: string }) {
  const { t } = useLanguage();

  const cardGroups = [
    {
      titleKey: 'guestManagement' as const,
      GroupIcon: UsersThree,
      cards: [
        { titleKey: 'guests' as const, descriptionKey: 'guestManagementDesc' as const, href: '/admin/guests', Icon: Users },
        { titleKey: 'applicants' as const, descriptionKey: 'applicationsDesc' as const, href: '/admin/applicants', Icon: UserPlus },
        { titleKey: 'importCSV' as const, descriptionKey: 'importCSVDesc' as const, href: '/admin/guests/import', Icon: UploadSimple },
      ],
    },
    {
      titleKey: 'event' as const,
      GroupIcon: CalendarCheck,
      cards: [
        { titleKey: 'seating' as const, descriptionKey: 'seatingArrangementDesc' as const, href: '/admin/seating', Icon: Chair },
        { titleKey: 'checkinLog' as const, descriptionKey: 'checkInDesc' as const, href: '/admin/checkin-log', Icon: CheckCircle },
        { titleKey: 'statistics' as const, descriptionKey: 'statisticsCardDesc' as const, href: '/admin/statistics', Icon: ChartBar },
      ],
    },
    {
      titleKey: 'comms' as const,
      GroupIcon: Chats,
      cards: [
        { titleKey: 'emailTemplates' as const, descriptionKey: 'emailTemplatesDesc' as const, href: '/admin/email-templates', Icon: EnvelopeSimple },
        { titleKey: 'scheduledEmails' as const, descriptionKey: 'scheduledEmailsDesc' as const, href: '/admin/scheduled-emails', Icon: Clock },
        { titleKey: 'payments' as const, descriptionKey: 'paymentsDesc' as const, href: '/admin/payments', Icon: CurrencyDollar },
      ],
    },
  ];

  return (
    <div className="py-10">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="page-header">
          <h1 className="font-display text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
            {t('dashboard')}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400 font-sans">
            {t('welcome')}, {userName}!
          </p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0 space-y-10">
            {cardGroups.map((group) => (
              <section key={group.titleKey}>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">
                  <group.GroupIcon size={24} weight="duotone" className="text-accent-teal" />
                  {t(group.titleKey)}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.cards.map((card) => (
                    <DashboardCard
                      key={card.href}
                      title={t(card.titleKey)}
                      description={t(card.descriptionKey)}
                      href={card.href}
                      Icon={card.Icon}
                      openLabel={t('open')}
                    />
                  ))}
                </div>
              </section>
            ))}
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
  openLabel,
  disabled = false
}: {
  title: string;
  description: string;
  href: string;
  Icon: Icon;
  openLabel: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`panel panel-hover overflow-hidden h-full flex flex-col ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="p-6 flex-1">
        <div className="flex items-center h-full">
          <div className="flex-shrink-0 w-14 h-14 bg-gray-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
            <Icon size={32} weight="duotone" className="text-gray-500 dark:text-neutral-300" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="font-display text-lg font-medium text-neutral-800 dark:text-neutral-100">
                {title}
              </dt>
              <dd className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 font-sans">{description}</dd>
            </dl>
          </div>
        </div>
      </div>
      {!disabled && (
        <div className="px-6 py-3 bg-neutral-50/50 dark:bg-neutral-700/50 border-t border-neutral-300/10 dark:border-neutral-600/30">
          <span className="text-sm font-sans text-accent-teal font-medium flex items-center">
            {openLabel}
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
