'use client';

import { useState } from 'react';
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
  Question,
  QrCode,
  Table,
  Envelope,
  DeviceMobile,
  Copy,
  Check,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Paths that staff can access
const staffAllowedPaths = ['/admin/checkin-log'];

export default function DashboardContent({ userName, userRole }: { userName?: string; userRole?: string }) {
  const { t, language } = useLanguage();
  const isAdmin = userRole === 'admin';

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
                  {group.cards.map((card) => {
                    // Staff can only access certain pages
                    const isDisabledForStaff = !isAdmin && !staffAllowedPaths.includes(card.href);
                    return (
                      <DashboardCard
                        key={card.href}
                        title={t(card.titleKey)}
                        description={t(card.descriptionKey)}
                        href={card.href}
                        Icon={card.Icon}
                        openLabel={t('open')}
                        disabled={isDisabledForStaff}
                      />
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Help Quick Links */}
            <section className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">
                <Question size={24} weight="duotone" className="text-accent-teal" />
                {t('help')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <HelpLink href="/admin/help#guest-list" icon={Users} label={language === 'hu' ? 'Vendégek' : 'Guests'} />
                <HelpLink href="/admin/help#csv-import" icon={UploadSimple} label={language === 'hu' ? 'CSV Import' : 'CSV Import'} />
                <HelpLink href="/admin/help#seating" icon={Chair} label={language === 'hu' ? 'Ültetés' : 'Seating'} />
                <HelpLink href="/admin/help#tables" icon={Table} label={language === 'hu' ? 'Asztalok' : 'Tables'} />
                <HelpLink href="/admin/help#checkin" icon={QrCode} label={language === 'hu' ? 'Check-in' : 'Check-in'} />
                <HelpLink href="/admin/help#statistics" icon={ChartBar} label={language === 'hu' ? 'Statisztika' : 'Statistics'} />
                <HelpLink href="/admin/help#email-templates" icon={EnvelopeSimple} label={language === 'hu' ? 'Email sablonok' : 'Email Templates'} />
                <HelpLink href="/admin/help#scheduled-emails" icon={Clock} label={language === 'hu' ? 'Ütemezett' : 'Scheduled'} />
                <HelpLink href="/admin/help#payments" icon={CurrencyDollar} label={language === 'hu' ? 'Fizetések' : 'Payments'} />
                <HelpLink href="/admin/help#email-logs" icon={Envelope} label={language === 'hu' ? 'Email logok' : 'Email Logs'} />
                <HelpLink href="/admin/help#applications" icon={UserPlus} label={language === 'hu' ? 'Jelentkezők' : 'Applicants'} />
                <Link
                  href="/admin/help"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20 transition-colors font-medium text-sm"
                >
                  <Question size={18} weight="fill" />
                  {language === 'hu' ? 'Összes' : 'All Topics'}
                </Link>
              </div>
            </section>

            {/* PWA Guest App Promotion */}
            <section className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">
                <DeviceMobile size={24} weight="duotone" className="text-accent-teal" />
                {language === 'hu' ? 'Vendég Alkalmazás' : 'Guest App'}
              </h2>
              <PWAPromoCard language={language} />
            </section>
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

function HelpLink({ href, icon: IconComponent, label }: { href: string; icon: Icon; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium text-sm"
    >
      <IconComponent size={18} weight="duotone" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function PWAPromoCard({ language }: { language: string }) {
  const [copied, setCopied] = useState(false);
  const pwaUrl = 'https://ceogala.mflevents.space/pwa';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pwaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pwaUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="panel p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Info Section */}
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
            {language === 'hu' ? 'CEO Gala Vendég App' : 'CEO Gala Guest App'}
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 font-sans">
            {language === 'hu'
              ? 'A vendégek letölthetik az alkalmazást, ahol offline is elérhetik a jegyüket, asztalinformációkat és esemény frissítéseket.'
              : 'Guests can download the app to access their ticket, table info, and event updates - even offline.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
              <Check size={14} weight="bold" /> iPhone
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
              <Check size={14} weight="bold" /> Android
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
              <Check size={14} weight="bold" /> Desktop
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
              <DeviceMobile size={14} weight="bold" /> Offline
            </span>
          </div>
        </div>

        {/* Link & Actions Section */}
        <div className="lg:w-80 flex flex-col gap-3">
          <div className="bg-neutral-100 dark:bg-neutral-700/50 rounded-lg p-3">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
              {language === 'hu' ? 'PWA Link (megosztható)' : 'PWA Link (shareable)'}
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-accent-teal font-mono truncate">
                {pwaUrl}
              </code>
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 p-2 rounded-md bg-white dark:bg-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-500 transition-colors shadow-sm"
                title={language === 'hu' ? 'Másolás' : 'Copy'}
              >
                {copied ? (
                  <Check size={18} weight="bold" className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-neutral-500 dark:text-neutral-300" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/pwa"
              target="_blank"
              className="flex-1 btn btn-primary text-center text-sm"
            >
              {language === 'hu' ? 'Megnyitás' : 'Open App'}
            </Link>
            <a
              href={`mailto:?subject=${encodeURIComponent('CEO Gala 2026 - Vendég App')}&body=${encodeURIComponent(`Töltsd le a CEO Gala vendég alkalmazást: ${pwaUrl}`)}`}
              className="flex-1 btn btn-secondary text-center text-sm"
            >
              {language === 'hu' ? 'Megosztás' : 'Share'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
