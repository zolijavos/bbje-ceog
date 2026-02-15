/**
 * Status Error Component
 *
 * Displays error messages when status page access fails
 * Story 2.6: Payment Status Dashboard for Guests
 */

import Link from 'next/link';
import { Warning, ArrowLeft, Question } from '@phosphor-icons/react/dist/ssr';

interface StatusErrorProps {
  errorType: 'not_found' | 'no_link' | 'invalid' | 'expired' | string;
  message?: string;
  email?: string;
}

export default function StatusError({ errorType, message, email }: StatusErrorProps) {
  // Get error title and description based on type
  const getErrorContent = () => {
    switch (errorType) {
      case 'expired':
        return {
          title: 'Link Expired',
          description:
            'The invitation link has expired. Links expire after 24 hours for security reasons.',
          showRequestLink: true,
        };
      case 'not_found':
        return {
          title: 'Email Address Not Found',
          description:
            'The provided email address is not on the guest list. Please verify that you are using the correct email address.',
          showRequestLink: false,
        };
      case 'no_link':
        return {
          title: 'No Active Invitation',
          description: 'We have not sent an invitation to this email address yet.',
          showRequestLink: true,
        };
      case 'invalid':
      default:
        return {
          title: 'Invalid Link',
          description: message || 'The provided link is invalid or incomplete.',
          showRequestLink: true,
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
              CEO Gála 2026
            </h1>
          </Link>
          <p className="text-accent-teal uppercase tracking-widest text-sm font-sans">
            Status Query
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-neutral-200 shadow-2xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <Warning weight="light" size={32} className="text-red-600" />
            </div>

            {/* Error Title */}
            <h2 className="font-display text-xl font-semibold text-neutral-800 mb-2">{errorContent.title}</h2>

            {/* Error Description */}
            <p className="text-neutral-600 font-sans mb-6">{errorContent.description}</p>

            {/* Actions */}
            <div className="space-y-3">
              {errorContent.showRequestLink && (
                <Link
                  href={`/register/request-link${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-teal hover:bg-accent-teal-dark transition-colors"
                >
                  Request New Invitation Link
                </Link>
              )}

              <Link
                href="/help"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-50 transition-colors"
              >
                <Question weight="light" size={18} />
                Registration Guide
              </Link>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft weight="regular" size={18} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-white/50 font-sans">
          <p>
            If you believe this is an error,{' '}
            <Link href="/help" className="text-accent-teal hover:text-accent-teal-light">
              check our Registration Guide
            </Link>
          </p>
          <p className="mt-4">© 2026 BBJ Events - Event Platform</p>
        </div>
      </div>
    </div>
  );
}
