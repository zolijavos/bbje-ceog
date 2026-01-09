'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { ArrowLeft, DownloadSimple, WifiSlash } from '@phosphor-icons/react';
import { EVENT_CONFIG, formatEventDate } from '@/lib/config/event';
import Card from '../components/ui/Card';
import Button3D from '../components/ui/Button3D';
import { SkeletonTicket } from '../components/ui/Skeleton';
import { useHaptic } from '../hooks/useHaptic';

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
  const { patterns } = useHaptic();
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
        // Try to get cached QR from localStorage first
        const cachedQR = localStorage.getItem('cached_qr_ticket');
        if (cachedQR) {
          const cached: CachedTicketData = JSON.parse(cachedQR);
          setQrDataUrl(cached.qrDataUrl);
          setData({
            guest: { id: 0, name: cached.guestName, guest_type: '' },
            registration: {
              id: cached.registrationId,
              ticket_type: cached.ticketType,
              qr_code_hash: null,
            },
            qrToken: null,
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
                dark: '#000D38',  // BBJ Events 2026 primary navy
                light: '#ffffff',
              },
            });
            setQrDataUrl(qrUrl);

            // Cache only the QR image and display data
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
          setError('Offline - No saved ticket');
        }
      } catch {
        const cachedQR = localStorage.getItem('cached_qr_ticket');
        if (cachedQR) {
          const cached: CachedTicketData = JSON.parse(cachedQR);
          setQrDataUrl(cached.qrDataUrl);
          setData({
            guest: { id: 0, name: cached.guestName, guest_type: '' },
            registration: {
              id: cached.registrationId,
              ticket_type: cached.ticketType,
              qr_code_hash: null,
            },
            qrToken: null,
          });
        } else {
          setError('Failed to load ticket');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [router]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    patterns.success();
    const link = document.createElement('a');
    link.download = `ceo-gala-2026-ticket-${data?.guest.name.replace(/\s+/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const getTicketTypeName = (type: string) => {
    switch (type) {
      case 'vip_free':
        return 'VIP Ticket';
      case 'paid_single':
        return 'Single Ticket';
      case 'paid_paired':
        return 'Paired Ticket';
      default:
        return 'Entry Ticket';
    }
  };

  if (loading) {
    return <SkeletonTicket />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pwa-bg-base">
        <div className="text-center">
          <p style={{ color: 'var(--color-error)' }} className="mb-4">
            {error}
          </p>
          <Link href="/pwa/dashboard" className="pwa-text-secondary underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header */}
      <header className="pwa-bg-header pwa-text-inverse px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/pwa/dashboard"
            className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="font-display text-xl pwa-text-inverse">Digital Ticket</h1>
        </div>
      </header>

      {/* Offline indicator */}
      {isOffline && (
        <div
          className="flex items-center justify-center gap-2 py-2 text-sm"
          style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}
        >
          <WifiSlash size={16} weight="bold" />
          Offline mode - Displaying saved ticket
        </div>
      )}

      {/* Ticket content */}
      <div className="p-4">
        <div className="card-static overflow-hidden max-w-sm mx-auto">
          {/* Ticket header */}
          <div className="pwa-bg-header p-4 text-center">
            <h2 className="font-display text-2xl mb-1 text-white">{EVENT_CONFIG.name}</h2>
            <p className="opacity-80 text-sm text-white">
              {formatEventDate()} - {EVENT_CONFIG.startTime}
            </p>
          </div>

          {/* QR Code section with shimmer */}
          <div className="p-6 text-center" style={{ background: 'var(--color-bg-card)' }}>
            {qrDataUrl ? (
              <>
                <div className="qr-container qr-glow qr-shimmer inline-block">
                  <img
                    src={qrDataUrl}
                    alt="QR Ticket"
                    className="w-64 h-64 mx-auto block"
                  />
                </div>
                <p className="mt-4 pwa-text-secondary text-sm">
                  Show this QR code at entry
                </p>
              </>
            ) : (
              <div
                className="p-8"
                style={{ background: 'var(--color-bg-elevated)' }}
              >
                <p className="pwa-text-tertiary">QR code generation in progress...</p>
                <p className="pwa-text-tertiary text-sm mt-2 opacity-70">
                  Your ticket will also arrive via email
                </p>
              </div>
            )}
          </div>

          {/* Ticket details */}
          <div
            className="p-4 border-t border-dashed"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="pwa-text-tertiary text-sm">Guest</span>
              <span className="font-medium pwa-text-primary">{data?.guest.name}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="pwa-text-tertiary text-sm">Ticket Type</span>
              <span className="font-medium pwa-text-primary">
                {data?.registration?.ticket_type
                  ? getTicketTypeName(data.registration.ticket_type)
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="pwa-text-tertiary text-sm">Registration</span>
              <span className="font-mono text-xs pwa-text-secondary">
                #{data?.registration?.id?.toString().padStart(6, '0')}
              </span>
            </div>
          </div>

          {/* Download button */}
          {qrDataUrl && (
            <div className="p-4" style={{ background: 'var(--color-bg-elevated)' }}>
              <Button3D
                onClick={handleDownload}
                fullWidth
                icon={<DownloadSimple size={20} weight="bold" />}
              >
                Download Ticket
              </Button3D>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center pwa-text-tertiary text-sm max-w-sm mx-auto">
          <p className="mb-2">
            <span className="inline-block mr-1">💡</span>
            Tip: The ticket is also available offline!
          </p>
          <p className="opacity-80">
            Visit this page with an internet connection, and the QR code will be
            automatically saved.
          </p>
          <p className="mt-4">
            <Link href="/pwa/help" className="pwa-text-accent hover:underline">
              Need help?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
