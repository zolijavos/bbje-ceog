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
  TestTube,
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
    version: '2.10.0',
    date: '2026-01-13',
    changes: [
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Automatic Registration Feedback Emails',
        titleHu: 'Automatikus Regisztráció Visszaigazoló Emailek',
        descriptionEn: 'New email templates sent after VIP registration. Main guest receives full registration summary (name, company, phone, dietary). Partner receives notification about registration.',
        descriptionHu: 'Új email sablonok VIP regisztráció után. Fővendég megkapja a teljes összefoglalót (név, cég, telefon, étrend). Partner értesítést kap a regisztrációról.',
      },
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Paired Ticket Confirmation Emails',
        titleHu: 'Páros Jegy Megerősítő Emailek',
        descriptionEn: 'Both guests in a paired ticket receive BOTH QR codes. Main guest gets own + partner QR. Partner gets own + main guest QR. Ensures check-in even if one forgets phone.',
        descriptionHu: 'Páros jegynél mindkét vendég megkapja MINDKÉT QR kódot. Fővendég kapja sajátját + partner QR-t. Partner kapja sajátját + fővendég QR-t.',
      },
      {
        type: 'improvement',
        category: 'email',
        titleEn: 'VIP Registration Email Order',
        titleHu: 'VIP Regisztráció Email Sorrend',
        descriptionEn: 'Email order changed: feedback email first, then ticket email. Ensures immediate confirmation of submitted data before QR ticket.',
        descriptionHu: 'Email sorrend változott: először visszaigazoló email, aztán jegy email. Biztosítja az azonnali adat visszaigazolást a QR jegy előtt.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: 'Partner Handling as Separate Guest',
        titleHu: 'Partner Kezelés Külön Vendégként',
        descriptionEn: 'Partners now created as separate Guest records with own Registration and unique QR code. Both guests have independent check-in capability.',
        descriptionHu: 'Partnerek most külön Guest rekordként jönnek létre saját Registration-nel és egyedi QR kóddal. Mindkét vendég önállóan beléphet.',
      },
      {
        type: 'improvement',
        category: 'email',
        titleEn: 'Ticket Email Simplified',
        titleHu: 'Jegy Email Egyszerűsítve',
        descriptionEn: 'Removed PWA deep link section from ticket emails. PWA auth code no longer included - guests access PWA directly via ceogala.hu/pwa.',
        descriptionHu: 'PWA deep link szekció eltávolítva jegy emailekből. PWA auth kód már nem szerepel - vendégek közvetlenül a ceogala.hu/pwa oldalon lépnek be.',
      },
    ],
  },
  {
    version: '2.9.0',
    date: '2026-01-11',
    changes: [
      {
        type: 'feature',
        category: 'pwa',
        titleEn: 'PWA Cancel Page',
        titleHu: 'PWA Lemondás Oldal',
        descriptionEn: 'Guests can cancel registration via /pwa/cancel with reason selection (schedule conflict, illness, other). Available until 7 days before event.',
        descriptionHu: 'Vendégek lemondhatják regisztrációjukat a /pwa/cancel oldalon ok választással (időpont ütközés, betegség, egyéb). Esemény előtt 7 napig elérhető.',
      },
      {
        type: 'feature',
        category: 'status',
        titleEn: 'Cancelled Status & No-Show Statistics',
        titleHu: 'Lemondott Státusz & No-Show Statisztikák',
        descriptionEn: 'New "Cancelled" status with orange badge. Dashboard shows attendance stats: cancelled count, potential no-shows, cancellation reasons.',
        descriptionHu: 'Új "Lemondott" státusz narancssárga badge-dzsel. Dashboard mutatja a részvételi statisztikákat: lemondottak, potenciális no-show-k, lemondási okok.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: 'Attendance Commitment Consent',
        titleHu: 'Részvételi Kötelezettségvállalás',
        descriptionEn: 'Updated consent text with no-show fee warning for VIP guests. Clear cancellation policy displayed.',
        descriptionHu: 'Frissített consent szöveg no-show díj figyelmeztetéssel VIP vendégeknek. Egyértelmű lemondási szabályzat.',
      },
      {
        type: 'feature',
        category: 'email',
        titleEn: 'E-10 Reminder Email Template',
        titleHu: 'E-10 Emlékeztető Email Sablon',
        descriptionEn: 'New template for 10-day event reminder with cancellation link.',
        descriptionHu: 'Új sablon 10 napos esemény emlékeztetőhöz lemondási linkkel.',
      },
      {
        type: 'improvement',
        category: 'email',
        titleEn: 'E-7 & No-Show Email Templates',
        titleHu: 'E-7 & No-Show Email Sablonok',
        descriptionEn: 'E-7 reminder (last chance to cancel) and No-Show payment request email templates added.',
        descriptionHu: 'E-7 emlékeztető (utolsó esély lemondásra) és No-Show fizetési felszólítás email sablonok hozzáadva.',
      },
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Email Scheduler Automation',
        titleHu: 'Email Ütemező Automatizálás',
        descriptionEn: 'New scheduler configs for E-10, E-7 reminders and no-show payment requests. Event reminders include cancel URL. Automatic scheduling based on event date.',
        descriptionHu: 'Új ütemező konfigurációk E-10, E-7 emlékeztetőkhöz és no-show fizetési felszólításokhoz. Esemény emlékeztetők tartalmazzák a lemondási linket. Automatikus ütemezés esemény dátum alapján.',
      },
      {
        type: 'improvement',
        category: 'checkin',
        titleEn: 'Check-in Blocks Cancelled Guests',
        titleHu: 'Beléptetés Blokkolja Lemondottakat',
        descriptionEn: 'QR scanner shows error for cancelled registrations.',
        descriptionHu: 'QR olvasó hibát jelez lemondott regisztrációknál.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: 'Sample GDPR Policy Text',
        titleHu: 'Minta GDPR Szabályzat Szöveg',
        descriptionEn: 'Detailed inline GDPR consent text with data collection details, retention period, and rights.',
        descriptionHu: 'Részletes inline GDPR szöveg adatgyűjtés részletekkel, megőrzési idővel és jogokkal.',
      },
      {
        type: 'improvement',
        category: 'pwa',
        titleEn: 'PWA Table Section Hidden',
        titleHu: 'PWA Asztal Szekció Elrejtve',
        descriptionEn: 'Table assignment temporarily hidden via feature flag until seating finalized.',
        descriptionHu: 'Asztal hozzárendelés ideiglenesen elrejtve amíg az ültetés nem végleges.',
      },
      {
        type: 'improvement',
        category: 'email',
        titleEn: 'Magic Link Invitation Email Redesign',
        titleHu: 'Magic Link Meghívó Email Újratervezés',
        descriptionEn: 'Complete redesign with CEO Gala 2026 branding, elegant typography, event details, awards section, and dual signatures.',
        descriptionHu: 'Teljes újratervezés CEO Gala 2026 arculattal, elegáns tipográfiával, esemény részletekkel, díjak szekcióval és kettős aláírással.',
      },
    ],
  },
  {
    version: '2.8.1',
    date: '2026-01-11',
    changes: [
      {
        type: 'feature',
        category: 'ui',
        titleEn: 'Release Testing Admin Page',
        titleHu: 'Release Tesztelés Admin Oldal',
        descriptionEn: 'New admin page at /admin/release-testing for manual test steps by version. Features: test status tracking, localStorage persistence, direct version linking via URL hash, bilingual support.',
        descriptionHu: 'Új admin oldal a /admin/release-testing címen manuális teszt lépésekhez verziónként. Funkciók: teszt státusz követés, localStorage mentés, közvetlen verzió linkelés, kétnyelvű támogatás.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Changelog Test Links',
        titleHu: 'Változásnapló Teszt Linkek',
        descriptionEn: 'Each version in the changelog now has a "Tesztelés" badge linking directly to its test steps.',
        descriptionHu: 'A változásnaplóban minden verzió mellett mostantól "Tesztelés" badge található, ami a teszt lépésekre mutat.',
      },
    ],
  },
  {
    version: '2.8.0',
    date: '2026-01-10',
    changes: [
      {
        type: 'feature',
        category: 'seating',
        titleEn: 'Floor Plan Export (PNG/PDF)',
        titleHu: 'Ültetési Térkép Exportálás (PNG/PDF)',
        descriptionEn: 'Download floor plan as high-quality PNG image or print-ready PDF with header, legend, and event info. Perfect for event coordinators and venue staff.',
        descriptionHu: 'Töltsd le az ültetési térképet magas minőségű PNG képként vagy nyomtatásra kész PDF-ként fejléccel, jelmagyarázattal és esemény infóval.',
      },
      {
        type: 'improvement',
        category: 'seating',
        titleEn: 'Smart Tooltip Positioning',
        titleHu: 'Okos Tooltip Pozicionálás',
        descriptionEn: 'Table tooltips automatically adjust position to stay on screen. Edge tables show tooltips on the appropriate side.',
        descriptionHu: 'Az asztal tooltipek automatikusan igazodnak a képernyőn maradáshoz. Szélső asztaloknál megfelelő oldalon jelennek meg.',
      },
      {
        type: 'improvement',
        category: 'seating',
        titleEn: 'Hoverable Tooltips',
        titleHu: 'Görögethető Tooltipek',
        descriptionEn: 'Tooltips stay visible when hovering over them with 300ms delay. Scrollable guest lists for large tables.',
        descriptionHu: 'A tooltipek láthatóak maradnak hover közben 300ms késleltetéssel. Görgethető vendéglista nagy asztaloknál.',
      },
      {
        type: 'fix',
        category: 'ui',
        titleEn: 'Dashboard Dark Mode Colors',
        titleHu: 'Vezérlőpult Sötét Mód Színek',
        descriptionEn: 'Fixed accent color visibility in dark mode on dashboard. Changed from accent-500 to accent-600/400 for better contrast.',
        descriptionHu: 'Javítva az accent szín láthatósága sötét módban a vezérlőpulton. accent-500 helyett accent-600/400 a jobb kontraszt érdekében.',
      },
    ],
  },
  {
    version: '2.7.0',
    date: '2026-01-09',
    changes: [
      {
        type: 'feature',
        category: 'branding',
        titleEn: 'BBJ Events 2026 Color Scheme',
        titleHu: 'BBJ Events 2026 Színséma',
        descriptionEn: 'Complete visual refresh with new navy-based color palette (#000D38 primary). Dark mode and light mode fully redesigned for elegant, VIP event branding.',
        descriptionHu: 'Teljes vizuális frissítés új navy alapú színpalettával (#000D38 elsődleges). Sötét és világos téma újratervezve elegáns, VIP esemény arculathoz.',
      },
      {
        type: 'feature',
        category: 'ui',
        titleEn: 'UX Design Wireframes',
        titleHu: 'UX Design Wireframe-ek',
        descriptionEn: 'Created complete wireframes for all 6 guest-facing screens (PWA Login, Dashboard, Ticket, Table, VIP Registration, Payment Success) in both dark and light modes.',
        descriptionHu: 'Elkészültek a teljes wireframe-ek mind a 6 vendég oldali képernyőhöz (PWA Bejelentkezés, Dashboard, Jegy, Asztal, VIP Regisztráció, Sikeres Fizetés) sötét és világos módban.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Monochrome Icon System',
        titleHu: 'Monokróm Ikon Rendszer',
        descriptionEn: 'All icons converted to monochrome navy/white palette. No colored icons in the UI for consistent VIP aesthetic.',
        descriptionHu: 'Minden ikon monokróm navy/fehér palettára konvertálva. Nincsenek színes ikonok a felületen az egységes VIP esztétikáért.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Inter Typography',
        titleHu: 'Inter Tipográfia',
        descriptionEn: 'Inter font standardized across all pages with proper weight hierarchy (400 Regular, 500 Medium, 600 SemiBold).',
        descriptionHu: 'Inter betűtípus szabványosítva minden oldalon megfelelő súly hierarchiával (400 Regular, 500 Medium, 600 SemiBold).',
      },
    ],
  },
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
        titleHu: 'VIP Fogadás Oszlop',
        descriptionEn: 'Added VIP Reception indicator column to guest list. VIP guests are marked with a star icon. Edit guests to toggle VIP status.',
        descriptionHu: 'VIP Fogadás jelző oszlop hozzáadva a vendéglistához. VIP vendégek csillag ikonnal jelölve. Vendég szerkesztésekor állítható.',
      },
      {
        type: 'feature',
        category: 'registration',
        titleEn: 'Partner Registration for All Guests',
        titleHu: 'Partner Regisztráció Minden Vendégnek',
        descriptionEn: 'All paying guests can now bring a partner. Previously only paired ticket holders could register partners.',
        descriptionHu: 'Minden fizető vendég hozhat partnert. Korábban csak páros jegyes vendégek regisztrálhattak partnert.',
      },
      {
        type: 'improvement',
        category: 'export',
        titleEn: 'Complete CSV Export',
        titleHu: 'Teljes CSV Export',
        descriptionEn: 'Guest export now includes all fields: billing info, check-in status, payment details, paired guest info, and more.',
        descriptionHu: 'A vendég export már tartalmazza az összes mezőt: számlázási adatok, check-in státusz, fizetési adatok, partner adatok és még több.',
      },
      {
        type: 'fix',
        category: 'status',
        titleEn: 'Status Filter Improvements',
        titleHu: 'Státusz Szűrő Javítások',
        descriptionEn: 'Fixed status filtering to properly distinguish "Declined" (guest cancelled) from "Rejected" (admin rejected). Hungarian translations corrected.',
        descriptionHu: 'Javítva a státusz szűrés, hogy megkülönböztesse a "Lemondta" (vendég lemondta) és "Elutasítva" (admin elutasította) státuszokat.',
      },
      {
        type: 'improvement',
        category: 'branding',
        titleEn: 'BBJ Events Branding',
        titleHu: 'BBJ Events Branding',
        descriptionEn: 'Updated all email templates and payment references from "CEO Gala" to "BBJ Events".',
        descriptionHu: 'Frissítve az összes email sablon és fizetési hivatkozás "CEO Gala"-ról "BBJ Events"-re.',
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
        titleHu: 'Admin Audit Napló',
        descriptionEn: 'New audit log page tracks all admin actions: guest changes, email sends, payment approvals, and more. Filter by action type, entity, or date.',
        descriptionHu: 'Új audit napló oldal követi az összes admin műveletet: vendég változtatások, email küldések, fizetés jóváhagyások és még több.',
      },
      {
        type: 'feature',
        category: 'guest',
        titleEn: 'Company & Position Fields',
        titleHu: 'Cég & Beosztás Mezők',
        descriptionEn: 'Added Company and Position fields to guest edit modal. These are now required fields.',
        descriptionHu: 'Cég és Beosztás mezők hozzáadva a vendég szerkesztő modalhoz. Ezek most kötelező mezők.',
      },
      {
        type: 'fix',
        category: 'ui',
        titleEn: 'Guest List Refresh Button',
        titleHu: 'Vendég Lista Frissítés Gomb',
        descriptionEn: 'Added refresh button to guest list for manual data reload without page refresh.',
        descriptionHu: 'Frissítés gomb hozzáadva a vendéglistához a kézi adat újratöltéshez oldal frissítés nélkül.',
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
        titleHu: 'Gala App (PWA) Fejlesztések',
        descriptionEn: 'Improved offline support, faster loading, and better QR code display. Push notifications ready.',
        descriptionHu: 'Javított offline támogatás, gyorsabb betöltés, és jobb QR kód megjelenítés. Push értesítések készen.',
      },
      {
        type: 'improvement',
        category: 'help',
        titleEn: 'Comprehensive Help System',
        titleHu: 'Átfogó Súgó Rendszer',
        descriptionEn: 'New searchable FAQ with 50+ entries covering all admin features. Available in Hungarian and English.',
        descriptionHu: 'Új kereshető GYIK 50+ bejegyzéssel, minden admin funkciót lefed. Elérhető magyarul és angolul.',
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
        titleHu: 'Email Korlátozás',
        descriptionEn: 'Prevents email spam: max 5 emails per type per hour, 20 total per hour per guest.',
        descriptionHu: 'Megakadályozza az email spamet: max 5 email típusonként óránként, 20 összes óránként vendégenként.',
      },
      {
        type: 'feature',
        category: 'seating',
        titleEn: 'Drag-and-Drop Seating Map',
        titleHu: 'Drag-and-Drop Ültetési Térkép',
        descriptionEn: 'Interactive visual seating map with drag-and-drop guest assignment.',
        descriptionHu: 'Interaktív vizuális ültetési térkép drag-and-drop vendég hozzárendeléssel.',
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
        titleHu: 'Jelentkező Flow',
        descriptionEn: 'Public application form for non-invited guests. Admin approval workflow with email notifications.',
        descriptionHu: 'Nyilvános jelentkezési űrlap nem meghívott vendégeknek. Admin jóváhagyási folyamat email értesítésekkel.',
      },
      {
        type: 'feature',
        category: 'pwa',
        titleEn: 'PWA Guest App Launch',
        titleHu: 'PWA Gala App Indulás',
        descriptionEn: 'Progressive Web App for guests with offline QR ticket, table info, and profile management.',
        descriptionHu: 'Progressive Web App vendégeknek offline QR jeggyel, asztal infóval, és profil kezeléssel.',
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
  feature: { en: 'New Feature', hu: 'Új funkció' },
  fix: { en: 'Bug Fix', hu: 'Hibajavítás' },
  improvement: { en: 'Improvement', hu: 'Javítás' },
  breaking: { en: 'Breaking Change', hu: 'Törő változás' },
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
    title: language === 'hu' ? 'Változásnapló' : 'Changelog',
    subtitle: language === 'hu'
      ? 'Legfrissebb fejlesztések és javítások'
      : 'Latest updates and improvements',
    expandAll: language === 'hu' ? 'Összes kibontása' : 'Expand All',
    collapseAll: language === 'hu' ? 'Összes összezárása' : 'Collapse All',
    testSteps: language === 'hu' ? 'Tesztelés' : 'Test Steps',
  };

  const getTestingUrl = (version: string) => {
    return `/admin/release-testing#v${version.replace(/\./g, '-')}`;
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
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center ${
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold ${isLatest ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                          v{entry.version}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            {language === 'hu' ? 'Legfrissebb' : 'Latest'}
                          </span>
                        )}
                        <a
                          href={getTestingUrl(entry.version)}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors border border-blue-300 dark:border-blue-600"
                          title={ui.testSteps}
                        >
                          <TestTube className="w-3 h-3" weight="bold" />
                          {ui.testSteps}
                        </a>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.date}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    {entry.changes.length} {language === 'hu' ? 'változás' : 'changes'}
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
              ? 'Kérdése van? Keresse az adminisztrátort.'
              : 'Have questions? Contact your administrator.'}
          </p>
        </div>
      </div>
    </div>
  );
}
