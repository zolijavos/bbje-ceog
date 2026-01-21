/**
 * Registration Declined Page
 *
 * Displays message after guest declines attendance.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

interface DeclinedPageProps {
  searchParams: Promise<{
    guest_id?: string;
  }>;
}

export default async function DeclinedPage({ searchParams }: DeclinedPageProps) {
  const params = await searchParams;
  const guestIdParam = params.guest_id;

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
    select: { id: true, first_name: true, last_name: true, email: true },
  });

  // Guest not found
  if (!guest) {
    redirect('/register?error=not_found');
  }

  return (
    <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1f] rounded-2xl shadow-2xl p-8 text-center border border-[#d1aa67]/30">
        {/* Info Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#d1aa67]/10 rounded-full mb-6 border-2 border-[#d1aa67]/50">
          <svg
            className="w-10 h-10 text-[#d1aa67]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold text-white mb-4"
          data-testid="declined-title"
        >
          Thank You for Your Response!
        </h1>

        {/* Message */}
        <p className="text-white/70 mb-6" data-testid="declined-message">
          We hope to see you next time!
        </p>

        {/* Guest Name */}
        <p className="text-white/60 mb-6">
          <span className="font-medium text-[#d1aa67]">{guest.first_name} {guest.last_name}</span>, we are sorry
          that you cannot attend the CEO Gala 2026 event.
        </p>

        {/* Event Details */}
        <div className="bg-[#2a2a2f] rounded-lg p-4 mb-6 border border-[#d1aa67]/20">
          <h2 className="text-lg font-semibold text-[#d1aa67] mb-2">
            CEO Gala 2026
          </h2>
          <p className="text-white/70 text-sm">
            Friday, March 27, 2026 • 6:00 PM
            <br />
            Budapest, Corinthia Hotel
          </p>
        </div>

        {/* Future Contact */}
        <div className="bg-[#d1aa67]/10 border border-[#d1aa67]/30 rounded-lg p-4 mb-6">
          <p className="text-white/80 text-sm">
            If you change your mind, please contact us via email and we will
            help you with the registration.
          </p>
        </div>

        {/* Contact Info */}
        <div className="text-xs space-y-1">
          <p className="text-white/40">
            Questions?{' '}
            <a
              href="https://bbj.hu/events/ceogala/#faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d1aa67] hover:text-[#e5c078]"
            >
              View Registration Guide
            </a>
          </p>
          <p className="text-white/40">
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className="text-[#d1aa67] hover:text-[#e5c078]">
              event@bbj.hu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
