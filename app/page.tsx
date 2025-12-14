'use client';

import Link from 'next/link';
import { Ticket, ShieldCheck, ClipboardText, Sparkle, Question } from '@phosphor-icons/react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <Sparkle weight="duotone" size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">CEO Gala 2026</h1>
          <p className="text-amber-100 text-lg">Event Registration System</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center mb-8">
            <p className="text-neutral-600 text-lg">
              Friday, March 27, 2026 • 6:00 PM
            </p>
            <p className="text-neutral-600">
              Budapest, Marriott Hotel
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/register/request-link"
              className="block h-full p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg group"
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="flex justify-center mb-3">
                  <Ticket weight="light" size={40} className="text-amber-600 group-hover:text-amber-700 transition-colors" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800 mb-2 group-hover:text-amber-700 transition-colors">
                  Guest Registration
                </h2>
                <p className="text-neutral-600 text-sm">
                  Register for the event with your invitation link
                </p>
              </div>
            </Link>

            <Link
              href="/admin/login"
              className="block h-full p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border-2 border-neutral-200 hover:border-neutral-400 transition-all hover:shadow-lg group"
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="flex justify-center mb-3">
                  <ShieldCheck weight="light" size={40} className="text-neutral-700 group-hover:text-neutral-800 transition-colors" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-800 mb-2 group-hover:text-neutral-700 transition-colors">
                  Admin Login
                </h2>
                <p className="text-neutral-600 text-sm">
                  Manage guests, seating, and check-ins
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <Link
              href="/status"
              className="block text-center p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors group"
            >
              <div className="flex justify-center mb-1">
                <ClipboardText weight="light" size={28} className="text-neutral-600 group-hover:text-neutral-700 transition-colors" />
              </div>
              <h3 className="font-medium text-neutral-800 mb-1">
                Check Registration Status
              </h3>
              <p className="text-neutral-600 text-sm">
                View your registration and payment status
              </p>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              <Question weight="regular" size={18} />
              <span>Need help? View FAQ & User Guide</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
