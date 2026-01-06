'use client';

/**
 * VIP Confirmation Client Component
 *
 * Displays VIP guest info with confirm/decline buttons.
 * Includes:
 * - Profile fields (title, dietary, seating preferences)
 * - Consent checkboxes (GDPR, cancellation policy)
 * Handles API calls and redirects on success.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestProfileFields from '../components/GuestProfileFields';
import ConsentCheckboxes from '../components/ConsentCheckboxes';

interface Guest {
  id: number;
  name: string;
  email: string;
  guest_type: string;
  title?: string | null;
  phone?: string | null;
  company?: string | null;
  position?: string | null;
  dietary_requirements?: string | null;
  seating_preferences?: string | null;
}

interface VIPConfirmationProps {
  guest: Guest;
}

interface FormData {
  title: string;
  phone: string;
  company: string;
  position: string;
  dietaryRequirements: string;
  seatingPreferences: string;
  gdprConsent: boolean;
  cancellationAccepted: boolean;
  // Partner fields (optional for VIP)
  hasPartner: boolean;
  partnerName: string;
  partnerEmail: string;
  partnerGdprConsent: boolean;
}

interface FormErrors {
  title?: string;
  phone?: string;
  company?: string;
  position?: string;
  dietary_requirements?: string;
  seating_preferences?: string;
  gdpr_consent?: string;
  cancellation_accepted?: string;
  partner_name?: string;
  partner_email?: string;
  partner_gdpr_consent?: string;
}

export default function VIPConfirmation({ guest }: VIPConfirmationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: guest.title || '',
    phone: guest.phone || '',
    company: guest.company || '',
    position: guest.position || '',
    dietaryRequirements: guest.dietary_requirements || '',
    seatingPreferences: guest.seating_preferences || '',
    gdprConsent: false,
    cancellationAccepted: false,
    hasPartner: false,
    partnerName: '',
    partnerEmail: '',
    partnerGdprConsent: false,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.phone || formData.phone.trim().length < 9) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.company || formData.company.trim().length < 1) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.position || formData.position.trim().length < 1) {
      newErrors.position = 'Position is required';
    }

    // Partner validation (if bringing a partner)
    if (formData.hasPartner) {
      if (!formData.partnerName || formData.partnerName.trim().length < 2) {
        newErrors.partner_name = 'Partner name is required (min. 2 characters)';
      }
      if (!formData.partnerEmail || formData.partnerEmail.trim().length < 5) {
        newErrors.partner_email = 'Partner email is required';
      } else {
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.partnerEmail)) {
          newErrors.partner_email = 'Invalid email format';
        }
      }
      // Partner GDPR consent required
      if (!formData.partnerGdprConsent) {
        newErrors.partner_gdpr_consent = 'Partner GDPR consent is required';
      }
    }

    // Consent validation
    if (!formData.gdprConsent) {
      newErrors.gdpr_consent = 'GDPR consent is required';
    }
    if (!formData.cancellationAccepted) {
      newErrors.cancellation_accepted = 'Accepting cancellation terms is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/registration/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guest.id,
          attendance: 'confirm',
          title: formData.title || null,
          phone: formData.phone,
          company: formData.company,
          position: formData.position,
          dietary_requirements: formData.dietaryRequirements || null,
          seating_preferences: formData.seatingPreferences || null,
          gdpr_consent: formData.gdprConsent,
          cancellation_accepted: formData.cancellationAccepted,
          // Partner info (optional for VIP)
          has_partner: formData.hasPartner,
          partner_name: formData.hasPartner ? formData.partnerName : null,
          partner_email: formData.hasPartner ? formData.partnerEmail : null,
          partner_gdpr_consent: formData.hasPartner ? formData.partnerGdprConsent : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          router.push(`/register/vip/already-registered?guest_id=${guest.id}`);
          return;
        }
        throw new Error(data.error || 'An error occurred');
      }

      router.push(`/register/success?guest_id=${guest.id}&type=vip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/registration/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guest.id,
          attendance: 'decline',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      router.push(`/register/declined?guest_id=${guest.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  // Show initial confirmation screen
  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          {/* VIP Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-gold/10 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-accent-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          {/* Welcome Message */}
          <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-2">
            Dear {guest.name}!
          </h1>
          <p className="text-accent-gold font-semibold mb-6 font-sans uppercase tracking-wider text-sm">VIP Guest</p>

          {/* Event Details */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6 border-l-4 border-accent-gold">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h2 className="font-display text-lg font-semibold text-neutral-800 mb-2">
                CEO Gala 2026
              </h2>
            </Link>
            <p className="text-neutral-500 text-sm font-sans">
              Friday, March 27, 2026 • 6:00 PM
              <br />
              Budapest, Corinthia Hotel
            </p>
          </div>

          {/* Invitation Text */}
          <p className="text-neutral-500 mb-8 font-sans">
            It is our honor to welcome you as a VIP guest at the CEO
            Gala 2026 event.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary w-full py-4"
              data-testid="confirm-attendance-button"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Yes, I will attend
            </button>

            <button
              onClick={handleDecline}
              disabled={isLoading}
              className="btn btn-ghost w-full"
              data-testid="decline-attendance-button"
            >
              I cannot attend
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-sans">
              {error}
            </div>
          )}

          {/* Footer Note */}
          <p className="text-xs text-neutral-500 mt-6 font-sans">
            Your QR ticket will arrive via email after confirmation.
          </p>
        </div>
      </div>
    );
  }

  // Show registration form with profile fields and consent
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-700 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-gold/10 rounded-full mb-4">
            <svg
              className="w-6 h-6 text-accent-gold"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-neutral-800 mb-1">
            VIP Registration
          </h1>
          <p className="text-neutral-500 font-sans">Dear {guest.name}!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 font-sans">
            {error}
          </div>
        )}

        {/* Profile Fields Section */}
        <div className="mb-6">
          <h3 className="font-display text-lg font-medium text-neutral-800 mb-4">
            Personal Information
          </h3>
          <GuestProfileFields
            title={formData.title}
            phone={formData.phone}
            company={formData.company}
            position={formData.position}
            dietaryRequirements={formData.dietaryRequirements}
            seatingPreferences={formData.seatingPreferences}
            onTitleChange={(value) => setFormData((prev) => ({ ...prev, title: value }))}
            onPhoneChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            onCompanyChange={(value) => setFormData((prev) => ({ ...prev, company: value }))}
            onPositionChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}
            onDietaryChange={(value) => setFormData((prev) => ({ ...prev, dietaryRequirements: value }))}
            onSeatingChange={(value) => setFormData((prev) => ({ ...prev, seatingPreferences: value }))}
            errors={errors}
          />
        </div>

        {/* Partner Section (Optional for VIP) */}
        <div className="mb-6">
          <h3 className="font-display text-lg font-medium text-neutral-800 mb-4">
            Bringing a Partner?
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            As a VIP guest, you may bring one partner free of charge.
          </p>

          {/* Partner Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={formData.hasPartner}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  hasPartner: checked,
                  // Clear partner fields when unchecked
                  ...(checked ? {} : { partnerName: '', partnerEmail: '', partnerGdprConsent: false }),
                }));
                // Clear partner errors when unchecked
                if (!checked) {
                  setErrors((prev) => {
                    const { partner_name, partner_email, partner_gdpr_consent, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              className="w-5 h-5 rounded border-neutral-300 text-accent-gold focus:ring-accent-gold"
            />
            <span className="text-neutral-800 font-sans">
              Yes, I would like to bring a partner
            </span>
          </label>

          {/* Partner Details (shown when checkbox is checked) */}
          {formData.hasPartner && (
            <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              {/* Partner Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerName: e.target.value }))}
                  placeholder="Full name"
                  className={`input w-full ${errors.partner_name ? 'border-red-500' : ''}`}
                />
                {errors.partner_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.partner_name}</p>
                )}
              </div>

              {/* Partner Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Partner Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.partnerEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerEmail: e.target.value }))}
                  placeholder="partner@example.com"
                  className={`input w-full ${errors.partner_email ? 'border-red-500' : ''}`}
                />
                {errors.partner_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.partner_email}</p>
                )}
                <p className="text-xs text-neutral-600 mt-1">
                  Your partner will receive their own ticket via email.
                </p>
              </div>

              {/* Partner GDPR Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.partnerGdprConsent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partnerGdprConsent: e.target.checked }))}
                    className={`w-5 h-5 mt-0.5 rounded border-neutral-300 text-accent-gold focus:ring-accent-gold ${errors.partner_gdpr_consent ? 'border-red-500' : ''}`}
                  />
                  <span className="text-sm text-neutral-700">
                    I confirm that my partner has consented to the processing of their personal data according to the <a href="/privacy" target="_blank" className="text-accent-gold hover:underline">Privacy Policy</a>. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.partner_gdpr_consent && (
                  <p className="text-red-500 text-sm mt-1 ml-8">{errors.partner_gdpr_consent}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Consent Section */}
        <div className="mb-8">
          <h3 className="font-display text-lg font-medium text-neutral-800 mb-4">
            Consents
          </h3>
          <ConsentCheckboxes
            gdprConsent={formData.gdprConsent}
            cancellationAccepted={formData.cancellationAccepted}
            onGdprChange={(checked) => setFormData((prev) => ({ ...prev, gdprConsent: checked }))}
            onCancellationChange={(checked) => setFormData((prev) => ({ ...prev, cancellationAccepted: checked }))}
            errors={errors}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(false)}
            disabled={isLoading}
            className="btn btn-ghost flex-1"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="btn btn-primary flex-1"
            data-testid="submit-button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </div>

        {/* Event Info Footer */}
        <div className="mt-8 pt-6 border-t border-neutral-300/20">
          <div className="text-center text-sm text-neutral-500 font-sans">
            <Link href="/" className="font-medium text-neutral-800 hover:text-accent-gold transition-colors">CEO Gala 2026</Link>
            <p>Friday, March 27, 2026 • 6:00 PM • Budapest, Corinthia Hotel</p>
            <p className="mt-3">
              <Link href="/help" className="text-accent-gold hover:underline">
                Need help?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
