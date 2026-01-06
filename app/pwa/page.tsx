'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Key, Question } from '@phosphor-icons/react';
import ThemeToggle from './components/ui/ThemeToggle';
import Button3D from './components/ui/Button3D';
import { useHaptic } from './hooks/useHaptic';

export default function PWALoginPage() {
  const router = useRouter();
  const { patterns } = useHaptic();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

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

  // Check URL params for pre-filled code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, []);

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
        <p className="pwa-text-tertiary text-sm">Gala App</p>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 pb-20">
        <div className="card-static p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold pwa-text-primary mb-2 text-center">
            Welcome!
          </h2>
          <p className="pwa-text-secondary text-sm text-center mb-6">
            Enter the access code from your ticket email to log in.
          </p>

          {error && (
            <div
              className="px-4 py-3 mb-4 text-sm border rounded-lg"
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
                Access Code
              </label>
              <input
                type="text"
                name="code"
                data-testid="auth-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CEOG-XXXXXX"
                className="w-full px-4 py-3 text-lg font-mono text-center tracking-wider rounded-lg"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
                maxLength={11}
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus
              />
              <p className="text-xs pwa-text-tertiary mt-2 text-center">
                You can find this code in your ticket confirmation email
              </p>
            </div>

            <Button3D
              type="submit"
              disabled={loading || code.length < 6}
              loading={loading}
              fullWidth
              icon={<Key size={20} weight="fill" />}
            >
              {loading ? 'Verifying...' : 'Login'}
            </Button3D>
          </form>
        </div>

        {/* Help section */}
        <div className="mt-8 text-center">
          <p className="pwa-text-tertiary text-sm mb-2">
            Don't have an access code?
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
