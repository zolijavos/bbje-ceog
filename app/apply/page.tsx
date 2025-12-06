'use client';

/**
 * Public Application Page
 *
 * Non-invited guests can apply to attend the CEO Gala.
 * Applications are reviewed by admins who can approve or reject them.
 */

import { useState } from 'react';
import GuestProfileFields from '@/app/register/components/GuestProfileFields';

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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your interest in the CEO Gala 2025. We have received your application and will review it shortly.
          </p>
          <p className="text-slate-500 text-sm">
            You will receive an email notification once your application has been reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CEO Gala 2025</h1>
          <h2 className="text-xl text-amber-400">Application to Attend</h2>
          <p className="text-slate-300 mt-4 max-w-md mx-auto">
            Not on the guest list? Apply here and we will review your application.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                Personal Information
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="John Smith"
                  data-testid="name-input"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="john@company.com"
                  data-testid="email-input"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4">
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
            <div className="border-t pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gdprConsent}
                  onChange={(e) => setFormData({ ...formData, gdprConsent: e.target.checked })}
                  className="mt-1 w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                  data-testid="gdpr-checkbox"
                />
                <span className="text-sm text-slate-600">
                  I consent to the processing of my personal data for the purpose of event registration
                  and communication. I understand that my data will be stored securely and used only
                  for event-related purposes. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.gdprConsent && (
                <p className="text-red-600 text-sm mt-2">{errors.gdprConsent}</p>
              )}
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="w-full bg-amber-600 text-white py-4 rounded-xl font-semibold hover:bg-amber-700
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                'Submit Application'
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already received an invitation?{' '}
              <a href="/register" className="text-amber-600 hover:underline">
                Register here
              </a>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          CEO Gala 2025 &copy; All rights reserved
        </p>
      </div>
    </div>
  );
}
