'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  Chair,
  ClipboardText,
  Users,
  MapPin,
  CalendarBlank,
  Clock,
  TShirt,
  Sparkle,
  ArrowRight,
  SignOut,
  NavigationArrow,
  CalendarPlus,
  GoogleLogo,
  AppleLogo,
  MicrosoftOutlookLogo,
  Question,
} from '@phosphor-icons/react';
import {
  EVENT_CONFIG,
  formatEventDate,
  formatEventTime,
  getDaysUntilEvent,
  isEventToday,
} from '@/lib/config/event';
import WelcomeModal from '../components/WelcomeModal';
import ThemeToggle from '../components/ui/ThemeToggle';
import Card, { CardHeader } from '../components/ui/Card';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import FlipClock, { SimpleCountdown } from '../components/ui/FlipClock';
import Button3D from '../components/ui/Button3D';
import { CalendarBottomSheet } from '../components/ui/BottomSheet';
import { useHaptic } from '../hooks/useHaptic';
import { addToCalendar } from '../utils/calendar';

interface CheckinEventData {
  type: 'CHECKED_IN' | 'CONNECTED' | 'HEARTBEAT';
  guestId?: number;
  guestName?: string;
  tableName?: string | null;
  tableType?: string | null;
  seatNumber?: number | null;
  checkedInAt?: string;
}

interface GuestData {
  id: number;
  email: string;
  name: string;
  guest_type: string;
  phone: string | null;
  company: string | null;
  position: string | null;
}

interface RegistrationData {
  id: number;
  ticket_type: string;
  status: string;
  qr_code_hash: string | null;
  partner_name: string | null;
  partner_email: string | null;
}

interface TableData {
  id: number;
  name: string;
  table_type: string;
  seat_number: number | null;
}

interface DashboardData {
  guest: GuestData;
  registration: RegistrationData | null;
  table: TableData | null;
  dietary_requirements: string | null;
  seating_preferences: string | null;
}

