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
    version: '2.15.0',
    date: '2026-01-21',
    changes: [
      {
        type: 'breaking',
        category: 'database',
        titleEn: 'Name Field Split (first_name / last_name)',
        titleHu: 'Név Mező Szétbontás (first_name / last_name)',
        descriptionEn: 'MIGRATION REQUIRED - The name fields have been split into first_name and last_name across all tables (guests, registrations, users, billing_info).',
        descriptionHu: 'MIGRÁCIÓ SZÜKSÉGES - A name mezők szét lettek bontva first_name és last_name mezőkre minden táblában.',
      },
      {
        type: 'feature',
        category: 'ui',
        titleEn: 'Dark Theme Registration Pages',
        titleHu: 'Sötét Téma Regisztrációs Oldalakon',
        descriptionEn: 'All registration pages feature dark theme with #0c0d0e background and #d1aa67 gold accents for premium look.',
        descriptionHu: 'Minden regisztrációs oldal sötét témát kapott #0c0d0e háttérrel és #d1aa67 arany kiemelésekkel.',
      },
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Title Display in All Emails',
        titleHu: 'Címzés Megjelenítés Minden Emailben',
        descriptionEn: 'Guest titles (Dr., Prof., etc.) now appear in all email greetings including bulk, scheduled, and magic link emails.',
        descriptionHu: 'Vendég címzések (Dr., Prof., stb.) mostantól megjelennek minden email megszólításban.',
      },
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Removed Link Fallback from Emails',
        titleHu: 'Link Fallback Eltávolítva Emailekből',
        descriptionEn: 'Removed "If button doesn\'t work, copy link" fallback section from emails for cleaner design.',
        descriptionHu: '"Ha a gomb nem működik" fallback szekció eltávolítva az emailekből a tisztább dizájn érdekében.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Subtle Decline Button',
        titleHu: 'Visszafogott Elutasítás Gomb',
        descriptionEn: 'Decline button is now less prominent (outline style) to encourage acceptance.',
        descriptionHu: 'Az elutasítás gomb visszafogottabb (körvonal stílus) a részvétel ösztönzésére.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: '"Gála" → "Gala" Text Change',
        titleHu: '"Gála" → "Gala" Szöveg Változás',
        descriptionEn: 'Changed Hungarian "Gála" to English "Gala" across all user-facing text for consistency.',
        descriptionHu: 'Magyar "Gála" helyett angol "Gala" írás minden felhasználói szövegben.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: 'English Title Dropdown Options',
        titleHu: 'Angol Címzés Dropdown Opciók',
        descriptionEn: 'Changed Hungarian title options (ifj., id.) to English equivalents (Jr., Sr.).',
        descriptionHu: 'Magyar címzés opciók (ifj., id.) lecserélve angol megfelelőkre (Jr., Sr.).',
      },
    ],
  },
  {
    version: '2.13.5',
    date: '2026-01-19',
    changes: [
      {
        type: 'fix',
        category: 'deployment',
        titleEn: 'Build Dependencies in Production',
        titleHu: 'Build Függőségek Production-ben',
        descriptionEn: 'Moved build-time dependencies to production dependencies for npm install --omit=dev compatibility.',
        descriptionHu: 'Build idejű függőségek átkerültek production dependencies-be az npm install --omit=dev kompatibilitásért.',
      },
      {
        type: 'feature',
        category: 'deployment',
        titleEn: 'Smart Database Setup',
        titleHu: 'Intelligens Adatbázis Beállítás',
        descriptionEn: 'start.sh automatically detects fresh vs. existing database. Uses prisma db push for clean installs.',
        descriptionHu: 'start.sh automatikusan felismeri a friss vs. létező adatbázist.',
      },
      {
        type: 'feature',
        category: 'deployment',
        titleEn: 'Node.js Version Check',
        titleHu: 'Node.js Verzió Ellenőrzés',
        descriptionEn: 'Added Node.js 18+ version check at startup with clear error message.',
        descriptionHu: 'Node.js 18+ verzió ellenőrzés hozzáadva induláskor.',
      },
      {
        type: 'improvement',
        category: 'security',
        titleEn: 'NEXTAUTH_SECRET Validation',
        titleHu: 'NEXTAUTH_SECRET Validálás',
        descriptionEn: 'NEXTAUTH_SECRET must be at least 64 characters. Build fails with clear error if shorter.',
        descriptionHu: 'NEXTAUTH_SECRET minimum 64 karakter. Build hibaüzenettel leáll ha rövidebb.',
      },
    ],
  },
  {
    version: '2.13.0',
    date: '2026-01-16',
    changes: [
      {
        type: 'feature',
        category: 'checkin',
        titleEn: 'Checked-In Registration Status',
        titleHu: 'Checked-In Regisztrációs Státusz',
        descriptionEn: 'New checked_in status automatically set when guest checks in. Displayed with emerald green badge in admin guest list.',
        descriptionHu: 'Új checked_in státusz automatikusan beállítva belépéskor. Smaragdzöld badge-dzsel jelenik meg az admin vendéglistában.',
      },
      {
        type: 'feature',
        category: 'guest',
        titleEn: 'Not Checked In Filter (No-Show)',
        titleHu: 'Nem Bejelentkezett Szűrő (No-Show)',
        descriptionEn: 'New filter option in admin guest list shows approved guests who haven\'t checked in yet. Useful for no-show follow-up emails.',
        descriptionHu: 'Új szűrő opció az admin vendéglistában a még be nem jelentkezett approved vendégekhez. Hasznos no-show emailekhez.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Guest Name Highlighting',
        titleHu: 'Vendég Név Kiemelés',
        descriptionEn: 'Guest name prominently displayed on all registration pages with large bold text and accent color.',
        descriptionHu: 'Vendég neve kiemelten jelenik meg minden regisztrációs oldalon nagy félkövér szöveggel és akcentszínnel.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: 'Partner Title Required',
        titleHu: 'Partner Címzés Kötelező',
        descriptionEn: 'Partner title field is now required on VIP and Paid registration forms with validation.',
        descriptionHu: 'Partner címzés mező mostantól kötelező a VIP és Paid regisztrációs űrlapokon validációval.',
      },
      {
        type: 'improvement',
        category: 'branding',
        titleEn: 'CEO Gála 2026 Branding',
        titleHu: 'CEO Gála 2026 Márkajelzés',
        descriptionEn: 'Updated branding from "BBJ Events 2026" to "CEO Gála 2026" across all guest-facing pages and emails.',
        descriptionHu: 'Márkajelzés frissítve "CEO Gála 2026"-ra minden vendég-oldali oldalon és emailben.',
      },
      {
        type: 'improvement',
        category: 'registration',
        titleEn: 'Partner Seating Preferences Removed',
        titleHu: 'Partner Ültetési Preferenciák Eltávolítva',
        descriptionEn: 'Partner seating preferences field removed from forms. Main guest seating preferences still available.',
        descriptionHu: 'Partner ültetési preferenciák mező eltávolítva. Fő vendég preferenciái továbbra is elérhetőek.',
      },
      {
        type: 'improvement',
        category: 'email',
        titleEn: 'Email Greeting Punctuation',
        titleHu: 'Email Megszólítás Írásjel',
        descriptionEn: 'Changed email greeting from exclamation mark to comma. Example: "Dear Dr. Kovács," instead of "Dear Dr. Kovács!"',
        descriptionHu: 'Email megszólítás írásjele vesszőre változott. Példa: "Dear Dr. Kovács," a "Dear Dr. Kovács!" helyett.',
      },
    ],
  },
  {
    version: '2.12.0',
    date: '2026-01-15',
    changes: [
      {
        type: 'feature',
        category: 'registration',
        titleEn: 'Partner Title Field',
        titleHu: 'Partner Címzés Mező',
        descriptionEn: 'VIP registration form now includes a title dropdown for partners (Mr., Ms., Mrs., Dr., Prof., Prof. Dr.). Title is stored and displayed with partner name.',
        descriptionHu: 'VIP regisztrációs űrlap mostantól tartalmaz címzés választót partnerekhez (Mr., Ms., Mrs., Dr., Prof., Prof. Dr.). A címzés tárolásra kerül és megjelenik a partner névvel.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'AlreadyRegistered Contrast Enhancement',
        titleHu: 'AlreadyRegistered Kontraszt Javítás',
        descriptionEn: 'Further improved text visibility on VIP AlreadyRegistered page with lighter backgrounds (green-50, slate-50) and proper borders.',
        descriptionHu: 'További javított szöveg láthatóság a VIP AlreadyRegistered oldalon világosabb háttérszínekkel és megfelelő keretekkel.',
      },
      {
        type: 'improvement',
        category: 'email',
        titleEn: 'BBJ Logo Size in Email',
        titleHu: 'BBJ Logo Méret Emailben',
        descriptionEn: 'Increased BBJ logo size in invitation emails from 200px to 300px per client request.',
        descriptionHu: 'BBJ logo méret növelve a meghívó emailekben 200px-ről 300px-re ügyfél kérésre.',
      },
      {
        type: 'improvement',
        category: 'testing',
        titleEn: 'Font Comparison Tool',
        titleHu: 'Font Összehasonlító Eszköz',
        descriptionEn: 'HTML comparison tool (docs/font-comparison.html) to evaluate Helvetica alternatives against ceogala.com design.',
        descriptionHu: 'HTML összehasonlító eszköz (docs/font-comparison.html) Helvetica alternatívák kiértékeléséhez a ceogala.com dizájnhoz.',
      },
    ],
  },
  {
    version: '2.11.0',
    date: '2026-01-14',
    changes: [
      {
        type: 'feature',
        category: 'email',
        titleEn: 'Bulk Email Guest Preview',
        titleHu: 'Tömeges Email Vendég Előnézet',
        descriptionEn: 'Guest list table displays before bulk email scheduling. Shows filtered guests (max 50) with count indicator. Schedule button shows total guest count.',
        descriptionHu: 'Vendéglista táblázat megjelenik tömeges email ütemezés előtt. Szűrt vendégek (max 50) számlálóval. Ütemezés gomb mutatja az összes vendégszámot.',
      },
      {
        type: 'feature',
        category: 'guest',
        titleEn: 'Array-Based Guest Filtering API',
        titleHu: 'Tömb-Alapú Vendég Szűrő API',
        descriptionEn: 'New API parameters for bulk operations: guest_types, registration_statuses (comma-separated), is_vip_reception, has_ticket, has_table. Limit increased to 500.',
        descriptionHu: 'Új API paraméterek tömeges műveletekhez: guest_types, registration_statuses (vesszővel elválasztott), is_vip_reception, has_ticket, has_table. Limit 500-ra növelve.',
      },
      {
        type: 'feature',
        category: 'testing',
        titleEn: 'Release Testing Database Persistence',
        titleHu: 'Release Tesztelés Adatbázis Perzisztencia',
        descriptionEn: 'Release testing page saves results to database. Features: checkbox per test step, comment section per feature, tester name tracking, CSV export (per version or all).',
        descriptionHu: 'Release tesztelés oldal adatbázisba menti az eredményeket. Funkciók: checkbox lépésenként, megjegyzés szekció, tesztelő nyilvántartás, CSV export.',
      },
      {
        type: 'fix',
        category: 'registration',
        titleEn: 'VIP Registration Status Fix',
        titleHu: 'VIP Regisztráció Státusz Javítás',
        descriptionEn: 'VIP registration now correctly sets status to "registered" instead of "approved". Fixed in 4 locations.',
        descriptionHu: 'VIP regisztráció most helyesen állítja a státuszt "registered"-re "approved" helyett. 4 helyen javítva.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'AlreadyRegistered Page Contrast',
        titleHu: 'AlreadyRegistered Oldal Kontraszt',
        descriptionEn: 'Improved text visibility on VIP AlreadyRegistered page with darker background and text colors.',
        descriptionHu: 'Javított szöveg láthatóság a VIP AlreadyRegistered oldalon sötétebb háttérrel és szövegszínekkel.',
      },
      {
        type: 'improvement',
        category: 'seating',
        titleEn: 'Invited Guests in Seating List',
        titleHu: 'Meghívott Vendégek Ültetési Listában',
        descriptionEn: 'Invited guests now appear in unassigned guests list for seating assignment. Previously only registered/approved guests were shown.',
        descriptionHu: 'Meghívott vendégek mostantól megjelennek az ültetési listában. Korábban csak regisztrált/jóváhagyott vendégek jelentek meg.',
      },
      {
        type: 'improvement',
        category: 'seating',
        titleEn: 'Partner Detection Improvements',
        titleHu: 'Partner Detektálás Javítások',
        descriptionEn: 'Improved partner detection on seating tables page via guest_type, ticket_type, partner_of field, and registration partner_name.',
        descriptionHu: 'Javított partner detektálás guest_type, ticket_type, partner_of mező és registration partner_name alapján.',
      },
      {
        type: 'improvement',
        category: 'ui',
        titleEn: 'Date/Time Input Visibility',
        titleHu: 'Dátum/Idő Input Láthatóság',
        descriptionEn: 'Fixed date and time input visibility across all admin pages. Split datetime-local into separate date and time inputs.',
        descriptionHu: 'Javított dátum/idő input láthatóság minden admin oldalon. datetime-local szétbontva külön inputokra.',
      },
      {
        type: 'improvement',
        category: 'branding',
        titleEn: 'MyForge Labs Logo Added',
        titleHu: 'MyForge Labs Logo Hozzáadva',
        descriptionEn: 'Added MyForge Labs logo to Check-in Scanner and PWA layout footers.',
        descriptionHu: 'MyForge Labs logo hozzáadva a Check-in Scanner és PWA lábléchez.',
      },
      {
        type: 'fix',
        category: 'registration',
        titleEn: 'Partner Registration Unique Constraint',
        titleHu: 'Partner Regisztráció Egyediség Hiba',
        descriptionEn: 'Fixed unique constraint error during paired ticket registration with friendly error handling.',
        descriptionHu: 'Javítva az egyediségi hiba páros jegy regisztrációkor barátságos hibakezeléssel.',
      },
      {
        type: 'fix',
        category: 'email',
        titleEn: 'Feedback Email Seating Preferences',
        titleHu: 'Visszaigazoló Email Ültetési Preferenciák',
        descriptionEn: 'Added guestSeating and partnerSeating fields to feedback email templates.',
        descriptionHu: 'guestSeating és partnerSeating mezők hozzáadva a visszaigazoló email sablonokhoz.',
      },
    ],
  },
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
        category: 'registration',
        titleEn: 'Partner Profile Fields',
        titleHu: 'Partner Profil Mezők',
        descriptionEn: 'Partners can now enter same profile info as main guest: title, phone, company, position, dietary requirements, seating preferences.',
        descriptionHu: 'Partnerek most ugyanazokat a profil adatokat adhatják meg: megszólítás, telefon, cég, pozíció, étrendi igények, ültetési preferenciák.',
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
