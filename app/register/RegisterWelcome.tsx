'use client';

/**
 * Registration Welcome Page
 *
 * First page after magic link validation.
 * Shows guest info and continues to registration flow.
 *
 * Themes: Dark (#0c0d0e), Dark Blue (#120c3a), Light (#f5f0e8)
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
    infoBg: 'bg-[#2a2a2f]',
    infoBorder: 'border-[#d1aa67]/30',
    footerText: 'text-white/40',
    linkColor: 'text-[#d1aa67] hover:text-[#e5c078]',
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
    infoBg: 'bg-[#2a2455]',
    infoBorder: 'border-[#d1aa67]/30',
    footerText: 'text-white/40',
    linkColor: 'text-[#d1aa67] hover:text-[#e5c078]',
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
    infoBg: 'bg-[#f5f0e8]',
    infoBorder: 'border-[#d1aa67]/40',
    footerText: 'text-[#0c0d0e]/40',
    linkColor: 'text-[#b41115] hover:text-[#8a0d10]',
  },
};

// Decorative gold line component
function GoldLine({ theme }: { theme: typeof themes.dark }) {
  return (
    <div className="flex items-center justify-center gap-3 my-4">
      <div className={`h-px w-12 ${theme.goldBg} opacity-50`} />
      <div className={`w-2 h-2 rotate-45 ${theme.goldBg} opacity-70`} />
      <div className={`h-px w-12 ${theme.goldBg} opacity-50`} />
    </div>
  );
}

interface Guest {
  id: number;
  name: string;
  email: string;
  guestType: string;
  status: string;
  title?: string | null;
}

interface RegisterWelcomeProps {
  guest: Guest;
  code?: string;
}

// Determine next step URL based on guest type
function getRegistrationUrl(guestId: number, guestType: string): string {
  if (guestType === 'vip' || guestType === 'invited') {
    return `/register/vip?guest_id=${guestId}`;
  }
  return `/register/paid?guest_id=${guestId}`;
}

export default function RegisterWelcome({ guest }: RegisterWelcomeProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  const t = themes[theme];
  const nextStepUrl = getRegistrationUrl(guest.id, guest.guestType);
  const displayName = guest.title ? `${guest.title} ${guest.name}` : guest.name;

  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className={`font-display text-4xl font-bold ${t.gold} tracking-tight`}>
            CEO Gala 2026
          </h1>
          <p className={`${t.textMuted} mt-2 uppercase tracking-widest text-sm font-semibold`}>
            Registration
          </p>
        </div>

        {/* Welcome Card */}
        <div className={`${t.cardBg} shadow-2xl rounded-2xl p-8 border ${t.cardBorder}`}>
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 ${t.goldBg}/10 rounded-full flex items-center justify-center`}>
              <svg
                className={`w-10 h-10 ${t.gold}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <GoldLine theme={t} />

          {/* Greeting */}
          <h2 className={`text-xl font-medium text-center ${t.textMuted} mb-2`}>
            Welcome,
          </h2>
          <p className={`text-center text-2xl font-bold ${t.gold} mb-2`}>
            {displayName}
          </p>
          <p className={`text-center ${t.textSubtle} mb-6 text-sm`}>
            Your invitation has been validated. Please continue with registration.
          </p>

          {/* Guest Info */}
          <div className={`${t.infoBg} rounded-lg p-4 mb-6 border-l-4 ${t.infoBorder}`}>
            <div className={`text-xs ${t.textSubtle} uppercase tracking-wider mb-1`}>Email</div>
            <div className={`${t.gold} font-medium`}>{guest.email}</div>
          </div>

          {/* Continue Button */}
          <Link
            href={nextStepUrl}
            className={`block w-full text-center py-4 px-6 ${t.buttonPrimary} font-bold text-lg uppercase tracking-wider transition-all shadow-lg hover:shadow-xl rounded-lg`}
          >
            Continue to Registration →
          </Link>

          {/* Info text */}
          <p className={`text-xs ${t.textSubtle} text-center mt-4`}>
            In the next step you can{' '}
            {guest.guestType === 'vip' || guest.guestType === 'invited'
              ? 'confirm your attendance'
              : 'enter your billing information'}
            .
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className={`text-xs ${t.footerText}`}>
            Questions?{' '}
            <a href="https://bbj.hu/events/ceogala/#faq" target="_blank" rel="noopener noreferrer" className={t.linkColor}>
              View Registration Guide
            </a>
          </p>
          <p className={`text-xs ${t.footerText}`}>
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className={t.linkColor}>
              event@bbj.hu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
