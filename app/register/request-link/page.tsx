/**
 * Request New Magic Link Page
 * Allows guests to request a new magic link when the previous one expired/invalid
 *
 * Story 1.5: Magic Link Validation & Registration Landing
 */

import RequestLinkForm from './RequestLinkForm';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CEO Gala 2026</h1>
          <p className="text-gray-500 mt-2">Request New Invitation Link</p>
        </div>

        {/* Request Form Card */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Új link kérése
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            {reason === 'expired'
              ? 'Az előző link lejárt. Adja meg email címét az új link küldéséhez.'
              : 'Adja meg email címét, és küldünk egy új meghívó linket.'}
          </p>

          {/* Form */}
          <RequestLinkForm
            defaultEmail={email}
            bypassRateLimit={reason === 'expired'}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Kérdés esetén:{' '}
          <a
            href="mailto:info@ceogala.hu"
            className="text-blue-600 hover:underline"
          >
            info@ceogala.hu
          </a>
        </p>
      </div>
    </div>
  );
}
