/**
 * Registration Declined Page
 *
 * Displays message after guest declines attendance.
 */

import { redirect } from 'next/navigation';
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
    select: { id: true, name: true, email: true },
  });

  // Guest not found
  if (!guest) {
    redirect('/register?error=not_found');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Info Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-slate-500"
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
          className="text-2xl font-bold text-slate-900 mb-4"
          data-testid="declined-title"
        >
          Thank You for Your Response!
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-6" data-testid="declined-message">
          We hope to see you next time!
        </p>

        {/* Guest Name */}
        <p className="text-slate-500 mb-6">
          Dear <span className="font-medium">{guest.name}</span>, we are sorry
          that you cannot attend the CEO Gala 2026 event.
        </p>

        {/* Event Details */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            CEO Gala 2026
          </h2>
          <p className="text-slate-600 text-sm">
            Friday, March 27, 2026 • 6:00 PM
            <br />
            Budapest, Marriott Hotel
          </p>
        </div>

        {/* Future Contact */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-700 text-sm">
            If you change your mind, please contact us via email and we will
            help you with the registration.
          </p>
        </div>

        {/* Contact Info */}
        <p className="text-xs text-slate-400">
          Questions?{' '}
          <a
            href="mailto:info@ceogala.hu"
            className="text-amber-600 hover:underline"
          >
            info@ceogala.hu
          </a>
        </p>
      </div>
    </div>
  );
}
