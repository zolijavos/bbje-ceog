'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PWAError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Error icon */}
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⚠️</span>
        </div>

        <h1 className="font-playfair text-2xl text-slate-800 mb-3">
          An Error Occurred
        </h1>

        <p className="text-slate-600 mb-6">
          Sorry, something went wrong while loading the page.
          Please try again.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-red-800 text-xs font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Retry button */}
        <button
          onClick={reset}
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
      </div>
    </div>
  );
}
