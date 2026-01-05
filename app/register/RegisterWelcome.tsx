'use client';

import Link from 'next/link';

interface Guest {
  id: number;
  name: string;
  email: string;
  guestType: string;
  status: string;
}

interface RegisterWelcomeProps {
  guest: Guest;
  code?: string; // Optional, kept for backwards compatibility
}

// Determine next step URL based on guest type - using guest_id for proper routing
function getRegistrationUrl(guestId: number, guestType: string): string {
  if (guestType === 'vip') {
    return `/register/vip?guest_id=${guestId}`;
  }
  return `/register/paid?guest_id=${guestId}`;
}

// Format guest type for display
function formatGuestType(type: string): { label: string; color: string } {
  const types: Record<string, { label: string; color: string }> = {
    vip: { label: 'VIP Guest', color: 'bg-accent-teal text-white' },
    paying_single: { label: 'Paying Guest', color: 'bg-neutral-800/10 text-neutral-800' },
    paying_paired: {
      label: 'Paying Guest (Paired)',
      color: 'bg-neutral-800/10 text-neutral-800',
    },
  };
  return types[type] || { label: type, color: 'bg-neutral-300/10 text-neutral-500' };
}


export default function RegisterWelcome({ guest }: RegisterWelcomeProps) {
  const guestTypeInfo = formatGuestType(guest.guestType);
  const nextStepUrl = getRegistrationUrl(guest.id, guest.guestType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-white tracking-tight">CEO Gala 2026</h1>
          <p className="text-accent-teal mt-2 font-sans uppercase tracking-widest text-sm">Registration</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white shadow-2xl rounded-lg p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent-teal/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-accent-teal"
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

          {/* Greeting */}
          <h2 className="font-display text-2xl font-semibold text-center text-neutral-800 mb-2">
            Welcome, {guest.name}!
          </h2>
          <p className="text-center text-neutral-500 mb-6 font-sans">
            Your invitation has been validated. Please continue with registration.
          </p>

          {/* Guest Type Badge */}
          <div className="flex justify-center mb-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold font-sans uppercase tracking-wider ${guestTypeInfo.color}`}
            >
              {guestTypeInfo.label}
            </span>
          </div>

          {/* Guest Info */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 border-l-4 border-accent-teal">
            <div className="text-sm text-neutral-500 font-sans uppercase tracking-wider">Email</div>
            <div className="text-neutral-800 font-medium font-sans">{guest.email}</div>
          </div>

          {/* Continue Button */}
          <Link
            href={nextStepUrl}
            className="btn btn-primary w-full text-center"
          >
            Continue to Registration
          </Link>

          {/* Info text */}
          <p className="text-xs text-neutral-500 text-center mt-4 font-sans">
            In the next step you can{' '}
            {guest.guestType === 'vip'
              ? 'confirm your attendance'
              : 'enter your billing information'}
            .
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/70 mt-6 font-sans">
          Questions?{' '}
          <Link
            href="/help"
            className="text-accent-teal hover:text-accent-teal-light"
          >
            View Registration Guide
          </Link>
        </p>
      </div>
    </div>
  );
}
