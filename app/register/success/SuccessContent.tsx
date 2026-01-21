'use client';

/**
 * Success Content Client Component - Screen 4
 *
 * Displays registration complete message with themed styling.
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
    buttonPrimary: 'bg-[#b41115] hover:bg-[#8a0d10] text-white',
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
    buttonPrimary: 'bg-[#b41115] hover:bg-[#8a0d10] text-white',
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
    buttonPrimary: 'bg-[#b41115] hover:bg-[#8a0d10] text-white',
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

interface SuccessContentProps {
  guest: {
    id: number;
    name: string;
    email: string;
    guestType: string;
  };
  isVIP: boolean;
  isPaid: boolean;
  isPairedTicket: boolean;
  ticketPrice: string;
  registrationId?: number;
}

export default function SuccessContent({
  guest,
  isVIP,
  isPaid,
  isPairedTicket,
  ticketPrice,
  registrationId,
}: SuccessContentProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  const t = themes[theme];

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
      <div className={`max-w-sm w-full ${t.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${t.cardBorder}`}>
        {/* Checkmark Icon with gold border */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#d1aa67] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#d1aa67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Title */}
        <h1 className={`text-2xl font-bold ${t.text} mb-4`} data-testid="success-title">
          Registration Complete!
        </h1>

        {/* Subtext */}
        <p className={`${t.textMuted} text-sm mb-6`} data-testid="success-message">
          We hope you will have a wonderful time at the event.
        </p>

        <GoldLine theme={t} />

        {/* Event Title */}
        <h2 className={`text-xl font-bold ${t.text} tracking-wide`}>
          CEO Gala 2026
        </h2>

        {/* Event Details */}
        <div className={`${t.textMuted} text-sm mt-3 space-y-1`}>
          <p>Friday, March 27, 2026 • 7:00 PM</p>
          <p>Budapest, Corinthia Hotel</p>
        </div>

        <GoldLine theme={t} />

        {/* Next Steps for VIP */}
        {isVIP && (
          <div className={`mt-6 p-4 rounded-lg ${theme === 'light' ? 'bg-[#f5f0e8]' : 'bg-black/20'}`}>
            <h3 className={`text-sm font-semibold ${t.text} mb-3`}>Next Steps</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${t.goldBg} flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-[#0c0d0e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <span className={`text-sm ${t.textMuted}`}>Download your QR ticket</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${t.goldBg} flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-[#0c0d0e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`text-sm ${t.textMuted}`}>Add event to calendar</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Section for Paid Guests */}
        {isPaid && registrationId && (
          <div className={`mt-6 p-4 rounded-lg ${theme === 'light' ? 'bg-[#f5f0e8]' : 'bg-black/20'}`}>
            <h3 className={`text-sm font-semibold ${t.text} mb-2`}>Payment Required</h3>
            <p className={`${t.textMuted} text-sm mb-4`}>
              Your ticket price: <span className={`font-bold ${t.gold}`}>{ticketPrice}</span>
            </p>
            <form action="/api/stripe/redirect-to-checkout" method="POST">
              <input type="hidden" name="registration_id" value={registrationId} />
              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${t.buttonPrimary}`}
                data-testid="pay-with-card-button"
              >
                PAY WITH CARD
              </button>
            </form>
            <p className={`text-xs ${t.textSubtle} mt-3`}>
              Secure payment via Stripe
            </p>
          </div>
        )}

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
