'use client';

import { useState } from 'react';
import {
  MagnifyingGlass,
  Question,
  Users,
  Chair,
  ChartBar,
  ClipboardText,
  CaretRight,
  CaretDown,
  BookOpen,
  ShieldCheck,
  Envelope,
} from '@phosphor-icons/react';

interface GuideItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const adminGuides: GuideItem[] = [
  // Guest Management
  {
    id: 'guest-1',
    category: 'Guest Management',
    question: 'How do I add a new guest to the system?',
    answer: 'Go to Guest List → Click "Add Guest" button → Fill in guest details (name, email, guest type) → Click "Save". The guest will be added with "Invited" status and can receive a magic link invitation.',
    keywords: ['add', 'create', 'new guest', 'invite'],
  },
  {
    id: 'guest-2',
    category: 'Guest Management',
    question: 'How do I import multiple guests from a CSV file?',
    answer: 'Go to Guest List → Click "Import CSV" → Select your CSV file (must have columns: email, name, guest_type) → Review the preview → Click "Confirm Import". Duplicate emails will be skipped.',
    keywords: ['import', 'csv', 'bulk', 'upload', 'multiple'],
  },
  {
    id: 'guest-3',
    category: 'Guest Management',
    question: 'How do I send magic link invitations to guests?',
    answer: 'Go to Guest List → Select guests using checkboxes → Click "Send Email" → Customize the email template if needed → Click "Send". Magic links are valid for 5 minutes after the first click.',
    keywords: ['send', 'email', 'magic link', 'invitation', 'invite'],
  },
  {
    id: 'guest-4',
    category: 'Guest Management',
    question: 'How do I edit a guest\'s information?',
    answer: 'Go to Guest List → Find the guest → Click the pencil icon → Update the information → Click "Save Changes". Note: You cannot change the email address if the guest has already registered.',
    keywords: ['edit', 'update', 'modify', 'change'],
  },
  {
    id: 'guest-5',
    category: 'Guest Management',
    question: 'How do I delete a guest?',
    answer: 'Go to Guest List → Find the guest → Click the trash icon → Confirm deletion. Warning: This will permanently delete the guest and all associated data (registration, payment, table assignment).',
    keywords: ['delete', 'remove', 'cancel'],
  },
  {
    id: 'guest-6',
    category: 'Guest Management',
    question: 'How do I filter guests by status or type?',
    answer: 'Use the filter dropdowns at the top of the Guest List: Guest Type (VIP, Paying Single, Paying Paired), Status (Invited, Registered, Approved, Declined), and Table Assignment filters. You can also use the search bar to find guests by name or email.',
    keywords: ['filter', 'search', 'find', 'status', 'type'],
  },
  {
    id: 'guest-7',
    category: 'Guest Management',
    question: 'What do the different guest statuses mean?',
    answer: 'Invited: Guest has been added but not registered yet. Registered: Guest completed registration but payment pending (for paying guests). Approved: Payment confirmed and ticket issued. Declined: Guest declined the invitation.',
    keywords: ['status', 'invited', 'registered', 'approved', 'declined'],
  },

  // Payment Management
  {
    id: 'pay-1',
    category: 'Payment Management',
    question: 'How do I manually approve a bank transfer payment?',
    answer: 'Go to Guest List → Find the guest with "Pending" payment status → Click the guest row → Click "Approve Payment" → Confirm. This will mark the payment as completed and send the e-ticket to the guest.',
    keywords: ['approve', 'payment', 'bank transfer', 'manual'],
  },
  {
    id: 'pay-2',
    category: 'Payment Management',
    question: 'How do I view payment details for a guest?',
    answer: 'Go to Guest List → Click on the guest row to expand details → View Payment section. You will see payment status, method, amount, and transaction ID (for card payments).',
    keywords: ['view', 'payment', 'details', 'status'],
  },
  {
    id: 'pay-3',
    category: 'Payment Management',
    question: 'How do I issue a refund?',
    answer: 'Refunds must be processed manually through Stripe Dashboard or your bank. Go to Guest List → Find the guest → View payment details → Note the Stripe Session ID or transaction reference → Process refund in Stripe Dashboard → Update guest status to "Declined" in the system.',
    keywords: ['refund', 'cancel', 'return', 'money back'],
  },
  {
    id: 'pay-4',
    category: 'Payment Management',
    question: 'What if a card payment fails?',
    answer: 'Failed payments are automatically recorded with "Failed" status. The guest will see an error message and can retry payment. You can contact the guest via email to assist with payment issues.',
    keywords: ['failed', 'payment', 'error', 'decline'],
  },

  // Seating Management
  {
    id: 'seat-1',
    category: 'Seating Management',
    question: 'How do I create a new table?',
    answer: 'Go to Seating → Click "Add Table" → Enter table name, capacity, and type (VIP, Standard, Sponsor) → Position the table on the floor plan by dragging → Click "Save".',
    keywords: ['create', 'add', 'new table', 'floor plan'],
  },
  {
    id: 'seat-2',
    category: 'Seating Management',
    question: 'How do I assign guests to tables?',
    answer: 'Go to Seating → Drag unassigned guests from the left panel onto tables on the floor plan. Paired guests automatically occupy 2 seats. You can also assign guests via the Guest List page.',
    keywords: ['assign', 'seating', 'drag', 'table'],
  },
  {
    id: 'seat-3',
    category: 'Seating Management',
    question: 'How do I remove a guest from a table?',
    answer: 'Go to Seating → Click on the table → Click the "X" icon next to the guest name in the table details → Confirm removal. The guest will be moved back to the unassigned list.',
    keywords: ['remove', 'unassign', 'delete', 'table'],
  },
  {
    id: 'seat-4',
    category: 'Seating Management',
    question: 'How do I edit table details (name, capacity, type)?',
    answer: 'Go to Seating → Click on a table → Click the pencil icon → Update name, capacity, or type → Click "Save Changes". Note: You cannot reduce capacity below the current number of assigned guests.',
    keywords: ['edit', 'table', 'capacity', 'change', 'name'],
  },
  {
    id: 'seat-5',
    category: 'Seating Management',
    question: 'How do I export the seating arrangement?',
    answer: 'Go to Seating → Click "Export Seating" → Choose format (CSV or PDF) → Download. The export includes table name, guest name, seat number, and guest type for printing or sharing.',
    keywords: ['export', 'download', 'csv', 'pdf', 'seating'],
  },
  {
    id: 'seat-6',
    category: 'Seating Management',
    question: 'What do the table colors mean on the floor plan?',
    answer: 'Green: Table has available seats. Amber/Orange: Table is partially full. Red: Table is at full capacity. Gray: Table is reserved but empty.',
    keywords: ['color', 'table', 'floor plan', 'indicator'],
  },
  {
    id: 'seat-7',
    category: 'Seating Management',
    question: 'How do I view seating preferences for a guest?',
    answer: 'Go to Guest List → Click on a guest → View "Seating Preferences" field. This shows any special requests the guest made during registration (e.g., "near VIP table", "with friends").',
    keywords: ['preferences', 'seating', 'request', 'special'],
  },

  // Check-in Management
  {
    id: 'checkin-1',
    category: 'Check-in',
    question: 'How do I check in a guest at the event?',
    answer: 'Go to Check-in page → Scan the guest\'s QR code using the mobile scanner → Verify guest name and details → Click "Check In". The system prevents duplicate check-ins automatically.',
    keywords: ['check-in', 'scan', 'qr code', 'event'],
  },
  {
    id: 'checkin-2',
    category: 'Check-in',
    question: 'What if a guest\'s QR code is not scanning?',
    answer: 'Use the manual search option: Go to Check-in → Click "Manual Search" → Enter guest name or email → Find the guest → Click "Check In" → Select "Manual Override" and provide a reason.',
    keywords: ['qr code', 'not working', 'manual', 'override'],
  },
  {
    id: 'checkin-3',
    category: 'Check-in',
    question: 'How do I view the check-in log?',
    answer: 'Go to Check-in Log → View all check-in events with timestamps, staff names, and methods (QR scan vs manual). You can filter by date, staff member, or guest type.',
    keywords: ['log', 'check-in', 'history', 'view'],
  },
  {
    id: 'checkin-4',
    category: 'Check-in',
    question: 'What if a guest tries to check in twice?',
    answer: 'The system automatically detects duplicate check-ins and shows a yellow warning card. You can override this (admin only) if needed, but the original check-in time is recorded.',
    keywords: ['duplicate', 'twice', 'already', 'check-in'],
  },

  // Statistics & Reporting
  {
    id: 'stats-1',
    category: 'Statistics & Reporting',
    question: 'How do I view registration statistics?',
    answer: 'Go to Statistics → View KPI cards at the top for Total Guests, Revenue, Occupancy Rate, and Check-in Rate. Scroll down for detailed breakdowns by status, type, payment method, and more.',
    keywords: ['statistics', 'stats', 'report', 'overview'],
  },
  {
    id: 'stats-2',
    category: 'Statistics & Reporting',
    question: 'How do I export guest lists for reporting?',
    answer: 'Go to Guest List → Click "Export" → Choose format (CSV or Excel) → Select columns to include → Download. You can export filtered lists by status or type.',
    keywords: ['export', 'report', 'download', 'csv', 'excel'],
  },
  {
    id: 'stats-3',
    category: 'Statistics & Reporting',
    question: 'How do I view dietary requirements summary?',
    answer: 'Go to Statistics → Scroll to "Dietary Requirements" section → View counts of Vegetarian, Vegan, Gluten-free, and Lactose-free requirements. This helps with catering planning.',
    keywords: ['dietary', 'requirements', 'food', 'catering'],
  },
  {
    id: 'stats-4',
    category: 'Statistics & Reporting',
    question: 'How do I track email delivery status?',
    answer: 'Go to Statistics → View "Email Statistics" section → See total sent, successful deliveries, and delivery rate. Failed emails are logged with error messages.',
    keywords: ['email', 'delivery', 'status', 'sent'],
  },

  // System & Technical
  {
    id: 'tech-1',
    category: 'System & Technical',
    question: 'How do I reset my admin password?',
    answer: 'Contact the system administrator to reset your password. For security reasons, password resets must be handled manually by the super admin.',
    keywords: ['password', 'reset', 'forgot', 'login'],
  },
  {
    id: 'tech-2',
    category: 'System & Technical',
    question: 'What are the different user roles?',
    answer: 'Admin: Full access to all features. Staff: Check-in access only (mobile scanner). Super Admin: Full access + user management and system settings.',
    keywords: ['roles', 'permissions', 'access', 'user'],
  },
  {
    id: 'tech-3',
    category: 'System & Technical',
    question: 'How do I add a new staff member for check-in?',
    answer: 'Only Super Admin can add users. Go to Settings → User Management → Click "Add User" → Enter email, name, and assign "Staff" role → Save. The user will receive login credentials via email.',
    keywords: ['add', 'user', 'staff', 'team'],
  },
  {
    id: 'tech-4',
    category: 'System & Technical',
    question: 'Is the system mobile-friendly?',
    answer: 'Yes, all admin features work on tablets and mobile devices. The Check-in page is optimized for mobile QR scanning. However, desktop is recommended for seating management due to drag-and-drop features.',
    keywords: ['mobile', 'tablet', 'responsive', 'phone'],
  },
  {
    id: 'tech-5',
    category: 'System & Technical',
    question: 'How is guest data protected?',
    answer: 'All data is encrypted in transit (HTTPS) and at rest. Passwords are hashed using bcrypt. Magic links expire after 5 minutes. Payment data is handled by Stripe (PCI-DSS compliant) and not stored in our system.',
    keywords: ['security', 'data', 'protection', 'privacy'],
  },
];

