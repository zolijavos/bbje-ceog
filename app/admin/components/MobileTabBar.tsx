'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  House,
  Users,
  Chair,
  ChartBar,
  DotsThree,
  X,
  ClipboardText,
  EnvelopeSimple,
  Clock,
  CurrencyDollar,
  UserPlus,
  Question,
} from '@phosphor-icons/react';

const mainTabs = [
  { href: '/admin', label: 'Home', icon: House },
  { href: '/admin/guests', label: 'Guests', icon: Users },
  { href: '/admin/seating', label: 'Seating', icon: Chair },
  { href: '/admin/statistics', label: 'Stats', icon: ChartBar },
];

const moreItems = [
  { href: '/admin/applicants', label: 'Applications', icon: UserPlus },
  { href: '/admin/checkin-log', label: 'Check-in Log', icon: ClipboardText },
  { href: '/admin/email-templates', label: 'Email Templates', icon: EnvelopeSimple },
  { href: '/admin/scheduled-emails', label: 'Scheduled Emails', icon: Clock },
  { href: '/admin/payments', label: 'Payments', icon: CurrencyDollar },
  { href: '/admin/help', label: 'Help', icon: Question },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  // Check if current path is in "more" menu
  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {/* More Menu Overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More Menu Slide-up */}
      {moreOpen && (
        <div className="fixed bottom-14 left-0 right-0 bg-white dark:bg-neutral-800 rounded-t-2xl shadow-lg z-50 md:hidden animate-slide-up">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">More</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                <X size={20} className="text-gray-500 dark:text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      active
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                        : 'hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300'
                    }`}
                  >
                    <Icon size={24} weight={active ? 'fill' : 'regular'} />
                    <span className="text-xs font-medium text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 z-40 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-neutral-400'
                }`}
              >
                <Icon size={22} weight={active ? 'fill' : 'regular'} />
                <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              moreOpen || isMoreActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-neutral-400'
            }`}
          >
            <DotsThree size={22} weight={moreOpen || isMoreActive ? 'fill' : 'regular'} />
            <span className="text-[10px] font-medium mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Spacer for fixed bottom nav + footer */}
      <div className="h-20 md:hidden" />

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </>
  );
}