export default function PWADashboardPage() {
  const router = useRouter();
  const { patterns } = useHaptic();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    guestName: string;
    tableName: string | null;
    tableType: string | null;
    seatNumber: number | null;
  } | null>(null);

  // Calendar bottom sheet state
  const [showCalendarSheet, setShowCalendarSheet] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pwa/profile');

        if (res.status === 401) {
          router.replace('/pwa');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // SSE connection for real-time check-in notifications
  useEffect(() => {
    const daysUntil = getDaysUntilEvent();
    const SSE_ACTIVE_DAYS_BEFORE_EVENT = 7;
    if (daysUntil > SSE_ACTIVE_DAYS_BEFORE_EVENT) return;

    let reconnectTimeout: NodeJS.Timeout | null = null;
    const SSE_RECONNECT_DELAY_MS = 5000;

    const connectSSE = () => {
      if (eventSourceRef.current) return;

      const eventSource = new EventSource('/api/pwa/events');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const eventData: CheckinEventData = JSON.parse(event.data);

          if (eventData.type === 'CHECKED_IN') {
            patterns.success();
            setWelcomeData({
              guestName: eventData.guestName || 'Guest',
              tableName: eventData.tableName || null,
              tableType: eventData.tableType || null,
              seatNumber: eventData.seatNumber || null,
            });
            setShowWelcomeModal(true);

            if (eventData.tableName) {
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      table: {
                        id: 0,
                        name: eventData.tableName!,
                        table_type: eventData.tableType || 'standard',
                        seat_number: eventData.seatNumber || null,
                      },
                    }
                  : prev
              );
            }
          }
        } catch (e) {
          console.error('[PWA] Failed to parse SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        reconnectTimeout = setTimeout(connectSSE, SSE_RECONNECT_DELAY_MS);
      };
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [patterns]);

  const handleLogout = async () => {
    patterns.medium();
    await fetch('/api/pwa/auth', { method: 'DELETE' });
    router.replace('/pwa');
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pwa-bg-base">
        <div className="text-center">
          <p style={{ color: 'var(--color-error)' }} className="mb-4">
            {error || 'An error occurred'}
          </p>
          <button
            onClick={() => router.replace('/pwa')}
            className="pwa-text-secondary underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  const getGuestTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return { text: 'VIP Guest', bg: 'rgba(217, 119, 6, 0.15)', color: '#D97706' };
      case 'paid_single':
        return { text: 'Single Ticket', bg: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' };
      case 'paid_paired':
        return { text: 'Paired Ticket', bg: 'rgba(147, 51, 234, 0.15)', color: '#9333EA' };
      case 'applicant':
        return { text: 'Applicant', bg: 'rgba(5, 150, 105, 0.15)', color: '#059669' };
      default:
        return { text: type, bg: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' };
    }
  };

  const badge = getGuestTypeBadge(data.guest.guest_type);

  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Welcome Modal */}
      {welcomeData && (
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          guestName={welcomeData.guestName}
          tableName={welcomeData.tableName}
          tableType={welcomeData.tableType}
          seatNumber={welcomeData.seatNumber}
        />
      )}

      {/* Header */}
      <header className="pwa-bg-header px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl pwa-text-inverse">CEO Gala 2026</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 text-sm"
            >
              <SignOut size={16} />
              Sign out
            </button>
          </div>
        </div>
        <div>
          <p className="text-2xl font-medium pwa-text-inverse">{data.guest.name}</p>
          <span
            className="inline-block mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.text}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* QR Ticket Card - Primary action */}
        <Link href="/pwa/ticket" className="block">
          <Card
            variant="float"
            className="border-2"
            style={{ borderColor: 'var(--color-accent)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardHeader
                  title="Digital Ticket"
                  icon={<Ticket size={20} weight="fill" style={{ color: 'var(--color-accent)' }} />}
                />
                <p className="pwa-text-secondary text-sm -mt-2">
                  {data.registration?.qr_code_hash
                    ? 'View QR code'
                    : 'Ticket generation in progress...'}
                </p>
              </div>
              <ArrowRight size={28} className="pwa-text-tertiary" />
            </div>
          </Card>
        </Link>

        {/* Table Assignment Card */}
        <Card variant="static">
          <CardHeader title="Table Number" icon={<Chair size={20} weight="fill" />} />
          {data.table ? (
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg"
                style={{
                  background: 'var(--color-btn-primary-bg)',
                  color: 'var(--color-btn-primary-text)',
                }}
              >
                {/* Extract just the number from table name */}
                {data.table.name.match(/\d+/)?.[0] || '#'}
              </div>
              <div>
                <p className="font-medium text-lg pwa-text-primary">{data.table.name}</p>
                <p className="text-sm pwa-text-secondary">
                  {data.table.table_type === 'vip' ? 'VIP table' : 'Standard table'}
                  {data.table.seat_number && ` • Seat ${data.table.seat_number}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="pwa-text-tertiary text-sm py-2">Table not yet assigned</div>
          )}
        </Card>

        {/* Profile Summary Card */}
        <Link href="/pwa/profile" className="block">
          <Card variant="float">
            <CardHeader
              title="My Details"
              icon={<ClipboardText size={20} weight="fill" />}
              action={<span className="flex items-center gap-1">Edit <ArrowRight size={14} /></span>}
            />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="pwa-text-tertiary">Email:</span>
                <span className="pwa-text-primary">{data.guest.email}</span>
              </div>
              {data.guest.phone && (
                <div className="flex justify-between">
                  <span className="pwa-text-tertiary">Phone:</span>
                  <span className="pwa-text-primary">{data.guest.phone}</span>
                </div>
              )}
              {data.guest.company && (
                <div className="flex justify-between">
                  <span className="pwa-text-tertiary">Company:</span>
                  <span className="pwa-text-primary">{data.guest.company}</span>
                </div>
              )}
              {data.dietary_requirements && (
                <div className="flex justify-between">
                  <span className="pwa-text-tertiary">Dietary:</span>
                  <span className="pwa-text-primary">{data.dietary_requirements}</span>
                </div>
              )}
            </div>
          </Card>
        </Link>

        {/* Partner Card (if paired ticket) */}
        {data.registration?.partner_name && (
          <Card variant="static">
            <CardHeader title="Partner" icon={<Users size={20} weight="fill" />} />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="pwa-text-tertiary">Name:</span>
                <span className="pwa-text-primary">{data.registration.partner_name}</span>
              </div>
              {data.registration.partner_email && (
                <div className="flex justify-between">
                  <span className="pwa-text-tertiary">Email:</span>
                  <span className="pwa-text-primary">{data.registration.partner_email}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Venue Card */}
        <Card variant="static">
          <CardHeader title="Venue" icon={<MapPin size={20} weight="fill" />} />
          <div className="space-y-3">
            <div>
              <p className="font-medium pwa-text-primary">{EVENT_CONFIG.venue.name}</p>
              <p className="text-sm pwa-text-secondary">{EVENT_CONFIG.venue.address}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  EVENT_CONFIG.venue.name + ' ' + EVENT_CONFIG.venue.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button3D variant="accent" fullWidth icon={<MapPin size={18} />}>
                  Map
                </Button3D>
              </a>
              <a
                href={`https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  EVENT_CONFIG.venue.name + ' ' + EVENT_CONFIG.venue.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button3D variant="accent" fullWidth icon={<NavigationArrow size={18} />}>
                  Directions
                </Button3D>
              </a>
            </div>
          </div>
        </Card>

        {/* Event Info Card - Uses explicit white text for contrast */}
        <Card
          variant="elevated"
          className="relative overflow-hidden event-info-card"
          style={{ background: '#1F2937' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarBlank size={20} weight="fill" className="text-white" />
            <h3 className="font-semibold text-white">Event Information</h3>
          </div>
          <div className="space-y-2.5 text-sm mb-4">
            <div className="flex items-center gap-2 text-gray-100">
              <CalendarBlank size={16} weight="fill" />
              <span>{formatEventDate()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-100">
              <Clock size={16} weight="fill" />
              <span>{formatEventTime()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-100">
              <TShirt size={16} weight="fill" />
              <span>Dress code: {EVENT_CONFIG.dressCode}</span>
            </div>
          </div>

          {/* Add to Calendar Button */}
          <button
            onClick={() => {
              patterns.light();
              setShowCalendarSheet(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all rounded-md bg-white/15 text-white border border-white/20 hover:bg-white/25"
          >
            <CalendarPlus size={18} weight="bold" />
            Add to Calendar
          </button>
        </Card>

        {/* Calendar Bottom Sheet */}
        <CalendarBottomSheet
          isOpen={showCalendarSheet}
          onClose={() => setShowCalendarSheet(false)}
          options={[
            {
              label: 'Google Calendar',
              icon: <GoogleLogo size={24} weight="fill" style={{ color: '#4285F4' }} />,
              onClick: () => {
                patterns.medium();
                addToCalendar('google');
              },
            },
            {
              label: 'Apple Calendar',
              icon: <AppleLogo size={24} weight="fill" className="pwa-text-primary" />,
              onClick: () => {
                patterns.medium();
                addToCalendar('apple');
              },
            },
            {
              label: 'Outlook',
              icon: <MicrosoftOutlookLogo size={24} weight="fill" style={{ color: '#0078D4' }} />,
              onClick: () => {
                patterns.medium();
                addToCalendar('outlook');
              },
            },
          ]}
        />

        {/* Countdown */}
        <CountdownSection />

        {/* Help Link */}
        <Link href="/pwa/help" className="block mt-4">
          <Card variant="float" className="text-center">
            <div className="flex items-center justify-center gap-2 pwa-text-secondary">
              <Question size={18} weight="fill" style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm font-medium">Need help? View FAQ</span>
              <ArrowRight size={14} />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function CountdownSection() {
  const daysLeft = getDaysUntilEvent();
  const eventDate = new Date(EVENT_CONFIG.date + 'T' + EVENT_CONFIG.startTime);

  if (isEventToday()) {
    return (
      <Card
        variant="static"
        className="text-center"
        style={{ background: 'var(--color-warning-bg)' }}
      >
        <p
          className="font-semibold text-lg flex items-center justify-center gap-2"
          style={{ color: 'var(--color-warning)' }}
        >
          <Sparkle size={24} weight="fill" />
          The event is today!
        </p>
      </Card>
    );
  }

  // Use FlipClock for last 7 days, simple countdown otherwise
  if (daysLeft <= 7) {
    return (
      <Card variant="static" padding="lg">
        <p className="pwa-text-secondary text-sm text-center mb-4">Countdown to the event</p>
        <FlipClock targetDate={eventDate} />
      </Card>
    );
  }

  return (
    <Card variant="static" padding="lg">
      <SimpleCountdown targetDate={eventDate} />
    </Card>
  );
}
