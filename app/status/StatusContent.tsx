'use client';

/**
 * Status Content Component
 *
 * Displays guest registration, payment, and ticket status
 * Story 2.6: Payment Status Dashboard for Guests
 */

import Image from 'next/image';
import Link from 'next/link';
import { User, Envelope, Ticket, CreditCard, QrCode, Clock, Users, ArrowLeft } from '@phosphor-icons/react';

interface StatusContentProps {
  guest: {
    name: string;
    email: string;
    guestType: string;
  };
  registration: {
    id: number;
    ticketType: string;
    registeredAt: string;
    partnerName: string | null;
  } | null;
  payment: {
    status: string;
    method: string | null;
    paidAt: string | null;
  } | null;
  ticket: {
    available: boolean;
    qrCodeDataUrl: string | null;
  };
  magicLinkCode: string;
  email: string;
}

// Bank transfer details for pending payments
const BANK_DETAILS = {
  bankName: 'OTP Bank',
  accountHolder: 'BBJ Events Organizing Committee',
  accountNumber: '11773016-01234567-00000000',
  iban: 'HU12 1177 3016 0123 4567 0000 0000',
  swift: 'OTPVHUHB',
};

// Ticket prices for display
const TICKET_PRICES: Record<string, string> = {
  paid_single: '100,000 Ft',
  paid_paired: '180,000 Ft',
  vip_free: 'Free',
};

// Ticket type labels
const TICKET_LABELS: Record<string, string> = {
  paid_single: 'Single Ticket',
  paid_paired: 'Paired Ticket',
  vip_free: 'Invited Ticket',
};

