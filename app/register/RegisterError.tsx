'use client';

import Link from 'next/link';
import type { MagicLinkErrorType } from '@/lib/auth/magic-link';

// Magic link expiry hours from env (default: 24)
const MAGIC_LINK_EXPIRY_HOURS = parseInt(process.env.NEXT_PUBLIC_MAGIC_LINK_EXPIRY_HOURS || '24', 10);

interface RegisterErrorProps {
  errorType: MagicLinkErrorType;
  email?: string;
  message?: string;
}

// Get error details based on error type
function getErrorDetails(errorType: MagicLinkErrorType): {
  title: string;
  description: string;
  icon: 'expired' | 'invalid' | 'not_found';
  showRequestLink: boolean;
} {
  switch (errorType) {
    case 'expired':
      return {
        title: 'Link Expired',
        description:
          `The invitation link expires after ${MAGIC_LINK_EXPIRY_HOURS} hours. Request a new link using the button below.`,
        icon: 'expired',
        showRequestLink: true,
      };
    case 'not_found':
      return {
        title: 'Email Address Not Found',
        description:
          'The provided email address is not on the guest list. Please check the email address.',
        icon: 'not_found',
        showRequestLink: false,
      };
    case 'no_link':
      return {
        title: 'No Active Invitation',
        description:
          'We have not sent an invitation to this email address yet. Request a new link using the button below.',
        icon: 'invalid',
        showRequestLink: true,
      };
    case 'invalid':
    default:
      return {
        title: 'Invalid Link',
        description:
          'The invitation link is invalid or has been modified. Request a new link using the button below.',
        icon: 'invalid',
        showRequestLink: true,
      };
  }
}

// Icon components
function ExpiredIcon() {
  return (
    <svg
      className="w-10 h-10 text-yellow-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function InvalidIcon() {
  return (
    <svg
      className="w-10 h-10 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function NotFoundIcon() {
  return (
    <svg
      className="w-10 h-10 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function RegisterError({
  errorType,
  email,
  message,
}: RegisterErrorProps) {
  const details = getErrorDetails(errorType);

  // Build request link URL with optional email and reason
  const requestLinkUrl = email
    ? `/register/request-link?email=${encodeURIComponent(email)}${errorType === 'expired' ? '&reason=expired' : ''}`
    : '/register/request-link';

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-white tracking-tight">CEO Gála 2026</h1>
          <p className="text-accent-teal mt-2 font-sans uppercase tracking-widest text-sm">Registration</p>
        </div>

        {/* Error Card */}
        <div className="bg-white shadow-2xl rounded-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                details.icon === 'expired'
                  ? 'bg-amber-50'
                  : details.icon === 'not_found'
                    ? 'bg-neutral-300/10'
                    : 'bg-red-50'
              }`}
            >
              {details.icon === 'expired' && <ExpiredIcon />}
              {details.icon === 'invalid' && <InvalidIcon />}
              {details.icon === 'not_found' && <NotFoundIcon />}
            </div>
          </div>

          {/* Error Title */}
          <h2 className="font-display text-2xl font-semibold text-center text-neutral-800 mb-2">
            {details.title}
          </h2>

          {/* Error Description */}
          <p className="text-center text-neutral-500 mb-6 font-sans">
            {message || details.description}
          </p>

          {/* Email Display (if available) */}
          {email && (
            <div className="bg-neutral-50 rounded-lg p-4 mb-6 border-l-4 border-accent-teal">
              <div className="text-sm text-neutral-500 font-sans uppercase tracking-wider">Email Address</div>
              <div className="text-neutral-800 font-medium font-sans">{email}</div>
            </div>
          )}

          {/* Request New Link Button */}
          {details.showRequestLink && (
            <Link
              href={requestLinkUrl}
              className="btn btn-primary w-full text-center mb-4"
            >
              Request New Link
            </Link>
          )}

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-white/70 mt-6 font-sans space-y-1">
          <p>
            Questions?{' '}
            <a
              href="https://bbj.hu/events/ceogala/#faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-teal hover:text-accent-teal-light"
            >
              View Registration Guide
            </a>
          </p>
          <p>
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className="text-accent-teal hover:text-accent-teal-light">
              event@bbj.hu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
