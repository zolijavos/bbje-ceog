'use client';

import Link from 'next/link';

export default function PWAOfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Offline icon */}
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">📡</span>
        </div>

        <h1 className="font-playfair text-2xl text-slate-800 mb-3">
          No Internet Connection
        </h1>

        <p className="text-slate-600 mb-6">
          An internet connection is required to load this page.
          Check your connection and try again.
        </p>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors mb-4"
        >
          Try Again
        </button>

        {/* Home link */}
        <Link
          href="/pwa"
          className="text-slate-600 underline text-sm"
        >
          Back to home
        </Link>

        {/* Tip */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl">
          <p className="text-amber-800 text-sm">
            💡 <strong>Tip:</strong> If you have logged in before,
            your ticket is available offline in the &quot;Digital Ticket&quot; section.
          </p>
        </div>
      </div>
    </div>
  );
}
