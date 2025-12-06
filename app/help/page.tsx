'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlass,
  Question,
  Ticket,
  CreditCard,
  QrCode,
  Envelope,
  CalendarBlank,
  UserCircle,
  CaretRight,
  CaretDown,
  House,
} from '@phosphor-icons/react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQItem[] = [
  // Registration
  {
    id: 'reg-1',
    category: 'Registration',
    question: 'How do I register for the CEO Gala 2026?',
    answer: 'You will receive a personalized magic link via email. Click the link in your invitation email, and it will automatically authenticate you and take you to the registration page. The link is valid for 5 minutes after the first click.',
    keywords: ['register', 'invitation', 'magic link', 'email', 'sign up'],
  },
  {
    id: 'reg-2',
    category: 'Registration',
    question: 'I didn\'t receive my invitation email. What should I do?',
    answer: 'First, check your spam/junk folder. If you still cannot find it, you can request a new magic link by visiting the "Request Link" page and entering your email address. If problems persist, contact the organizing committee.',
    keywords: ['email', 'not received', 'spam', 'resend', 'request link'],
  },
  {
    id: 'reg-3',
    category: 'Registration',
    question: 'Can I bring a guest/partner?',
    answer: 'If you are invited as a VIP guest, your invitation is for one person only. If you purchased a paired ticket, you can register with your partner during the registration process. You will need to provide their name and email address.',
    keywords: ['partner', 'guest', 'plus one', 'paired', 'companion'],
  },
  {
    id: 'reg-4',
    category: 'Registration',
    question: 'Can I change my registration details after submitting?',
    answer: 'Yes, you can update your profile information (dietary requirements, seating preferences) by contacting the organizing committee. However, ticket type changes may not be possible once payment is processed.',
    keywords: ['change', 'edit', 'update', 'modify', 'registration'],
  },
  {
    id: 'reg-5',
    category: 'Registration',
    question: 'What is the registration deadline?',
    answer: 'Registration closes on March 20, 2026 (one week before the event). We recommend registering as soon as possible to secure your spot and preferred seating.',
    keywords: ['deadline', 'last day', 'when', 'close', 'final date'],
  },

  // Payment
  {
    id: 'pay-1',
    category: 'Payment',
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit card payments via Stripe (Visa, Mastercard, American Express) and bank transfers. For bank transfers, you will receive account details after registration.',
    keywords: ['payment', 'card', 'bank transfer', 'stripe', 'visa', 'mastercard'],
  },
  {
    id: 'pay-2',
    category: 'Payment',
    question: 'How much does a ticket cost?',
    answer: 'Single ticket: 100,000 HUF. Paired ticket (for two people): 180,000 HUF. VIP guests receive complimentary tickets at no cost.',
    keywords: ['price', 'cost', 'how much', 'ticket price', 'fee'],
  },
  {
    id: 'pay-3',
    category: 'Payment',
    question: 'When will I receive my e-ticket?',
    answer: 'Your e-ticket with QR code will be sent via email immediately after payment confirmation. For bank transfers, you will receive your ticket after manual approval by our team (usually within 24-48 hours).',
    keywords: ['ticket', 'e-ticket', 'qr code', 'when', 'receive'],
  },
  {
    id: 'pay-4',
    category: 'Payment',
    question: 'Can I get a refund if I cannot attend?',
    answer: 'Refunds are available until March 15, 2026. After this date, tickets are non-refundable. Please contact the organizing committee to request a refund.',
    keywords: ['refund', 'cancel', 'money back', 'cancellation'],
  },
  {
    id: 'pay-5',
    category: 'Payment',
    question: 'I paid but did not receive my ticket. What should I do?',
    answer: 'Check your spam/junk folder first. If you still cannot find the email, check your registration status on the "Check Status" page. If the payment shows as "Pending", please allow 24-48 hours for bank transfer confirmation. Contact support if issues persist.',
    keywords: ['payment', 'not received', 'ticket', 'missing', 'problem'],
  },

  // Event Day
  {
    id: 'event-1',
    category: 'Event Day',
    question: 'What should I bring to the event?',
    answer: 'Please bring your e-ticket (printed or on your mobile device). You will need to show the QR code at check-in. A valid ID may also be requested for verification.',
    keywords: ['bring', 'qr code', 'ticket', 'id', 'what to bring'],
  },
  {
    id: 'event-2',
    category: 'Event Day',
    question: 'What time should I arrive?',
    answer: 'Doors open at 6:00 PM on Friday, March 27, 2026. We recommend arriving between 6:00 PM and 6:30 PM to allow time for check-in and seating.',
    keywords: ['time', 'arrival', 'when', 'doors open', 'check-in'],
  },
  {
    id: 'event-3',
    category: 'Event Day',
    question: 'What is the dress code?',
    answer: 'The dress code is Black Tie. Men should wear tuxedos or dark suits with ties. Women should wear evening gowns or formal cocktail dresses.',
    keywords: ['dress code', 'attire', 'what to wear', 'formal', 'black tie'],
  },
  {
    id: 'event-4',
    category: 'Event Day',
    question: 'Is parking available at the venue?',
    answer: 'Yes, complimentary valet parking is available at the Marriott Hotel Budapest. Please inform the valet that you are attending the CEO Gala.',
    keywords: ['parking', 'valet', 'car', 'venue'],
  },
  {
    id: 'event-5',
    category: 'Event Day',
    question: 'I lost my e-ticket. What should I do?',
    answer: 'You can retrieve your e-ticket by visiting the "Check Status" page and entering your email address. You can also contact the registration desk at the event entrance with a valid ID.',
    keywords: ['lost', 'ticket', 'missing', 'retrieve', 'forgot'],
  },

  // QR Code & Check-in
  {
    id: 'qr-1',
    category: 'QR Code & Check-in',
    question: 'How does the QR code check-in work?',
    answer: 'At the event entrance, our staff will scan the QR code on your e-ticket using a mobile scanner. Once verified, you will be checked in and directed to your assigned table.',
    keywords: ['qr code', 'check-in', 'scan', 'entrance', 'verification'],
  },
  {
    id: 'qr-2',
    category: 'QR Code & Check-in',
    question: 'Can I use a screenshot of my QR code?',
    answer: 'Yes, you can display your QR code from your email, a screenshot, or a printed copy. Any format that clearly shows the QR code will work.',
    keywords: ['screenshot', 'qr code', 'printed', 'photo', 'format'],
  },
  {
    id: 'qr-3',
    category: 'QR Code & Check-in',
    question: 'What if my QR code is not scanning?',
    answer: 'Ensure your screen brightness is high and the QR code is not blurry. If scanning issues persist, staff can manually verify your registration using your name and email address.',
    keywords: ['qr code', 'not working', 'scanning', 'problem', 'error'],
  },

  // Seating
  {
    id: 'seat-1',
    category: 'Seating',
    question: 'How are seats assigned?',
    answer: 'Seating is assigned by the organizing committee based on guest type (VIP, paying) and seating preferences you provided during registration. You will be notified of your table assignment before the event.',
    keywords: ['seating', 'table', 'assigned', 'where', 'placement'],
  },
  {
    id: 'seat-2',
    category: 'Seating',
    question: 'Can I request to sit with specific people?',
    answer: 'Yes, you can indicate seating preferences during registration (e.g., "near the VIP table" or "with the Kovács family"). We will do our best to accommodate requests, but cannot guarantee placement.',
    keywords: ['seating', 'request', 'preference', 'friends', 'family'],
  },
  {
    id: 'seat-3',
    category: 'Seating',
    question: 'Will I receive my table assignment before the event?',
    answer: 'Yes, table assignments will be sent via email 3-5 days before the event. You can also check your status on the registration status page.',
    keywords: ['table', 'assignment', 'when', 'notification', 'seating'],
  },

  // Technical Issues
  {
    id: 'tech-1',
    category: 'Technical Issues',
    question: 'The magic link expired. How can I access registration?',
    answer: 'Magic links expire 5 minutes after the first click for security. You can request a new link by visiting the "Request Link" page and entering your email address.',
    keywords: ['expired', 'magic link', 'timeout', 'access', 'request'],
  },
  {
    id: 'tech-2',
    category: 'Technical Issues',
    question: 'I am having trouble with the registration form. Who can help?',
    answer: 'Please ensure you are using an updated browser (Chrome, Firefox, Safari, or Edge). Clear your browser cache and try again. If problems persist, contact technical support at support@ceogala.hu.',
    keywords: ['error', 'bug', 'problem', 'form', 'technical'],
  },
  {
    id: 'tech-3',
    category: 'Technical Issues',
    question: 'Can I register using my mobile phone?',
    answer: 'Yes, the registration system is fully mobile-responsive and works on all modern smartphones and tablets.',
    keywords: ['mobile', 'phone', 'smartphone', 'tablet', 'responsive'],
  },
];

