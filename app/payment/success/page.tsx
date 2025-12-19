/**
 * Payment Success Page
 *
 * Displays after successful Stripe checkout
 */

import Link from 'next/link';

interface PaymentSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-emerald-600"
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
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-2">
          Payment Successful!
        </h1>

        {/* Message */}
        <p className="text-neutral-500 font-sans mb-6">
          Thank you for registering! We will send your e-ticket via email shortly.
        </p>

        {/* Details */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left border-l-4 border-accent-teal">
          <h2 className="font-display font-semibold text-neutral-800 mb-2">What happens now?</h2>
          <ul className="text-sm text-neutral-500 space-y-2 font-sans">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Payment has been successfully processed</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>QR code e-ticket has been automatically generated</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span>Check your email for the ticket</span>
            </li>
          </ul>
        </div>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <p className="text-xs text-neutral-500/60 mb-6 font-sans">
            Transaction: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="btn btn-primary w-full text-center"
          >
            Back to Home
          </Link>
        </div>

        {/* Help Link */}
        <p className="text-sm text-neutral-500 mt-6 font-sans">
          <Link href="/help" className="text-accent-teal hover:underline">
            Segítségre van szüksége?
          </Link>
        </p>
      </div>
    </div>
  );
}
