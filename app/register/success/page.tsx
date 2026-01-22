/**
 * Registration Success Page
 *
 * Displays success message after VIP or paid registration.
 * Design: Dark theme with gold accents (CEO Gala 2026 branding)
 */

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { getFullName } from '@/lib/utils/name';

interface SuccessPageProps {
  searchParams: Promise<{
    guest_id?: string;
    type?: string;
  }>;
}

// Star decoration component
function StarDecoration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
    </svg>
  );
}

// Decorative line with stars
function GoldLine() {
  return (
    <div className="flex items-center justify-center gap-2 my-6">
      <div className="h-px w-12 bg-[#d1aa67] opacity-50" />
      <StarDecoration className="w-3 h-3 text-[#d1aa67]" />
      <div className="h-px w-12 bg-[#d1aa67] opacity-50" />
    </div>
  );
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
  const isInvited = guest.guest_type === 'invited';
  const isPaid = registrationType === 'paid' || guest.guest_type === 'paying_single' || guest.guest_type === 'paying_paired';
  const ticketType = guest.registration?.ticket_type;
  const isPairedTicket = ticketType === 'paid_paired';
  const ticketPrice = isPairedTicket ? '180,000 Ft' : '100,000 Ft';
  const fullName = getFullName(guest.first_name, guest.last_name);
  const displayName = guest.title ? `${guest.title} ${fullName}` : fullName;

  return (
    <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1f] rounded-2xl shadow-2xl p-8 text-center border border-[#d1aa67]/30">
        {/* Success Icon with gold border */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#d1aa67] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#d1aa67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Title */}
        <h1
          className="text-2xl font-bold text-white mb-4"
          data-testid="success-title"
        >
          {isPaid ? 'Registration Saved!' : 'Your registration is complete'}
        </h1>

        {/* Success Message */}
        <p className="text-white/70 mb-6 text-sm" data-testid="success-message">
          {isVIP || isInvited
            ? 'Your QR ticket will arrive via email shortly.'
            : isPaid
            ? 'Payment options will be available soon.'
            : 'Your registration has been successfully recorded.'}
        </p>

        <GoldLine />

        {/* Guest Info */}
        <div className="bg-black/20 rounded-lg p-4 mb-6 border-l-4 border-[#d1aa67]">
          <h3 className="font-semibold text-[#d1aa67] mb-3 text-lg">Your Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Name:</span>
              <span className="text-white font-medium">{displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Email:</span>
              <span className="text-white font-medium">{guest.email}</span>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-2">
            CEO Gala 2026
          </h2>
          <p className="text-white/70 text-sm">
            Friday, March 27, 2026 • 7:00 PM
            <br />
            Budapest, Corinthia Hotel
          </p>
        </div>

        {/* Payment Section for Paid Guests */}
        {isPaid && guest.registration && (
          <div className="bg-[#b41115]/10 border border-[#b41115]/30 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-3">Payment</h3>
            <p className="text-white/70 text-sm mb-4">
              Your ticket price:{' '}
              <span className="font-bold text-[#d1aa67]">{ticketPrice}</span>
            </p>
            <form action="/api/stripe/redirect-to-checkout" method="POST">
              <input
                type="hidden"
                name="registration_id"
                value={guest.registration.id}
              />
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all bg-[#b41115] hover:bg-[#8a0d10] text-white flex items-center justify-center gap-2"
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
            <p className="text-xs text-white/50 mt-3">
              Secure payment via Stripe
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-black/20 rounded-lg p-4 mb-6 border-l-4 border-[#d1aa67]">
          <h3 className="font-semibold text-[#d1aa67] mb-3">Next Steps</h3>
          {isPaid ? (
            <ul className="text-white/70 text-sm text-left list-disc list-inside space-y-1">
              <li>Pay with card using the button above</li>
              <li>Or choose bank transfer</li>
              <li>You will receive the QR ticket after payment</li>
            </ul>
          ) : (
            <ul className="text-white/70 text-sm text-left list-disc list-inside space-y-1">
              <li>QR ticket will arrive via email</li>
              <li>Show the QR code at the check-in point</li>
              <li>Enjoy the event!</li>
            </ul>
          )}
        </div>

        <GoldLine />

        {/* Contact Info */}
        <div className="text-[10px] text-white/50 space-y-1">
          <p>
            Questions?{' '}
            <a
              href="https://bbj.hu/events/ceogala/#faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d1aa67] hover:underline"
            >
              Find answers in our FAQs
            </a>
          </p>
          <p>
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className="text-[#d1aa67] hover:underline">
              event@bbj.hu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