const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-800 to-neutral-700">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <House weight="regular" size={20} />
              <span className="text-sm font-sans">Home</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Question weight="duotone" size={64} className="text-accent-teal" />
            </div>
            <h1 className="font-display text-4xl font-semibold text-white mb-2">
              User Guide & FAQ
            </h1>
            <p className="text-white/80 font-sans text-lg">
              Everything you need to know about CEO Gala 2026
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <MagnifyingGlass
              weight="regular"
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-neutral-300/20 focus:border-accent-teal focus:ring-2 focus:ring-neutral-800/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                !selectedCategory
                  ? 'bg-accent-teal text-white'
                  : 'bg-white text-neutral-800 hover:bg-accent-teal/10 border border-neutral-300/20'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-accent-teal text-white'
                    : 'bg-white text-neutral-800 hover:bg-accent-teal/10 border border-neutral-300/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg border border-neutral-300/20 p-6 hover:border-accent-teal transition-all">
            <Ticket weight="light" size={32} className="text-accent-teal mb-3" />
            <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">
              Registration Guide
            </h3>
            <p className="text-sm text-neutral-500 font-sans mb-4">
              Step-by-step instructions for registering to the event
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Registration');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View FAQs →
            </button>
          </div>

          <div className="bg-white rounded-lg border border-neutral-300/20 p-6 hover:border-accent-teal transition-all">
            <CreditCard weight="light" size={32} className="text-accent-teal mb-3" />
            <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">
              Payment & Tickets
            </h3>
            <p className="text-sm text-neutral-500 font-sans mb-4">
              Information about payment methods and receiving tickets
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Payment');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View FAQs →
            </button>
          </div>

          <div className="bg-white rounded-lg border border-neutral-300/20 p-6 hover:border-accent-teal transition-all">
            <QrCode weight="light" size={32} className="text-accent-teal mb-3" />
            <h3 className="font-display text-lg font-semibold text-neutral-800 mb-2">
              Event Day Info
            </h3>
            <p className="text-sm text-neutral-500 font-sans mb-4">
              What to bring, check-in process, and venue details
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Event Day');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View FAQs →
            </button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl font-semibold text-neutral-800 mb-6">
            {searchQuery
              ? `Search Results (${filteredFAQs.length})`
              : selectedCategory
              ? `${selectedCategory} (${filteredFAQs.length})`
              : `All Questions (${filteredFAQs.length})`}
          </h2>

          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-300/20 p-12 text-center">
              <MagnifyingGlass weight="light" size={48} className="mx-auto text-neutral-500 mb-4" />
              <p className="text-neutral-500 font-sans">
                No results found. Try a different search term or browse by category.
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg border border-neutral-300/20 overflow-hidden hover:border-accent-teal transition-all"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent-teal/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-sans text-neutral-500 bg-neutral-50 px-2 py-1 rounded">
                        {faq.category}
                      </span>
                    </div>
                    <p className="font-sans font-medium text-neutral-800">{faq.question}</p>
                  </div>
                  <div className="ml-4">
                    {expandedFAQ === faq.id ? (
                      <CaretDown weight="bold" size={20} className="text-accent-teal" />
                    ) : (
                      <CaretRight weight="bold" size={20} className="text-neutral-500" />
                    )}
                  </div>
                </button>

                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-4 border-t border-neutral-300/10">
                    <p className="text-neutral-500 font-sans leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-lg p-8 text-center">
          <Envelope weight="light" size={48} className="mx-auto text-accent-teal mb-4" />
          <h3 className="font-display text-2xl font-semibold text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-white/80 font-sans mb-6">
            Contact our support team for personalized assistance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@ceogala.hu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-all font-sans font-medium"
            >
              <Envelope weight="fill" size={20} />
              support@ceogala.hu
            </a>
            <Link
              href="/status"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-sans font-medium"
            >
              <UserCircle weight="fill" size={20} />
              Check Registration Status
            </Link>
          </div>
        </div>

        {/* Event Details Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-neutral-500 font-sans text-sm">
            <CalendarBlank weight="regular" size={16} />
            <span>Friday, March 27, 2026 • 6:00 PM • Budapest, Marriott Hotel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
