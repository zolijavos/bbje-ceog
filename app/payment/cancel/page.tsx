/**
 * Payment Cancel Page
 *
 * Displays when user cancels Stripe checkout
 */

import Link from 'next/link';

interface PaymentCancelPageProps {
  searchParams: Promise<{ registration_id?: string }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: PaymentCancelPageProps) {
  const params = await searchParams;
  const registrationId = params.registration_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        {/* Warning Icon */}
        <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-amber-600"
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

        {/* Title */}
        <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-2">
          Payment Cancelled
        </h1>

        {/* Message */}
        <p className="text-neutral-500 font-sans mb-6">
          The payment process was interrupted. Your registration has been saved,
          you can retry payment at any time.
        </p>

        {/* Info Box */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left border-l-4 border-amber-500">
          <h2 className="font-display font-semibold text-neutral-800 mb-2">
            Don't Worry!
          </h2>
          <p className="text-sm text-neutral-500 font-sans">
            Your registration has not been lost. You can return and retry the payment,
            or choose bank transfer as well.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {registrationId && (
            <Link
              href={`/register/paid?retry=true&registration_id=${registrationId}`}
              className="btn btn-primary w-full text-center"
            >
              Try Again
            </Link>
          )}
          <Link
            href="/"
            className="btn btn-ghost w-full text-center"
          >
            Back to Home
          </Link>
        </div>

        {/* Contact Info */}
        <p className="text-sm text-neutral-500 mt-6 font-sans">
          <Link href="/help" className="text-accent-teal hover:underline">
            Need help?
          </Link>
        </p>
        <p className="text-sm text-neutral-500 mt-2 font-sans">
          Having problems?{' '}
          <Link
            href="/help"
            className="text-accent-teal hover:text-accent-teal-dark"
          >
            View Registration Guide
          </Link>
        </p>
      </div>
    </div>
  );
}
