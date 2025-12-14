'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import {
  House,
  Users,
  Chair,
  ClipboardText,
  SignOut,
  ChartBar,
  Question,
  CaretDown,
  EnvelopeSimple,
  Clock,
  CurrencyDollar,
  Gear,
  UserCircle,
  Envelope,
} from '@phosphor-icons/react';
import AdminThemeToggle from './components/AdminThemeToggle';
import LanguageToggle from './components/LanguageToggle';

// Dropdown menu structure
const dropdownMenus = {
  event: {
    label: 'Event',
    items: [
      { href: '/admin/seating', label: 'Seating', icon: Chair },
      { href: '/admin/checkin-log', label: 'Check-in Log', icon: ClipboardText },
      { href: '/admin/statistics', label: 'Statistics', icon: ChartBar },
    ],
  },
  comms: {
    label: 'Comms',
    items: [
      { href: '/admin/email-templates', label: 'Email Templates', icon: EnvelopeSimple },
      { href: '/admin/scheduled-emails', label: 'Scheduled Emails', icon: Clock },
      { href: '/admin/payments', label: 'Payment History', icon: CurrencyDollar },
    ],
  },
  system: {
    label: 'System',
    items: [
      { href: '/admin/users', label: 'Users', icon: UserCircle },
      { href: '/admin/email-logs', label: 'Email Logs', icon: Envelope },
    ],
  },
};

// Paths that belong to each dropdown (for highlighting)
const eventPaths = ['/admin/seating', '/admin/checkin-log', '/admin/statistics'];
const commsPaths = ['/admin/email-templates', '/admin/scheduled-emails', '/admin/payments'];
const systemPaths = ['/admin/users', '/admin/email-logs'];

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isDropdownActive = (paths: string[]) => {
    return paths.some((path) => pathname.startsWith(path));
  };

  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <nav className="bg-neutral-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and nav links */}
          <div className="flex items-center gap-6" ref={dropdownRef}>
            <Link href="/admin" className="font-display text-xl font-semibold text-white">
              CEO Gala Admin
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Dashboard - always visible */}
              <Link
                href="/admin"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${pathname === '/admin'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <House size={18} weight={pathname === '/admin' ? 'fill' : 'regular'} />
                Dashboard
              </Link>

              {/* Guest List - always visible */}
              <Link
                href="/admin/guests"
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive('/admin/guests') || isActive('/admin/applicants')
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Users size={18} weight={isActive('/admin/guests') ? 'fill' : 'regular'} />
                Guests
              </Link>

              {/* Event Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('event')}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isDropdownActive(eventPaths)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Chair size={18} weight={isDropdownActive(eventPaths) ? 'fill' : 'regular'} />
                  Event
                  <CaretDown
                    size={14}
                    className={`transition-transform ${openDropdown === 'event' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openDropdown === 'event' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-neutral-700 rounded-lg shadow-lg py-1 z-50">
                    {dropdownMenus.event.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`
                            flex items-center gap-2 px-4 py-2 text-sm transition-colors
                            ${active
                              ? 'bg-white/10 text-white'
                              : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }
                          `}
                        >
                          <Icon size={16} weight={active ? 'fill' : 'regular'} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Comms Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('comms')}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isDropdownActive(commsPaths)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <EnvelopeSimple size={18} weight={isDropdownActive(commsPaths) ? 'fill' : 'regular'} />
                  Comms
                  <CaretDown
                    size={14}
                    className={`transition-transform ${openDropdown === 'comms' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openDropdown === 'comms' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-neutral-700 rounded-lg shadow-lg py-1 z-50">
                    {dropdownMenus.comms.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`
                            flex items-center gap-2 px-4 py-2 text-sm transition-colors
                            ${active
                              ? 'bg-white/10 text-white'
                              : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }
                          `}
                        >
                          <Icon size={16} weight={active ? 'fill' : 'regular'} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* System Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('system')}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isDropdownActive(systemPaths)
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Gear size={18} weight={isDropdownActive(systemPaths) ? 'fill' : 'regular'} />
                  System
                  <CaretDown
                    size={14}
                    className={`transition-transform ${openDropdown === 'system' ? 'rotate-180' : ''}`}
                  />
                </button>
                {openDropdown === 'system' && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-neutral-700 rounded-lg shadow-lg py-1 z-50">
                    {dropdownMenus.system.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`
                            flex items-center gap-2 px-4 py-2 text-sm transition-colors
                            ${active
                              ? 'bg-white/10 text-white'
                              : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }
                          `}
                        >
                          <Icon size={16} weight={active ? 'fill' : 'regular'} />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Theme, Help, User info, Logout */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <AdminThemeToggle />

            {/* Language toggle */}
            <LanguageToggle />

            {/* Help icon */}
            <Link
              href="/admin/help"
              className={`
                p-2 rounded-md transition-colors
                ${isActive('/admin/help')
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
              title="Help & Guide"
            >
              <Question size={20} weight={isActive('/admin/help') ? 'fill' : 'regular'} />
            </Link>

            {session?.user && (
              <span className="hidden lg:inline text-sm text-white/80 font-sans ml-2">
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
      </div>
    </nav>
  );
}
