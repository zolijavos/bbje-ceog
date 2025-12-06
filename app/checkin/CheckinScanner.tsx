'use client';

/**
 * Check-in Scanner Component
 *
 * Mobile-optimized QR code scanner with result display cards
 * Story 3.2: Mobile QR Scanner Interface
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { TICKET_TYPE_LABELS } from '@/lib/constants';
import { logError } from '@/lib/utils/logger';

// Validation result from API
interface ValidationResult {
  valid: boolean;
  error?: string;
  guest?: {
    id: number;
    name: string;
    ticketType: string;
    partnerName: string | null;
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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
            const data: ValidationResult = await response.json();
            setResult(data);
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
    if (!result.valid) return 'bg-red-600';
    if (result.alreadyCheckedIn) return 'bg-yellow-500';
    return 'bg-green-600';
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
    };
    return messages[error || ''] || error || 'Unknown Error';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white text-lg font-semibold">CEO Gala Check-in</h1>
        {scanning && (
          <button
            onClick={stopScanner}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg"
          >
            Stop
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Scanner view */}
        {!result && (
          <div className="w-full max-w-md">
            <div
              id="qr-reader"
              ref={containerRef}
              className="w-full aspect-square bg-black rounded-lg overflow-hidden"
            />
            {!scanning && (
              <button
                onClick={startScanner}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Start Scanning
              </button>
            )}
            {scanning && (
              <p className="mt-4 text-center text-gray-400">
                Hold the QR code in front of the camera...
              </p>
            )}
          </div>
        )}

        {/* Result card */}
        {result && (
          <div
            className={`w-full max-w-md rounded-xl shadow-xl overflow-hidden ${getCardColor()}`}
          >
            {/* Success state after check-in */}
            {checkInSuccess && (
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check-in Successful!</h2>
                <p className="text-white/90 text-lg">{result.guest?.name}</p>
                <button
                  onClick={scanAgain}
                  className="mt-6 w-full py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30"
                >
                  Next Guest
                </button>
              </div>
            )}

            {/* Valid ticket - not checked in yet */}
            {result.valid && !result.alreadyCheckedIn && !checkInSuccess && (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm uppercase tracking-wider">
                    Valid Ticket
                  </span>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">{result.guest?.name}</h2>
                  <p className="text-white/90">
                    {TICKET_TYPE_LABELS[result.guest?.ticketType || ''] || result.guest?.ticketType}
                  </p>
                  {result.guest?.partnerName && (
                    <p className="text-white/80 mt-1">Partner: {result.guest.partnerName}</p>
                  )}
                </div>

                {submitError && (
                  <p className="text-white/90 bg-red-700/50 rounded-lg p-2 mb-4 text-center">
                    {getErrorMessage(submitError)}
                  </p>
                )}

                <button
                  onClick={() => submitCheckin(false)}
                  disabled={submitting}
                  className="w-full py-4 bg-white text-green-700 rounded-lg font-bold text-lg hover:bg-white/90 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'CHECK IN'}
                </button>

                <button
                  onClick={scanAgain}
                  className="mt-3 w-full py-2 bg-white/20 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Already checked in - warning */}
            {result.valid && result.alreadyCheckedIn && !checkInSuccess && (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm uppercase tracking-wider font-bold">
                    Already Checked In!
                  </span>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">{result.guest?.name}</h2>
                  <p className="text-white/90">
                    {TICKET_TYPE_LABELS[result.guest?.ticketType || ''] || result.guest?.ticketType}
                  </p>
                  {result.previousCheckin && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-white/80 text-sm">
                        Previous Check-in: {formatDate(result.previousCheckin.checkedInAt)}
                      </p>
                      {result.previousCheckin.staffName && (
                        <p className="text-white/80 text-sm">
                          Staff: {result.previousCheckin.staffName}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {submitError && (
                  <p className="text-white/90 bg-red-700/50 rounded-lg p-2 mb-4 text-center">
                    {getErrorMessage(submitError)}
                  </p>
                )}

                <button
                  onClick={() => submitCheckin(true)}
                  disabled={submitting}
                  className="w-full py-3 bg-white/20 text-white rounded-lg font-medium border-2 border-white/50 hover:bg-white/30 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Admin Override'}
                </button>

                <button
                  onClick={scanAgain}
                  className="mt-3 w-full py-3 bg-white text-yellow-700 rounded-lg font-bold"
                >
                  Next Guest
                </button>
              </div>
            )}

            {/* Invalid ticket - error */}
            {!result.valid && (
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Invalid Ticket</h2>
                <p className="text-white/90">{getErrorMessage(result.error)}</p>
                <button
                  onClick={scanAgain}
                  className="mt-6 w-full py-3 bg-white text-red-700 rounded-lg font-bold"
                >
                  Scan Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 px-4 py-2 text-center">
        <p className="text-gray-400 text-sm">CEO Gala 2026 Check-in</p>
      </footer>
    </div>
  );
}
