'use client';

/**
 * Public FAQ Page
 * Basic registration information for non-registered visitors
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Question,
  Envelope,
  UserPlus,
  ArrowLeft,
  CaretRight,
  CaretDown,
  Sun,
  Moon,
  CheckCircle,
  Clock,
  Warning,
} from '@phosphor-icons/react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I register if I received an invitation?',
    answer: 'Click "Invited Guest" on the homepage, enter your email address, and we\'ll send you a personalized registration link. Click the link in your email to complete your registration. The link is valid for 24 hours.',
  },
  {
    id: '2',
    question: 'I didn\'t receive my invitation email',
    answer: 'First check your spam/junk folder. If you still can\'t find it, return to the homepage and request a new link. Enter your email address and we\'ll send a fresh invitation within minutes.',
  },
  {
    id: '3',
    question: 'What if I\'m not on the guest list?',
    answer: 'You can apply to attend by clicking "Apply to Attend" on the homepage. Fill out the application form with your details, and our team will review your request. You\'ll receive an email notification once approved.',
  },
  {
    id: '4',
    question: 'How long does the application review take?',
    answer: 'Applications are typically reviewed within 2-3 business days. Once approved, you\'ll receive an invitation link via email to complete your registration.',
  },
  {
    id: '5',
    question: 'What information do I need to register?',
    answer: 'You\'ll need your full name, email address, phone number, company name, and position. You can also provide dietary requirements and seating preferences.',
  },
  {
    id: '6',
    question: 'Can I bring a guest or partner?',
    answer: 'VIP guests can now add a free partner during registration! Simply select the option to bring a partner and enter their details. Paired ticket holders also register with their partner. Both you and your partner will receive separate tickets and access to the Gala App.',
  },
  {
    id: '7',
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards (Visa, Mastercard, American Express) via Stripe, and bank transfers. VIP guests attend free of charge.',
  },
  {
    id: '8',
    question: 'When will I receive my ticket?',
    answer: 'Your e-ticket with QR code is sent immediately after successful payment. For bank transfers, tickets are sent within 24-48 hours after payment verification.',
  },
  {
    id: '9',
    question: 'What is the Gala App?',
    answer: 'The Gala App is our mobile-friendly web app where you can view your QR ticket (works offline!), check your table assignment, and update your profile. Your ticket email includes a login code (CEOG-XXXXXX) - just enter it to access the app. No password needed!',
  },
  {
    id: '10',
    question: 'How do I access my ticket on my phone?',
    answer: 'Open the Gala App link from your ticket email and enter your 6-character login code (e.g., CEOG-A1B2C3). Your QR ticket will be saved for offline use, so it works even without internet at the event!',
  },
];

export default function PublicHelpPage() {
  const [isDark, setIsDark] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('landing-theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('landing-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleFAQ = (id: string) => setExpandedFAQ(expandedFAQ === id ? null : id);

  return (
    <div className="min-h-screen landing-bg transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full landing-btn border transition-all duration-200 hover:scale-105"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun weight="duotone" size={20} className="text-amber-400" />
          ) : (
            <Moon weight="duotone" size={20} className="text-slate-600" />
          )}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 landing-text-secondary hover:text-accent-teal dark:hover:text-teal-400 transition-colors mb-8"
        >
          <ArrowLeft weight="regular" size={18} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 landing-icon-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <Question weight="duotone" size={32} className="text-accent-teal dark:text-teal-400" />
          </div>
          <h1 className="font-display text-3xl font-bold landing-text-heading mb-2">
            Registration Guide
          </h1>
          <p className="landing-text-secondary">
            Quick answers to help you get started
          </p>
        </div>

        {/* Quick Steps */}
        <div className="landing-card rounded-2xl p-6 border mb-8">
          <h2 className="font-display text-lg font-semibold landing-text-heading mb-4">
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-teal/20 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-teal dark:text-teal-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium landing-text-primary">Request Your Link</h3>
                <p className="text-sm landing-text-secondary">Click "Invited Guest" and enter your email</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-teal/20 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-teal dark:text-teal-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium landing-text-primary">Check Your Email</h3>
                <p className="text-sm landing-text-secondary">Click the registration link we send you</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-teal/20 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-teal dark:text-teal-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium landing-text-primary">Complete Registration</h3>
                <p className="text-sm landing-text-secondary">Fill in your details and confirm attendance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Icons Legend */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="landing-card rounded-xl p-4 border text-center">
            <CheckCircle weight="duotone" size={24} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-xs landing-text-secondary">Invited</p>
          </div>
          <div className="landing-card rounded-xl p-4 border text-center">
            <Clock weight="duotone" size={24} className="text-amber-500 mx-auto mb-2" />
            <p className="text-xs landing-text-secondary">Pending</p>
          </div>
          <div className="landing-card rounded-xl p-4 border text-center">
            <Warning weight="duotone" size={24} className="text-orange-500 mx-auto mb-2" />
            <p className="text-xs landing-text-secondary">Link Expired</p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3 mb-8">
          <h2 className="font-display text-lg font-semibold landing-text-heading mb-4">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="landing-card rounded-xl border overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <span className="font-medium landing-text-primary text-sm pr-4">{faq.question}</span>
                {expandedFAQ === faq.id ? (
                  <CaretDown weight="bold" size={16} className="text-accent-teal dark:text-teal-400 flex-shrink-0" />
                ) : (
                  <CaretRight weight="bold" size={16} className="landing-text-tertiary flex-shrink-0" />
                )}
              </button>
              {expandedFAQ === faq.id && (
                <div className="px-4 pb-4 border-t landing-divider">
                  <p className="text-sm landing-text-secondary pt-3 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="landing-card rounded-2xl p-6 border text-center">
          <Envelope weight="duotone" size={32} className="text-accent-teal dark:text-teal-400 mx-auto mb-3" />
          <h3 className="font-display text-lg font-semibold landing-text-heading mb-2">
            Need More Help?
          </h3>
          <p className="landing-text-secondary text-sm mb-4">
            Contact our support team
          </p>
          <a
            href="https://www.myforgelabs.com/#kapcsolat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-accent-teal dark:bg-teal-700 rounded-lg font-semibold text-sm
                     hover:bg-accent-teal-dark dark:hover:bg-teal-600 transition-colors"
            style={{ color: 'white' }}
          >
            MyForge Labs
          </a>
        </div>

        {/* Footer */}
        <p className="text-center landing-footer text-xs mt-8">
          © 2026 BBJ Events • Executive Excellence
        </p>
      </div>
    </div>
  );
}
