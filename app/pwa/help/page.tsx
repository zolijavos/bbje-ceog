'use client';

/**
 * PWA Help/FAQ Page
 * Detailed event and app information for registered guests
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Question,
  Envelope,
  CaretRight,
  CaretDown,
  CalendarBlank,
  Clock,
  TShirt,
  MapPin,
  QrCode,
  CheckCircle,
  DeviceMobile,
  Chair,
  ForkKnife,
  CreditCard,
  Ticket,
  ShieldCheck,
  UserCircle,
  CaretCircleRight,
} from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import {
  EVENT_CONFIG,
  formatEventDate,
  formatEventTime,
} from '@/lib/config/event';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: 'Event Details',
    icon: <CalendarBlank size={20} weight="fill" />,
    items: [
      {
        id: 'event-1',
        question: 'When and where is the event?',
        answer: `The BBJ Events 2026 takes place on ${formatEventDate()} at ${formatEventTime()}. The venue is ${EVENT_CONFIG.venue.name}, located at ${EVENT_CONFIG.venue.address}.`,
      },
      {
        id: 'event-2',
        question: 'What is the dress code?',
        answer: `The dress code is ${EVENT_CONFIG.dressCode}. Gentlemen are expected to wear formal suits or tuxedos. Ladies should wear evening gowns or elegant cocktail attire.`,
      },
      {
        id: 'event-3',
        question: 'What time should I arrive?',
        answer: 'We recommend arriving 15-30 minutes before the start time to allow for check-in and welcome drinks. The check-in desk opens 30 minutes before the event.',
      },
      {
        id: 'event-4',
        question: 'Is parking available?',
        answer: 'Yes, the venue has parking available. VIP guests have access to reserved parking spaces. Please show your digital ticket at the parking entrance.',
      },
    ],
  },
  {
    title: 'Using the App',
    icon: <DeviceMobile size={20} weight="fill" />,
    items: [
      {
        id: 'app-1',
        question: 'How do I access my digital ticket?',
        answer: 'Tap on "Digital Ticket" on your dashboard to view your QR code. You can also access it directly from the ticket page. The QR code works offline once loaded.',
      },
      {
        id: 'app-2',
        question: 'Can I use the app offline?',
        answer: 'Yes! Your QR ticket is cached for offline use. Open the ticket page while connected to save it. Event information is also available offline after the first load.',
      },
      {
        id: 'app-3',
        question: 'How do I update my profile information?',
        answer: 'Go to "My Details" from your dashboard. You can update your phone number, company, position, dietary requirements, and seating preferences.',
      },
      {
        id: 'app-4',
        question: 'How do I add the event to my calendar?',
        answer: 'On the dashboard, tap "Add to Calendar" in the Event Information card. Choose your preferred calendar app (Google, Apple, or Outlook) to save the event.',
      },
    ],
  },
  {
    title: 'Check-in Process',
    icon: <QrCode size={20} weight="fill" />,
    items: [
      {
        id: 'checkin-1',
        question: 'How does check-in work?',
        answer: 'When you arrive, show your digital ticket QR code at the check-in desk. Staff will scan it, and you\'ll receive a welcome notification with your table number.',
      },
      {
        id: 'checkin-2',
        question: 'What if my QR code won\'t scan?',
        answer: 'Try increasing your screen brightness. If issues persist, our staff can verify your identity using your email address or name and check you in manually.',
      },
      {
        id: 'checkin-3',
        question: 'Can someone else use my ticket?',
        answer: 'No, tickets are non-transferable and linked to your registration. Each QR code can only be used once for check-in.',
      },
    ],
  },
  {
    title: 'Seating & Tables',
    icon: <Chair size={20} weight="fill" />,
    items: [
      {
        id: 'seating-1',
        question: 'How do I find out my table number?',
        answer: 'Your table assignment appears on your dashboard under "Table Number". You\'ll also see it in the welcome notification after check-in.',
      },
      {
        id: 'seating-2',
        question: 'Can I request to sit with specific people?',
        answer: 'Yes! Update your "Seating Preference" in your profile with names of people you\'d like to sit with. We\'ll do our best to accommodate requests.',
      },
      {
        id: 'seating-3',
        question: 'What if my table is not assigned yet?',
        answer: 'Table assignments are finalized closer to the event. Check back in the app or you\'ll be notified once assigned. Staff can also help at check-in.',
      },
    ],
  },
  {
    title: 'Food & Dietary',
    icon: <ForkKnife size={20} weight="fill" />,
    items: [
      {
        id: 'food-1',
        question: 'How do I specify dietary requirements?',
        answer: 'Go to "My Details" and update the "Dietary Requirements" field. Include any allergies, intolerances, or preferences (vegetarian, vegan, kosher, halal, etc.).',
      },
      {
        id: 'food-2',
        question: 'Can I change my dietary requirements?',
        answer: 'Yes, you can update your dietary requirements in the app until 48 hours before the event. After that, please contact our team directly.',
      },
    ],
  },
  {
    title: 'Tickets & Payment',
    icon: <Ticket size={20} weight="fill" />,
    items: [
      {
        id: 'payment-1',
        question: 'Where can I see my ticket status?',
        answer: 'Your ticket status is shown on the dashboard. VIP guests have complimentary tickets. Paid guests can view their payment confirmation in the app.',
      },
      {
        id: 'payment-2',
        question: 'I have a paired ticket. Where is my partner\'s info?',
        answer: 'Partner information is displayed on your dashboard under "Partner". Both you and your partner will be seated together at the same table.',
      },
      {
        id: 'payment-3',
        question: 'Can I get a refund or cancel my registration?',
        answer: 'Please check our Registration Guide for cancellation policies. Refund eligibility depends on timing and ticket type.',
      },
    ],
  },
];

export default function PWAHelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('Event Details');

  const toggleFAQ = (id: string) => setExpandedFAQ(expandedFAQ === id ? null : id);
  const toggleSection = (title: string) => setExpandedSection(expandedSection === title ? '' : title);

  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header */}
      <header className="pwa-bg-header px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/pwa/dashboard"
            className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="font-display text-xl pwa-text-inverse">Help & FAQ</h1>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Quick Help Card */}
        <Card variant="elevated" className="text-center">
          <div
            className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-accent-soft)' }}
          >
            <Question size={28} weight="fill" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="font-display text-lg font-semibold pwa-text-primary mb-1">
            Guest Guide
          </h2>
          <p className="pwa-text-secondary text-sm">
            Everything you need to know for the BBJ Events 2026
          </p>
        </Card>

        {/* Event Quick Info */}
        <Card variant="static">
          <h3 className="font-semibold pwa-text-primary mb-3 flex items-center gap-2">
            <CalendarBlank size={18} weight="fill" style={{ color: 'var(--color-accent)' }} />
            Event at a Glance
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <CalendarBlank size={16} className="pwa-text-tertiary" />
              <span className="pwa-text-primary">{formatEventDate()}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="pwa-text-tertiary" />
              <span className="pwa-text-primary">{formatEventTime()}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="pwa-text-tertiary" />
              <span className="pwa-text-primary">{EVENT_CONFIG.venue.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <TShirt size={16} className="pwa-text-tertiary" />
              <span className="pwa-text-primary">{EVENT_CONFIG.dressCode}</span>
            </div>
          </div>
        </Card>

        {/* Check-in Steps */}
        <Card variant="static">
          <h3 className="font-semibold pwa-text-primary mb-4 flex items-center gap-2">
            <ShieldCheck size={18} weight="fill" style={{ color: 'var(--color-accent)' }} />
            Check-in Made Easy
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>1</span>
              </div>
              <div>
                <p className="font-medium pwa-text-primary">Open Your Ticket</p>
                <p className="text-sm pwa-text-secondary">Tap "Digital Ticket" on your dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>2</span>
              </div>
              <div>
                <p className="font-medium pwa-text-primary">Show QR Code</p>
                <p className="text-sm pwa-text-secondary">Present it at the check-in desk</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-accent-soft)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>3</span>
              </div>
              <div>
                <p className="font-medium pwa-text-primary">Get Your Table</p>
                <p className="text-sm pwa-text-secondary">Receive welcome with table assignment</p>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-3">
          <h3 className="font-semibold pwa-text-primary px-1">Frequently Asked Questions</h3>

          {faqSections.map((section) => (
            <Card key={section.title} variant="static" padding="none" className="overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>{section.icon}</span>
                  <span className="font-medium pwa-text-primary">{section.title}</span>
                </div>
                {expandedSection === section.title ? (
                  <CaretDown size={18} style={{ color: 'var(--color-accent)' }} weight="bold" />
                ) : (
                  <CaretRight size={18} className="pwa-text-tertiary" weight="bold" />
                )}
              </button>

              {/* Section Content */}
              {expandedSection === section.title && (
                <div className="border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  {section.items.map((faq, index) => (
                    <div
                      key={faq.id}
                      className={index > 0 ? 'border-t' : ''}
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm pwa-text-primary pr-4">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <CaretDown size={14} style={{ color: 'var(--color-accent)' }} weight="bold" className="flex-shrink-0" />
                        ) : (
                          <CaretCircleRight size={14} className="pwa-text-tertiary flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div
                          className="px-4 pb-3"
                          style={{ background: 'var(--color-bg-elevated)' }}
                        >
                          <p className="text-sm pwa-text-secondary leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Card */}
        <Card variant="elevated" className="text-center">
          <Question size={28} weight="fill" className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
          <h3 className="font-semibold pwa-text-primary mb-1">Need More Help?</h3>
          <p className="pwa-text-secondary text-sm mb-3">
            Check our registration guide
          </p>
          <Link
            href="/help"
            className="inline-block px-6 py-2 text-sm font-medium transition-all"
            style={{
              background: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
            }}
          >
            Registration Guide
          </Link>
        </Card>

        {/* Footer */}
        <p className="text-center pwa-text-tertiary text-xs pt-2">
          © 2026 BBJ Events • Executive Excellence
        </p>
      </div>
    </div>
  );
}
