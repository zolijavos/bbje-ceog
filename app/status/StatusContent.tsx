'use client';

/**
 * Status Content Component
 *
 * Displays guest registration, payment, and ticket status
 * Story 2.6: Payment Status Dashboard for Guests
 */

import Image from 'next/image';

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
  accountHolder: 'CEO Gala Organizing Committee',
  accountNumber: '11773016-01234567-00000000',
  iban: 'HU12 1177 3016 0123 4567 0000 0000',
  swift: 'OTPVHUHB',
};

// Ticket prices for display
const TICKET_PRICES: Record<string, string> = {
  paid_single: '20,000 Ft',
  paid_paired: '40,000 Ft',
  vip_free: 'Free',
};

// Ticket type labels
const TICKET_LABELS: Record<string, string> = {
  paid_single: 'Single Ticket',
  paid_paired: 'Paired Ticket',
  vip_free: 'VIP Ticket',
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
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          VIP - Free
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Paid
        </span>
      );
    }
    if (isPending) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        No Registration
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CEO Gala 2026</h1>
          <p className="mt-2 text-lg text-gray-600">Registration Status</p>
        </div>

        {/* Guest Info Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Guest Information</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-lg text-gray-900">{guest.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-lg text-gray-900">{guest.email}</dd>
              </div>
              {registration && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ticket Type</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      {TICKET_LABELS[registration.ticketType] || registration.ticketType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      {TICKET_PRICES[registration.ticketType] || 'N/A'}
                    </dd>
                  </div>
                  {registration.partnerName && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Partner Name</dt>
                      <dd className="mt-1 text-lg text-gray-900">{registration.partnerName}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Registration Time</dt>
                    <dd className="mt-1 text-gray-900">{formatDate(registration.registeredAt)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Payment Status Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Payment Status</h2>
            {getPaymentBadge()}
          </div>
          <div className="px-6 py-5">
            {isPaid && payment?.paidAt && (
              <p className="text-gray-600">
                Paid: {formatDate(payment.paidAt)}
                {payment.method === 'card' && ' (Card)'}
                {payment.method === 'bank_transfer' && ' (Bank Transfer)'}
              </p>
            )}
            {isPending && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your registration has been recorded. Please transfer the ticket price to the following bank account:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Bank:</dt>
                      <dd className="font-medium text-gray-900">{BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Beneficiary:</dt>
                      <dd className="font-medium text-gray-900">{BANK_DETAILS.accountHolder}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Account Number:</dt>
                      <dd className="font-medium text-gray-900 font-mono">
                        {BANK_DETAILS.accountNumber}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">IBAN:</dt>
                      <dd className="font-medium text-gray-900 font-mono text-xs">
                        {BANK_DETAILS.iban}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Amount:</dt>
                      <dd className="font-bold text-gray-900">
                        {registration?.ticketType
                          ? TICKET_PRICES[registration.ticketType]
                          : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Reference:</dt>
                      <dd className="font-medium text-gray-900">CEOGALA-{registration?.id}</dd>
                    </div>
                  </dl>
                </div>
                <p className="text-sm text-gray-500">
                  You will automatically receive your e-ticket via email after payment is received.
                </p>
              </div>
            )}
            {isFailed && (
              <div className="text-center py-4">
                <p className="text-red-600 mb-4">Payment failed.</p>
                <a
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </a>
              </div>
            )}
            {isVIP && (
              <p className="text-gray-600">
                As a VIP guest, you have received a free invitation to the event.
              </p>
            )}
            {!registration && (
              <p className="text-gray-600">
                You have not registered for the event yet. Use the link from your invitation to
                register.
              </p>
            )}
          </div>
        </div>

        {/* Ticket Card - Only show if available */}
        {ticket.available && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">E-Ticket</h2>
            </div>
            <div className="px-6 py-8 text-center">
              {ticket.qrCodeDataUrl ? (
                <div className="space-y-4">
                  <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                    <Image
                      src={ticket.qrCodeDataUrl}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Show this QR code at the check-in point
                  </p>
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">
                      We have sent/will send the e-ticket via email!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>Generating QR code...</p>
                  <p className="text-sm mt-2">
                    If it doesn't appear, refresh the page or check your email.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>For questions: info@ceogala.hu</p>
        </div>
      </div>
    </div>
  );
}
