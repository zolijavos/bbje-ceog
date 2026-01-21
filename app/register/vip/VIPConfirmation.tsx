'use client';

/**
 * VIP Confirmation Client Component
 *
 * Displays VIP guest info with confirm/decline buttons.
 * Implements 4-screen registration flow:
 * - Screen 1: Invitation (Yes/No)
 * - Screen 2: Confirmation (Thank you, continue)
 * - Screen 3: Registration Details (form)
 * - Screen 4: Redirect to success page
 *
 * Themes: Dark (#0c0d0e), Dark Blue (#120c3a), Light (#ffffff)
 * Brand colors: Gold (#d1aa67), Red (#b41115)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestProfileFields from '../components/GuestProfileFields';
import ConsentCheckboxes from '../components/ConsentCheckboxes';

// Theme definitions
type Theme = 'dark' | 'dark-blue' | 'light';

const themes = {
  dark: {
    bg: 'bg-[#0c0d0e]',
    cardBg: 'bg-[#1a1a1f]',
    cardBorder: 'border-[#d1aa67]/30',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSubtle: 'text-white/50',
    gold: 'text-[#d1aa67]',
    goldBg: 'bg-[#d1aa67]',
    buttonPrimary: 'bg-[#b41115] hover:bg-[#8a0d10] text-white',
    buttonSecondary: 'bg-transparent border border-white/30 hover:bg-white/10 text-white',
    inputBg: 'bg-[#2a2a2f] border-[#d1aa67]/30 text-white placeholder-white/40',
    footerText: 'text-white/40',
  },
  'dark-blue': {
    bg: 'bg-[#120c3a]',
    cardBg: 'bg-[#1a1445]',
    cardBorder: 'border-[#d1aa67]/30',
    text: 'text-white',
    textMuted: 'text-white/70',
    textSubtle: 'text-white/50',
    gold: 'text-[#d1aa67]',
    goldBg: 'bg-[#d1aa67]',
    buttonPrimary: 'bg-[#b41115] hover:bg-[#8a0d10] text-white',
    buttonSecondary: 'bg-transparent border border-white/30 hover:bg-white/10 text-white',
    inputBg: 'bg-[#2a2455] border-[#d1aa67]/30 text-white placeholder-white/40',
    footerText: 'text-white/40',
  },
  light: {
    bg: 'bg-[#f5f0e8]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#d1aa67]/40',
    text: 'text-[#0c0d0e]',
    textMuted: 'text-[#0c0d0e]/70',
    textSubtle: 'text-[#0c0d0e]/50',
    gold: 'text-[#d1aa67]',
    goldBg: 'bg-[#d1aa67]',
    buttonPrimary: 'bg-[#b41115] hover:bg-[#8a0d10] text-white',
    buttonSecondary: 'bg-transparent border border-[#0c0d0e]/30 hover:bg-[#0c0d0e]/10 text-[#0c0d0e]',
    inputBg: 'bg-[#f5f0e8] border-[#d1aa67]/40 text-[#0c0d0e] placeholder-[#0c0d0e]/40',
    footerText: 'text-[#0c0d0e]/40',
  },
};

// Screen states
type ScreenState = 'invitation' | 'confirmation' | 'registration';

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
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
  partnerTitle: string;
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerCompany: string;
  partnerPosition: string;
  partnerDietaryRequirements: string;
  partnerSeatingPreferences: string;
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
  partner_title?: string;
  partner_name?: string;
  partner_email?: string;
  partner_phone?: string;
  partner_company?: string;
  partner_position?: string;
  partner_gdpr_consent?: string;
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
function GoldLine({ theme }: { theme: typeof themes.dark }) {
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <div className={`h-px w-12 ${theme.goldBg} opacity-50`} />
      <StarDecoration className={`w-3 h-3 ${theme.gold}`} />
      <div className={`h-px w-12 ${theme.goldBg} opacity-50`} />
    </div>
  );
}

// Footer component
function PoweredByFooter() {
  return (
    <div className={`text-center mt-8 pt-4 border-t border-white/10`} />
  );
}

export default function VIPConfirmation({ guest }: VIPConfirmationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [screenState, setScreenState] = useState<ScreenState>('invitation');
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('registration-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  // Get current theme styles
  const t = themes[theme];

  // Compose full name and display name
  const fullName = `${guest.first_name} ${guest.last_name}`;
  // Get display name with title (e.g., "Dr. John Smith")
  const displayName = guest.title ? `${guest.title} ${fullName}` : fullName;

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
    partnerTitle: '',
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    partnerCompany: '',
    partnerPosition: '',
    partnerDietaryRequirements: '',
    partnerSeatingPreferences: '',
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
      if (!formData.partnerTitle) {
        newErrors.partner_title = 'Partner title is required';
      }
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
      if (!formData.partnerPhone || formData.partnerPhone.trim().length < 9) {
        newErrors.partner_phone = 'Partner phone number is required';
      }
      if (!formData.partnerCompany || formData.partnerCompany.trim().length < 1) {
        newErrors.partner_company = 'Partner company name is required';
      }
      if (!formData.partnerPosition || formData.partnerPosition.trim().length < 1) {
        newErrors.partner_position = 'Partner position is required';
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
    if (!validateForm()) {
      // Scroll to error summary
      setTimeout(() => {
        const errorSummary = document.getElementById('error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

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
          partner_title: formData.hasPartner ? (formData.partnerTitle || null) : null,
          partner_phone: formData.hasPartner ? (formData.partnerPhone || null) : null,
          partner_company: formData.hasPartner ? (formData.partnerCompany || null) : null,
          partner_position: formData.hasPartner ? (formData.partnerPosition || null) : null,
          partner_dietary_requirements: formData.hasPartner ? (formData.partnerDietaryRequirements || null) : null,
          partner_seating_preferences: formData.hasPartner ? (formData.partnerSeatingPreferences || null) : null,
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

  // ========================================
  // SCREEN 1: INVITATION
  // ========================================
  if (screenState === 'invitation') {
    return (
      <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
        <div className={`max-w-sm w-full ${t.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${t.cardBorder}`}>
          {/* Decorative stars at top */}
          <div className="flex justify-center gap-1 mb-2">
            <StarDecoration className={`w-4 h-4 ${t.gold} opacity-60`} />
            <StarDecoration className={`w-5 h-5 ${t.gold}`} />
            <StarDecoration className={`w-4 h-4 ${t.gold} opacity-60`} />
          </div>

          {/* Dear Label */}
          <p className={`text-xs uppercase tracking-[3px] ${t.textMuted} mt-4`}>
            Dear
          </p>

          {/* Guest Name */}
          <h1 className={`text-2xl font-semibold ${t.text} mt-2 mb-2`}>
            {displayName}
          </h1>

          <GoldLine theme={t} />

          {/* Event Title */}
          <h2 className={`text-xl font-bold ${t.text} tracking-wide`}>
            CEO Gala 2026
          </h2>

          {/* Event Details */}
          <div className={`${t.textMuted} text-sm mt-3 space-y-1`}>
            <p>Friday, March 27, 2026 • 6:00 PM</p>
            <p>Budapest, Corinthia Hotel</p>
          </div>

          <GoldLine theme={t} />

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            <button
              onClick={() => setScreenState('confirmation')}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${t.buttonPrimary}`}
              data-testid="confirm-attendance-button"
            >
              YES, I WILL ATTEND
            </button>

            <button
              onClick={handleDecline}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-sm uppercase tracking-wider transition-all ${t.buttonSecondary}`}
              data-testid="decline-attendance-button"
            >
              {isLoading ? 'Processing...' : 'I CANNOT ATTEND'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <PoweredByFooter />
        </div>
      </div>
    );
  }

  // ========================================
  // SCREEN 2: CONFIRMATION (Thank You)
  // ========================================
  if (screenState === 'confirmation') {
    return (
      <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
        <div className={`max-w-sm w-full ${t.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${t.cardBorder}`}>
          {/* Checkmark Icon with gold border */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-[#d1aa67] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#d1aa67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Thank You Heading */}
          <h1 className={`text-2xl font-bold ${t.text} mb-4`}>
            Thank You for Your Response!
          </h1>

          {/* Subtext */}
          <p className={`${t.textMuted} text-sm mb-2`}>
            You will receive a confirmation email shortly.
          </p>
          <p className={`${t.textMuted} text-sm mb-8`}>
            Please continue to registration.
          </p>

          {/* Continue Button */}
          <button
            onClick={() => setScreenState('registration')}
            className={`w-full py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${t.buttonPrimary} flex items-center justify-center gap-2`}
          >
            CONTINUE TO REGISTRATION
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <PoweredByFooter />
        </div>
      </div>
    );
  }

  // ========================================
  // SCREEN 3: REGISTRATION FORM
  // ========================================
  return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center p-4`}>
      <div className={`max-w-lg w-full ${t.cardBg} rounded-2xl shadow-2xl p-8 border ${t.cardBorder}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center gap-1 mb-4">
            <StarDecoration className={`w-4 h-4 ${t.gold} opacity-60`} />
            <StarDecoration className={`w-5 h-5 ${t.gold}`} />
            <StarDecoration className={`w-4 h-4 ${t.gold} opacity-60`} />
          </div>
          <h1 className={`text-xl font-semibold ${t.text} mb-1`}>
            Registration Details
          </h1>

          {/* Guest Info Summary */}
          <div className={`mt-4 p-4 rounded-lg ${theme === 'light' ? 'bg-[#f5f0e8]' : 'bg-black/20'}`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={t.textMuted}>Name:</span>
                <span className={`${t.text} font-medium`}>{displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className={t.textMuted}>Email:</span>
                <span className={`${t.text} font-medium`}>{guest.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={t.textMuted}>Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.goldBg} text-[#0c0d0e]`}>
                  VIP Guest
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Validation Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div
            id="error-summary"
            className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-red-300 text-sm">
                Please fix the following errors:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-300">
              {errors.phone && <li>Phone: {errors.phone}</li>}
              {errors.company && <li>Company: {errors.company}</li>}
              {errors.position && <li>Position: {errors.position}</li>}
              {errors.partner_title && <li>Partner Title: {errors.partner_title}</li>}
              {errors.partner_name && <li>Partner Name: {errors.partner_name}</li>}
              {errors.partner_email && <li>Partner Email: {errors.partner_email}</li>}
              {errors.partner_phone && <li>Partner Phone: {errors.partner_phone}</li>}
              {errors.partner_company && <li>Partner Company: {errors.partner_company}</li>}
              {errors.partner_position && <li>Partner Position: {errors.partner_position}</li>}
              {errors.partner_gdpr_consent && <li>Partner Consent: {errors.partner_gdpr_consent}</li>}
              {errors.gdpr_consent && <li>GDPR: {errors.gdpr_consent}</li>}
              {errors.cancellation_accepted && <li>Cancellation: {errors.cancellation_accepted}</li>}
            </ul>
          </div>
        )}

        {/* Profile Fields Section */}
        <div className="mb-6">
          <h3 className={`text-lg font-medium ${t.text} mb-4`}>
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
          <h3 className={`text-lg font-medium ${t.text} mb-4`}>
            Bringing a Partner?
          </h3>
          <p className={`text-sm ${t.textMuted} mb-4`}>
            As an invited guest, you may bring one partner free of charge.
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
                  ...(checked ? {} : {
                    partnerTitle: '',
                    partnerName: '',
                    partnerEmail: '',
                    partnerPhone: '',
                    partnerCompany: '',
                    partnerPosition: '',
                    partnerDietaryRequirements: '',
                    partnerSeatingPreferences: '',
                    partnerGdprConsent: false
                  }),
                }));
                // Clear partner errors when unchecked
                if (!checked) {
                  setErrors((prev) => {
                    const { partner_name, partner_email, partner_gdpr_consent, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              className="w-5 h-5 rounded border-[#d1aa67]/50 text-[#d1aa67] focus:ring-[#d1aa67] bg-transparent"
            />
            <span className={t.text}>
              Yes, I would like to bring a partner
            </span>
          </label>

          {/* Partner Details (shown when checkbox is checked) */}
          {formData.hasPartner && (
            <div className={`space-y-4 p-4 rounded-lg border ${theme === 'light' ? 'bg-[#f5f0e8] border-[#d1aa67]/30' : 'bg-black/20 border-[#d1aa67]/20'}`}>
              {/* Partner Title */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Title <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.partnerTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerTitle: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg} ${errors.partner_title ? 'border-red-500' : ''}`}
                >
                  <option value="">-- Please select --</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Prof. Dr.">Prof. Dr.</option>
                </select>
                {errors.partner_title && (
                  <p className="text-red-400 text-sm mt-1">{errors.partner_title}</p>
                )}
              </div>

              {/* Partner Name */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerName: e.target.value }))}
                  placeholder="Full name"
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg} ${errors.partner_name ? 'border-red-500' : ''}`}
                />
                {errors.partner_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.partner_name}</p>
                )}
              </div>

              {/* Partner Email */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.partnerEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerEmail: e.target.value }))}
                  placeholder="partner@example.com"
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg} ${errors.partner_email ? 'border-red-500' : ''}`}
                />
                {errors.partner_email && (
                  <p className="text-red-400 text-sm mt-1">{errors.partner_email}</p>
                )}
                <p className={`text-xs ${t.textSubtle} mt-1`}>
                  Your partner will receive their own ticket via email.
                </p>
              </div>

              {/* Partner Phone */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Phone <span className="text-[#b41115]">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.partnerPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerPhone: e.target.value }))}
                  placeholder="+36 30 123 4567"
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg} ${errors.partner_phone ? 'border-red-500' : ''}`}
                />
                {errors.partner_phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.partner_phone}</p>
                )}
              </div>

              {/* Partner Company */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Company / Organization <span className="text-[#b41115]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partnerCompany}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerCompany: e.target.value }))}
                  placeholder="Company Ltd."
                  maxLength={255}
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg} ${errors.partner_company ? 'border-red-500' : ''}`}
                />
                {errors.partner_company && (
                  <p className="text-red-400 text-sm mt-1">{errors.partner_company}</p>
                )}
              </div>

              {/* Partner Position */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Position <span className="text-[#b41115]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partnerPosition}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerPosition: e.target.value }))}
                  placeholder="CEO"
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg} ${errors.partner_position ? 'border-red-500' : ''}`}
                />
                {errors.partner_position && (
                  <p className="text-red-400 text-sm mt-1">{errors.partner_position}</p>
                )}
              </div>

              {/* Partner Dietary Requirements */}
              <div>
                <label className={`block text-sm font-medium ${t.text} mb-1`}>
                  Partner Dietary Requirements (optional)
                </label>
                <textarea
                  value={formData.partnerDietaryRequirements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerDietaryRequirements: e.target.value }))}
                  maxLength={500}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-lg border ${t.inputBg}`}
                  placeholder="E.g., vegetarian, gluten-free, lactose-free, nut allergy..."
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${t.textSubtle}`}>{formData.partnerDietaryRequirements.length}/500</span>
                </div>
              </div>

              {/* Partner GDPR Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.partnerGdprConsent}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partnerGdprConsent: e.target.checked }))}
                    className={`w-5 h-5 mt-0.5 rounded border-[#d1aa67]/50 text-[#d1aa67] focus:ring-[#d1aa67] bg-transparent ${errors.partner_gdpr_consent ? 'border-red-500' : ''}`}
                  />
                  <span className={`text-sm ${t.textMuted}`}>
                    I confirm that my partner has consented to the processing of their personal data according to the <a href="/privacy" target="_blank" className="text-[#d1aa67] hover:underline">Privacy Policy</a>. <span className="text-red-400">*</span>
                  </span>
                </label>
                {errors.partner_gdpr_consent && (
                  <p className="text-red-400 text-sm mt-1 ml-8">{errors.partner_gdpr_consent}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Consent Section */}
        <div className="mb-8">
          <h3 className={`text-lg font-medium ${t.text} mb-4`}>
            Consents
          </h3>
          <ConsentCheckboxes
            gdprConsent={formData.gdprConsent}
            cancellationAccepted={formData.cancellationAccepted}
            onGdprChange={(checked) => setFormData((prev) => ({ ...prev, gdprConsent: checked }))}
            onCancellationChange={(checked) => setFormData((prev) => ({ ...prev, cancellationAccepted: checked }))}
            errors={errors}
            guestType={guest.guest_type as 'vip' | 'paying_single' | 'paying_paired' | 'applicant'}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setScreenState('confirmation')}
            disabled={isLoading}
            className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm uppercase tracking-wider transition-all ${t.buttonSecondary}`}
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${t.buttonPrimary}`}
            data-testid="submit-button"
          >
            {isLoading ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>

        {/* Event Info Footer */}
        <div className={`mt-8 pt-6 border-t ${theme === 'light' ? 'border-[#0c0d0e]/10' : 'border-white/10'}`}>
          <div className={`text-center text-sm ${t.textMuted}`}>
            <p className={`font-medium ${t.text}`}>CEO Gala 2026</p>
            <p className="mt-1">Friday, March 27, 2026 • 6:00 PM • Budapest, Corinthia Hotel</p>
          </div>
        </div>

        {/* Help Links */}
        <div className={`mt-6 text-xs ${t.textMuted} text-center space-y-1`}>
          <p>
            Questions?{' '}
            <a href="https://bbj.hu/events/ceogala/#faq" target="_blank" rel="noopener noreferrer" className="text-[#d1aa67] hover:underline">
              View Registration Guide
            </a>
          </p>
          <p>
            Need more help:{' '}
            <a href="mailto:event@bbj.hu" className="text-[#d1aa67] hover:underline">
              event@bbj.hu
            </a>
          </p>
        </div>

        <PoweredByFooter />
      </div>
    </div>
  );
}
