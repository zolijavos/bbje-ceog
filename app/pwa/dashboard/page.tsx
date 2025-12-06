'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EVENT_CONFIG,
  formatEventDate,
  formatEventTime,
  getDaysUntilEvent,
  isEventToday,
} from '@/lib/config/event';
import WelcomeModal from '../components/WelcomeModal';

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
        setError('Nem sikerült betölteni az adatokat');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // SSE connection for real-time check-in notifications
  useEffect(() => {
    // Only connect SSE on event day or close to it
    const daysUntil = getDaysUntilEvent();
    const SSE_ACTIVE_DAYS_BEFORE_EVENT = 7;
    if (daysUntil > SSE_ACTIVE_DAYS_BEFORE_EVENT) return;

    let reconnectTimeout: NodeJS.Timeout | null = null;
    const SSE_RECONNECT_DELAY_MS = 5000;

    const connectSSE = () => {
      if (eventSourceRef.current) return; // Already connected

      const eventSource = new EventSource('/api/pwa/events');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const eventData: CheckinEventData = JSON.parse(event.data);

          if (eventData.type === 'CHECKED_IN') {
            // Show welcome modal with table info (use event data, not stale state)
            setWelcomeData({
              guestName: eventData.guestName || 'Vendég',
              tableName: eventData.tableName || null,
              tableType: eventData.tableType || null,
              seatNumber: eventData.seatNumber || null,
            });
            setShowWelcomeModal(true);

            // Update table data in dashboard
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
        // Reconnect after delay on error
        eventSource.close();
        eventSourceRef.current = null;
        reconnectTimeout = setTimeout(connectSSE, SSE_RECONNECT_DELAY_MS);
      };
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []); // Empty deps - SSE connection is session-based, not data-dependent

  const handleLogout = async () => {
    await fetch('/api/pwa/auth', { method: 'DELETE' });
    router.replace('/pwa');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Hiba történt'}</p>
          <button
            onClick={() => router.replace('/pwa')}
            className="text-slate-600 underline"
          >
            Vissza a bejelentkezéshez
          </button>
        </div>
      </div>
    );
  }

  const getGuestTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return { text: 'VIP Vendég', color: 'bg-amber-100 text-amber-800' };
      case 'paid_single':
        return { text: 'Egyéni Jegy', color: 'bg-blue-100 text-blue-800' };
      case 'paid_paired':
        return { text: 'Páros Jegy', color: 'bg-purple-100 text-purple-800' };
      case 'applicant':
        return { text: 'Jelentkező', color: 'bg-green-100 text-green-800' };
      default:
        return { text: type, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const badge = getGuestTypeBadge(data.guest.guest_type);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Welcome Modal - shown after check-in */}
      {welcomeData && (
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={handleCloseWelcomeModal}
          guestName={welcomeData.guestName}
          tableName={welcomeData.tableName}
          tableType={welcomeData.tableType}
          seatNumber={welcomeData.seatNumber}
        />
      )}

      {/* Header */}
      <header className="bg-slate-800 text-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-playfair text-xl">CEO Gála 2025</h1>
          <button
            onClick={handleLogout}
            className="text-slate-300 text-sm hover:text-white"
          >
            Kijelentkezés
          </button>
        </div>
        <div>
          <p className="text-2xl font-medium">{data.guest.name}</p>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.text}
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* QR Ticket Card */}
        <Link href="/pwa/ticket" className="block">
          <div className="bg-white rounded-xl shadow-sm p-4 border-2 border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800 mb-1">🎫 Digitális Jegy</h2>
                <p className="text-sm text-slate-600">
                  {data.registration?.qr_code_hash
                    ? 'QR kód megtekintése'
                    : 'Jegy generálás folyamatban...'}
                </p>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </div>
        </Link>

        {/* Table Assignment Card */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-slate-800 mb-3">🪑 Asztalszám</h2>
          {data.table ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-800 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                {data.table.name.replace('Table ', '').replace('VIP-', '')}
              </div>
              <div>
                <p className="font-medium text-lg">{data.table.name}</p>
                <p className="text-sm text-slate-600">
                  {data.table.table_type === 'vip' ? 'VIP asztal' : 'Standard asztal'}
                  {data.table.seat_number && ` • Szék: ${data.table.seat_number}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm py-2">
              Asztal még nincs kiosztva
            </div>
          )}
        </div>

        {/* Profile Summary Card */}
        <Link href="/pwa/profile" className="block">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">📋 Adataim</h2>
              <span className="text-slate-400 text-sm">Szerkesztés →</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800">{data.guest.email}</span>
              </div>
              {data.guest.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Telefon:</span>
                  <span className="text-slate-800">{data.guest.phone}</span>
                </div>
              )}
              {data.guest.company && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Cég:</span>
                  <span className="text-slate-800">{data.guest.company}</span>
                </div>
              )}
              {data.dietary_requirements && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Diétás igény:</span>
                  <span className="text-slate-800">{data.dietary_requirements}</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Partner Card (if paired ticket) */}
        {data.registration?.partner_name && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-3">👫 Partner</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Név:</span>
                <span className="text-slate-800">{data.registration.partner_name}</span>
              </div>
              {data.registration.partner_email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800">{data.registration.partner_email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Info Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-sm p-4 text-white">
          <h2 className="font-semibold mb-3">📍 Esemény Információk</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatEventDate()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>{formatEventTime()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{EVENT_CONFIG.venue.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👔</span>
              <span>Dress code: {EVENT_CONFIG.dressCode}</span>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <DaysUntilEvent />
      </div>
    </div>
  );
}

function DaysUntilEvent() {
  const daysLeft = getDaysUntilEvent();

  if (isEventToday()) {
    return (
      <div className="bg-amber-100 rounded-xl p-4 text-center">
        <p className="text-amber-800 font-semibold text-lg">🎉 Ma van az esemény!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 rounded-xl p-4 text-center">
      <p className="text-slate-600 text-sm mb-1">Még</p>
      <p className="text-3xl font-bold text-slate-800">{daysLeft}</p>
      <p className="text-slate-600 text-sm">nap az eseményig</p>
    </div>
  );
}
