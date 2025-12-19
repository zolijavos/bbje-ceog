'use client';

import { useEffect, useState } from 'react';
import { WifiSlash, DownloadSimple, X } from '@phosphor-icons/react';
import { ThemeProvider } from './providers/ThemeProvider';
import { useThemeInit } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/ui/Toast';
import Button3D from './components/ui/Button3D';

// Inner layout component that uses hooks
function PWALayoutInner({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const { toasts, dismiss } = useToast();

  // Initialize theme immediately to prevent flash
  useThemeInit();

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
    <div className="pwa-bg-base min-h-screen transition-colors duration-300">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Offline banner */}
      {!isOnline && (
        <div
          className="flex items-center justify-center gap-2 py-2 text-sm font-medium"
          style={{
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
          }}
        >
          <WifiSlash size={16} weight="bold" />
          <span>Offline mode - Some features are unavailable</span>
        </div>
      )}

      {/* Install prompt banner */}
      {showInstallPrompt && (
        <div className="pwa-bg-header px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 pwa-text-inverse">
            <DownloadSimple size={18} weight="bold" />
            <span className="text-sm">Install the app for quick access!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-btn-primary-bg)',
                color: 'var(--color-btn-primary-text)',
              }}
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="p-1 pwa-text-inverse opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="min-h-screen pb-14">{children}</main>

      {/* Footer branding - blur effect */}
      <footer className="fixed bottom-0 left-0 right-0 py-1.5 text-center border-t border-white/20 dark:border-neutral-700/30 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md transition-colors duration-300">
        <span className="text-[10px] text-neutral-500/80 dark:text-neutral-400/80">
          Built By{' '}
          <a
            href="https://www.myforgelabs.com/#kapcsolat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600/80 dark:text-neutral-300/80 hover:text-neutral-800 dark:hover:text-white transition-colors underline"
          >
            MyForge Labs
          </a>
        </span>
      </footer>
    </div>
  );
}

// Main layout with ThemeProvider wrapper
export default function PWALayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PWALayoutInner>{children}</PWALayoutInner>
    </ThemeProvider>
  );
}
