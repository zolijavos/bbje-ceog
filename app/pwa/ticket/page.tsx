'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { EVENT_CONFIG, formatEventDate } from '@/lib/config/event';

// Only store minimal display data, NOT the JWT token
interface CachedTicketData {
  guestName: string;
  ticketType: string;
  registrationId: number;
  qrDataUrl: string;
  cachedAt: number;
}

interface TicketData {
  guest: {
    id: number;
    name: string;
    guest_type: string;
  };
  registration: {
    id: number;
    ticket_type: string;
    qr_code_hash: string | null;
  } | null;
  qrToken: string | null;
}

export default function PWATicketPage() {
  const router = useRouter();
  const [data, setData] = useState<TicketData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Try to get cached QR from localStorage first (only stores QR image, not token)
        const cachedQR = localStorage.getItem('cached_qr_ticket');
        if (cachedQR) {
          const cached: CachedTicketData = JSON.parse(cachedQR);
          setQrDataUrl(cached.qrDataUrl);
          // Reconstruct minimal data for display
          setData({
            guest: { id: 0, name: cached.guestName, guest_type: '' },
            registration: { id: cached.registrationId, ticket_type: cached.ticketType, qr_code_hash: null },
            qrToken: null, // Never store the token in localStorage
          });
        }

        // If online, fetch fresh data
        if (navigator.onLine) {
          const res = await fetch('/api/pwa/ticket');

          if (res.status === 401) {
            router.replace('/pwa');
            return;
          }

          if (!res.ok) {
            throw new Error('Failed to fetch ticket');
          }

          const json: TicketData = await res.json();
          setData(json);

          // Generate QR code if we have a token
          if (json.qrToken) {
            const qrUrl = await QRCode.toDataURL(json.qrToken, {
              width: 300,
              margin: 2,
              color: {
                dark: '#1e293b',
                light: '#ffffff',
              },
            });
            setQrDataUrl(qrUrl);

            // Cache only the QR image and display data (NOT the JWT token)
            const cacheData: CachedTicketData = {
              guestName: json.guest.name,
              ticketType: json.registration?.ticket_type || '',
              registrationId: json.registration?.id || 0,
              qrDataUrl: qrUrl,
              cachedAt: Date.now(),
            };
            localStorage.setItem('cached_qr_ticket', JSON.stringify(cacheData));
          }
        } else if (!cachedQR) {
          setError('Offline - Nincs mentett jegy');
        }
      } catch {
        // If offline and we have cache, use it
        const cachedQR = localStorage.getItem('cached_qr_ticket');
        if (cachedQR) {
          const cached: CachedTicketData = JSON.parse(cachedQR);
          setQrDataUrl(cached.qrDataUrl);
          setData({
            guest: { id: 0, name: cached.guestName, guest_type: '' },
            registration: { id: cached.registrationId, ticket_type: cached.ticketType, qr_code_hash: null },
            qrToken: null,
          });
        } else {
          setError('Nem sikerült betölteni a jegyet');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [router]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `ceo-gala-2026-ticket-${data?.guest.name.replace(/\s+/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const getTicketTypeName = (type: string) => {
    switch (type) {
      case 'vip_free':
        return 'VIP Jegy';
      case 'paid_single':
        return 'Egyéni Jegy';
      case 'paid_paired':
        return 'Páros Jegy';
      default:
        return 'Belépőjegy';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Jegy betöltése...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/pwa/dashboard"
            className="text-slate-600 underline"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-slate-800 text-white px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/pwa/dashboard" className="text-slate-300 hover:text-white">
            ← Vissza
          </Link>
          <h1 className="font-playfair text-xl">Digitális Jegy</h1>
        </div>
      </header>

      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 text-sm">
          📡 Offline mód - Mentett jegy megjelenítése
        </div>
      )}

      {/* Ticket content */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm mx-auto">
          {/* Ticket header */}
          <div className="bg-slate-800 text-white p-4 text-center">
            <h2 className="font-playfair text-2xl mb-1">{EVENT_CONFIG.name}</h2>
            <p className="text-slate-300 text-sm">{formatEventDate()} • {EVENT_CONFIG.startTime}</p>
          </div>

          {/* QR Code section */}
          <div className="p-6 text-center">
            {qrDataUrl ? (
              <>
                <div className="bg-white p-4 rounded-xl inline-block shadow-inner border-2 border-slate-100">
                  <img
                    src={qrDataUrl}
                    alt="QR Ticket"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="mt-4 text-slate-600 text-sm">
                  Mutasd fel ezt a QR kódot a belépéskor
                </p>
              </>
            ) : (
              <div className="bg-slate-100 rounded-xl p-8">
                <p className="text-slate-500">
                  QR kód generálása folyamatban...
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  A jegyed email-ben is megérkezik
                </p>
              </div>
            )}
          </div>

          {/* Ticket details */}
          <div className="border-t border-dashed border-slate-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-500 text-sm">Vendég</span>
              <span className="font-medium text-slate-800">{data?.guest.name}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-500 text-sm">Jegy típus</span>
              <span className="font-medium text-slate-800">
                {data?.registration?.ticket_type
                  ? getTicketTypeName(data.registration.ticket_type)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Regisztráció</span>
              <span className="font-mono text-xs text-slate-600">
                #{data?.registration?.id?.toString().padStart(6, '0')}
              </span>
            </div>
          </div>

          {/* Download button */}
          {qrDataUrl && (
            <div className="p-4 bg-slate-50">
              <button
                onClick={handleDownload}
                className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>📥</span>
                Jegy letöltése
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-slate-500 text-sm max-w-sm mx-auto">
          <p className="mb-2">💡 Tipp: A jegy offline is elérhető!</p>
          <p>
            Látogasd meg ezt az oldalt internet kapcsolattal,
            és a QR kód automatikusan mentésre kerül.
          </p>
        </div>
      </div>
    </div>
  );
}