export default function StatusContent({
  guest,
  registration,
  payment,
  ticket,
}: StatusContentProps) {
  const isVIP = guest.guestType === 'vip';
  const isPending = payment?.status === 'pending';
  const isPaid = payment?.status === 'paid';
  const isFailed = payment?.status === 'failed';

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get payment status badge
  const getPaymentBadge = () => {
    if (isVIP) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-teal/10 text-accent-teal">
          Invited - Free
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
          Paid
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
          Pending Transfer
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Payment Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-600">
        No Registration
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
              CEO Gála 2026
            </h1>
          </Link>
          <p className="text-accent-teal uppercase tracking-widest text-sm font-sans">
            Registration Status
          </p>
        </div>

        {/* Guest Info Card */}
        <div className="bg-neutral-200 shadow-2xl rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-3">
            <User weight="light" size={24} className="text-accent-teal" />
            <h2 className="font-display text-lg font-semibold text-neutral-800">Guest Information</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-sans font-medium text-neutral-500 flex items-center gap-2">
                  <User weight="light" size={16} />
                  Name
                </dt>
                <dd className="mt-1 text-lg text-neutral-800 font-display">{guest.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-sans font-medium text-neutral-500 flex items-center gap-2">
                  <Envelope weight="light" size={16} />
                  Email
                </dt>
                <dd className="mt-1 text-lg text-neutral-800">{guest.email}</dd>
              </div>
              {registration && (
                <>
                  <div>
                    <dt className="text-sm font-sans font-medium text-neutral-500 flex items-center gap-2">
                      <Ticket weight="light" size={16} />
                      Ticket Type
                    </dt>
                    <dd className="mt-1 text-lg text-neutral-800">
                      {TICKET_LABELS[registration.ticketType] || registration.ticketType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-sans font-medium text-neutral-500 flex items-center gap-2">
                      <CreditCard weight="light" size={16} />
                      Price
                    </dt>
                    <dd className="mt-1 text-lg text-neutral-800 font-semibold">
                      {TICKET_PRICES[registration.ticketType] || 'N/A'}
                    </dd>
                  </div>
                  {registration.partnerName && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-sans font-medium text-neutral-500 flex items-center gap-2">
                        <Users weight="light" size={16} />
                        Partner Name
                      </dt>
                      <dd className="mt-1 text-lg text-neutral-800">{registration.partnerName}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-sans font-medium text-neutral-500 flex items-center gap-2">
                      <Clock weight="light" size={16} />
                      Registration Time
                    </dt>
                    <dd className="mt-1 text-neutral-700">{formatDate(registration.registeredAt)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="bg-neutral-200 shadow-2xl rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard weight="light" size={24} className="text-accent-teal" />
              <h2 className="font-display text-lg font-semibold text-neutral-800">Payment Status</h2>
            </div>
            {getPaymentBadge()}
          </div>
          <div className="px-6 py-5">
            {isPaid && payment?.paidAt && (
              <p className="text-neutral-600 font-sans">
                Paid: {formatDate(payment.paidAt)}
                {payment.method === 'card' && ' (Card)'}
                {payment.method === 'bank_transfer' && ' (Bank Transfer)'}
              </p>
            )}
            {isPending && (
              <div className="space-y-4">
                <p className="text-neutral-600 font-sans">
                  Your registration has been recorded. Please transfer the ticket price to the following bank account:
                </p>
                <div className="bg-neutral-100 rounded-lg p-4 border border-neutral-300">
                  <dl className="space-y-2 text-sm font-sans">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Bank:</dt>
                      <dd className="font-medium text-neutral-800">{BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Beneficiary:</dt>
                      <dd className="font-medium text-neutral-800">{BANK_DETAILS.accountHolder}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Account Number:</dt>
                      <dd className="font-medium text-neutral-800 font-mono">
                        {BANK_DETAILS.accountNumber}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">IBAN:</dt>
                      <dd className="font-medium text-neutral-800 font-mono text-xs">
                        {BANK_DETAILS.iban}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Amount:</dt>
                      <dd className="font-bold text-accent-teal">
                        {registration?.ticketType
                          ? TICKET_PRICES[registration.ticketType]
                          : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Reference:</dt>
                      <dd className="font-medium text-neutral-800">CEOGALA-{registration?.id}</dd>
                    </div>
                  </dl>
                </div>
                <p className="text-sm text-neutral-500 font-sans">
                  You will automatically receive your e-ticket via email after payment is received.
                </p>
              </div>
            )}
            {isFailed && (
              <div className="text-center py-4">
                <p className="text-red-600 mb-4 font-sans">Payment failed.</p>
                <a
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-teal hover:bg-accent-teal-dark transition-colors"
                >
                  Try Again
                </a>
              </div>
            )}
            {isVIP && (
              <p className="text-neutral-600 font-sans">
                As an invited guest, you have received a free invitation to the event.
              </p>
            )}
            {!registration && (
              <p className="text-neutral-600 font-sans">
                You have not registered for the event yet. Use the link from your invitation to
                register.
              </p>
            )}
          </div>
        </div>

        {/* Ticket Card - Only show if available */}
        {ticket.available && (
          <div className="bg-neutral-200 shadow-2xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-300 flex items-center gap-3">
              <QrCode weight="light" size={24} className="text-accent-teal" />
              <h2 className="font-display text-lg font-semibold text-neutral-800">E-Ticket</h2>
            </div>
            <div className="px-6 py-8 text-center">
              {ticket.qrCodeDataUrl ? (
                <div className="space-y-4">
                  <div className="inline-block p-4 bg-neutral-100 rounded-lg shadow-md border border-neutral-300">
                    <Image
                      src={ticket.qrCodeDataUrl}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-neutral-500 font-sans">
                    Show this QR code at the check-in point
                  </p>
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-800 font-medium font-sans">
                      We have sent/will send the e-ticket via email!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 font-sans">
                  <p>Generating QR code...</p>
                  <p className="text-sm mt-2">
                    If it doesn&apos;t appear, refresh the page or check your email.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft weight="regular" size={18} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] text-white/50 font-sans">
          <p>
            <Link href="/help" className="text-accent-gold hover:underline">
              Need help?
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/help" className="text-accent-gold hover:underline">
              Find answers in our FAQs
            </Link>
          </p>
          <p className="mt-2">© 2026 BBJ Events - Event Platform</p>
        </div>
      </div>
    </div>
  );
}
