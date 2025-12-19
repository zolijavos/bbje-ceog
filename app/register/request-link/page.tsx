/**
 * Request New Magic Link Page
 * Allows guests to request a new magic link when the previous one expired/invalid
 *
 * Story 1.5: Magic Link Validation & Registration Landing
 */

import Link from 'next/link';
import { Envelope } from '@phosphor-icons/react/dist/ssr';
import RequestLinkForm from './RequestLinkForm';
import RequestLinkWrapper from './RequestLinkWrapper';

interface RequestLinkPageProps {
  searchParams: Promise<{
    email?: string;
    reason?: string;
  }>;
}

export default async function RequestLinkPage({
  searchParams,
}: RequestLinkPageProps) {
  const params = await searchParams;
  const { email, reason } = params;

  return (
    <RequestLinkWrapper>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-display text-4xl md:text-5xl font-bold landing-text-heading tracking-tight mb-3">
              CEO Gala
            </h1>
          </Link>
          <p className="text-accent-teal dark:text-teal-400 uppercase tracking-widest text-sm font-sans">
            Request Registration Link
          </p>
        </div>

        {/* Request Form Card */}
        <div className="landing-card shadow-2xl rounded-2xl p-8 border">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 landing-icon-teal rounded-full flex items-center justify-center">
              <Envelope weight="duotone" size={32} className="text-accent-teal dark:text-teal-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl font-semibold text-center landing-text-heading mb-2">
            Request New Link
          </h2>

          {/* Description */}
          <p className="text-center landing-text-secondary font-sans mb-6">
            {reason === 'expired'
              ? 'Your previous link has expired. Enter your email to receive a new one.'
              : 'Enter your email address and we\'ll send you a new invitation link.'}
          </p>

          {/* Form */}
          <RequestLinkForm
            defaultEmail={email}
            reason={reason === 'expired' ? 'expired' : undefined}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm landing-footer font-sans mt-6">
          <Link
            href="/help"
            className="text-accent-teal dark:text-teal-400 hover:underline"
          >
            Segítségre van szüksége?
          </Link>
        </p>
        <p className="text-center text-sm landing-footer font-sans mt-2">
          Questions?{' '}
          <a
            href="mailto:11.11@myforgelabs.com"
            className="text-accent-teal dark:text-teal-400 hover:underline"
          >
            11.11@myforgelabs.com
          </a>
        </p>
        <p className="text-center text-sm landing-footer font-sans mt-4">
          © 2026 CEO Gala • Executive Excellence
        </p>
      </div>
    </RequestLinkWrapper>
  );
}
