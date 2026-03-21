'use client';

/**
 * Check-in Scanner Component
 *
 * Mobile-optimized QR code scanner with result display cards
 * Story 3.2: Mobile QR Scanner Interface
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Html5Qrcode } from 'html5-qrcode';
import { TICKET_TYPE_LABELS } from '@/lib/constants';
import { logError } from '@/lib/utils/logger';

// PWA Install Event type
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Validation result from API
interface ValidationResult {
  valid: boolean;
  error?: string;
  guest?: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    ticketType: string;
    partnerName: string | null;
    partnerFirstName: string | null;
    partnerLastName: string | null;
    title: string | null;
    dietaryRequirements: string | null;
    isVipReception: boolean;
    tableName: string | null;
  };
  registration?: {
    id: number;
  };
  alreadyCheckedIn: boolean;
  previousCheckin?: {
    checkedInAt: string;
    staffName: string | null;
  };
}

export default function CheckinScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [guestDetails, setGuestDetails] = useState<{
    title: string | null;
    dietaryRequirements: string | null;
    tableName: string | null;
    guestType: string;
    isVipReception: boolean;
    guestName: string;
  } | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Listen for PWA install prompt
  useEffect(() => {
    isMountedRef.current = true;

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (isMountedRef.current) {
        setInstallPrompt(e as BeforeInstallPromptEvent);
      }
    };

    const handleAppInstalled = () => {
      if (isMountedRef.current) {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle install button click
  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setInstallPrompt(null);
      }
    } catch (error) {
      logError('Install prompt error:', error);
    }
  };

  // Start scanner
  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          // Stop scanning while processing
          await scanner.stop();
          setScanning(false);

          // Validate the QR code
          try {
            const response = await fetch('/api/checkin/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ qrToken: decodedText }),
            });
            const data = await response.json();
            // Map API response fields to frontend interface
            if (data.guest) {
              data.guest.name = `${data.guest.firstName || ''} ${data.guest.lastName || ''}`.trim();
              if (data.guest.partnerFirstName || data.guest.partnerLastName) {
                data.guest.partnerName = `${data.guest.partnerFirstName || ''} ${data.guest.partnerLastName || ''}`.trim();
              }
            }
            setResult(data as ValidationResult);
            setCheckInSuccess(false);
            setSubmitError(null);
          } catch (error) {
            setResult({
              valid: false,
              error: 'NETWORK_ERROR',
              alreadyCheckedIn: false,
            });
          }
        },
        () => {
          // QR code not found in frame - ignore
        }
      );

      setScanning(true);
    } catch (error) {
      logError('Scanner start error:', error);
      setScanning(false);
    }
  }, []);

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  // Reset and scan again
  const scanAgain = useCallback(async () => {
    setResult(null);
    setCheckInSuccess(false);
    setSubmitError(null);
    setGuestDetails(null);
    await startScanner();
  }, [startScanner]);

  // Submit check-in
  const submitCheckin = useCallback(
    async (override: boolean = false) => {
      if (!result?.registration?.id) return;

      setSubmitting(true);
      setSubmitError(null);

      try {
        const response = await fetch('/api/checkin/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: result.registration.id,
            override,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setCheckInSuccess(true);
          if (data.guestDetails) {
            setGuestDetails(data.guestDetails);
          }
        } else {
          setSubmitError(data.error || 'Check-in failed');
        }
      } catch (error) {
        setSubmitError('Network error');
      } finally {
        setSubmitting(false);
      }
    },
    [result]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get card color based on result
  const getCardColor = () => {
    if (!result) return 'bg-gray-800';
    if (!result.valid) return 'bg-red-700';
    if (result.alreadyCheckedIn) return 'bg-amber-600';
    return 'bg-emerald-700';
  };

  // Get error message
  const getErrorMessage = (error?: string) => {
    const messages: Record<string, string> = {
      INVALID_TOKEN: 'Invalid QR Code',
      EXPIRED_TOKEN: 'Expired QR Code',
      REGISTRATION_NOT_FOUND: 'Registration Not Found',
      TOKEN_MISMATCH: 'QR Code Mismatch',
      NETWORK_ERROR: 'Network Error',
      ALREADY_CHECKED_IN: 'Already Checked In',
      ADMIN_AUTH_REQUIRED: 'Admin Login Required',
      CANCELLED: 'Registration Cancelled',
      REGISTRATION_CANCELLED: 'Registration Cancelled',
    };
    return messages[error || ''] || error || 'Unknown Error';
  };

  // Shared info box for staff details
  const renderGuestInfoBox = (guest: ValidationResult['guest'], details?: typeof guestDetails) => {
    const tableName = details?.tableName || guest?.tableName;
    const isVip = details?.isVipReception ?? guest?.isVipReception;
    const dietary = details?.dietaryRequirements || guest?.dietaryRequirements;
    const partnerName = guest?.partnerName;

    const hasInfo = tableName || isVip || dietary || partnerName;
    if (!hasInfo) return null;

    return (
      <div className="rounded-lg p-4 my-4 space-y-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
        {tableName && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ opacity: 0.7 }}>Table</span>
            <span className="font-semibold">{tableName}</span>
          </div>
        )}
        {isVip && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ opacity: 0.7 }}>VIP</span>
            <span className="font-semibold" style={{ color: '#d4af37' }}>&#9733; VIP Reception</span>
          </div>
        )}
        {dietary && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ opacity: 0.7 }}>Dietary</span>
            <span className="font-semibold" style={{ color: '#e8a035' }}>{dietary}</span>
          </div>
        )}
        {partnerName && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ opacity: 0.7 }}>Partner</span>
            <span className="font-semibold">{partnerName}</span>
          </div>
        )}
      </div>
    );
  };

  // Gold line separator
  const GoldLine = () => (
    <div className="my-5" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />
  );

  // VIP badge
  const VipBadge = () => (
    <span
      className="inline-block text-[10px] font-bold uppercase ml-2 px-3 py-1 rounded-full align-middle"
      style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a1628', letterSpacing: '1.5px' }}
    >
      &#9733; VIP
    </span>
  );

  const isVipGuest = result?.guest?.isVipReception || guestDetails?.isVipReception;
  const cardVipStyle = isVipGuest
    ? { border: '1px solid #d4af37', boxShadow: '0 0 20px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05)' }
    : { border: '1px solid rgba(212,175,55,0.3)' };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: '#0a1628', color: '#fff' }}
    >
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span style={{ color: '#d4af37', fontSize: 20 }}>&#9733;</span>
          <span className="text-lg font-semibold" style={{ color: '#d4af37' }}>CEO Gala 2026</span>
        </Link>
        <div className="flex items-center gap-2">
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="px-3 py-1 text-sm rounded-lg font-medium flex items-center gap-1 transition-colors"
              style={{ background: '#722f37', color: '#fff' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install
            </button>
          )}
          {scanning && (
            <button
              onClick={stopScanner}
              className="px-3 py-1 text-sm rounded-lg"
              style={{ background: 'rgba(180,60,60,0.3)', border: '1px solid rgba(180,60,60,0.5)', color: '#e05555' }}
            >
              Stop
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-16">
        {/* Scanner view */}
        {!result && (
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <div style={{ color: '#d4af37', fontSize: 32 }}>&#9733;</div>
              <h2 className="text-lg font-semibold mt-2" style={{ color: '#d4af37' }}>CEO Gala 2026</h2>
              <p className="text-xs uppercase mt-1" style={{ letterSpacing: 2, opacity: 0.6, color: '#d4af37' }}>Check-in Scanner</p>
            </div>

            <div
              className="relative w-full aspect-square rounded-xl overflow-hidden mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(212,175,55,0.3)' }}
            >
              <div
                id="qr-reader"
                ref={containerRef}
                className="w-full h-full"
              />
              {scanning && (
                <div
                  className="absolute left-[20%] right-[20%] h-[2px]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                    animation: 'scanMove 2.5s ease-in-out infinite',
                  }}
                />
              )}
            </div>

            {!scanning && (
              <button
                onClick={startScanner}
                className="w-full py-4 rounded-lg font-bold text-sm uppercase transition-colors"
                style={{ background: '#722f37', color: '#fff', letterSpacing: 1 }}
              >
                Start Scanning
              </button>
            )}
            {scanning && (
              <p className="text-center text-sm" style={{ opacity: 0.6 }}>
                Hold QR code in front of camera...
              </p>
            )}
          </div>
        )}

        {/* Result card */}
        {result && (
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              ...cardVipStyle,
              padding: '32px 24px',
              background: 'linear-gradient(180deg, #0a1628 0%, #162447 100%)',
              animation: 'cardFadeIn 0.5s ease-out',
            }}
          >
            {/* ===== SUCCESS ===== */}
            {checkInSuccess && (
              <div className="text-center">
                <div style={{ color: '#d4af37', fontSize: 24 }}>&#9733;</div>

                <div
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto my-4"
                  style={{ background: '#722f37', border: '2px solid #d4af37' }}
                >
                  <span className="text-white text-2xl">&#10003;</span>
                </div>

                <h2 className="text-xl font-bold mb-2">Check-in Successful!</h2>
                <h3 className="text-xl mb-1" style={{ fontWeight: 300 }}>
                  {guestDetails?.title ? `${guestDetails.title} ` : ''}{guestDetails?.guestName || result.guest?.name}
                  {isVipGuest && <VipBadge />}
                </h3>
                <p className="text-sm mb-2" style={{ opacity: 0.8 }}>
                  {TICKET_TYPE_LABELS[result.guest?.ticketType || ''] || result.guest?.ticketType}
                </p>

                <GoldLine />
                {renderGuestInfoBox(result.guest, guestDetails)}
                <GoldLine />

                <button
                  onClick={scanAgain}
                  className="w-full py-3.5 rounded-lg font-semibold text-sm uppercase transition-opacity hover:opacity-80"
                  style={{ background: 'transparent', border: '1px solid currentColor', opacity: 0.7, letterSpacing: 1 }}
                >
                  Next Guest
                </button>
              </div>
            )}

            {/* ===== VALID TICKET (pre check-in) ===== */}
            {result.valid && !result.alreadyCheckedIn && !checkInSuccess && (
              <div>
                <div className="text-center" style={{ color: '#d4af37', fontSize: 24 }}>&#9733;</div>

                <p className="text-center text-xs uppercase mt-4 mb-1" style={{ letterSpacing: 2, opacity: 0.7 }}>
                  Valid Ticket
                </p>
                <h2 className="text-center text-2xl mb-1" style={{ fontWeight: 300 }}>
                  {result.guest?.title ? `${result.guest.title} ` : ''}{result.guest?.name}
                  {result.guest?.isVipReception && <VipBadge />}
                </h2>
                <p className="text-center text-sm mb-4" style={{ opacity: 0.8 }}>
                  {TICKET_TYPE_LABELS[result.guest?.ticketType || ''] || result.guest?.ticketType}
                </p>

                <GoldLine />
                {renderGuestInfoBox(result.guest)}
                <GoldLine />

                {submitError && (
                  <div className="rounded-lg p-3 mb-4 text-center text-sm" style={{ background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.3)', color: '#e05555' }}>
                    {getErrorMessage(submitError)}
                  </div>
                )}

                <button
                  onClick={() => submitCheckin(false)}
                  disabled={submitting}
                  className="w-full py-4 rounded-lg font-bold text-sm uppercase transition-colors disabled:opacity-50"
                  style={{ background: '#722f37', color: '#fff', letterSpacing: 1 }}
                >
                  {submitting ? 'Processing...' : 'CHECK IN'}
                </button>

                <button
                  onClick={scanAgain}
                  className="mt-3 w-full py-3.5 rounded-lg font-semibold text-sm uppercase transition-opacity hover:opacity-80"
                  style={{ background: 'transparent', border: '1px solid currentColor', opacity: 0.7, letterSpacing: 1 }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* ===== ALREADY CHECKED IN (warning) ===== */}
            {result.valid && result.alreadyCheckedIn && !checkInSuccess && (
              <div>
                <div className="text-center" style={{ color: '#d4af37', fontSize: 24 }}>&#9733;</div>

                <div
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto my-4"
                  style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid #d4af37' }}
                >
                  <span className="text-2xl" style={{ color: '#d4af37' }}>&#9888;</span>
                </div>

                <h2 className="text-center text-xl font-bold mb-2" style={{ color: '#d4af37' }}>Already Checked In!</h2>
                <h3 className="text-center text-xl mb-1" style={{ fontWeight: 300 }}>
                  {result.guest?.title ? `${result.guest.title} ` : ''}{result.guest?.name}
                </h3>
                <p className="text-center text-sm mb-2" style={{ opacity: 0.8 }}>
                  {TICKET_TYPE_LABELS[result.guest?.ticketType || ''] || result.guest?.ticketType}
                </p>

                {result.previousCheckin && (
                  <div className="rounded-lg p-3 my-3 text-center text-sm" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
                    <div className="mb-1">&#9888; This guest was already checked in</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {formatDate(result.previousCheckin.checkedInAt)}
                      {result.previousCheckin.staffName && ` — by Staff: ${result.previousCheckin.staffName}`}
                    </div>
                  </div>
                )}

                <GoldLine />
                {renderGuestInfoBox(result.guest)}
                <GoldLine />

                {submitError && (
                  <div className="rounded-lg p-3 mb-4 text-center text-sm" style={{ background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.3)', color: '#e05555' }}>
                    {getErrorMessage(submitError)}
                  </div>
                )}

                <button
                  onClick={() => submitCheckin(true)}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-lg font-semibold text-sm uppercase transition-colors disabled:opacity-50 mb-3"
                  style={{ background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', letterSpacing: 1 }}
                >
                  {submitting ? 'Processing...' : 'Admin Override'}
                </button>

                <button
                  onClick={scanAgain}
                  className="w-full py-3.5 rounded-lg font-semibold text-sm uppercase transition-opacity hover:opacity-80"
                  style={{ background: 'transparent', border: '1px solid currentColor', opacity: 0.7, letterSpacing: 1 }}
                >
                  Next Guest
                </button>
              </div>
            )}

            {/* ===== INVALID TICKET (error) ===== */}
            {!result.valid && (
              <div className="text-center">
                <div style={{ color: '#d4af37', fontSize: 24 }}>&#9733;</div>

                <div
                  className="w-[60px] h-[60px] rounded-full flex items-center justify-center mx-auto my-4"
                  style={{ background: 'rgba(180,60,60,0.2)', border: '2px solid #b43c3c' }}
                >
                  <span className="text-2xl" style={{ color: '#e05555' }}>&#10007;</span>
                </div>

                <h2 className="text-xl font-bold mb-3">Invalid Ticket</h2>

                <div className="rounded-lg p-3 mb-4 text-sm" style={{ background: 'rgba(180,60,60,0.1)', border: '1px solid rgba(180,60,60,0.3)', color: '#e05555' }}>
                  {getErrorMessage(result.error)}
                </div>

                <GoldLine />

                <button
                  onClick={scanAgain}
                  className="w-full py-4 rounded-lg font-bold text-sm uppercase transition-colors"
                  style={{ background: '#722f37', color: '#fff', letterSpacing: 1 }}
                >
                  Scan Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MyForge Labs footer bar */}
      <div
        className="fixed bottom-0 left-0 right-0 py-1.5 z-50 flex items-center justify-center gap-2"
        style={{
          background: 'rgba(10,22,40,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(212,175,55,0.15)',
        }}
      >
        <Image src="/myforgelabs-logo.png" alt="MyForge Labs" width={18} height={18} className="opacity-80" />
        <span className="text-xs" style={{ color: 'rgba(212,175,55,0.6)', letterSpacing: 1 }}>
          Built By{' '}
          <a
            href="https://www.myforgelabs.com/#kapcsolat"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: 'rgba(212,175,55,0.7)' }}
          >
            MyForge Labs
          </a>
        </span>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scanMove {
          0%, 100% { top: 22%; }
          50% { top: 75%; }
        }
      `}</style>
    </div>
  );
}