const categories = Array.from(new Set(adminGuides.map((guide) => guide.category)));

export default function AdminHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const filteredGuides = adminGuides.filter((guide) => {
    const matchesSearch =
      searchQuery === '' ||
      guide.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.keywords.some((keyword) => keyword.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || guide.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen weight="light" size={36} className="text-accent-teal" />
            <h1 className="font-display text-3xl font-semibold text-neutral-800">
              Admin User Guide
            </h1>
          </div>
          <p className="text-neutral-500 font-sans text-lg">
            Complete guide for managing CEO Gala 2026 registration system
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlass
              weight="regular"
              size={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              placeholder="Search admin guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-neutral-300/20 focus:border-accent-teal focus:ring-2 focus:ring-neutral-800/20 transition-all font-sans"
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
              All Topics
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
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-lg border border-neutral-300/20 p-5 hover:border-accent-teal transition-all">
            <Users weight="light" size={28} className="text-accent-teal mb-2" />
            <h3 className="font-display text-base font-semibold text-neutral-800 mb-1">
              Guest Management
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('Guest Management');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View Guide →
            </button>
          </div>

          <div className="bg-white rounded-lg border border-neutral-300/20 p-5 hover:border-accent-teal transition-all">
            <Chair weight="light" size={28} className="text-accent-teal mb-2" />
            <h3 className="font-display text-base font-semibold text-neutral-800 mb-1">
              Seating Management
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('Seating Management');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View Guide →
            </button>
          </div>

          <div className="bg-white rounded-lg border border-neutral-300/20 p-5 hover:border-accent-teal transition-all">
            <ClipboardText weight="light" size={28} className="text-accent-teal mb-2" />
            <h3 className="font-display text-base font-semibold text-neutral-800 mb-1">
              Check-in Process
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('Check-in');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View Guide →
            </button>
          </div>

          <div className="bg-white rounded-lg border border-neutral-300/20 p-5 hover:border-accent-teal transition-all">
            <ChartBar weight="light" size={28} className="text-accent-teal mb-2" />
            <h3 className="font-display text-base font-semibold text-neutral-800 mb-1">
              Statistics & Reports
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('Statistics & Reporting');
                setSearchQuery('');
              }}
              className="text-accent-teal text-sm font-sans font-medium hover:underline"
            >
              View Guide →
            </button>
          </div>
        </div>

        {/* Guide List */}
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mb-4">
            {searchQuery
              ? `Search Results (${filteredGuides.length})`
              : selectedCategory
              ? `${selectedCategory} (${filteredGuides.length})`
              : `All Topics (${filteredGuides.length})`}
          </h2>

          {filteredGuides.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-300/20 p-12 text-center">
              <MagnifyingGlass weight="light" size={48} className="mx-auto text-neutral-500 mb-4" />
              <p className="text-neutral-500 font-sans">
                No results found. Try a different search term or browse by category.
              </p>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-lg border border-neutral-300/20 overflow-hidden hover:border-accent-teal transition-all"
              >
                <button
                  onClick={() => toggleGuide(guide.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-accent-teal/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-sans text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded">
                        {guide.category}
                      </span>
                    </div>
                    <p className="font-sans font-medium text-neutral-800">{guide.question}</p>
                  </div>
                  <div className="ml-4">
                    {expandedGuide === guide.id ? (
                      <CaretDown weight="bold" size={20} className="text-accent-teal" />
                    ) : (
                      <CaretRight weight="bold" size={20} className="text-neutral-500" />
                    )}
                  </div>
                </button>

                {expandedGuide === guide.id && (
                  <div className="px-5 pb-4 border-t border-neutral-300/10">
                    <p className="text-neutral-500 font-sans leading-relaxed pt-4">
                      {guide.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-lg p-8 text-center">
          <ShieldCheck weight="light" size={48} className="mx-auto text-accent-teal mb-4" />
          <h3 className="font-display text-2xl font-semibold text-white mb-2">
            Need technical support?
          </h3>
          <p className="text-white/80 font-sans mb-6">
            Contact the system administrator for help with technical issues
          </p>
          <a
            href="mailto:admin@ceogala.hu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/90 transition-all font-sans font-medium"
          >
            <Envelope weight="fill" size={20} />
            admin@ceogala.hu
          </a>
        </div>
    </div>
  );
}
