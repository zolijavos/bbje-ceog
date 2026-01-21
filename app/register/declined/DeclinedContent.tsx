'use client';

/**
 * Declined Content Client Component
 *
 * Displays message after guest declines attendance.
 * Themes: Dark (#0c0d0e), Dark Blue (#120c3a), Light (#ffffff)
 * Brand colors: Gold (#d1aa67), Red (#b41115)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Theme definitions
type Theme = 'dark' | 'dark-blue' | 'light';

const themes = {
  dark: {
    bg: 'bg-[#0c0d0e]',
    cardBg: 'bg-[#1a1a1f]',
    cardBorder: 'border-[#d1aa67]/30',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSubtle: 'text-white/50',
    gold: 'text-[#d1aa67]',
    goldBg: 'bg-[#d1aa67]',
    footerText: 'text-white/40',
  },
  'dark-blue': {
    bg: 'bg-[#120c3a]',
    cardBg: 'bg-[#1a1445]',
    cardBorder: 'border-[#d1aa67]/30',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSubtle: 'text-white/50',
    gold: 'text-[#d1aa67]',
    goldBg: 'bg-[#d1aa67]',
    footerText: 'text-white/40',
  },
  light: {
    bg: 'bg-[#f5f0e8]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#d1aa67]/40',
    text: 'text-[#0c0d0e]',
    textMuted: 'text-[#0c0d0e]/70',
    textSubtle: 'text-[#0c0d0e]/50',
    gold: 'text-[#d1aa67]',
    goldBg: 'bg-[#d1aa67]',
    footerText: 'text-[#0c0d0e]/40',
  },
};

// Star decoration component
function StarDecoration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
    </svg>
  );
}

// Decorative line with stars
function GoldLine({ theme }: { theme: typeof themes.dark }) {
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <div className={`h-px w-12 ${theme.goldBg} opacity-50`} />
      <StarDecoration className={`w-3 h-3 ${theme.gold}`} />
      <div className={`h-px w-12 ${theme.goldBg} opacity-50`} />
    </div>
  );
}

// Footer component
function PoweredByFooter() {
  return (
    <div className={`text-center mt-8 pt-4 border-t border-white/10`} />
  );
}

interface DeclinedContentProps {
  guest: {
    id: number;
    name: string;
    email: string;
    firstName?: string;
  };
}

export default function DeclinedContent({ guest }: DeclinedContentProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  const t = themes[theme];
  const displayName = guest.firstName || guest.name.split(' ')[0] || guest.name;

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
      <div className={`max-w-sm w-full ${t.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${t.cardBorder}`}>
        {/* Info Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#d1aa67]/50 flex items-center justify-center">
            <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold ${t.text} mb-4`} data-testid="declined-title">
          Thank You for Your Response!
        </h1>

        {/* Subtext */}
        <p className={`${t.textMuted} text-sm mb-6`} data-testid="declined-message">
          We hope to see you next time!
        </p>

        {/* Guest Message */}
        <p className={`${t.textMuted} text-sm mb-6`}>
          Dear <span className={`font-medium ${t.text}`}>{displayName}</span>, we are sorry
          that you cannot attend the CEO Gala 2026 event.
        </p>

        <GoldLine theme={t} />

        {/* Event Details */}
        <h2 className={`text-xl font-bold ${t.text} tracking-wide`}>
          CEO Gala 2026
        </h2>

        <div className={`${t.textMuted} text-sm mt-3 space-y-1`}>
          <p>Friday, March 27, 2026 • 6:00 PM</p>
          <p>Budapest, Corinthia Hotel</p>
        </div>

        <GoldLine theme={t} />

        {/* Future Contact Note */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-500/30'}`}>
          <p className={`text-sm ${theme === 'light' ? 'text-amber-700' : 'text-amber-200'}`}>
            If you change your mind, please contact us via email and we will
            help you with the registration.
          </p>
        </div>

        {/* Help Links */}
        <div className={`mt-6 text-xs ${t.textMuted} text-center space-y-1`}>
          <p>
            Questions?{' '}
            <a href="https://bbj.hu/events/ceogala/#faq" target="_blank" rel="noopener noreferrer" className="text-[#d1aa67] hover:underline">
              View Registration Guide
            </a>
          </p>
          <p>
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className="text-[#d1aa67] hover:underline">
              event@bbj.hu
            </a>
          </p>
        </div>

        <PoweredByFooter />
      </div>
    </div>
  );
}
