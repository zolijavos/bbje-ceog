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
  TestTube,
  Globe,
  QrCode,
  List,
  X,
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
      { href: '/admin/diagrams', label: 'Test Hub', icon: TestTube },
    ],
  },
};

// Paths that belong to each dropdown (for highlighting)
const eventPaths = ['/admin/seating', '/admin/checkin-log', '/admin/statistics'];
const commsPaths = ['/admin/email-templates', '/admin/scheduled-emails', '/admin/payments'];
const systemPaths = ['/admin/users', '/admin/email-logs', '/admin/diagrams'];

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is admin (not staff)
  const isAdmin = session?.user?.role === 'admin';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
          <div className="flex items-center gap-2 md:gap-6" ref={dropdownRef}>
            {/* Mobile: Hamburger menu for admin */}
            {isAdmin && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
              </button>
            )}

            <Link href="/admin" className="font-display text-lg md:text-xl font-semibold text-white">
              CEO Gala Admin
            </Link>

            {/* Mobile: Staff primary buttons */}
            {!isAdmin && (
              <div className="flex md:hidden items-center gap-2 ml-2">
                <Link
                  href="/checkin"
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors
                    ${pathname.startsWith('/checkin')
                      ? 'bg-accent-teal text-white'
                      : 'text-white bg-accent-teal/30 hover:bg-accent-teal/50 border border-accent-teal/50'
                    }
                  `}
                >
                  <QrCode size={20} weight={pathname.startsWith('/checkin') ? 'fill' : 'bold'} />
                  Scanner
                </Link>
                <Link
                  href="/admin/checkin-log"
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors
                    ${isActive('/admin/checkin-log')
                      ? 'bg-accent-teal text-white'
                      : 'text-white bg-accent-teal/30 hover:bg-accent-teal/50 border border-accent-teal/50'
                    }
                  `}
                >
                  <ClipboardText size={20} weight={isActive('/admin/checkin-log') ? 'fill' : 'bold'} />
                  Log
                </Link>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Dashboard - admin only */}
              {isAdmin && (
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
              )}

              {/* Check-in Scanner - staff primary tool */}
              <Link
                href="/checkin"
                className={`
                  flex items-center gap-2 rounded-md font-medium transition-colors
                  ${!isAdmin
                    ? `px-4 py-2.5 text-base ${pathname.startsWith('/checkin')
                        ? 'bg-accent-teal text-white'
                        : 'text-white bg-accent-teal/20 hover:bg-accent-teal/40 border border-accent-teal/50'
                      }`
                    : `px-3 py-2 text-sm ${pathname.startsWith('/checkin')
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`
                  }
                `}
              >
                <QrCode size={!isAdmin ? 22 : 18} weight={pathname.startsWith('/checkin') ? 'fill' : 'regular'} />
                Scanner
              </Link>

              {/* Check-in Log - staff can access */}
              <Link
                href="/admin/checkin-log"
                className={`
                  flex items-center gap-2 rounded-md font-medium transition-colors
                  ${!isAdmin
                    ? `px-4 py-2.5 text-base ${isActive('/admin/checkin-log')
                        ? 'bg-accent-teal text-white'
                        : 'text-white bg-accent-teal/20 hover:bg-accent-teal/40 border border-accent-teal/50'
                      }`
                    : `px-3 py-2 text-sm ${isActive('/admin/checkin-log')
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`
                  }
                `}
              >
                <ClipboardText size={!isAdmin ? 22 : 18} weight={isActive('/admin/checkin-log') ? 'fill' : 'regular'} />
                Log
              </Link>

              {/* Guest List - admin only */}
              {isAdmin && (
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
              )}

              {/* Event Dropdown - admin only */}
              {isAdmin && (
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
              )}

              {/* Comms Dropdown - admin only */}
              {isAdmin && (
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
              )}

              {/* System Dropdown - admin only */}
              {isAdmin && (
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
              )}
            </div>
          </div>

          {/* Right side: Utilities */}
          <div className="flex items-center gap-1">
            {/* Utility icons group */}
            <div className="flex items-center border-r border-white/10 pr-2 mr-1">
              <AdminThemeToggle />
              <LanguageToggle />
            </div>

            {/* Navigation icons */}
            <Link
              href="/"
              className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="Public Site"
            >
              <Globe size={18} weight="duotone" />
            </Link>

            <Link
              href="/admin/help"
              className={`
                p-1.5 rounded-md transition-colors
                ${isActive('/admin/help')
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
              title="Help"
            >
              <Question size={18} weight={isActive('/admin/help') ? 'fill' : 'regular'} />
            </Link>

            {/* User role badge with name tooltip */}
            {session?.user && (
              <span
                className="hidden sm:inline-flex ml-1 px-2 py-1 bg-accent-teal/20 text-accent-teal text-xs rounded-full uppercase tracking-wider font-medium cursor-default"
                title={session.user.name || 'User'}
              >
                {session.user.role}
              </span>
            )}

            {/* Logout - icon only */}
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-1.5 rounded-md text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors ml-1"
              title="Logout"
            >
              <SignOut size={18} weight="regular" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel - Admin only */}
      {isAdmin && mobileMenuOpen && (
        <div className="md:hidden bg-neutral-700 border-t border-neutral-600">
          <div className="px-4 py-3 space-y-1">
            {/* Dashboard */}
            <Link
              href="/admin"
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors
                ${pathname === '/admin'
                  ? 'bg-accent-teal/20 text-accent-teal'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <House size={22} weight={pathname === '/admin' ? 'fill' : 'regular'} />
              Dashboard
            </Link>

            {/* Scanner */}
            <Link
              href="/checkin"
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors
                ${pathname.startsWith('/checkin')
                  ? 'bg-accent-teal/20 text-accent-teal'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <QrCode size={22} weight={pathname.startsWith('/checkin') ? 'fill' : 'regular'} />
              Scanner
            </Link>

            {/* Guests */}
            <Link
              href="/admin/guests"
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors
                ${isActive('/admin/guests')
                  ? 'bg-accent-teal/20 text-accent-teal'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Users size={22} weight={isActive('/admin/guests') ? 'fill' : 'regular'} />
              Guests
            </Link>

            {/* Divider */}
            <div className="border-t border-neutral-600 my-2" />

            {/* Event section */}
            <p className="px-3 py-1 text-xs font-semibold text-white/50 uppercase tracking-wider">Event</p>
            {dropdownMenus.event.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-accent-teal/20 text-accent-teal'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}

            {/* Comms section */}
            <p className="px-3 py-1 text-xs font-semibold text-white/50 uppercase tracking-wider mt-2">Comms</p>
            {dropdownMenus.comms.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-accent-teal/20 text-accent-teal'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}

            {/* System section */}
            <p className="px-3 py-1 text-xs font-semibold text-white/50 uppercase tracking-wider mt-2">System</p>
            {dropdownMenus.system.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'bg-accent-teal/20 text-accent-teal'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-neutral-600 my-2" />

            {/* Help section */}
            <p className="px-3 py-1 text-xs font-semibold text-white/50 uppercase tracking-wider">Help</p>
            <Link
              href="/admin/help#guest-list"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Users size={18} />
              Guest Management
            </Link>
            <Link
              href="/admin/help#seating"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Chair size={18} />
              Seating & Tables
            </Link>
            <Link
              href="/admin/help#checkin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <QrCode size={18} />
              Check-in
            </Link>
            <Link
              href="/admin/help#email-templates"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <EnvelopeSimple size={18} />
              Email & Comms
            </Link>
            <Link
              href="/admin/help"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent-teal hover:bg-accent-teal/10 transition-colors"
            >
              <Question size={18} weight="fill" />
              All Help Topics
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
