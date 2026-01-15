'use client';

/**
 * Paid Registration Form Component
 *
 * Multi-step form for paying guests:
 * - Step 1: Ticket type (if paired allowed)
 * - Step 2: Guest profile (title, dietary, seating)
 * - Step 3: Billing information (structured form)
 * - Step 4: Partner details (if paired selected)
 * - Step 5: Consent (GDPR, cancellation)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GuestProfileFields from '../components/GuestProfileFields';
import BillingForm, { type BillingFormData } from '../components/BillingForm';
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

interface PaidRegistrationFormProps {
  guest: Guest;
  canSelectPaired: boolean;
}

type TicketType = 'paid_single' | 'paid_paired';

interface FormData {
  ticketType: TicketType;
  // Profile fields
  title: string;
  phone: string;
  company: string;
  position: string;
  dietaryRequirements: string;
  seatingPreferences: string;
  // Billing fields
  billing: BillingFormData;
  // Partner fields
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  partnerCompany: string;
  partnerPosition: string;
  partnerDietaryRequirements: string;
  partnerSeatingPreferences: string;
  partnerGdprConsent: boolean;
  // Consent fields
  gdprConsent: boolean;
  cancellationAccepted: boolean;
}

interface FormErrors {
  title?: string;
  phone?: string;
  company?: string;
  position?: string;
  dietary_requirements?: string;
  seating_preferences?: string;
  billingName?: string;
  companyName?: string;
  taxNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  partnerName?: string;
  partnerEmail?: string;
  partner_gdpr_consent?: string;
  gdpr_consent?: string;
  cancellation_accepted?: string;
}

export default function PaidRegistrationForm({
  guest,
  canSelectPaired,
}: PaidRegistrationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(canSelectPaired ? 1 : 2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    ticketType: 'paid_single',
    // Profile
    title: guest.title || '',
    phone: guest.phone || '',
    company: guest.company || '',
    position: guest.position || '',
    dietaryRequirements: guest.dietary_requirements || '',
    seatingPreferences: guest.seating_preferences || '',
    // Billing
    billing: {
      billingName: guest.name,
      companyName: guest.company || '',
      taxNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: 'HU',
    },
    // Partner
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    partnerCompany: '',
    partnerPosition: '',
    partnerDietaryRequirements: '',
    partnerSeatingPreferences: '',
    partnerGdprConsent: false,
    // Consent
    gdprConsent: false,
    cancellationAccepted: false,
  });

  // Steps:
  // 1 = Ticket type (only if canSelectPaired)
  // 2 = Profile
  // 3 = Billing
  // 4 = Partner (only if paid_paired)
  // 5 = Consent
  const getStepCount = () => {
    if (!canSelectPaired && formData.ticketType === 'paid_single') return 4; // Profile, Billing, Consent (skip ticket selection and partner)
    if (formData.ticketType === 'paid_paired') return 5;
    return 4; // ticket, profile, billing, consent
  };

  const totalSteps = getStepCount();

  const getStepName = (stepNum: number): string => {
    if (!canSelectPaired) {
      // No ticket selection step
      switch (stepNum) {
        case 2: return 'Personal Information';
        case 3: return 'Billing Information';
        case 4: return 'Consents';
        default: return '';
      }
    }
    switch (stepNum) {
      case 1: return 'Ticket Type';
      case 2: return 'Personal Information';
      case 3: return 'Billing Information';
      case 4: return formData.ticketType === 'paid_paired' ? 'Partner Details' : 'Consents';
      case 5: return 'Consents';
      default: return '';
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    // Step 2: Profile - Now with required fields
    if (currentStep === 2) {
      if (!formData.phone || formData.phone.trim().length < 9) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.company || formData.company.trim().length < 1) {
        newErrors.company = 'Company name is required';
      }
      if (!formData.position || formData.position.trim().length < 1) {
        newErrors.position = 'Position is required';
      }
    }

    // Step 3: Billing
    if (currentStep === 3) {
      if (!formData.billing.billingName || formData.billing.billingName.length < 2) {
        newErrors.billingName = 'Billing name is required (min. 2 characters)';
      }
      if (!formData.billing.addressLine1 || formData.billing.addressLine1.length < 5) {
        newErrors.addressLine1 = 'Address is required (min. 5 characters)';
      }
      if (!formData.billing.city || formData.billing.city.length < 2) {
        newErrors.city = 'City is required';
      }
      if (!formData.billing.postalCode || !/^[0-9]{4}$/.test(formData.billing.postalCode)) {
        newErrors.postalCode = 'Invalid postal code (4 digits)';
      }
      // Validate tax number format if provided
      if (formData.billing.taxNumber && !/^[0-9]{8}-[0-9]-[0-9]{2}$/.test(formData.billing.taxNumber)) {
        newErrors.taxNumber = 'Invalid tax number format (e.g.: 12345678-1-42)';
      }
    }

    // Step 4: Partner (if paired)
    if (currentStep === 4 && formData.ticketType === 'paid_paired') {
      if (!formData.partnerName || formData.partnerName.length < 2) {
        newErrors.partnerName = 'Partner name is required (min. 2 characters)';
      }
      if (!formData.partnerEmail) {
        newErrors.partnerEmail = 'Partner email address is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.partnerEmail)) {
          newErrors.partnerEmail = 'Invalid email format';
        }
      }
      // Partner GDPR consent required
      if (!formData.partnerGdprConsent) {
        newErrors.partner_gdpr_consent = 'Partner GDPR consent is required';
      }
    }

    // Last step: Consent
    const consentStep = formData.ticketType === 'paid_paired' ? 5 : 4;
    if (currentStep === consentStep || (!canSelectPaired && currentStep === 4)) {
      if (!formData.gdprConsent) {
        newErrors.gdpr_consent = 'GDPR consent is required';
      }
      if (!formData.cancellationAccepted) {
        newErrors.cancellation_accepted = 'Accepting cancellation terms is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      // Skip partner step for single ticket
      if (step === 3 && formData.ticketType === 'paid_single' && canSelectPaired) {
        setStep(4); // Go to consent
      } else {
        setStep(step + 1);
      }
    } else {
      // Scroll to error summary
      setTimeout(() => {
        const errorSummary = document.getElementById('error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    // Skip partner step when going back for single ticket
    if (step === 4 && formData.ticketType === 'paid_single' && canSelectPaired) {
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const lastStep = formData.ticketType === 'paid_paired' ? 5 : 4;
    if (!validateStep(lastStep)) {
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
      const response = await fetch('/api/registration/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: guest.id,
          ticket_type: formData.ticketType,
          // Profile fields
          title: formData.title || null,
          phone: formData.phone,
          company: formData.company,
          position: formData.position,
          dietary_requirements: formData.dietaryRequirements || null,
          seating_preferences: formData.seatingPreferences || null,
          // Billing info (structured)
          billing_info: {
            billing_name: formData.billing.billingName,
            company_name: formData.billing.companyName || null,
            tax_number: formData.billing.taxNumber || null,
            address_line1: formData.billing.addressLine1,
            address_line2: formData.billing.addressLine2 || null,
            city: formData.billing.city,
            postal_code: formData.billing.postalCode,
            country: formData.billing.country,
          },
          // Partner info (if paired)
          partner_name: formData.ticketType === 'paid_paired' ? formData.partnerName : null,
          partner_email: formData.ticketType === 'paid_paired' ? formData.partnerEmail : null,
          partner_phone: formData.ticketType === 'paid_paired' ? (formData.partnerPhone || null) : null,
          partner_company: formData.ticketType === 'paid_paired' ? (formData.partnerCompany || null) : null,
          partner_position: formData.ticketType === 'paid_paired' ? (formData.partnerPosition || null) : null,
          partner_dietary_requirements: formData.ticketType === 'paid_paired' ? (formData.partnerDietaryRequirements || null) : null,
          partner_seating_preferences: formData.ticketType === 'paid_paired' ? (formData.partnerSeatingPreferences || null) : null,
          partner_gdpr_consent: formData.ticketType === 'paid_paired' ? formData.partnerGdprConsent : null,
          // Consent
          gdpr_consent: formData.gdprConsent,
          cancellation_accepted: formData.cancellationAccepted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          router.push(`/register/paid?guest_id=${guest.id}&error=already_registered`);
          return;
        }
        throw new Error(data.error || 'An error occurred');
      }

      router.push(`/register/success?guest_id=${guest.id}&type=paid`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBillingField = (field: keyof BillingFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      billing: { ...prev.billing, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isLastStep = () => {
    if (formData.ticketType === 'paid_paired') {
      return step === 5;
    }
    return step === 4;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Registration</h1>
          <p className="text-slate-600">Dear {guest.name}!</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">{getStepName(step)}</span>
            <span className="text-sm text-slate-600">{step}/{totalSteps}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Validation Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div
            id="error-summary"
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-red-800 text-sm">
                Please fix the following errors:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errors.phone && <li>Phone: {errors.phone}</li>}
              {errors.company && <li>Company: {errors.company}</li>}
              {errors.position && <li>Position: {errors.position}</li>}
              {errors.billingName && <li>Billing Name: {errors.billingName}</li>}
              {errors.addressLine1 && <li>Address: {errors.addressLine1}</li>}
              {errors.city && <li>City: {errors.city}</li>}
              {errors.postalCode && <li>Postal Code: {errors.postalCode}</li>}
              {errors.taxNumber && <li>Tax Number: {errors.taxNumber}</li>}
              {errors.partnerName && <li>Partner Name: {errors.partnerName}</li>}
              {errors.partnerEmail && <li>Partner Email: {errors.partnerEmail}</li>}
              {errors.partner_gdpr_consent && <li>Partner GDPR: {errors.partner_gdpr_consent}</li>}
              {errors.gdpr_consent && <li>GDPR: {errors.gdpr_consent}</li>}
              {errors.cancellation_accepted && <li>Cancellation: {errors.cancellation_accepted}</li>}
            </ul>
          </div>
        )}

        {/* Step 1: Ticket Type Selection */}
        {step === 1 && canSelectPaired && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Select ticket type
            </h2>
            <div className="space-y-3">
              <label
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.ticketType === 'paid_single'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="ticketType"
                  value="paid_single"
                  checked={formData.ticketType === 'paid_single'}
                  onChange={(e) => updateFormData('ticketType', e.target.value as TicketType)}
                  className="sr-only"
                  data-testid="ticket-type-single"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900">Single Ticket</span>
                    <p className="text-sm text-slate-500 mt-1">Entry for one person</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.ticketType === 'paid_single'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {formData.ticketType === 'paid_single' && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.ticketType === 'paid_paired'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="ticketType"
                  value="paid_paired"
                  checked={formData.ticketType === 'paid_paired'}
                  onChange={(e) => updateFormData('ticketType', e.target.value as TicketType)}
                  className="sr-only"
                  data-testid="ticket-type-paired"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900">Paired Ticket</span>
                    <p className="text-sm text-slate-500 mt-1">Entry for two people (You + partner)</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.ticketType === 'paid_paired'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {formData.ticketType === 'paid_paired' && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <GuestProfileFields
            title={formData.title}
            phone={formData.phone}
            company={formData.company}
            position={formData.position}
            dietaryRequirements={formData.dietaryRequirements}
            seatingPreferences={formData.seatingPreferences}
            onTitleChange={(value) => updateFormData('title', value)}
            onPhoneChange={(value) => updateFormData('phone', value)}
            onCompanyChange={(value) => updateFormData('company', value)}
            onPositionChange={(value) => updateFormData('position', value)}
            onDietaryChange={(value) => updateFormData('dietaryRequirements', value)}
            onSeatingChange={(value) => updateFormData('seatingPreferences', value)}
            errors={errors}
          />
        )}

        {/* Step 3: Billing Information */}
        {step === 3 && (
          <BillingForm
            data={formData.billing}
            onChange={updateBillingField}
            errors={errors}
          />
        )}

        {/* Step 4: Partner Details (if paired) */}
        {step === 4 && formData.ticketType === 'paid_paired' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Partner Details</h2>
            <p className="text-sm text-slate-500 mb-4">
              Partner information is required to issue the personalized QR ticket.
            </p>
            <div className="space-y-4">
              {/* Partner Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => updateFormData('partnerName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.partnerName ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Partner's full name"
                  data-testid="partner-name-input"
                />
                {errors.partnerName && (
                  <p className="text-red-600 text-sm mt-1">{errors.partnerName}</p>
                )}
              </div>

              {/* Partner Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.partnerEmail}
                  onChange={(e) => updateFormData('partnerEmail', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.partnerEmail ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="partner@email.com"
                  data-testid="partner-email-input"
                />
                {errors.partnerEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.partnerEmail}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Your partner will receive their own ticket via email.
                </p>
              </div>

              {/* Partner Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.partnerPhone}
                  onChange={(e) => updateFormData('partnerPhone', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 border-slate-300"
                  placeholder="+36 30 123 4567"
                />
              </div>

              {/* Partner Company */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Company / Organization (optional)
                </label>
                <input
                  type="text"
                  value={formData.partnerCompany}
                  onChange={(e) => updateFormData('partnerCompany', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 border-slate-300"
                  placeholder="Company Ltd."
                  maxLength={255}
                />
              </div>

              {/* Partner Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Position (optional)
                </label>
                <input
                  type="text"
                  value={formData.partnerPosition}
                  onChange={(e) => updateFormData('partnerPosition', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 border-slate-300"
                  placeholder="CEO"
                  maxLength={100}
                />
              </div>

              {/* Partner Dietary Requirements */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Dietary Requirements (optional)
                </label>
                <textarea
                  value={formData.partnerDietaryRequirements}
                  onChange={(e) => updateFormData('partnerDietaryRequirements', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 border-slate-300"
                  placeholder="E.g., vegetarian, gluten-free, lactose-free, nut allergy..."
                  rows={2}
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-slate-500">{formData.partnerDietaryRequirements.length}/500</span>
                </div>
              </div>

              {/* Partner Seating Preferences */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Partner Seating Preferences (optional)
                </label>
                <textarea
                  value={formData.partnerSeatingPreferences}
                  onChange={(e) => updateFormData('partnerSeatingPreferences', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 border-slate-300"
                  placeholder="Who would you like to sit with?"
                  rows={2}
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-slate-500">{formData.partnerSeatingPreferences.length}/500</span>
                </div>
              </div>

              {/* Partner GDPR Consent */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.partnerGdprConsent}
                    onChange={(e) => updateFormData('partnerGdprConsent', e.target.checked)}
                    className={`w-5 h-5 mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 ${errors.partner_gdpr_consent ? 'border-red-500' : ''}`}
                  />
                  <span className="text-sm text-slate-700">
                    I confirm that my partner has consented to the processing of their personal data according to the <a href="/privacy" target="_blank" className="text-amber-600 hover:underline">Privacy Policy</a>. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.partner_gdpr_consent && (
                  <p className="text-red-600 text-sm mt-1 ml-8">{errors.partner_gdpr_consent}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4/5: Consent */}
        {((step === 4 && formData.ticketType === 'paid_single') || step === 5) && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Consents</h2>
            <ConsentCheckboxes
              gdprConsent={formData.gdprConsent}
              cancellationAccepted={formData.cancellationAccepted}
              onGdprChange={(checked) => updateFormData('gdprConsent', checked)}
              onCancellationChange={(checked) => updateFormData('cancellationAccepted', checked)}
              errors={errors}
              guestType={formData.ticketType as 'paying_single' | 'paying_paired'}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > (canSelectPaired ? 1 : 2) ? (
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {!isLastStep() ? (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg disabled:opacity-50"
              data-testid="next-button"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-lg flex items-center gap-2"
              data-testid="submit-button"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          )}
        </div>

        {/* Event Info Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="text-center text-sm text-slate-500">
            <Link href="/" className="font-medium text-slate-700 hover:text-amber-600 transition-colors">BBJ Events 2026</Link>
            <p>Friday, March 27, 2026 • 6:00 PM • Budapest, Corinthia Hotel</p>
            <p className="mt-3">
              <Link href="/help" className="text-amber-600 hover:underline">
                Need help?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
