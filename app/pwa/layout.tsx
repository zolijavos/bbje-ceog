'use client';

import { useEffect, useState } from 'react';

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // Service worker registered successfully
        })
        .catch(() => {
          // Service worker registration failed - app still works without it
        });
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    (deferredPrompt as any).prompt();

    // Wait for the user's response
    await (deferredPrompt as any).userChoice;

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
          Offline mód - Egyes funkciók nem elérhetők
        </div>
      )}

      {/* Install prompt banner */}
      {showInstallPrompt && (
        <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
          <span className="text-sm">Telepítsd az appot a gyors eléréshez!</span>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-slate-800 px-3 py-1 rounded text-sm font-medium"
            >
              Telepítés
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-slate-300 px-2"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-h-screen pb-12">
        {children}
      </main>

      {/* Footer branding */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 text-center">
        <a
          href="https://myforgelabs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Powered by MyForge Labs
        </a>
      </footer>
    </div>
  );
}
