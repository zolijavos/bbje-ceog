'use client';

import { useState } from 'react';
import {
  ClockCounterClockwise,
  CaretDown,
  CaretRight,
  Star,
  Users,
  Envelope,
  Table,
  CheckCircle,
  Gear,
  Tag,
  Bug,
  Sparkle,
} from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'fix' | 'improvement' | 'breaking';
    category: string;
    titleEn: string;
    titleHu: string;
    descriptionEn?: string;
    descriptionHu?: string;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: '2.6.0',
    date: '2026-01-09',
    changes: [
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Form Validation Error Summary',
        titleHu: 'Űrlap Validációs Hibaösszesítő',
        descriptionEn: 'All forms now display a clear error summary box at the top when validation fails. Errors are listed with field names, and in admin modal you can click to jump to the field. Auto-scroll to error summary on submit.',
        descriptionHu: 'Minden űrlapon mostantól megjelenik egy hibaösszesítő doboz validációs hiba esetén. A hibák mező nevekkel jelennek meg, admin modalban kattintással ugorhatsz a mezőre. Automatikus görgetés a hibalistához submit után.',
      },
    ],
  },
  {
    version: '2.5.0',
    date: '2026-01-08',
    changes: [
      {
        type: 'feature',
        category: 'guest',
        titleEn: 'Payment Status Column & Filter',
        titleHu: 'Fizetési Státusz Oszlop & Szűrő',
        descriptionEn: 'Added Payment Status column to guest list with color-coded badges. New filter allows filtering by payment status (Awaiting Transfer, Paid, Failed, Refunded).',
        descriptionHu: 'Fizetési státusz oszlop hozzáadva a vendéglistához színkódolt jelzésekkel. Új szűrő a fizetési státusz szerinti szűréshez (Utalásra vár, Fizetve, Sikertelen, Visszatérítve).',
      },
      {
        type: 'fix',
        category: 'guest',
        titleEn: 'VIP Filter & Checkbox Fix',
        titleHu: 'VIP Szűrő & Checkbox Javítás',
        descriptionEn: 'Fixed VIP filter not working on guest list. Fixed VIP checkbox not saving when editing guests.',
        descriptionHu: 'Javítva a VIP szűrő, ami nem működött a vendéglistában. Javítva a VIP checkbox mentése szerkesztésnél.',
      },
      {
        type: 'feature',
        category: 'email',
        titleEn: 'VIP Filter for Bulk Emails',
        titleHu: 'VIP Szűrő Tömeges Emailekhez',
        descriptionEn: 'Added VIP Reception filter to bulk email scheduling. Now you can send emails to VIP-only or non-VIP guests.',
        descriptionHu: 'VIP Fogadás szűrő hozzáadva a tömeges email küldéshez. Most már küldhetsz emailt csak VIP vagy csak nem-VIP vendégeknek.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Inter Font',
        titleHu: 'Inter Betűtípus',
        descriptionEn: 'Changed primary font from Open Sans to Inter for better readability across all pages.',
        descriptionHu: 'Elsődleges betűtípus cserélve Open Sans-ról Inter-re a jobb olvashatóság érdekében minden oldalon.',
      },
    ],
  },
  {
    version: '2.4.0',
    date: '2026-01-08',
    changes: [
      {
        type: 'feature',
        category: 'guest',
        titleEn: 'VIP Reception Column',
        titleHu: 'VIP Fogadas oszlop',
        descriptionEn: 'Added VIP Reception indicator column to guest list. VIP guests are marked with a star icon. Edit guests to toggle VIP status.',
        descriptionHu: 'VIP Fogadas jelzo oszlop hozzaadva a vendeglistahoz. VIP vendegek csillag ikonnal jelolve. Vendeg szerkesztesekor allithato.',
      },
      {
        type: 'feature',
        category: 'registration',
        titleEn: 'Partner Registration for All Guests',
        titleHu: 'Partner regisztracio minden vendegnek',
        descriptionEn: 'All paying guests can now bring a partner. Previously only paired ticket holders could register partners.',
        descriptionHu: 'Minden fizetos vendeg hozhat partnert. Korabban csak paros jegyes vendegek regisztralhattakk partnert.',
      },
      {
        type: 'improvement',
        category: 'export',
        titleEn: 'Complete CSV Export',
        titleHu: 'Teljes CSV export',
        descriptionEn: 'Guest export now includes all fields: billing info, check-in status, payment details, paired guest info, and more.',
        descriptionHu: 'A vendeg export mar tartalmazza az osszes mezot: szamlazasi adatok, check-in statusz, fizetesi adatok, partner adatok es meg tobb.',
      },
      {
        type: 'fix',
        category: 'status',
        titleEn: 'Status Filter Improvements',
        titleHu: 'Statusz szuro javitasok',
        descriptionEn: 'Fixed status filtering to properly distinguish "Declined" (guest cancelled) from "Rejected" (admin rejected). Hungarian translations corrected.',
        descriptionHu: 'Javitva a statusz szures, hogy megkulonboztesse a "Lemondta" (vendeg lemondta) es "Elutasitva" (admin elutasitotta) statuszokat.',
      },
      {
        type: 'improvement',
        category: 'branding',
        titleEn: 'BBJ Events Branding',
        titleHu: 'BBJ Events branding',
        descriptionEn: 'Updated all email templates and payment references from "CEO Gala" to "BBJ Events".',
        descriptionHu: 'Frissitve az osszes email sablon es fizetesi hivatkozas "CEO Gala"-rol "BBJ Events"-re.',
      },
    ],
  },
  {
    version: '2.3.0',
    date: '2026-01-06',
    changes: [
      {
        type: 'feature',
        category: 'audit',
        titleEn: 'Admin Audit Log',
        titleHu: 'Admin Audit Naplo',
        descriptionEn: 'New audit log page tracks all admin actions: guest changes, email sends, payment approvals, and more. Filter by action type, entity, or date.',
        descriptionHu: 'Uj audit naplo oldal koveti az osszes admin muveletet: vendeg valtoztatasok, email kuldesek, fizetes jovahagyasok es meg tobb.',
      },
      {
        type: 'feature',
        category: 'guest',
        titleEn: 'Company & Position Fields',
        titleHu: 'Ceg & Beosztas mezok',
        descriptionEn: 'Added Company and Position fields to guest edit modal. These are now required fields.',
        descriptionHu: 'Ceg es Beosztas mezok hozzaadva a vendeg szerkeszto modalhoz. Ezek most kotelezo mezok.',
      },
      {
        type: 'fix',
        category: 'ui',
        titleEn: 'Guest List Refresh Button',
        titleHu: 'Vendeg lista frissites gomb',
        descriptionEn: 'Added refresh button to guest list for manual data reload without page refresh.',
        descriptionHu: 'Frissites gomb hozzaadva a vendeglistahoz a kezzi adat ujratolteshez oldal frissites nelkul.',
      },
    ],
  },
  {
    version: '2.2.0',
    date: '2026-01-03',
    changes: [
      {
        type: 'feature',
        category: 'pwa',
        titleEn: 'Gala App (PWA) Enhancements',
        titleHu: 'Gala App (PWA) fejlesztesek',
        descriptionEn: 'Improved offline support, faster loading, and better QR code display. Push notifications ready.',
        descriptionHu: 'Javitott offline tamogatas, gyorsabb betoltes, es jobb QR kod megjlenites. Push ertesitesek keszen.',
      },
      {
        type: 'improvement',
        category: 'help',
        titleEn: 'Comprehensive Help System',
        titleHu: 'Atfogo sugo rendszer',
        descriptionEn: 'New searchable FAQ with 50+ entries covering all admin features. Available in Hungarian and English.',
        descriptionHu: 'Uj keresheto GYIK 50+ bejegyzessal, minden admin funkciot lefed. Elerheto magyarul es angolul.',
      },
    ],
  },
  {
    version: '2.1.0',
    date: '2025-12-20',
    changes: [
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Email Rate Limiting',
        titleHu: 'Email korlatozas',
        descriptionEn: 'Prevents email spam: max 5 emails per type per hour, 20 total per hour per guest.',
        descriptionHu: 'Megakadalyozza az email spamet: max 5 email tipusonkent orankent, 20 osszes orankent vendegenkent.',
      },
      {
        type: 'feature',
        category: 'seating',
        titleEn: 'Drag-and-Drop Seating Map',
        titleHu: 'Drag-and-drop ultetesi terkep',
        descriptionEn: 'Interactive visual seating map with drag-and-drop guest assignment.',
        descriptionHu: 'Interaktiv vizualis ultetesi terkep drag-and-drop vendeg hozzarendelessel.',
      },
    ],
  },
  {
    version: '2.0.0',
    date: '2025-12-15',
    changes: [
      {
        type: 'feature',
        category: 'applicant',
        titleEn: 'Applicant Flow',
        titleHu: 'Jelentkezo flow',
        descriptionEn: 'Public application form for non-invited guests. Admin approval workflow with email notifications.',
        descriptionHu: 'Nyilvanos jelentkezesi urlap nem meghivott vendegeknek. Admin jovahagyasi folyamat email ertesitesekkel.',
      },
      {
        type: 'feature',
        category: 'pwa',
        titleEn: 'PWA Guest App Launch',
        titleHu: 'PWA Gala App indulas',
        descriptionEn: 'Progressive Web App for guests with offline QR ticket, table info, and profile management.',
        descriptionHu: 'Progressive Web App vendegeknek offline QR jeggyel, asztal infoval, es profil kezelessel.',
      },
    ],
  },
];

