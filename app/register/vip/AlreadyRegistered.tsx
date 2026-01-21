'use client';

/**
 * Already Registered Component
 *
 * Displays message when VIP guest has already registered or declined.
 * Themes: Dark (#0c0d0e), Dark Blue (#120c3a), Light (#ffffff)
 * Brand colors: Gold (#d1aa67), Red (#b41115)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    successBg: 'bg-emerald-900/30 border-emerald-500/50',
    successText: 'text-emerald-300',
    successTitle: 'text-emerald-200',
    declinedBg: 'bg-slate-800/50 border-slate-600/50',
    declinedText: 'text-slate-400',
    infoBg: 'bg-black/20 border-[#d1aa67]/30',
    footerText: 'text-white/40',
    linkColor: 'text-[#d1aa67] hover:text-[#d1aa67]/80',
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
    successBg: 'bg-emerald-900/30 border-emerald-500/50',
    successText: 'text-emerald-300',
    successTitle: 'text-emerald-200',
    declinedBg: 'bg-slate-800/50 border-slate-600/50',
    declinedText: 'text-slate-400',
    infoBg: 'bg-black/20 border-[#d1aa67]/30',
    footerText: 'text-white/40',
    linkColor: 'text-[#d1aa67] hover:text-[#d1aa67]/80',
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
    successBg: 'bg-emerald-50 border-emerald-200',
    successText: 'text-emerald-700',
    successTitle: 'text-emerald-800',
    declinedBg: 'bg-slate-100 border-slate-300',
    declinedText: 'text-slate-600',
    infoBg: 'bg-[#f5f0e8] border-[#d1aa67]/40',
    footerText: 'text-[#0c0d0e]/40',
    linkColor: 'text-[#d1aa67] hover:text-[#b89a5a]',
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
function GoldLine() {
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <div className="h-px w-12 bg-[#d1aa67] opacity-50" />
      <StarDecoration className="w-3 h-3 text-[#d1aa67]" />
      <div className="h-px w-12 bg-[#d1aa67] opacity-50" />
    </div>
  );
}

// Footer component
function PoweredByFooter() {
  return (
    <div className="text-center mt-8 pt-4 border-t border-white/10" />
  );
}

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  guest_type: string;
  registration_status: string;
  title?: string | null;
}

interface AlreadyRegisteredProps {
  guest: Guest;
  declined?: boolean;
}

export default function AlreadyRegistered({
  guest,
  declined = false,
}: AlreadyRegisteredProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  const t = themes[theme];
  // Compose full name
  const fullName = `${guest.first_name} ${guest.last_name}`;
  // Get display name with title (e.g., "Dr. John Smith")
  const displayName = guest.title ? `${guest.title} ${fullName}` : fullName;
  const firstName = guest.first_name;

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full ${t.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${t.cardBorder}`}>
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
            declined ? 'border-slate-500' : 'border-[#d1aa67]'
          }`}>
            {declined ? (
              <svg
                className="w-10 h-10 text-slate-500"
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
            ) : (
              <svg
                className="w-10 h-10 text-[#d1aa67]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-2xl font-bold ${t.text} mb-2`}>
          Hello, {firstName}!
        </h1>

        {/* Status Message */}
        {declined ? (
          <>
            <p className={`${t.textMuted} mb-6`} data-testid="declined-message">
              You have previously indicated that you cannot attend the CEO Gala 2026 event.
            </p>

            <GoldLine />

            <div className={`rounded-lg p-4 mb-6 border ${t.declinedBg}`}>
              <p className={`text-sm ${t.declinedText}`}>
                If you have changed your mind and would like to attend, please contact the organizers.
              </p>
            </div>
          </>
        ) : (
          <>
            <p
              className={`${t.gold} font-semibold mb-4`}
              data-testid="already-registered-message"
            >
              You have already registered for this event.
            </p>
            <p className={`${t.textMuted} text-sm mb-6`}>
              Your registration has been recorded. Your QR ticket will arrive via email shortly.
            </p>

            <GoldLine />

            <div className={`rounded-lg p-4 mb-6 border ${t.successBg}`}>
              <h3 className={`font-semibold ${t.successTitle} mb-2`}>
                Registration Status
              </h3>
              <p className={`text-sm ${t.successText}`}>
                ✓ Attendance confirmed
                <br />✓ VIP guest status
              </p>
            </div>
          </>
        )}

        {/* Event Info */}
        <div className={`rounded-lg p-4 mb-6 border ${t.infoBg}`}>
          <h2 className={`text-lg font-semibold ${t.gold} mb-2`}>
            CEO Gala 2026
          </h2>
          <p className={`text-sm ${t.textMuted}`}>
            Friday, March 27, 2026 • 7:00 PM
            <br />
            Budapest, Corinthia Hotel
          </p>
        </div>

        {/* Help Links */}
        <div className={`text-xs ${t.textMuted} text-center space-y-1`}>
          <p>
            Questions?{' '}
            <a href="https://bbj.hu/events/ceogala/#faq" target="_blank" rel="noopener noreferrer" className={t.linkColor}>
              View Registration Guide
            </a>
          </p>
          <p>
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className={t.linkColor}>
              event@bbj.hu
            </a>
          </p>
        </div>

        <PoweredByFooter />
      </div>
    </div>
  );
}
