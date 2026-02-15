'use client';

import { X, CreditCard, Bank, User, Buildings, MapPin, Receipt } from '@phosphor-icons/react';

interface BillingInfo {
  billing_first_name: string;
  billing_last_name: string;
  billingName: string; // Computed full name
  company_name: string | null;
  tax_number: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
}

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // Computed full name
  email: string;
  guestType: string;
  paymentMethod: 'card' | 'bank_transfer' | null;
  billingInfo: BillingInfo | null;
  partnerFirstName: string | null;
  partnerLastName: string | null;
  partnerName: string | null; // Computed full name
  partnerEmail: string | null;
  partnerGuest?: { id: number; firstName: string; lastName: string; name: string; email: string } | null;
}

interface PaymentApprovalModalProps {
  guest: Guest;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Ticket prices (should match constants)
const TICKET_PRICES = {
  single: 50000,
  paired: 90000,
};

export default function PaymentApprovalModal({
  guest,
  isLoading,
  onConfirm,
  onClose,
}: PaymentApprovalModalProps) {
  const isPaired = guest.guestType === 'paying_paired';
  const ticketPrice = isPaired ? TICKET_PRICES.paired : TICKET_PRICES.single;
  const ticketTypeLabel = isPaired ? 'Paros jegy' : 'Egyeni jegy';
  const paymentMethodLabel = guest.paymentMethod === 'bank_transfer' ? 'Banki atutalas' : 'Kartyas fizetes';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Fizetes jovahagyasa
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Guest Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} weight="duotone" className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{guest.name}</p>
                  <p className="text-sm text-gray-500">{guest.email}</p>
                </div>
              </div>

              {/* Partner info if paired */}
              {isPaired && (guest.partnerName || guest.partnerGuest) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Partner:</p>
                  <p className="font-medium text-gray-900">
                    {guest.partnerGuest?.name || guest.partnerName}
                  </p>
                  {(guest.partnerGuest?.email || guest.partnerEmail) && (
                    <p className="text-sm text-gray-500">
                      {guest.partnerGuest?.email || guest.partnerEmail}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Receipt size={18} weight="duotone" className="text-gray-500" />
                Fizetes reszletei
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Jegy tipusa</p>
                  <p className="font-medium text-gray-900">{ticketTypeLabel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fizetes modja</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Bank size={16} weight="duotone" className="text-gray-500" />
                    {paymentMethodLabel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Osszeg</p>
                  <p className="font-semibold text-lg text-emerald-600">
                    {ticketPrice.toLocaleString('hu-HU')} Ft
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Statusz</p>
                  <p className="font-medium text-amber-600">Fizetesre var</p>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            {guest.billingInfo && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Buildings size={18} weight="duotone" className="text-gray-500" />
                  Szamlazasi adatok
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-medium text-gray-900">
                    {guest.billingInfo.billingName}
                  </p>
                  {guest.billingInfo.company_name && (
                    <p className="text-gray-600">{guest.billingInfo.company_name}</p>
                  )}
                  {guest.billingInfo.tax_number && (
                    <p className="text-gray-500">
                      Adoszam: {guest.billingInfo.tax_number}
                    </p>
                  )}
                  <div className="flex items-start gap-1 text-gray-600">
                    <MapPin size={16} weight="duotone" className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{guest.billingInfo.address_line1}</p>
                      {guest.billingInfo.address_line2 && (
                        <p>{guest.billingInfo.address_line2}</p>
                      )}
                      <p>
                        {guest.billingInfo.postal_code} {guest.billingInfo.city}
                      </p>
                      <p>{guest.billingInfo.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Figyelem:</strong> A jovahagyas utan automatikusan elkuldunk egy
                e-ticketet a vendegnek (es partnerenek, ha van). Ellenorizd, hogy a
                banki atutalas valoban megerkezett!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Megse
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Feldolgozas...
                </>
              ) : (
                'Fizetes jovahagyasa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