const typeIcons = {
  feature: Sparkle,
  fix: Bug,
  improvement: CheckCircle,
  breaking: Tag,
};

const typeColors = {
  feature: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  fix: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  improvement: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  breaking: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

const typeLabels = {
  feature: { en: 'New Feature', hu: 'Uj funkcio' },
  fix: { en: 'Bug Fix', hu: 'Hibajavitas' },
  improvement: { en: 'Improvement', hu: 'Javitas' },
  breaking: { en: 'Breaking Change', hu: 'Toro valtozas' },
};

const categoryIcons: Record<string, typeof Users> = {
  guest: Users,
  registration: Users,
  email: Envelope,
  seating: Table,
  status: CheckCircle,
  branding: Star,
  audit: ClockCounterClockwise,
  ui: Gear,
  pwa: Gear,
  help: Gear,
  export: Table,
  applicant: Users,
};

export default function ChangelogPage() {
  const { language } = useLanguage();
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set([changelogData[0]?.version])
  );

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const ui = {
    title: language === 'hu' ? 'Valtozasnaplo' : 'Changelog',
    subtitle: language === 'hu'
      ? 'Legfrissebb fejlesztesek es javitasok'
      : 'Latest updates and improvements',
    expandAll: language === 'hu' ? 'Osszes kibontasa' : 'Expand All',
    collapseAll: language === 'hu' ? 'Osszes osszezarasa' : 'Collapse All',
  };

  const allExpanded = changelogData.every(entry => expandedVersions.has(entry.version));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedVersions(new Set());
    } else {
      setExpandedVersions(new Set(changelogData.map(e => e.version)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <ClockCounterClockwise className="w-6 h-6 text-purple-600 dark:text-purple-400" weight="duotone" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {ui.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {ui.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAll}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            {allExpanded ? ui.collapseAll : ui.expandAll}
          </button>
        </div>

        {/* Version Timeline */}
        <div className="space-y-4">
          {changelogData.map((entry, idx) => {
            const isExpanded = expandedVersions.has(entry.version);
            const isLatest = idx === 0;

            return (
              <div
                key={entry.version}
                className={`bg-white dark:bg-neutral-800 rounded-xl shadow-sm border ${
                  isLatest
                    ? 'border-purple-200 dark:border-purple-800'
                    : 'border-gray-200 dark:border-neutral-700'
                }`}
              >
                {/* Version Header */}
                <button
                  onClick={() => toggleVersion(entry.version)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isLatest
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-gray-100 dark:bg-neutral-700'
                    }`}>
                      {isExpanded ? (
                        <CaretDown className={`w-5 h-5 ${isLatest ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} weight="bold" />
                      ) : (
                        <CaretRight className={`w-5 h-5 ${isLatest ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} weight="bold" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isLatest ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                          v{entry.version}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                            {language === 'hu' ? 'Legfrissebb' : 'Latest'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.date}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.changes.length} {language === 'hu' ? 'valtozas' : 'changes'}
                  </span>
                </button>

                {/* Changes List */}
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-3">
                    <div className="border-t border-gray-100 dark:border-neutral-700 pt-4">
                      {entry.changes.map((change, changeIdx) => {
                        const TypeIcon = typeIcons[change.type];
                        const CategoryIcon = categoryIcons[change.category] || Gear;

                        return (
                          <div
                            key={changeIdx}
                            className="flex gap-4 py-3 border-b border-gray-50 dark:border-neutral-700/50 last:border-0"
                          >
                            <div className="flex-shrink-0">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${typeColors[change.type]}`}>
                                <TypeIcon className="w-3.5 h-3.5" weight="bold" />
                                {typeLabels[change.type][language]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {language === 'hu' ? change.titleHu : change.titleEn}
                                </span>
                              </div>
                              {(change.descriptionEn || change.descriptionHu) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {language === 'hu' ? change.descriptionHu : change.descriptionEn}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {language === 'hu'
              ? 'Kerdese van? Keresse az adminisztratort.'
              : 'Have questions? Contact your administrator.'}
          </p>
        </div>
      </div>
    </div>
  );
}
