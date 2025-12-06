'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';

type AuthMode = 'select' | 'scan' | 'code';

export default function PWALoginPage() {
  const router = useRouter();
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
          await handleQRAuth(decodedText);
        },
        () => {
          // Scan error - ignore, keep scanning
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { /* cleanup error ignored */ });
        scannerRef.current = null;
      }
    };
  }, [mode]);

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
        router.replace('/pwa/dashboard');
      } else {
        setError(data.error || 'Érvénytelen QR kód');
        setMode('select');
      }
    } catch {
      setError('Hálózati hiba. Kérjük, próbáld újra.');
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
        router.replace('/pwa/dashboard');
      } else {
        setError(data.error || 'Érvénytelen kód');
      }
    } catch {
      setError('Hálózati hiba. Kérjük, próbáld újra.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-800">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Betöltés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 text-center">
        <h1 className="font-playfair text-3xl text-white mb-2">CEO Gála 2025</h1>
        <p className="text-slate-400 text-sm">Vendég Alkalmazás</p>
      </header>

      {/* Main content */}
      <div className="flex-1 px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
          {mode === 'select' && (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-2 text-center">
                Üdvözlünk!
              </h2>
              <p className="text-slate-600 text-sm text-center mb-6">
                Lépj be a jegyeden található QR kóddal vagy regisztrációs kóddal.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setMode('scan')}
                  className="w-full bg-slate-800 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-slate-700 transition-colors"
                >
                  <span className="text-2xl">📷</span>
                  QR Kód Beolvasása
                </button>

                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-slate-400 text-sm">vagy</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <button
                  onClick={() => setMode('code')}
                  className="w-full bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl">🔑</span>
                  Kód Megadása
                </button>
              </div>
            </>
          )}

          {mode === 'scan' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setMode('select')}
                  className="text-slate-600 hover:text-slate-800"
                >
                  ← Vissza
                </button>
                <h2 className="text-lg font-semibold text-slate-800">
                  QR Beolvasás
                </h2>
                <div className="w-16"></div>
              </div>

              <p className="text-slate-600 text-sm text-center mb-4">
                Tartsd a kamerát a jegyeden található QR kód fölé.
              </p>

              <div id="qr-reader" className="rounded-lg overflow-hidden"></div>

              {loading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-600 text-sm mt-2">Ellenőrzés...</p>
                </div>
              )}
            </>
          )}

          {mode === 'code' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setMode('select')}
                  className="text-slate-600 hover:text-slate-800"
                >
                  ← Vissza
                </button>
                <h2 className="text-lg font-semibold text-slate-800">
                  Kód Megadása
                </h2>
                <div className="w-16"></div>
              </div>

              <p className="text-slate-600 text-sm text-center mb-4">
                Add meg a jegyeden található regisztrációs kódot.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCodeAuth}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Regisztrációs kód
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CEOG-XXXXXX"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-mono text-center tracking-wider focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    maxLength={12}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Ellenőrzés...' : 'Belépés'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Help section */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Nincs QR kódod?</p>
          <a
            href="mailto:info@ceogala.hu"
            className="text-white underline text-sm hover:text-slate-300"
          >
            Írj nekünk emailt
          </a>
        </div>
      </div>
    </div>
  );
}
