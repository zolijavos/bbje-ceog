'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  House,
  Users,
  Chair,
  ClipboardText,
  SignOut,
  ChartBar,
  Question,
} from '@phosphor-icons/react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: House },
  { href: '/admin/guests', label: 'Guest List', icon: Users },
  { href: '/admin/seating', label: 'Seating', icon: Chair },
  { href: '/admin/statistics', label: 'Statistics', icon: ChartBar },
  { href: '/admin/checkin-log', label: 'Check-in Log', icon: ClipboardText },
  { href: '/admin/help', label: 'Help', icon: Question },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-neutral-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and nav links */}
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-xl font-semibold text-white">
              CEO Gála Admin
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${active
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon size={18} weight={active ? 'fill' : 'regular'} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="hidden sm:inline text-sm text-white/80 font-sans">
                {session.user.name}
                <span className="ml-2 px-2 py-0.5 bg-accent-teal/20 text-accent-teal text-xs rounded-full uppercase tracking-wider">
                  {session.user.role}
                </span>
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Logout"
            >
              <SignOut size={18} weight="regular" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-3 flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors
                  ${active
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon size={16} weight={active ? 'fill' : 'regular'} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
