'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlass,
  Users,
  Chair,
  ChartBar,
  CaretRight,
  CaretDown,
  BookOpen,
  ShieldCheck,
  Envelope,
  CurrencyDollar,
  Clock,
  EnvelopeSimple,
  UploadSimple,
  UserPlus,
  Gear,
  Table,
  QrCode,
} from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getAdminGuides, getAdminHelpUI, type GuideItem } from '@/lib/i18n/admin-help-translations';

// Simple markdown-like text formatter
function formatText(text: string): string {
  return text
    // Bold text: **text** → <strong>text</strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-neutral-800 dark:text-neutral-200">$1</strong>')
    // Inline code: `code` → <code>code</code>
    .replace(/`([^`]+)`/g, '<code class="bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-sm font-mono text-neutral-700 dark:text-neutral-300">$1</code>')
    // Code blocks: ```...``` → <pre>...</pre>
    .replace(/```\n?([\s\S]*?)```/g, '<pre class="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-lg text-sm font-mono overflow-x-auto my-2 text-neutral-800 dark:text-neutral-200">$1</pre>')
    // Bullet points: • or - at start of line
    .replace(/^[•\-]\s+(.+)$/gm, '<li class="ml-4 list-disc list-inside text-sm leading-relaxed">$1</li>')
    // Numbered lists: 1. 2. etc - remove the number as CSS will add it
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 text-sm leading-relaxed" style="list-style-type: decimal; list-style-position: inside;">$2</li>')
    // Double line breaks = new paragraph
    .replace(/\n\n/g, '</p><p class="mt-2">')
    // Single line breaks
    .replace(/\n/g, '<br/>');
}

// Map URL anchors to categories for deep linking
const anchorToCategory: Record<string, string> = {
  'guest-list': 'Guest List',
  'csv-import': 'CSV Import',
  'applications': 'Applications',
  'seating': 'Seating Arrangement',
  'tables': 'Table Management',
  'checkin': 'Check-in',
  'statistics': 'Statistics',
  'email-templates': 'Email Templates',
  'scheduled-emails': 'Scheduled Emails',
  'payments': 'Payment History',
  'email-logs': 'Email Logs',
  'users': 'User Management',
};

// Category to anchor mapping (reverse)
const categoryToAnchor: Record<string, string> = {
  'Guest List': 'guest-list',
  'CSV Import': 'csv-import',
  'Applications': 'applications',
  'Seating Arrangement': 'seating',
  'Table Management': 'tables',
  'Check-in': 'checkin',
  'Statistics': 'statistics',
  'Email Templates': 'email-templates',
  'Scheduled Emails': 'scheduled-emails',
  'Payment History': 'payments',
  'Payment Management': 'payments',
  'Email Logs': 'email-logs',
  'User Management': 'users',
  'System & Technical': 'system',
};

const categoryIcons: Record<string, typeof Users> = {
  'Guest List': Users,
  'CSV Import': UploadSimple,
  'Applications': UserPlus,
  'Seating Arrangement': Chair,
  'Table Management': Table,
  'Check-in': QrCode,
  'Payment History': CurrencyDollar,
  'Email Templates': EnvelopeSimple,
  'Scheduled Emails': Clock,
  'Statistics': ChartBar,
  'Email Logs': Envelope,
  'User Management': ShieldCheck,
  'System & Technical': Gear,
};

export default function AdminHelpPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGuides, setExpandedGuides] = useState<Set<string>>(new Set());

  // Get translated content based on current language
  const adminGuides = useMemo(() => getAdminGuides(language), [language]);
  const ui = useMemo(() => getAdminHelpUI(language), [language]);
  const categories = useMemo(() => Array.from(new Set(adminGuides.map((guide) => guide.category))), [adminGuides]);

  // Handle URL hash for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && anchorToCategory[hash]) {
        setSelectedCategory(anchorToCategory[hash]);
        setSearchQuery('');
        // Expand all guides in the category
        const categoryGuides = adminGuides.filter(g => g.category === anchorToCategory[hash]);
        setExpandedGuides(new Set(categoryGuides.map(g => g.id)));
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [adminGuides]);

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
    const newExpanded = new Set(expandedGuides);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGuides(newExpanded);
  };

  const expandAll = () => {
    setExpandedGuides(new Set(filteredGuides.map(g => g.id)));
  };

  const collapseAll = () => {
    setExpandedGuides(new Set());
  };

  // Group filtered guides by category
  const groupedGuides = filteredGuides.reduce((acc, guide) => {
    if (!acc[guide.category]) {
      acc[guide.category] = [];
    }
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, GuideItem[]>);

  // Get translated category name
  const getCategoryName = (category: string) => {
    return ui.categories[category as keyof typeof ui.categories] || category;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen weight="light" size={36} className="text-accent-teal" />
          <h1 className="font-display text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
            {ui.pageTitle}
          </h1>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 font-sans text-lg">
          {ui.pageDescription}
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
            placeholder={ui.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory(null);
            }}
            className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-neutral-300/20 focus:border-accent-teal focus:ring-2 focus:ring-neutral-800/20 transition-all font-sans"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className={`px-4 py-2 rounded-lg font-sans text-sm transition-all ${
              !selectedCategory
                ? 'bg-accent-teal text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-accent-teal/10 border border-neutral-300/20 dark:border-neutral-700'
            }`}
          >
            {ui.all}
          </button>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || BookOpen;
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  const anchor = categoryToAnchor[category];
                  if (anchor) {
                    window.history.replaceState(null, '', `#${anchor}`);
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-accent-teal text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-accent-teal/10 border border-neutral-300/20 dark:border-neutral-700'
                }`}
              >
                <Icon size={16} weight="regular" />
                {getCategoryName(category)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Links Grid */}
      {!searchQuery && !selectedCategory && (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {Object.entries(categoryIcons).slice(0, 8).map(([category, Icon]) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                const anchor = categoryToAnchor[category];
                if (anchor) {
                  window.history.replaceState(null, '', `#${anchor}`);
                }
              }}
              className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300/20 dark:border-neutral-700 p-5 hover:border-accent-teal transition-all text-left"
            >
              <Icon weight="light" size={28} className="text-accent-teal" />
              <h3 className="font-display text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1 mt-2">
                {getCategoryName(category)}
              </h3>
              <span className="text-accent-teal text-sm font-sans font-medium">
                {adminGuides.filter(g => g.category === category).length} {ui.guides} →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results Header with Expand/Collapse */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-neutral-100">
          {searchQuery
            ? `${ui.searchResults} (${filteredGuides.length})`
            : selectedCategory
            ? `${getCategoryName(selectedCategory)} (${filteredGuides.length})`
            : `${ui.allGuides} (${filteredGuides.length})`}
        </h2>
        {filteredGuides.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-accent-teal hover:underline"
            >
              {ui.expandAll}
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-accent-teal hover:underline"
            >
              {ui.collapseAll}
            </button>
          </div>
        )}
      </div>

      {/* Guide List - Grouped by Category */}
      <div className="space-y-8">
        {filteredGuides.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300/20 dark:border-neutral-700 p-12 text-center">
            <MagnifyingGlass weight="light" size={48} className="mx-auto text-neutral-500 dark:text-neutral-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 font-sans">
              {ui.noResults}
            </p>
          </div>
        ) : (
          Object.entries(groupedGuides).map(([category, guides]) => {
            const Icon = categoryIcons[category] || BookOpen;
            return (
              <div key={category} id={categoryToAnchor[category]}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                  <Icon weight="duotone" size={24} className="text-accent-teal" />
                  <h3 className="font-display text-lg font-semibold text-neutral-700 dark:text-neutral-200">
                    {getCategoryName(category)}
                  </h3>
                  <span className="text-sm text-neutral-400 dark:text-neutral-500 ml-2">
                    ({guides.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {guides.map((guide) => (
                    <div
                      key={guide.id}
                      className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300/20 dark:border-neutral-700 overflow-hidden hover:border-accent-teal/50 transition-all"
                    >
                      <button
                        onClick={() => toggleGuide(guide.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                      >
                        <p className="font-sans font-bold text-neutral-900 dark:text-white pr-4">
                          {guide.question}
                        </p>
                        <div className="flex-shrink-0">
                          {expandedGuides.has(guide.id) ? (
                            <CaretDown weight="bold" size={20} className="text-accent-teal" />
                          ) : (
                            <CaretRight weight="bold" size={20} className="text-neutral-500" />
                          )}
                        </div>
                      </button>

                      {expandedGuides.has(guide.id) && (
                        <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-700">
                          <div
                            className="text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed pt-4"
                            dangerouslySetInnerHTML={{ __html: `<p>${formatText(guide.answer)}</p>` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Support Section */}
      <div className="mt-12 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-lg p-8 text-center">
        <ShieldCheck weight="light" size={48} className="mx-auto text-accent-teal mb-4" />
        <h3 className="font-display text-2xl font-semibold text-white mb-2">
          {ui.needHelp}
        </h3>
        <p className="text-white/80 font-sans mb-6">
          {ui.contactAdmin}
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
