'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Check, ArrowLeft, Envelope, ShieldCheck } from '@phosphor-icons/react';

// reCAPTCHA site key from environment variable
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Declare grecaptcha type
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

interface RequestLinkFormProps {
  defaultEmail?: string;
  reason?: 'expired' | 'resend';
}

export default function RequestLinkForm({
  defaultEmail = '',
  reason,
}: RequestLinkFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Get reCAPTCHA token
  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    // Skip if no site key configured
    if (!RECAPTCHA_SITE_KEY) {
      return null;
    }

    // Skip if reCAPTCHA not loaded
    if (!recaptchaLoaded || !window.grecaptcha) {
      return null;
    }

    try {
      return await new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
              action: 'request_magic_link',
            });
            resolve(token);
          } catch {
            resolve(null);
          }
        });
      });
    } catch {
      return null;
    }
  }, [recaptchaLoaded]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get reCAPTCHA token before submitting
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch('/api/register/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          reason,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'An error occurred while sending');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Check weight="bold" size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h3 className="font-display text-lg font-semibold landing-text-heading mb-2">
          Email Sent!
        </h3>
        <p className="landing-text-secondary font-sans mb-6">
          If the provided email address is on our guest list, you will receive
          your invitation link shortly.
        </p>
        <p className="text-sm landing-text-tertiary font-sans mb-4">
          Please check your spam folder as well.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-2 px-4 landing-btn border rounded-lg font-medium transition-colors font-sans"
        >
          <ArrowLeft weight="regular" size={18} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Load reCAPTCHA v3 script */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          onLoad={() => setRecaptchaLoaded(true)}
        />
      )}

      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium landing-text-secondary mb-1 font-sans flex items-center gap-2"
          >
            <Envelope weight="duotone" size={16} className="text-accent-teal dark:text-teal-400" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-teal dark:focus:ring-teal-400 focus:border-accent-teal dark:focus:border-teal-400 outline-none transition-colors
                       bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-600
                       landing-text-primary placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400 font-sans">{error}</p>
          </div>
        )}

        {/* Expired link info */}
        {reason === 'expired' && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-sans">
              Your previous link has expired. Please request a new one.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all font-sans
                     shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[2px]
                     active:shadow-none active:translate-y-[4px] ${
            isSubmitting || !email
              ? 'bg-slate-400 dark:bg-zinc-600 cursor-not-allowed'
              : 'bg-accent-teal dark:bg-teal-600 hover:bg-accent-teal-dark dark:hover:bg-teal-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            'Send New Link'
          )}
        </button>

        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 mt-3 landing-btn border rounded-lg text-center font-semibold transition-all font-sans landing-text-primary"
        >
          <ArrowLeft weight="regular" size={18} />
          Back
        </Link>

        {/* Info text */}
        <p className="text-xs landing-text-tertiary text-center mt-4 font-sans">
          The link will be valid for 24 hours.
        </p>

        {/* reCAPTCHA badge notice */}
        {RECAPTCHA_SITE_KEY && (
          <p className="text-xs landing-text-tertiary text-center mt-3 font-sans flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-accent-teal dark:text-teal-400" />
            Protected by reCAPTCHA
          </p>
        )}
      </form>
    </>
  );
}
