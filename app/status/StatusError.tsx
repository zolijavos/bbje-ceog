/**
 * Status Error Component
 *
 * Displays error messages when status page access fails
 * Story 2.6: Payment Status Dashboard for Guests
 */

import Link from 'next/link';

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
            'The invitation link has expired. Links expire after 5 minutes for security reasons.',
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CEO Gala 2026</h1>
          <p className="mt-2 text-lg text-gray-600">Status Query</p>
        </div>

        {/* Error Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
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
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{errorContent.title}</h2>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">{errorContent.description}</p>

            {/* Actions */}
            <div className="space-y-3">
              {errorContent.showRequestLink && (
                <Link
                  href={`/register/request-link${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Request New Invitation Link
                </Link>
              )}

              <a
                href="mailto:info@ceogala.hu"
                className="block w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact us at{' '}
            <a href="mailto:info@ceogala.hu" className="text-blue-600 hover:text-blue-500">
              info@ceogala.hu
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
