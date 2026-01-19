/**
 * Registration Success Page
 *
 * Displays success message after VIP or paid registration.
 */

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';

interface SuccessPageProps {
  searchParams: Promise<{
    guest_id?: string;
    type?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const guestIdParam = params.guest_id;
  const registrationType = params.type || 'vip';

  // Validate guest_id parameter
  if (!guestIdParam) {
    redirect('/register?error=missing_params');
  }

  const guestId = parseInt(guestIdParam, 10);
  if (isNaN(guestId)) {
    redirect('/register?error=invalid_params');
  }

  // Get guest from database
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { registration: true },
  });

  // Guest not found
  if (!guest) {
    redirect('/register?error=not_found');
  }

  const isVIP = registrationType === 'vip' || guest.guest_type === 'vip';
  const isPaid = registrationType === 'paid' || guest.guest_type === 'paying_single' || guest.guest_type === 'paying_paired';
  const ticketType = guest.registration?.ticket_type;
  const isPairedTicket = ticketType === 'paid_paired';
  const ticketPrice = isPairedTicket ? '180,000 Ft' : '100,000 Ft';

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-teal/10 rounded-full mb-6">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Title */}
        <h1
          className="font-display text-2xl font-semibold text-neutral-800 mb-4"
          data-testid="success-title"
        >
          {isPaid ? 'Registration Saved!' : 'Thank You for Confirming!'}
        </h1>

        {/* Success Message */}
        <p className="text-neutral-500 mb-6 font-sans" data-testid="success-message">
          {isVIP
            ? 'Your QR ticket will arrive via email shortly.'
            : isPaid
            ? 'Payment options will be available soon.'
            : 'Your registration has been successfully recorded.'}
        </p>

        {/* Guest Info */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 border-l-4 border-accent-teal">
          <h3 className="font-display font-semibold text-neutral-800 mb-2">Registration Details</h3>
          <p className="text-neutral-500 text-sm font-sans">
            <span className="font-medium text-neutral-800">Name:</span> {guest.name}
            <br />
            <span className="font-medium text-neutral-800">Email:</span> {guest.email}
            <br />
            <span className="font-medium text-neutral-800">Status:</span>{' '}
            {isVIP ? 'VIP Guest' : isPairedTicket ? 'Paired Ticket' : 'Single Ticket'}
          </p>
        </div>

        {/* Event Details */}
        <div className="bg-neutral-100 rounded-lg p-4 mb-6">
          <h2 className="font-display text-lg font-semibold text-neutral-900 mb-2">
            CEO Gála 2026
          </h2>
          <p className="text-neutral-700 text-sm font-sans">
            Friday, March 27, 2026 • 6:00 PM
            <br />
            Budapest, Corinthia Hotel
          </p>
        </div>

        {/* Payment Section for Paid Guests */}
        {isPaid && guest.registration && (
          <div className="bg-accent-teal/5 border border-accent-teal/20 rounded-lg p-4 mb-6">
            <h3 className="font-display font-semibold text-neutral-800 mb-3">Payment</h3>
            <p className="text-neutral-500 text-sm mb-4 font-sans">
              Your ticket price:{' '}
              <span className="font-bold text-accent-teal">{ticketPrice}</span>
            </p>
            <form action="/api/stripe/redirect-to-checkout" method="POST">
              <input
                type="hidden"
                name="registration_id"
                value={guest.registration.id}
              />
              <button
                type="submit"
                className="btn btn-primary w-full"
                data-testid="pay-with-card-button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Pay with Card
              </button>
            </form>
            <p className="text-xs text-neutral-500 mt-3 font-sans">
              Secure payment via Stripe
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 border-l-4 border-amber-500">
          <h3 className="font-display font-semibold text-neutral-800 mb-2">Next Steps</h3>
          {isPaid ? (
            <ul className="text-neutral-500 text-sm text-left list-disc list-inside font-sans">
              <li>Pay with card using the button above</li>
              <li>Or choose bank transfer</li>
              <li>You will receive the QR ticket after payment</li>
            </ul>
          ) : (
            <ul className="text-neutral-500 text-sm text-left list-disc list-inside font-sans">
              <li>QR ticket will arrive via email</li>
              <li>Show the QR code at the check-in point</li>
              <li>Enjoy the event!</li>
            </ul>
          )}
        </div>

        {/* PWA Download Section - Hidden for now */}
        {/* {isVIP && (
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="font-display font-semibold text-white text-sm">Download the Gala App</h3>
            </div>
            <p className="text-white text-sm mb-3 font-sans">
              Access your ticket &amp; event info - even offline!
            </p>
            <Link
              href="/pwa"
              className="inline-block bg-white text-teal-700 font-semibold text-sm px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              Open Gala App
            </Link>
          </div>
        )} */}

        {/* Contact Info */}
        <div className="text-xs font-sans space-y-2">
          <p className="text-neutral-600">
            Questions?{' '}
            <Link
              href="/help"
              className="text-accent-teal hover:text-accent-teal-dark"
            >
              View Registration Guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
