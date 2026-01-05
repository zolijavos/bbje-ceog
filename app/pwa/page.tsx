'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';
import { Camera, Key, ArrowLeft, Question } from '@phosphor-icons/react';
import ThemeToggle from './components/ui/ThemeToggle';
import Button3D from './components/ui/Button3D';
import { useHaptic } from './hooks/useHaptic';

type AuthMode = 'select' | 'scan' | 'code';

export default function PWALoginPage() {
  const router = useRouter();
  const { patterns } = useHaptic();
  const [mode, setMode] = useState<AuthMode>('select');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/pwa/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.replace('/pwa/dashboard');
            return;
          }
        }
      } catch {
        // Not authenticated
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [router]);

  // Initialize QR scanner when mode is 'scan'
  useEffect(() => {
    if (mode === 'scan' && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          // QR code scanned successfully
          scannerRef.current?.clear();
          patterns.success();
          await handleQRAuth(decodedText);
        },
        () => {
          // Scan error - ignore, keep scanning
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {
          /* cleanup error ignored */
        });
        scannerRef.current = null;
      }
    };
  }, [mode, patterns]);

  const handleQRAuth = async (token: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pwa/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        patterns.success();
        router.replace('/pwa/dashboard');
      } else {
        patterns.error();
        setError(data.error || 'Invalid QR code');
        setMode('select');
      }
    } catch {
      patterns.error();
      setError('Network error. Please try again.');
      setMode('select');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pwa/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        patterns.success();
        router.replace('/pwa/dashboard');
      } else {
        patterns.error();
        setError(data.error || 'Invalid code');
      }
    } catch {
      patterns.error();
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center pwa-bg-base">
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: 'var(--color-border-subtle)',
              borderTopColor: 'var(--color-accent)',
            }}
          />
          <p className="pwa-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pwa-bg-base flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-6 text-center relative">
        {/* Theme toggle - top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <h1 className="font-display text-3xl pwa-text-primary mb-2">
          CEO Gala 2026
        </h1>
        <p className="pwa-text-tertiary text-sm">Guest App</p>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 pb-20">
        <div className="card-static p-6 max-w-md mx-auto">
          {mode === 'select' && (
            <>
              <h2 className="text-xl font-semibold pwa-text-primary mb-2 text-center">
                Welcome!
              </h2>
              <p className="pwa-text-secondary text-sm text-center mb-6">
                Log in with the QR code or registration code on your ticket.
              </p>

              {error && (
                <div
                  className="px-4 py-3 mb-4 text-sm border"
                  style={{
                    background: 'var(--color-error-bg)',
                    color: 'var(--color-error)',
                    borderColor: 'var(--color-error)',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button3D
                  onClick={() => {
                    patterns.light();
                    setMode('scan');
                  }}
                  fullWidth
                  icon={<Camera size={24} weight="fill" />}
                >
                  Scan QR Code
                </Button3D>

                <div className="flex items-center gap-4 my-4">
                  <div
                    className="flex-1 h-px"
                    style={{ background: 'var(--color-border-subtle)' }}
                  />
                  <span className="pwa-text-tertiary text-sm">or</span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: 'var(--color-border-subtle)' }}
                  />
                </div>

                <Button3D
                  variant="secondary"
                  onClick={() => {
                    patterns.light();
                    setMode('code');
                  }}
                  fullWidth
                  icon={<Key size={24} weight="fill" />}
                >
                  Enter Code
                </Button3D>
              </div>
            </>
          )}

          {mode === 'scan' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    patterns.light();
                    setMode('select');
                  }}
                  className="pwa-text-secondary hover:pwa-text-primary transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <h2 className="text-lg font-semibold pwa-text-primary">
                  QR Scan
                </h2>
                <div className="w-16" />
              </div>

              <p className="pwa-text-secondary text-sm text-center mb-4">
                Hold your camera over the QR code on your ticket.
              </p>

              <div id="qr-reader" className="overflow-hidden" />

              {loading && (
                <div className="mt-4 text-center">
                  <div
                    className="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
                    style={{
                      borderColor: 'var(--color-border-subtle)',
                      borderTopColor: 'var(--color-accent)',
                    }}
                  />
                  <p className="pwa-text-secondary text-sm mt-2">Verifying...</p>
                </div>
              )}
            </>
          )}

          {mode === 'code' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    patterns.light();
                    setMode('select');
                  }}
                  className="pwa-text-secondary hover:pwa-text-primary transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <h2 className="text-lg font-semibold pwa-text-primary">
                  Enter Code
                </h2>
                <div className="w-16" />
              </div>

              <p className="pwa-text-secondary text-sm text-center mb-4">
                Enter the registration code on your ticket.
              </p>

              {error && (
                <div
                  className="px-4 py-3 mb-4 text-sm border"
                  style={{
                    background: 'var(--color-error-bg)',
                    color: 'var(--color-error)',
                    borderColor: 'var(--color-error)',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleCodeAuth}>
                <div className="mb-4">
                  <label className="block text-sm font-medium pwa-text-primary mb-1">
                    Registration code
                  </label>
                  <input
                    type="text"
                    name="code"
                    data-testid="auth-code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CEOG-XXXXXX"
                    className="w-full px-4 py-3 text-lg font-mono text-center tracking-wider"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                    maxLength={12}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                </div>

                <Button3D
                  type="submit"
                  disabled={loading || code.length < 6}
                  loading={loading}
                  fullWidth
                >
                  {loading ? 'Verifying...' : 'Login'}
                </Button3D>
              </form>
            </>
          )}
        </div>

        {/* Help section */}
        <div className="mt-8 text-center">
          <p className="pwa-text-tertiary text-sm mb-2">
            Don't have a QR code?
          </p>
          <Link
            href="/register/request-link"
            className="inline-flex items-center gap-1 pwa-text-accent text-sm hover:opacity-80 transition-opacity"
          >
            Request Registration Link
          </Link>
          <div className="mt-3">
            <Link
              href="/help"
              className="inline-flex items-center gap-1 pwa-text-tertiary text-sm hover:opacity-80 transition-opacity"
            >
              <Question size={16} />
              View Registration Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
