'use client';

/**
 * Public Application Page
 *
 * Non-invited guests can apply to attend the CEO Gala.
 * Applications are reviewed by admins who can approve or reject them.
 */

import { useState } from 'react';
import Link from 'next/link';
import { PaperPlaneTilt, Check } from '@phosphor-icons/react';
import GuestProfileFields from '@/app/register/components/GuestProfileFields';
import ApplyWrapper from './ApplyWrapper';

interface FormData {
  name: string;
  email: string;
  title: string;
  phone: string;
  company: string;
  position: string;
  dietaryRequirements: string;
  seatingPreferences: string;
  gdprConsent: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  dietaryRequirements?: string;
  seatingPreferences?: string;
  gdprConsent?: string;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

// Phone validation regex - must match server validation in /api/apply/route.ts
const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;

export default function ApplyPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    title: '',
    phone: '',
    company: '',
    position: '',
    dietaryRequirements: '',
    seatingPreferences: '',
    gdprConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Full name is required (minimum 2 characters)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }

    // Phone validation - must match server validation
    if (!formData.phone || formData.phone.trim().length < 9) {
      newErrors.phone = 'Phone number is required (minimum 9 digits)';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Company validation
    if (!formData.company || formData.company.trim().length < 1) {
      newErrors.company = 'Company name is required';
    }

    // Position validation
    if (!formData.position || formData.position.trim().length < 1) {
      newErrors.position = 'Position is required';
    }

    // GDPR consent validation
    if (!formData.gdprConsent) {
      newErrors.gdprConsent = 'You must accept the data processing terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          title: formData.title || null,
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          position: formData.position.trim(),
          dietary_requirements: formData.dietaryRequirements.trim() || null,
          seating_preferences: formData.seatingPreferences.trim() || null,
          gdpr_consent: formData.gdprConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <ApplyWrapper>
        <div className="max-w-md mx-auto flex items-center justify-center min-h-[80vh]">
          <div className="landing-card rounded-2xl shadow-2xl p-8 text-center border w-full">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check weight="bold" size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold landing-text-heading mb-2">Application Submitted!</h1>
            <p className="landing-text-secondary mb-6">
              Thank you for your interest in the CEO Gala 2026. We have received your application and will review it shortly.
            </p>
            <p className="landing-text-tertiary text-sm mb-6">
              You will receive an email notification once your application has been reviewed.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-accent-teal dark:bg-teal-600 text-white rounded-xl font-semibold
                       hover:bg-accent-teal-dark dark:hover:bg-teal-700 transition-colors
                       shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[2px]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </ApplyWrapper>
    );
  }

  return (
    <ApplyWrapper>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-display text-4xl font-bold landing-text-heading mb-2">CEO Gala</h1>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <PaperPlaneTilt weight="duotone" size={24} className="text-amber-500 dark:text-amber-400" />
            <h2 className="text-xl text-amber-600 dark:text-amber-400 font-medium">Apply to Attend</h2>
          </div>
          <p className="landing-text-secondary max-w-md mx-auto">
            Not on the guest list? Submit your application and we&apos;ll review it.
          </p>
        </div>

        {/* Form Card */}
        <div className="landing-card rounded-2xl shadow-2xl p-8 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold landing-text-heading border-b landing-divider pb-2">
                Personal Information
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium landing-text-secondary mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none transition-colors
                             bg-white dark:bg-zinc-800 landing-text-primary placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                    errors.name ? 'border-red-500' : 'border-slate-300 dark:border-zinc-600'
                  }`}
                  placeholder="John Smith"
                  data-testid="name-input"
                />
                {errors.name && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium landing-text-secondary mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-400 outline-none transition-colors
                             bg-white dark:bg-zinc-800 landing-text-primary placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                    errors.email ? 'border-red-500' : 'border-slate-300 dark:border-zinc-600'
                  }`}
                  placeholder="john@company.com"
                  data-testid="email-input"
                />
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div>
              <h3 className="text-lg font-semibold landing-text-heading border-b landing-divider pb-2 mb-4">
                Professional Details
              </h3>
              <GuestProfileFields
                title={formData.title}
                phone={formData.phone}
                company={formData.company}
                position={formData.position}
                dietaryRequirements={formData.dietaryRequirements}
                seatingPreferences={formData.seatingPreferences}
                onTitleChange={(value) => setFormData({ ...formData, title: value })}
                onPhoneChange={(value) => setFormData({ ...formData, phone: value })}
                onCompanyChange={(value) => setFormData({ ...formData, company: value })}
                onPositionChange={(value) => setFormData({ ...formData, position: value })}
                onDietaryChange={(value) => setFormData({ ...formData, dietaryRequirements: value })}
                onSeatingChange={(value) => setFormData({ ...formData, seatingPreferences: value })}
                errors={{
                  phone: errors.phone,
                  company: errors.company,
                  position: errors.position,
                  dietary_requirements: errors.dietaryRequirements,
                  seating_preferences: errors.seatingPreferences,
                }}
              />
            </div>

            {/* GDPR Consent */}
            <div className="border-t landing-divider pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gdprConsent}
                  onChange={(e) => setFormData({ ...formData, gdprConsent: e.target.checked })}
                  className="mt-1 w-5 h-5 text-amber-600 dark:text-amber-400 border-slate-300 dark:border-zinc-600 rounded focus:ring-amber-500 dark:focus:ring-amber-400 bg-white dark:bg-zinc-800"
                  data-testid="gdpr-checkbox"
                />
                <span className="text-sm landing-text-secondary">
                  I consent to the processing of my personal data for the purpose of event registration
                  and communication. I understand that my data will be stored securely and used only
                  for event-related purposes. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.gdprConsent && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.gdprConsent}</p>
              )}
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="w-full bg-amber-600 dark:bg-amber-600 text-white py-4 rounded-xl font-semibold
                       hover:bg-amber-700 dark:hover:bg-amber-700 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                       shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[2px]
                       active:shadow-none active:translate-y-[4px]"
              data-testid="submit-button"
            >
              {submitStatus === 'submitting' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <PaperPlaneTilt weight="bold" size={20} />
                  Submit Application
                </>
              )}
            </button>

            <p className="text-center text-sm landing-text-tertiary">
              Already received an invitation?{' '}
              <Link href="/register/request-link" className="text-amber-600 dark:text-amber-400 hover:underline">
                Request your link
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center landing-footer text-sm mt-6">
          <Link
            href="/help"
            className="text-accent-teal dark:text-teal-400 hover:underline"
          >
            Segítségre van szüksége?
          </Link>
        </p>
        <p className="text-center landing-footer text-sm mt-4">
          © 2026 CEO Gala • Executive Excellence
        </p>
      </div>
    </ApplyWrapper>
  );
}
