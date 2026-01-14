'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TestTube,
  CheckCircle,
  XCircle,
  Question,
  CaretRight,
  CaretDown,
  ArrowLeft,
  Export,
  ChatText,
  Check,
  Spinner,
} from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

interface TestStep {
  en: string;
  hu: string;
}

interface TestFeature {
  nameEn: string;
  nameHu: string;
  steps: TestStep[];
  expected: { en: string; hu: string };
}

interface ReleaseTest {
  version: string;
  date: string;
  features: TestFeature[];
}

// Database result type
interface TestResultData {
  id: number;
  version: string;
  feature_index: number;
  feature_name: string;
  status: TestStatus;
  comment: string | null;
  step_results: string | null;
  tester_name: string;
  tester: { id: number; name: string; email: string };
  tested_at: string;
  updated_at: string;
}

const releaseTests: ReleaseTest[] = [
  {
    version: '2.11.0',
    date: '2026-01-14',
    features: [
      {
        nameEn: 'Bulk Email Guest Preview',
        nameHu: 'Tömeges Email Vendég Előnézet',
        steps: [
          { en: 'Navigate to /admin/scheduled-emails', hu: 'Navigálj a /admin/scheduled-emails oldalra' },
          { en: 'Click "Schedule Bulk Email" tab', hu: 'Kattints a "Tömeges Email Ütemezés" fülre' },
          { en: 'Select any guest filters (type, status, VIP)', hu: 'Válassz vendég szűrőket (típus, státusz, VIP)' },
          { en: 'Verify filtered guest list table appears below filters', hu: 'Ellenőrizd, hogy a szűrt vendéglista táblázat megjelenik a szűrők alatt' },
          { en: 'Verify max 50 guests shown with "X more guests..." indicator', hu: 'Ellenőrizd, hogy max 50 vendég jelenik meg "X további vendég..." jelzéssel' },
          { en: 'Verify schedule button shows total guest count', hu: 'Ellenőrizd, hogy az ütemezés gomb mutatja az összes vendégszámot' },
        ],
        expected: { en: 'Guest preview table shows filtered recipients before scheduling bulk emails', hu: 'Vendég előnézet táblázat mutatja a szűrt címzetteket tömeges email ütemezés előtt' }
      },
      {
        nameEn: 'Array-Based Guest Filtering API',
        nameHu: 'Tömb-Alapú Vendég Szűrő API',
        steps: [
          { en: 'Open browser DevTools Network tab', hu: 'Nyisd meg a böngésző DevTools Hálózat fület' },
          { en: 'Select multiple guest types in bulk email filters', hu: 'Válassz több vendég típust a tömeges email szűrőkben' },
          { en: 'Verify API call uses guest_types=vip,paying_single format', hu: 'Ellenőrizd, hogy az API hívás guest_types=vip,paying_single formátumot használ' },
          { en: 'Select multiple registration statuses', hu: 'Válassz több regisztrációs státuszt' },
          { en: 'Verify API call uses registration_statuses=invited,registered format', hu: 'Ellenőrizd, hogy az API hívás registration_statuses=invited,registered formátumot használ' },
          { en: 'Check limit parameter is 500', hu: 'Ellenőrizd, hogy a limit paraméter 500' },
        ],
        expected: { en: 'API correctly processes comma-separated array filters', hu: 'API helyesen dolgozza fel a vesszővel elválasztott tömb szűrőket' }
      },
      {
        nameEn: 'VIP Registration Status Fix',
        nameHu: 'VIP Regisztráció Státusz Javítás',
        steps: [
          { en: 'Create a new VIP guest in admin', hu: 'Hozz létre új VIP vendéget az adminban' },
          { en: 'Send magic link to the guest', hu: 'Küldj magic linket a vendégnek' },
          { en: 'Complete VIP registration', hu: 'Töltsd ki a VIP regisztrációt' },
          { en: 'Navigate to /admin/guests and find the guest', hu: 'Navigálj a /admin/guests oldalra és keresd meg a vendéget' },
          { en: 'Verify status shows "Registered" (not "Approved")', hu: 'Ellenőrizd, hogy a státusz "Regisztrált" (nem "Jóváhagyott")' },
        ],
        expected: { en: 'VIP registration correctly sets status to "registered"', hu: 'VIP regisztráció helyesen állítja a státuszt "registered"-re' }
      },
      {
        nameEn: 'Invited Guests in Seating List',
        nameHu: 'Meghívott Vendégek az Ültetési Listában',
        steps: [
          { en: 'Create a new guest with "invited" status (no registration yet)', hu: 'Hozz létre új vendéget "invited" státusszal (még nincs regisztráció)' },
          { en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' },
          { en: 'Look at the "Unassigned Guests" panel', hu: 'Nézd meg a "Nem hozzárendelt vendégek" panelt' },
          { en: 'Verify the invited guest appears in the list', hu: 'Ellenőrizd, hogy a meghívott vendég megjelenik a listában' },
          { en: 'Drag guest to a table to assign seat', hu: 'Húzd a vendéget egy asztalhoz ülőhely hozzárendeléséhez' },
        ],
        expected: { en: 'Invited guests are visible and assignable in seating list', hu: 'Meghívott vendégek láthatók és hozzárendelhetők az ültetési listában' }
      },
      {
        nameEn: 'Partner Detection on Seating Tables',
        nameHu: 'Partner Detektálás az Ültetési Táblákban',
        steps: [
          { en: 'Create a paired ticket registration (paying_paired type)', hu: 'Hozz létre páros jegy regisztrációt (paying_paired típus)' },
          { en: 'Navigate to /admin/seating (Tables view)', hu: 'Navigálj a /admin/seating oldalra (Táblák nézet)' },
          { en: 'Find the paired guest in unassigned list', hu: 'Keresd meg a páros vendéget a nem hozzárendelt listában' },
          { en: 'Verify partner indicator is shown (icon or label)', hu: 'Ellenőrizd, hogy a partner jelző megjelenik (ikon vagy címke)' },
          { en: 'Assign to table and verify both seats reserved', hu: 'Rendelj asztalhoz és ellenőrizd, hogy mindkét hely lefoglalódik' },
        ],
        expected: { en: 'Partners correctly detected via guest_type, ticket_type, partner_of, or registration partner_name', hu: 'Partnerek helyesen detektálva guest_type, ticket_type, partner_of vagy registration partner_name alapján' }
      },
      {
        nameEn: 'Date/Time Input Visibility',
        nameHu: 'Dátum/Idő Input Láthatóság',
        steps: [
          { en: 'Navigate to /admin/scheduled-emails', hu: 'Navigálj a /admin/scheduled-emails oldalra' },
          { en: 'Verify date picker text is dark and readable', hu: 'Ellenőrizd, hogy a dátum választó szöveg sötét és olvasható' },
          { en: 'Verify time picker text is dark and readable', hu: 'Ellenőrizd, hogy az idő választó szöveg sötét és olvasható' },
          { en: 'Navigate to /admin/checkin-log and check date inputs', hu: 'Navigálj a /admin/checkin-log oldalra és ellenőrizd a dátum inputokat' },
          { en: 'Navigate to /admin/audit-log and check date inputs', hu: 'Navigálj a /admin/audit-log oldalra és ellenőrizd a dátum inputokat' },
          { en: 'Navigate to /admin/payments and check date inputs', hu: 'Navigálj a /admin/payments oldalra és ellenőrizd a dátum inputokat' },
        ],
        expected: { en: 'All date/time inputs have visible dark text on white background', hu: 'Minden dátum/idő input sötét szöveget mutat fehér háttéren' }
      },
      {
        nameEn: 'MyForge Labs Logo in Footers',
        nameHu: 'MyForge Labs Logo a Láblécekben',
        steps: [
          { en: 'Navigate to /checkin (QR scanner)', hu: 'Navigálj a /checkin oldalra (QR olvasó)' },
          { en: 'Scroll to footer area', hu: 'Görgess a lábléc területre' },
          { en: 'Verify MyForge Labs logo appears before "Built By MyForge Labs" text', hu: 'Ellenőrizd, hogy a MyForge Labs logo megjelenik a "Built By MyForge Labs" szöveg előtt' },
          { en: 'Login to PWA at /pwa', hu: 'Jelentkezz be a PWA-ba a /pwa címen' },
          { en: 'Check footer on any PWA page', hu: 'Ellenőrizd a láblécet bármely PWA oldalon' },
          { en: 'Verify logo appears in PWA footer too', hu: 'Ellenőrizd, hogy a logo megjelenik a PWA láblécben is' },
        ],
        expected: { en: 'MyForge Labs logo visible in both Check-in Scanner and PWA footers', hu: 'MyForge Labs logo látható a Check-in Scanner és PWA láblécekben egyaránt' }
      },
      {
        nameEn: 'Partner Registration Error Handling',
        nameHu: 'Partner Regisztráció Hibakezelés',
        steps: [
          { en: 'Create a paid guest with paired ticket type', hu: 'Hozz létre fizető vendéget páros jegy típussal' },
          { en: 'Complete registration with partner email', hu: 'Töltsd ki a regisztrációt partner email címmel' },
          { en: 'Try to register the same partner email again for a different guest', hu: 'Próbáld regisztrálni ugyanazt a partner email címet egy másik vendégnek' },
          { en: 'Verify friendly error message appears (not database error)', hu: 'Ellenőrizd, hogy barátságos hibaüzenet jelenik meg (nem adatbázis hiba)' },
        ],
        expected: { en: 'System gracefully handles duplicate partner registration attempts', hu: 'Rendszer elegánsan kezeli a duplikált partner regisztrációs kísérleteket' }
      },
      {
        nameEn: 'AlreadyRegistered Page Contrast',
        nameHu: 'AlreadyRegistered Oldal Kontraszt',
        steps: [
          { en: 'Register a VIP guest successfully', hu: 'Regisztrálj egy VIP vendéget sikeresen' },
          { en: 'Try to access the same magic link again', hu: 'Próbáld újra elérni ugyanazt a magic linket' },
          { en: 'Verify AlreadyRegistered page is displayed', hu: 'Ellenőrizd, hogy az AlreadyRegistered oldal jelenik meg' },
          { en: 'Check that green box has good text contrast', hu: 'Ellenőrizd, hogy a zöld dobozban jól látható a szöveg' },
          { en: 'Verify border is visible around the box', hu: 'Ellenőrizd, hogy keret látható a doboz körül' },
        ],
        expected: { en: 'AlreadyRegistered page has improved text visibility with darker colors', hu: 'AlreadyRegistered oldalon javított szöveg láthatóság sötétebb színekkel' }
      },
    ]
  },
  {
    version: '2.10.0',
    date: '2026-01-13',
    features: [
      {
        nameEn: 'Automatic Registration Feedback Emails',
        nameHu: 'Automatikus Regisztráció Visszaigazoló Emailek',
        steps: [
          { en: 'Create a new VIP guest in admin', hu: 'Hozz létre új VIP vendéget az adminban' },
          { en: 'Send magic link to the VIP guest', hu: 'Küldj magic linket a VIP vendégnek' },
          { en: 'Complete VIP registration with partner info', hu: 'Töltsd ki a VIP regisztrációt partner adatokkal' },
          { en: 'Check main guest email for "Automatic feedback" email', hu: 'Ellenőrizd a fővendég emailjét az "Automatic feedback" emailért' },
          { en: 'Verify email contains all registration data (name, company, phone, dietary)', hu: 'Ellenőrizd, hogy az email tartalmazza az összes regisztrációs adatot (név, cég, telefon, étrend)' },
          { en: 'Check partner email for notification about registration', hu: 'Ellenőrizd a partner emailjét az értesítésért a regisztrációról' },
          { en: 'Verify CEO Gala 2026 header image appears in both emails', hu: 'Ellenőrizd, hogy a CEO Gala 2026 fejléc kép megjelenik mindkét emailben' },
        ],
        expected: { en: 'Both main guest and partner receive feedback emails with registration data summary before ticket delivery', hu: 'Fővendég és partner is kap visszaigazoló emailt a regisztrációs adatok összefoglalójával a jegy küldés előtt' }
      },
      {
        nameEn: 'Paired Ticket Dual QR Code Test',
        nameHu: 'Páros Jegy Dupla QR Kód Teszt',
        steps: [
          { en: 'Create a paying guest with paired ticket type', hu: 'Hozz létre fizető vendéget páros jegy típussal' },
          { en: 'Complete registration with partner name and email', hu: 'Töltsd ki a regisztrációt partner névvel és email címmel' },
          { en: 'Complete payment (card or manual approval for bank transfer)', hu: 'Fejezd be a fizetést (kártya vagy kézi jóváhagyás átutaláshoz)' },
          { en: 'Check main guest ticket email', hu: 'Ellenőrizd a fővendég jegy emailjét' },
          { en: 'Verify main guest email contains TWO QR codes (own + partner)', hu: 'Ellenőrizd, hogy a fővendég email KETTŐ QR kódot tartalmaz (saját + partner)' },
          { en: 'Check partner ticket email', hu: 'Ellenőrizd a partner jegy emailjét' },
          { en: 'Verify partner email contains TWO QR codes (own + main guest)', hu: 'Ellenőrizd, hogy a partner email KETTŐ QR kódot tartalmaz (saját + fővendég)' },
        ],
        expected: { en: 'Both guests in paired ticket receive both QR codes for backup check-in capability', hu: 'Páros jegynél mindkét vendég megkapja mindkét QR kódot a tartalék belépés érdekében' }
      },
      {
        nameEn: 'Email Order Verification (Feedback → Ticket)',
        nameHu: 'Email Sorrend Ellenőrzés (Visszaigazoló → Jegy)',
        steps: [
          { en: 'Complete a fresh VIP registration', hu: 'Végezz el egy új VIP regisztrációt' },
          { en: 'Check email inbox or email logs', hu: 'Ellenőrizd az email postaládát vagy email naplókat' },
          { en: 'Verify feedback email arrived BEFORE ticket email', hu: 'Ellenőrizd, hogy a visszaigazoló email ELŐBB érkezett a jegy emailnél' },
          { en: 'Compare timestamps if checking via admin email log', hu: 'Hasonlítsd össze az időbélyegeket ha admin email naplón keresztül nézed' },
        ],
        expected: { en: 'Feedback email sent first, ticket email sent second (correct order)', hu: 'Visszaigazoló email először, jegy email másodszor (helyes sorrend)' }
      },
      {
        nameEn: 'Partner as Separate Guest Record',
        nameHu: 'Partner Külön Vendég Rekordként',
        steps: [
          { en: 'Complete a paired ticket registration with partner details', hu: 'Végezz el páros jegy regisztrációt partner adatokkal' },
          { en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' },
          { en: 'Search for the partner by name or email', hu: 'Keress a partnerre név vagy email alapján' },
          { en: 'Verify partner appears as separate row in guest list', hu: 'Ellenőrizd, hogy a partner külön sorként jelenik meg a vendéglistában' },
          { en: 'Click on partner to view details', hu: 'Kattints a partnerre a részletek megtekintéséhez' },
          { en: 'Verify partner has own Registration record and unique QR code', hu: 'Ellenőrizd, hogy a partnernek saját Registration rekordja és egyedi QR kódja van' },
        ],
        expected: { en: 'Partners are independent Guest records with separate Registration and QR - not just data on main guest', hu: 'Partnerek önálló Guest rekordok külön Registrationnel és QR-rel - nem csak adat a fővendégen' }
      },
      {
        nameEn: 'Ticket Email PWA Link Removal',
        nameHu: 'Jegy Email PWA Link Eltávolítás',
        steps: [
          { en: 'Complete any registration to trigger ticket email', hu: 'Végezz el bármilyen regisztrációt a jegy email kiváltásához' },
          { en: 'Open the ticket delivery email', hu: 'Nyisd meg a jegy küldő emailt' },
          { en: 'Scroll through entire email content', hu: 'Görgess végig az egész email tartalmon' },
          { en: 'Verify NO "Open in Gala App" or PWA deep link section exists', hu: 'Ellenőrizd, hogy NINCS "Open in Gala App" vagy PWA deep link szekció' },
          { en: 'Verify email contains only: QR code, event info, guest name', hu: 'Ellenőrizd, hogy az email csak ezt tartalmazza: QR kód, esemény info, vendég név' },
        ],
        expected: { en: 'Ticket emails are simplified without PWA promotional section', hu: 'Jegy emailek egyszerűsítve PWA promóciós szekció nélkül' }
      },
      {
        nameEn: 'Email Template Preview - Feedback Templates',
        nameHu: 'Email Sablon Előnézet - Visszaigazoló Sablonok',
        steps: [
          { en: 'Navigate to /admin/email-templates', hu: 'Navigálj a /admin/email-templates oldalra' },
          { en: 'Find "Registration Feedback (Main Guest)" template', hu: 'Keresd a "Registration Feedback (Main Guest)" sablont' },
          { en: 'Click Preview button', hu: 'Kattints az Előnézet gombra' },
          { en: 'Verify sample data is displayed correctly', hu: 'Ellenőrizd, hogy a minta adatok helyesen jelennek meg' },
          { en: 'Find "Registration Feedback (Partner)" template', hu: 'Keresd a "Registration Feedback (Partner)" sablont' },
          { en: 'Click Preview and verify partner notification content', hu: 'Kattints az Előnézetre és ellenőrizd a partner értesítő tartalmat' },
        ],
        expected: { en: 'Both new feedback templates have working preview with sample data', hu: 'Mindkét új visszaigazoló sablon működő előnézettel rendelkezik minta adatokkal' }
      },
    ]
  },
  {
    version: '2.9.0',
    date: '2026-01-11',
    features: [
      { nameEn: 'PWA Cancel Page - Basic Flow', nameHu: 'PWA Lemondás Oldal - Alap Flow', steps: [{ en: 'Login to PWA with a registered guest code', hu: 'Jelentkezz be a PWA-ba egy regisztrált vendég kóddal' }, { en: 'Navigate to /pwa/cancel', hu: 'Navigálj a /pwa/cancel oldalra' }, { en: 'Select a cancellation reason', hu: 'Válassz lemondási okot' }, { en: 'Click "Confirm Cancellation" button', hu: 'Kattints a "Lemondás megerősítése" gombra' }, { en: 'Verify success message', hu: 'Ellenőrizd a sikeres üzenetet' }], expected: { en: 'Registration status changes to "Cancelled"', hu: 'Regisztrációs státusz "Lemondott"-ra változik' } },
      { nameEn: 'PWA Cancel Page - Deadline Check', nameHu: 'PWA Lemondás Oldal - Határidő Ellenőrzés', steps: [{ en: 'Try to access /pwa/cancel within 7 days of event', hu: 'Próbáld elérni a /pwa/cancel oldalt 7 napon belül az esemény előtt' }, { en: 'Verify warning message', hu: 'Ellenőrizd a figyelmeztetést' }], expected: { en: 'Cancellation blocked when deadline passed', hu: 'Lemondás blokkolva ha a határidő lejárt' } },
      { nameEn: 'Cancelled Status in Guest List', nameHu: 'Lemondott Státusz a Vendéglistában', steps: [{ en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' }, { en: 'Find a cancelled guest', hu: 'Keress lemondott vendéget' }, { en: 'Verify orange badge', hu: 'Ellenőrizd a narancssárga badge-et' }], expected: { en: 'Cancelled guests have orange badge', hu: 'Lemondott vendégek narancssárga badge-dzsel' } },
      { nameEn: 'Magic Link Invitation Email Redesign', nameHu: 'Magic Link Meghívó Email Újratervezés', steps: [{ en: 'Create a new guest in admin', hu: 'Hozz létre új vendéget' }, { en: 'Send magic link invitation email', hu: 'Küldj magic link emailt' }, { en: 'Verify Georgia serif font', hu: 'Ellenőrizd a Georgia betűtípust' }, { en: 'Verify CEO Gala 2026 details', hu: 'Ellenőrizd a CEO Gala 2026 részleteket' }], expected: { en: 'Email has new professional design', hu: 'Email új professzionális dizájnnal' } },
    ]
  },
  {
    version: '2.8.1',
    date: '2026-01-11',
    features: [
      { nameEn: 'Release Testing Admin Page', nameHu: 'Release Tesztelés Admin Oldal', steps: [{ en: 'Navigate to /admin/release-testing', hu: 'Navigálj a /admin/release-testing oldalra' }, { en: 'Verify all versions listed', hu: 'Ellenőrizd a verziókat' }, { en: 'Click Passed/Failed buttons', hu: 'Kattints a gombokra' }], expected: { en: 'Test status persists', hu: 'Teszt státusz megmarad' } },
      { nameEn: 'Changelog Test Badge Links', nameHu: 'Változásnapló Teszt Badge Linkek', steps: [{ en: 'Navigate to /admin/changelog', hu: 'Navigálj a /admin/changelog oldalra' }, { en: 'Click test badge', hu: 'Kattints a teszt badge-re' }], expected: { en: 'Badge links correctly', hu: 'Badge helyesen linkel' } },
    ]
  },
  {
    version: '2.8.0',
    date: '2026-01-10',
    features: [
      { nameEn: 'Floor Plan PNG Export', nameHu: 'Ültetési Térkép PNG Export', steps: [{ en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' }, { en: 'Click Export > PNG', hu: 'Kattints Exportálás > PNG' }], expected: { en: 'PNG downloads with all elements', hu: 'PNG letöltődik minden elemmel' } },
      { nameEn: 'Floor Plan PDF Export', nameHu: 'Ültetési Térkép PDF Export', steps: [{ en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' }, { en: 'Click Export > PDF', hu: 'Kattints Exportálás > PDF' }], expected: { en: 'PDF downloads with header', hu: 'PDF letöltődik fejléccel' } },
    ]
  },
  {
    version: '2.7.0',
    date: '2026-01-09',
    features: [
      { nameEn: 'BBJ Events Color Scheme', nameHu: 'BBJ Events Színséma', steps: [{ en: 'Navigate to /admin', hu: 'Navigálj a /admin oldalra' }, { en: 'Verify navy color scheme', hu: 'Ellenőrizd a navy színsémát' }], expected: { en: 'Elegant navy palette', hu: 'Elegáns navy paletta' } },
    ]
  },
  {
    version: '2.6.0',
    date: '2026-01-09',
    features: [
      { nameEn: 'Form Validation Error Summary', nameHu: 'Űrlap Validációs Hibaösszesítő', steps: [{ en: 'Submit empty form', hu: 'Küldj üres űrlapot' }, { en: 'Verify error summary', hu: 'Ellenőrizd a hibaösszesítőt' }], expected: { en: 'Clear error summary', hu: 'Tiszta hibaösszesítő' } },
    ]
  },
  {
    version: '2.5.0',
    date: '2026-01-08',
    features: [
      { nameEn: 'Payment Status Column', nameHu: 'Fizetési Státusz Oszlop', steps: [{ en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' }, { en: 'Verify Payment column', hu: 'Ellenőrizd a Fizetés oszlopot' }], expected: { en: 'Payment status visible', hu: 'Fizetési státusz látható' } },
    ]
  },
  {
    version: '2.4.0',
    date: '2026-01-08',
    features: [
      { nameEn: 'VIP Reception Column', nameHu: 'VIP Fogadás Oszlop', steps: [{ en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' }, { en: 'Verify star icon column', hu: 'Ellenőrizd a csillag ikont' }], expected: { en: 'VIP status toggleable', hu: 'VIP státusz kapcsolható' } },
    ]
  },
  {
    version: '2.3.0',
    date: '2026-01-06',
    features: [
      { nameEn: 'Admin Audit Log', nameHu: 'Admin Audit Napló', steps: [{ en: 'Navigate to /admin/audit-log', hu: 'Navigálj a /admin/audit-log oldalra' }, { en: 'Verify actions listed', hu: 'Ellenőrizd a műveleteket' }], expected: { en: 'All actions logged', hu: 'Minden művelet naplózva' } },
    ]
  },
  {
    version: '2.2.0',
    date: '2026-01-03',
    features: [
      { nameEn: 'PWA Enhancements', nameHu: 'PWA Fejlesztések', steps: [{ en: 'Open PWA at /pwa', hu: 'Nyisd meg a PWA-t' }, { en: 'Enable airplane mode', hu: 'Kapcsold be a repülő módot' }], expected: { en: 'QR ticket works offline', hu: 'QR jegy működik offline' } },
    ]
  },
  {
    version: '2.1.0',
    date: '2025-12-20',
    features: [
      { nameEn: 'Email Rate Limiting', nameHu: 'Email Korlátozás', steps: [{ en: 'Send 5 emails to same guest', hu: 'Küldj 5 emailt' }, { en: 'Try 6th email', hu: 'Próbálj 6. emailt' }], expected: { en: 'Max 5 emails enforced', hu: 'Max 5 email betartva' } },
    ]
  },
  {
    version: '2.0.0',
    date: '2025-12-15',
    features: [
      { nameEn: 'Applicant Flow', nameHu: 'Jelentkező Flow', steps: [{ en: 'Navigate to /apply', hu: 'Navigálj a /apply oldalra' }, { en: 'Fill and submit form', hu: 'Töltsd ki az űrlapot' }], expected: { en: 'Complete workflow', hu: 'Teljes folyamat' } },
      { nameEn: 'PWA Guest App', nameHu: 'PWA Vendég App', steps: [{ en: 'Open /pwa on mobile', hu: 'Nyisd meg a /pwa-t mobilon' }, { en: 'Login with code', hu: 'Jelentkezz be kóddal' }], expected: { en: 'Full PWA functionality', hu: 'Teljes PWA funkcionalitás' } },
    ]
  },
];

const translations = {
  hu: {
    title: 'Release Tesztelés',
    subtitle: 'Manuális tesztelési lépések verziónként',
    backToChangelog: 'Változásnapló',
    steps: 'lépés',
    expectedResult: 'Elvárt eredmény',
    passed: 'Sikeres',
    failed: 'Sikertelen',
    notTested: 'Nem tesztelt',
    latest: 'Legújabb',
    allVersions: 'Összes verzió',
    jumpTo: 'Ugrás verzióra',
    features: 'funkció',
    filterBy: 'Szűrés',
    all: 'Mind',
    total: 'Összesen',
    noResults: 'Nincs találat',
    clearFilter: 'Szűrő törlése',
    exportAll: 'Összes exportálás',
    comment: 'Megjegyzés',
    addComment: 'Megjegyzés hozzáadása...',
    tester: 'Tesztelő',
    loading: 'Betöltés...',
  },
  en: {
    title: 'Release Testing',
    subtitle: 'Manual test steps by version',
    backToChangelog: 'Changelog',
    steps: 'steps',
    expectedResult: 'Expected Result',
    passed: 'Passed',
    failed: 'Failed',
    notTested: 'Not Tested',
    latest: 'Latest',
    allVersions: 'All Versions',
    jumpTo: 'Jump to version',
    features: 'features',
    filterBy: 'Filter by',
    all: 'All',
    total: 'Total',
    noResults: 'No results',
    clearFilter: 'Clear filter',
    exportAll: 'Export All',
    comment: 'Comment',
    addComment: 'Add comment...',
    tester: 'Tester',
    loading: 'Loading...',
  }
};

type TestStatus = 'passed' | 'failed' | 'not_tested';
type StatusFilter = 'all' | TestStatus;

interface FeatureTestState {
  status: TestStatus;
  comment: string;
  stepResults: Record<number, boolean>;
  testerName?: string;
}

export default function ReleaseTestingPage() {
  const { language } = useLanguage();
  const t = translations[language as 'hu' | 'en'] || translations.hu;

  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([releaseTests[0]?.version]));
  const [testResults, setTestResults] = useState<Record<string, FeatureTestState>>({});
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getFeatureKey = (version: string, featureIndex: number) => `${version}-${featureIndex}`;

  const loadResults = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/test-results');
      if (res.ok) {
        const data = await res.json();
        const resultsMap: Record<string, FeatureTestState> = {};
        data.results.forEach((result: TestResultData) => {
          const key = getFeatureKey(result.version, result.feature_index);
          resultsMap[key] = {
            status: result.status as TestStatus,
            comment: result.comment || '',
            stepResults: result.step_results ? JSON.parse(result.step_results) : {},
            testerName: result.tester_name
          };
        });
        setTestResults(resultsMap);
      }
    } catch (error) {
      console.error('Failed to load test results:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
    const hash = window.location.hash;
    if (hash) {
      const versionFromHash = hash.replace('#v', '').replace(/-/g, '.');
      const found = releaseTests.find(r => r.version === versionFromHash);
      if (found) {
        setExpandedVersions(new Set([found.version]));
        setSelectedVersion(found.version);
        setTimeout(() => {
          document.getElementById(`version-${found.version.replace(/\./g, '-')}`)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [loadResults]);

  const saveTestResult = async (version: string, featureIndex: number, featureName: string, state: Partial<FeatureTestState>) => {
    const key = getFeatureKey(version, featureIndex);
    setSavingKey(key);
    const currentState = testResults[key] || { status: 'not_tested', comment: '', stepResults: {} };
    const newState = { ...currentState, ...state };
    setTestResults(prev => ({ ...prev, [key]: newState }));

    try {
      await fetch('/api/admin/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, featureIndex, featureName, status: newState.status, comment: newState.comment, stepResults: newState.stepResults })
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSavingKey(null);
    }
  };

  const getTestState = (version: string, featureIndex: number): FeatureTestState => {
    const key = getFeatureKey(version, featureIndex);
    return testResults[key] || { status: 'not_tested', comment: '', stepResults: {} };
  };

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) newExpanded.delete(version);
    else newExpanded.add(version);
    setExpandedVersions(newExpanded);
  };

  const scrollToVersion = (version: string) => {
    if (!version) return;
    setExpandedVersions(prev => new Set([...Array.from(prev), version]));
    setSelectedVersion(version);
    window.location.hash = `v${version.replace(/\./g, '-')}`;
    setTimeout(() => {
      document.getElementById(`version-${version.replace(/\./g, '-')}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const countSteps = (release: ReleaseTest) => release.features.reduce((sum, f) => sum + f.steps.length, 0);

  const getStats = () => {
    let passed = 0, failed = 0, notTested = 0, total = 0;
    releaseTests.forEach((release) => {
      release.features.forEach((_, fIdx) => {
        total++;
        const state = getTestState(release.version, fIdx);
        if (state.status === 'passed') passed++;
        else if (state.status === 'failed') failed++;
        else notTested++;
      });
    });
    return { passed, failed, notTested, total };
  };

  const stats = getStats();

  const getFilteredFeatures = (release: ReleaseTest) => {
    if (statusFilter === 'all') return release.features;
    return release.features.filter((_, fIdx) => getTestState(release.version, fIdx).status === statusFilter);
  };

  const getFilteredReleases = () => {
    if (statusFilter === 'all') return releaseTests;
    return releaseTests.filter((release) => getFilteredFeatures(release).length > 0);
  };

  const filteredReleases = getFilteredReleases();

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle weight="fill" className="w-4 h-4 text-status-success" />;
      case 'failed': return <XCircle weight="fill" className="w-4 h-4 text-status-error" />;
      default: return <Question weight="fill" className="w-4 h-4 text-neutral-400" />;
    }
  };

  const handleExport = (version?: string) => {
    const url = version ? `/api/admin/test-results/export?version=${version}` : '/api/admin/test-results/export';
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-500">
          <Spinner className="w-5 h-5 animate-spin" />
          <span>{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin/changelog" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary">
            <ArrowLeft className="w-4 h-4" />{t.backToChangelog}
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TestTube weight="duotone" className="w-8 h-8 text-primary dark:text-white" />
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white font-serif">{t.title}</h1>
              <p className="text-sm text-neutral-500">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={() => handleExport()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-accent-500 text-white hover:bg-accent-600">
            <Export className="w-4 h-4" />{t.exportAll}
          </button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">{t.total}:</span>
              <span className="font-semibold text-neutral-900 dark:text-white">{stats.total}</span>
            </div>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700" />
            <div className="flex items-center gap-2">
              <CheckCircle weight="fill" className="w-4 h-4 text-status-success" />
              <span className="text-sm text-status-success font-medium">{stats.passed}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle weight="fill" className="w-4 h-4 text-status-error" />
              <span className="text-sm text-status-error font-medium">{stats.failed}</span>
            </div>
            <div className="flex items-center gap-2">
              <Question weight="fill" className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-500 font-medium">{stats.notTested}</span>
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
              {stats.passed > 0 && <div className="h-full bg-status-success" style={{ width: `${(stats.passed / stats.total) * 100}%` }} />}
              {stats.failed > 0 && <div className="h-full bg-status-error" style={{ width: `${(stats.failed / stats.total) * 100}%` }} />}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">{t.jumpTo}:</span>
          <select value={selectedVersion} onChange={(e) => scrollToVersion(e.target.value)} className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <option value="">-- {t.allVersions} --</option>
            {releaseTests.map((release) => <option key={release.version} value={release.version}>v{release.version} ({release.date})</option>)}
          </select>
        </div>
        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">{t.filterBy}:</span>
          <div className="flex gap-1">
            {(['all', 'passed', 'failed', 'not_tested'] as const).map((filter) => (
              <button key={filter} onClick={() => setStatusFilter(filter)} className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${statusFilter === filter ? (filter === 'passed' ? 'bg-status-success text-white' : filter === 'failed' ? 'bg-status-error text-white' : filter === 'not_tested' ? 'bg-neutral-500 text-white' : 'bg-accent-500 text-white') : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
                {filter === 'passed' && <CheckCircle weight="fill" className="w-3 h-3" />}
                {filter === 'failed' && <XCircle weight="fill" className="w-3 h-3" />}
                {filter === 'not_tested' && <Question weight="fill" className="w-3 h-3" />}
                {filter === 'all' ? `${t.all} (${stats.total})` : filter === 'passed' ? stats.passed : filter === 'failed' ? stats.failed : stats.notTested}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReleases.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <Question weight="duotone" className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
            <p className="text-neutral-600 mb-4">{t.noResults}</p>
            <button onClick={() => setStatusFilter('all')} className="px-4 py-2 text-sm font-medium bg-accent-500 text-white hover:bg-accent-600">{t.clearFilter}</button>
          </div>
        ) : filteredReleases.map((release) => {
          const isLatest = release.version === releaseTests[0]?.version;
          const filteredFeatures = getFilteredFeatures(release);

          return (
            <div key={release.version} id={`version-${release.version.replace(/\./g, '-')}`} className={`border bg-white dark:bg-neutral-800 ${isLatest ? 'border-accent-500' : 'border-neutral-200 dark:border-neutral-700'}`}>
              <button onClick={() => toggleVersion(release.version)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                <div className="flex items-center gap-3">
                  {expandedVersions.has(release.version) ? <CaretDown className="w-5 h-5 text-neutral-400" /> : <CaretRight className="w-5 h-5 text-neutral-400" />}
                  <span className="font-semibold text-lg text-neutral-900 dark:text-white font-serif">v{release.version}</span>
                  {isLatest && <span className="px-2 py-0.5 text-xs font-semibold bg-accent-500 text-white uppercase">{t.latest}</span>}
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <button onClick={(e) => { e.stopPropagation(); handleExport(release.version); }} className="flex items-center gap-1 hover:text-accent-500"><Export className="w-4 h-4" />CSV</button>
                  <span>{release.features.length} {t.features}</span>
                  <span>{countSteps(release)} {t.steps}</span>
                  <span>{release.date}</span>
                </div>
              </button>

              {expandedVersions.has(release.version) && (
                <div className="px-4 pb-4 space-y-3 border-t border-neutral-100 dark:border-neutral-700">
                  {filteredFeatures.map((feature) => {
                    const originalIdx = release.features.findIndex(f => f.nameEn === feature.nameEn);
                    const state = getTestState(release.version, originalIdx);
                    const featureKey = getFeatureKey(release.version, originalIdx);
                    const isSaving = savingKey === featureKey;

                    return (
                      <div key={originalIdx} className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(state.status)}
                            <h3 className="font-medium text-neutral-900 dark:text-white">{language === 'hu' ? feature.nameHu : feature.nameEn}</h3>
                            {isSaving && <Spinner className="w-4 h-4 animate-spin text-accent-500" />}
                          </div>
                          <div className="flex gap-1">
                            {(['passed', 'failed', 'not_tested'] as const).map((statusOption) => (
                              <button key={statusOption} onClick={() => saveTestResult(release.version, originalIdx, feature.nameEn, { status: statusOption })} disabled={isSaving} className={`px-2 py-1 text-xs font-semibold transition-all ${state.status === statusOption ? (statusOption === 'passed' ? 'bg-status-success text-white' : statusOption === 'failed' ? 'bg-status-error text-white' : 'bg-neutral-500 text-white') : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
                                {statusOption === 'passed' ? t.passed : statusOption === 'failed' ? t.failed : t.notTested}
                              </button>
                            ))}
                          </div>
                        </div>

                        <ol className="space-y-1.5 mb-3">
                          {feature.steps.map((step, sIdx) => {
                            const isChecked = state.stepResults[sIdx] === true;
                            return (
                              <li key={sIdx} className="flex items-start gap-2 text-sm">
                                <button onClick={() => { const newStepResults = { ...state.stepResults, [sIdx]: !isChecked }; saveTestResult(release.version, originalIdx, feature.nameEn, { stepResults: newStepResults }); }} disabled={isSaving} className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border transition-all ${isChecked ? 'bg-status-success border-status-success text-white' : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 hover:border-accent-500'}`}>
                                  {isChecked && <Check weight="bold" className="w-3 h-3" />}
                                </button>
                                <span className={`${isChecked ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                  <span className="font-semibold text-accent-600 dark:text-accent-400 mr-1">{sIdx + 1}.</span>
                                  {language === 'hu' ? step.hu : step.en}
                                </span>
                              </li>
                            );
                          })}
                        </ol>

                        <div className="pl-3 border-l-2 border-accent-500 bg-accent-50 dark:bg-accent-900/20 p-2 mb-3">
                          <div className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase mb-0.5">{t.expectedResult}</div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{language === 'hu' ? feature.expected.hu : feature.expected.en}</p>
                        </div>

                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <ChatText className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-semibold text-neutral-500 uppercase">{t.comment}</span>
                            {state.testerName && <span className="text-xs text-neutral-400 ml-auto">{t.tester}: {state.testerName}</span>}
                          </div>
                          <textarea value={state.comment} onChange={(e) => { setTestResults(prev => ({ ...prev, [featureKey]: { ...state, comment: e.target.value } })); }} onBlur={(e) => { if (e.target.value !== (testResults[featureKey]?.comment || '')) { saveTestResult(release.version, originalIdx, feature.nameEn, { comment: e.target.value }); } }} placeholder={t.addComment} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-accent-500 resize-none" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
