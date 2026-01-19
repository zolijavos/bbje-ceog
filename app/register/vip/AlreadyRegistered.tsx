'use client';

import Link from 'next/link';

/**
 * Already Registered Component
 *
 * Displays message when VIP guest has already registered or declined.
 */

interface Guest {
  id: number;
  name: string;
  email: string;
  guest_type: string;
  registration_status: string;
}

interface AlreadyRegisteredProps {
  guest: Guest;
  declined?: boolean;
}

export default function AlreadyRegistered({
  guest,
  declined = false,
}: AlreadyRegisteredProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Status Icon */}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
            declined ? 'bg-slate-100' : 'bg-green-100'
          }`}
        >
          {declined ? (
            <svg
              className="w-8 h-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 text-green-600"
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
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Kedves {guest.name}!
        </h1>

        {/* Status Message */}
        {declined ? (
          <>
            <p className="text-slate-600 mb-6" data-testid="declined-message">
              You have previously indicated that you cannot attend the CEO Gála 2026
              event.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-slate-500 text-sm">
                If you have changed your mind and would like to attend, please
                contact the organizers.
              </p>
            </div>
          </>
        ) : (
          <>
            <p
              className="text-green-600 font-semibold mb-4"
              data-testid="already-registered-message"
            >
              You have already registered for this event.
            </p>
            <p className="text-slate-600 mb-6">
              Your registration has been recorded. Your QR ticket will arrive
              via email shortly.
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-400">
              <h3 className="font-semibold text-green-800 mb-2">
                Registration Status
              </h3>
              <p className="text-green-700 text-sm">
                ✓ Attendance confirmed
                <br />✓ VIP guest status
              </p>
            </div>
          </>
        )}

        {/* Event Info */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            CEO Gála 2026
          </h2>
          <p className="text-slate-600 text-sm">
            Friday, March 27, 2026 • 6:00 PM
            <br />
            Budapest, Corinthia Hotel
          </p>
        </div>

        {/* Contact Info */}
        <div className="text-xs space-y-2">
          <p className="text-slate-500">
            Questions?{' '}
            <Link
              href="/help"
              className="text-amber-600 hover:underline"
            >
              View Registration Guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
