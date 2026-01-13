'use client';

import { useState, useEffect } from 'react';
import {
  TestTube,
  CheckCircle,
  XCircle,
  Question,
  CaretRight,
  CaretDown,
  ArrowLeft,
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

const releaseTests: ReleaseTest[] = [
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
      {
        nameEn: 'PWA Cancel Page - Basic Flow',
        nameHu: 'PWA Lemondás Oldal - Alap Flow',
        steps: [
          { en: 'Login to PWA with a registered guest code', hu: 'Jelentkezz be a PWA-ba egy regisztrált vendég kóddal' },
          { en: 'Navigate to /pwa/cancel (or click Cancel button on dashboard)', hu: 'Navigálj a /pwa/cancel oldalra (vagy kattints a Lemondás gombra a dashboardon)' },
          { en: 'Verify cancel page shows guest name and event info', hu: 'Ellenőrizd, hogy a lemondás oldal mutatja a vendég nevét és esemény infót' },
          { en: 'Select a cancellation reason (Schedule conflict)', hu: 'Válassz lemondási okot (Időpont ütközés)' },
          { en: 'Optionally add a comment', hu: 'Opcionálisan adj hozzá megjegyzést' },
          { en: 'Click "Confirm Cancellation" button', hu: 'Kattints a "Lemondás megerősítése" gombra' },
          { en: 'Verify success message and redirect to dashboard', hu: 'Ellenőrizd a sikeres üzenetet és az átirányítást a dashboardra' },
        ],
        expected: { en: 'Registration status changes to "Cancelled", guest cannot access ticket anymore', hu: 'Regisztrációs státusz "Lemondott"-ra változik, vendég nem éri el a jegyet' }
      },
      {
        nameEn: 'PWA Cancel Page - Deadline Check',
        nameHu: 'PWA Lemondás Oldal - Határidő Ellenőrzés',
        steps: [
          { en: 'Try to access /pwa/cancel within 7 days of event', hu: 'Próbáld elérni a /pwa/cancel oldalt 7 napon belül az esemény előtt' },
          { en: 'Verify warning message about deadline', hu: 'Ellenőrizd a határidő figyelmeztetést' },
          { en: 'Verify cancel button is disabled or page shows error', hu: 'Ellenőrizd, hogy a lemondás gomb le van tiltva vagy hibaüzenet jelenik meg' },
        ],
        expected: { en: 'Cancellation blocked when deadline passed (7 days before event)', hu: 'Lemondás blokkolva ha a határidő lejárt (esemény előtt 7 nap)' }
      },
      {
        nameEn: 'Cancelled Status in Guest List',
        nameHu: 'Lemondott Státusz a Vendéglistában',
        steps: [
          { en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' },
          { en: 'Find a guest who cancelled their registration', hu: 'Keress egy vendéget aki lemondta a regisztrációját' },
          { en: 'Verify orange "Cancelled" badge is displayed', hu: 'Ellenőrizd, hogy narancssárga "Lemondott" badge jelenik meg' },
          { en: 'Use Status filter dropdown and select "Cancelled"', hu: 'Használd a Státusz szűrőt és válaszd a "Lemondott" opciót' },
          { en: 'Verify only cancelled guests are shown', hu: 'Ellenőrizd, hogy csak lemondott vendégek jelennek meg' },
        ],
        expected: { en: 'Cancelled guests have orange badge and are filterable', hu: 'Lemondott vendégek narancssárga badge-dzsel és szűrhetők' }
      },
      {
        nameEn: 'No-Show Statistics Dashboard',
        nameHu: 'No-Show Statisztikák Dashboard',
        steps: [
          { en: 'Navigate to /admin/statistics', hu: 'Navigálj a /admin/statistics oldalra' },
          { en: 'Find the "Attendance" or "Részvétel" section', hu: 'Keresd a "Részvétel" vagy "Attendance" szekciót' },
          { en: 'Verify "Cancelled" count is displayed', hu: 'Ellenőrizd, hogy a "Lemondott" szám megjelenik' },
          { en: 'Verify "Potential No-Shows" count is displayed', hu: 'Ellenőrizd, hogy a "Potenciális No-Show" szám megjelenik' },
          { en: 'Check cancellation reasons breakdown (if available)', hu: 'Ellenőrizd a lemondási okok megoszlását (ha elérhető)' },
        ],
        expected: { en: 'Attendance statistics show accurate cancelled and no-show counts', hu: 'Részvételi statisztikák pontos lemondott és no-show számokat mutatnak' }
      },
      {
        nameEn: 'Attendance Commitment Consent Text',
        nameHu: 'Részvételi Kötelezettségvállalás Szöveg',
        steps: [
          { en: 'Create a new VIP guest and send magic link', hu: 'Hozz létre új VIP vendéget és küldj magic linket' },
          { en: 'Open the registration link', hu: 'Nyisd meg a regisztrációs linket' },
          { en: 'Look at the "Attendance Commitment" checkbox', hu: 'Nézd meg a "Részvételi kötelezettség" checkbox-ot' },
          { en: 'Verify text mentions no-show fee for VIP guests', hu: 'Ellenőrizd, hogy a szöveg említi a no-show díjat VIP vendégeknek' },
          { en: 'Verify 7-day cancellation deadline is mentioned', hu: 'Ellenőrizd, hogy a 7 napos lemondási határidő meg van említve' },
        ],
        expected: { en: 'Consent text clearly states no-show fee policy for VIP/applicant guests', hu: 'Consent szöveg egyértelműen közli a no-show díj szabályzatot VIP/jelentkező vendégeknek' }
      },
      {
        nameEn: 'Cancel API Endpoint',
        nameHu: 'Lemondás API Végpont',
        steps: [
          { en: 'Check /api/registration/cancel-status?guestId=X returns eligibility', hu: 'Ellenőrizd, hogy /api/registration/cancel-status?guestId=X visszaadja a jogosultságot' },
          { en: 'POST to /api/registration/cancel with valid data', hu: 'POST kérés a /api/registration/cancel-ra érvényes adatokkal' },
          { en: 'Verify response contains success: true', hu: 'Ellenőrizd, hogy a válasz tartalmazza: success: true' },
          { en: 'Verify cancelled_at timestamp is set in database', hu: 'Ellenőrizd, hogy a cancelled_at timestamp be van állítva az adatbázisban' },
        ],
        expected: { en: 'API correctly processes cancellation and updates database', hu: 'API helyesen dolgozza fel a lemondást és frissíti az adatbázist' }
      },
      {
        nameEn: 'Check-in Blocks Cancelled Guests',
        nameHu: 'Beléptetés Blokkolja Lemondottakat',
        steps: [
          { en: 'Cancel a guest registration via PWA or admin', hu: 'Mondass le egy vendég regisztrációt PWA-n vagy admin felületen' },
          { en: 'Navigate to /checkin (QR scanner)', hu: 'Navigálj a /checkin oldalra (QR olvasó)' },
          { en: 'Try to scan the cancelled guest\'s QR code', hu: 'Próbáld beolvasni a lemondott vendég QR kódját' },
          { en: 'Verify error message is shown (red card)', hu: 'Ellenőrizd, hogy hibaüzenet jelenik meg (piros kártya)' },
        ],
        expected: { en: 'Cancelled guests cannot be checked in, scanner shows error', hu: 'Lemondott vendégek nem léptethetők be, olvasó hibát jelez' }
      },
      {
        nameEn: 'Sample GDPR Consent Text',
        nameHu: 'Minta GDPR Hozzájárulás Szöveg',
        steps: [
          { en: 'Open a registration page (VIP or Paid)', hu: 'Nyiss meg egy regisztrációs oldalt (VIP vagy Fizetős)' },
          { en: 'Locate the GDPR consent checkbox', hu: 'Keresd meg a GDPR hozzájárulás checkbox-ot' },
          { en: 'Verify detailed text mentions: data types collected', hu: 'Ellenőrizd, hogy a részletes szöveg tartalmazza: gyűjtött adattípusok' },
          { en: 'Verify text mentions: 12 month retention period', hu: 'Ellenőrizd, hogy a szöveg tartalmazza: 12 hónapos megőrzési idő' },
          { en: 'Verify text mentions: data subject rights', hu: 'Ellenőrizd, hogy a szöveg tartalmazza: érintetti jogok' },
        ],
        expected: { en: 'GDPR consent has detailed inline policy text', hu: 'GDPR hozzájárulás részletes inline szabályzat szöveggel rendelkezik' }
      },
      {
        nameEn: 'PWA Table Section Hidden',
        nameHu: 'PWA Asztal Szekció Elrejtve',
        steps: [
          { en: 'Login to PWA with a guest code', hu: 'Jelentkezz be a PWA-ba vendég kóddal' },
          { en: 'Navigate to /pwa/dashboard', hu: 'Navigálj a /pwa/dashboard oldalra' },
          { en: 'Verify "Table Number" card is NOT visible', hu: 'Ellenőrizd, hogy az "Asztal Szám" kártya NEM látható' },
          { en: 'Check that other cards (Ticket, Profile, etc.) are visible', hu: 'Ellenőrizd, hogy a többi kártya (Jegy, Profil, stb.) látható' },
        ],
        expected: { en: 'Table section hidden via feature flag, other sections work normally', hu: 'Asztal szekció el van rejtve feature flag-gel, többi szekció normálisan működik' }
      },
      {
        nameEn: 'Magic Link Invitation Email Redesign',
        nameHu: 'Magic Link Meghívó Email Újratervezés',
        steps: [
          { en: 'Create a new guest in admin', hu: 'Hozz létre új vendéget az adminban' },
          { en: 'Send magic link invitation email', hu: 'Küldj magic link meghívó emailt' },
          { en: 'Check email in inbox (or email logs)', hu: 'Ellenőrizd az emailt a postaládában (vagy email naplóban)' },
          { en: 'Verify Georgia serif font is used', hu: 'Ellenőrizd, hogy Georgia serif betűtípus van használva' },
          { en: 'Verify CEO Gala 2026 event details are present', hu: 'Ellenőrizd, hogy CEO Gala 2026 esemény részletek jelen vannak' },
          { en: 'Verify dual signatures (Botka, Roman) appear', hu: 'Ellenőrizd, hogy kettős aláírás (Botka, Roman) megjelenik' },
          { en: 'Verify navy "REGISTER NOW" button', hu: 'Ellenőrizd a navy "REGISTER NOW" gombot' },
        ],
        expected: { en: 'Email has new professional CEO Gala 2026 design with event details and signatures', hu: 'Email új professzionális CEO Gala 2026 dizájnnal rendelkezik esemény részletekkel és aláírásokkal' }
      },
      {
        nameEn: 'Email Scheduler Automation',
        nameHu: 'Email Ütemező Automatizálás',
        steps: [
          { en: 'Navigate to /admin/email', hu: 'Navigálj a /admin/email oldalra' },
          { en: 'Click "Schedule Bulk Email" or "Bulk Email Scheduling"', hu: 'Kattints a "Tömeges Email Ütemezés" gombra' },
          { en: 'Look for E-10/E-7 reminder scheduler options', hu: 'Keresd az E-10/E-7 emlékeztető ütemező opciókat' },
          { en: 'Verify scheduler allows setting date offset (e.g., 10 days before event)', hu: 'Ellenőrizd, hogy az ütemező lehetővé teszi a dátum eltolás beállítását (pl. 10 nappal az esemény előtt)' },
          { en: 'Check that scheduled reminder emails include cancel URL', hu: 'Ellenőrizd, hogy az ütemezett emlékeztető emailek tartalmazzák a lemondási linket' },
        ],
        expected: { en: 'E-10, E-7 reminders and no-show payment requests can be scheduled with automatic date calculation', hu: 'E-10, E-7 emlékeztetők és no-show fizetési felszólítások ütemezhetők automatikus dátum számítással' }
      },
    ]
  },
  {
    version: '2.8.1',
    date: '2026-01-11',
    features: [
      {
        nameEn: 'Release Testing Admin Page',
        nameHu: 'Release Tesztelés Admin Oldal',
        steps: [
          { en: 'Navigate to /admin/release-testing', hu: 'Navigálj a /admin/release-testing oldalra' },
          { en: 'Verify all versions are listed (v2.0.0 - v2.8.1)', hu: 'Ellenőrizd, hogy minden verzió listázva van (v2.0.0 - v2.8.1)' },
          { en: 'Expand a version and verify test steps are visible', hu: 'Bontsd ki egy verziót és ellenőrizd, hogy a teszt lépések láthatók' },
          { en: 'Click Passed/Failed/Not Tested buttons and verify state saves', hu: 'Kattints a Sikeres/Sikertelen/Nem tesztelt gombokra és ellenőrizd, hogy a státusz mentődik' },
          { en: 'Refresh page and verify test status persists', hu: 'Frissítsd az oldalt és ellenőrizd, hogy a teszt státusz megmarad' },
        ],
        expected: { en: 'Test status persists in localStorage across page reloads', hu: 'Teszt státusz megmarad localStorage-ban oldal újratöltések között' }
      },
      {
        nameEn: 'Changelog Test Badge Links',
        nameHu: 'Változásnapló Teszt Badge Linkek',
        steps: [
          { en: 'Navigate to /admin/changelog', hu: 'Navigálj a /admin/changelog oldalra' },
          { en: 'Find "Tesztelés" badge next to version number', hu: 'Keresd meg a "Tesztelés" badge-et a verzió szám mellett' },
          { en: 'Click the badge', hu: 'Kattints a badge-re' },
          { en: 'Verify redirect to /admin/release-testing with correct version hash', hu: 'Ellenőrizd az átirányítást a /admin/release-testing oldalra a megfelelő verzió hash-sel' },
        ],
        expected: { en: 'Badge links correctly to specific version test steps', hu: 'Badge helyesen linkel a konkrét verzió teszt lépéseihez' }
      },
    ]
  },
  {
    version: '2.8.0',
    date: '2026-01-10',
    features: [
      {
        nameEn: 'Floor Plan PNG Export',
        nameHu: 'Ültetési Térkép PNG Export',
        steps: [
          { en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' },
          { en: 'Click "Export" button in toolbar', hu: 'Kattints az "Exportálás" gombra az eszköztáron' },
          { en: 'Select "PNG" from dropdown', hu: 'Válaszd a "PNG" opciót a legördülőből' },
          { en: 'Verify PNG downloads with header, legend, tables', hu: 'Ellenőrizd, hogy a PNG letöltődik fejléccel, jelmagyarázattal, asztalokkal' },
        ],
        expected: { en: 'High-quality PNG image with all floor plan elements', hu: 'Magas minőségű PNG kép az összes térképelemmel' }
      },
      {
        nameEn: 'Floor Plan PDF Export',
        nameHu: 'Ültetési Térkép PDF Export',
        steps: [
          { en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' },
          { en: 'Click "Export" button in toolbar', hu: 'Kattints az "Exportálás" gombra az eszköztáron' },
          { en: 'Select "PDF" from dropdown', hu: 'Válaszd a "PDF" opciót a legördülőből' },
          { en: 'Verify PDF opens/downloads with event info header', hu: 'Ellenőrizd, hogy a PDF megnyílik/letöltődik esemény fejléccel' },
        ],
        expected: { en: 'Print-ready PDF with header, legend, and event date', hu: 'Nyomtatásra kész PDF fejléccel, jelmagyarázattal és dátummal' }
      },
      {
        nameEn: 'Smart Tooltip Positioning',
        nameHu: 'Okos Tooltip Pozicionálás',
        steps: [
          { en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' },
          { en: 'Hover over a table on the left edge', hu: 'Vidd az egeret egy bal széli asztal fölé' },
          { en: 'Verify tooltip appears on the right side', hu: 'Ellenőrizd, hogy a tooltip jobb oldalon jelenik meg' },
          { en: 'Hover over a table on the right edge', hu: 'Vidd az egeret egy jobb széli asztal fölé' },
          { en: 'Verify tooltip appears on the left side', hu: 'Ellenőrizd, hogy a tooltip bal oldalon jelenik meg' },
        ],
        expected: { en: 'Tooltips always stay within viewport', hu: 'Tooltipek mindig a képernyőn belül maradnak' }
      },
    ]
  },
  {
    version: '2.7.0',
    date: '2026-01-09',
    features: [
      {
        nameEn: 'BBJ Events Color Scheme',
        nameHu: 'BBJ Events Színséma',
        steps: [
          { en: 'Navigate to /admin', hu: 'Navigálj a /admin oldalra' },
          { en: 'Verify navy-based color scheme (#000D38)', hu: 'Ellenőrizd a navy alapú színsémát (#000D38)' },
          { en: 'Toggle dark/light mode', hu: 'Váltsd a sötét/világos módot' },
          { en: 'Verify both themes use consistent branding', hu: 'Ellenőrizd, hogy mindkét téma egységes arculatot használ' },
        ],
        expected: { en: 'Elegant navy color palette in both modes', hu: 'Elegáns navy színpaletta mindkét módban' }
      },
      {
        nameEn: 'Monochrome Icons',
        nameHu: 'Monokróm Ikonok',
        steps: [
          { en: 'Browse through admin pages', hu: 'Böngészd végig az admin oldalakat' },
          { en: 'Verify no colored icons (only navy/white)', hu: 'Ellenőrizd, hogy nincsenek színes ikonok (csak navy/fehér)' },
          { en: 'Check PWA pages for consistent icon style', hu: 'Ellenőrizd a PWA oldalakat az egységes ikon stílusért' },
        ],
        expected: { en: 'All icons are monochrome navy/white', hu: 'Minden ikon monokróm navy/fehér' }
      },
    ]
  },
  {
    version: '2.6.0',
    date: '2026-01-09',
    features: [
      {
        nameEn: 'Form Validation Error Summary',
        nameHu: 'Űrlap Validációs Hibaösszesítő',
        steps: [
          { en: 'Navigate to /admin/guests and click "Add Guest"', hu: 'Navigálj a /admin/guests oldalra és kattints "Vendég hozzáadása"' },
          { en: 'Submit form without filling required fields', hu: 'Küld el az űrlapot a kötelező mezők kitöltése nélkül' },
          { en: 'Verify red error summary box appears at top', hu: 'Ellenőrizd, hogy piros hibaösszesítő doboz jelenik meg felül' },
          { en: 'Click on error item in summary', hu: 'Kattints a hibaelemre az összesítőben' },
          { en: 'Verify page scrolls/focuses to the field', hu: 'Ellenőrizd, hogy az oldal görgeti/fókuszálja a mezőt' },
        ],
        expected: { en: 'Clear error summary with clickable items', hu: 'Tiszta hibaösszesítő kattintható elemekkel' }
      },
    ]
  },
  {
    version: '2.5.0',
    date: '2026-01-08',
    features: [
      {
        nameEn: 'Payment Status Column',
        nameHu: 'Fizetési Státusz Oszlop',
        steps: [
          { en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' },
          { en: 'Verify "Payment" column is visible', hu: 'Ellenőrizd, hogy a "Fizetés" oszlop látható' },
          { en: 'Check color-coded badges (green=paid, orange=pending)', hu: 'Ellenőrizd a színkódolt jelzéseket (zöld=fizetve, narancs=függőben)' },
          { en: 'Use Payment Status filter dropdown', hu: 'Használd a Fizetési Státusz szűrő legördülőt' },
          { en: 'Verify filtering works correctly', hu: 'Ellenőrizd, hogy a szűrés helyesen működik' },
        ],
        expected: { en: 'Payment status visible and filterable', hu: 'Fizetési státusz látható és szűrhető' }
      },
      {
        nameEn: 'VIP Filter for Bulk Emails',
        nameHu: 'VIP Szűrő Tömeges Emailekhez',
        steps: [
          { en: 'Navigate to /admin/email', hu: 'Navigálj a /admin/email oldalra' },
          { en: 'Click "Bulk Email" or "Schedule Email"', hu: 'Kattints "Tömeges Email" vagy "Email Ütemezés"' },
          { en: 'Look for "VIP Reception" filter option', hu: 'Keresd a "VIP Fogadás" szűrő opciót' },
          { en: 'Select "VIP Only" and verify recipient count changes', hu: 'Válaszd a "Csak VIP" opciót és ellenőrizd a címzettek számát' },
        ],
        expected: { en: 'VIP filter affects recipient selection', hu: 'VIP szűrő befolyásolja a címzett kiválasztást' }
      },
    ]
  },
  {
    version: '2.4.0',
    date: '2026-01-08',
    features: [
      {
        nameEn: 'VIP Reception Column',
        nameHu: 'VIP Fogadás Oszlop',
        steps: [
          { en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' },
          { en: 'Verify star icon column for VIP status', hu: 'Ellenőrizd a csillag ikon oszlopot a VIP státuszhoz' },
          { en: 'Edit a guest and toggle VIP checkbox', hu: 'Szerkessz egy vendéget és váltsd a VIP jelölőnégyzetet' },
          { en: 'Save and verify star icon updates', hu: 'Mentsd és ellenőrizd, hogy a csillag ikon frissül' },
        ],
        expected: { en: 'VIP status toggleable with visual indicator', hu: 'VIP státusz kapcsolható vizuális jelzéssel' }
      },
      {
        nameEn: 'Partner Registration for All',
        nameHu: 'Partner Regisztráció Mindenkinek',
        steps: [
          { en: 'Create a magic link for paying_single guest', hu: 'Hozz létre magic linket paying_single vendégnek' },
          { en: 'Complete registration flow', hu: 'Töltsd ki a regisztrációs folyamatot' },
          { en: 'Verify partner fields are available', hu: 'Ellenőrizd, hogy a partner mezők elérhetők' },
          { en: 'Fill partner name and email', hu: 'Töltsd ki a partner nevét és emailjét' },
        ],
        expected: { en: 'All paying guests can add partner info', hu: 'Minden fizető vendég hozzáadhat partner adatokat' }
      },
    ]
  },
  {
    version: '2.3.0',
    date: '2026-01-06',
    features: [
      {
        nameEn: 'Admin Audit Log',
        nameHu: 'Admin Audit Napló',
        steps: [
          { en: 'Navigate to /admin/audit-log', hu: 'Navigálj a /admin/audit-log oldalra' },
          { en: 'Verify recent admin actions are listed', hu: 'Ellenőrizd, hogy a legutóbbi admin műveletek listázva vannak' },
          { en: 'Use filters (action type, entity, date)', hu: 'Használd a szűrőket (művelet típus, entitás, dátum)' },
          { en: 'Perform an action (edit guest) and verify it appears', hu: 'Végezz egy műveletet (vendég szerkesztés) és ellenőrizd, hogy megjelenik' },
        ],
        expected: { en: 'All admin actions logged and filterable', hu: 'Minden admin művelet naplózva és szűrhető' }
      },
      {
        nameEn: 'Company & Position Fields',
        nameHu: 'Cég & Beosztás Mezők',
        steps: [
          { en: 'Navigate to /admin/guests', hu: 'Navigálj a /admin/guests oldalra' },
          { en: 'Click "Add Guest" or edit existing', hu: 'Kattints "Vendég hozzáadása" vagy szerkessz meglévőt' },
          { en: 'Verify Company and Position fields exist', hu: 'Ellenőrizd, hogy a Cég és Beosztás mezők léteznek' },
          { en: 'Try to save without these fields', hu: 'Próbáld menteni e mezők nélkül' },
          { en: 'Verify validation requires them', hu: 'Ellenőrizd, hogy a validáció megköveteli őket' },
        ],
        expected: { en: 'Company and Position are required fields', hu: 'Cég és Beosztás kötelező mezők' }
      },
    ]
  },
  {
    version: '2.2.0',
    date: '2026-01-03',
    features: [
      {
        nameEn: 'PWA Enhancements',
        nameHu: 'PWA Fejlesztések',
        steps: [
          { en: 'Open PWA at /pwa on mobile', hu: 'Nyisd meg a PWA-t /pwa címen mobilon' },
          { en: 'Login with guest code', hu: 'Jelentkezz be vendég kóddal' },
          { en: 'Enable airplane mode', hu: 'Kapcsold be a repülő módot' },
          { en: 'Verify QR ticket still displays', hu: 'Ellenőrizd, hogy a QR jegy továbbra is megjelenik' },
        ],
        expected: { en: 'QR ticket works offline', hu: 'QR jegy működik offline' }
      },
      {
        nameEn: 'Help System',
        nameHu: 'Súgó Rendszer',
        steps: [
          { en: 'Navigate to /admin/help', hu: 'Navigálj a /admin/help oldalra' },
          { en: 'Use search to find specific topic', hu: 'Használd a keresést adott téma megtalálásához' },
          { en: 'Verify FAQ entries expand/collapse', hu: 'Ellenőrizd, hogy a GYIK bejegyzések kinyílnak/bezárulnak' },
          { en: 'Toggle HU/EN language', hu: 'Váltsd a HU/EN nyelvet' },
        ],
        expected: { en: 'Searchable FAQ in both languages', hu: 'Kereshető GYIK mindkét nyelven' }
      },
    ]
  },
  {
    version: '2.1.0',
    date: '2025-12-20',
    features: [
      {
        nameEn: 'Email Rate Limiting',
        nameHu: 'Email Korlátozás',
        steps: [
          { en: 'Send 5 magic link emails to same guest', hu: 'Küldj 5 magic link emailt ugyanannak a vendégnek' },
          { en: 'Try to send 6th email', hu: 'Próbálj 6. emailt küldeni' },
          { en: 'Verify rate limit error appears', hu: 'Ellenőrizd, hogy korlátozási hiba jelenik meg' },
          { en: 'Wait 1 hour and try again', hu: 'Várj 1 órát és próbáld újra' },
        ],
        expected: { en: 'Max 5 emails per type per hour enforced', hu: 'Max 5 email típusonként óránként betartva' }
      },
      {
        nameEn: 'Drag-and-Drop Seating',
        nameHu: 'Drag-and-Drop Ültetés',
        steps: [
          { en: 'Navigate to /admin/seating', hu: 'Navigálj a /admin/seating oldalra' },
          { en: 'Drag a table to new position', hu: 'Húzz egy asztalt új pozícióba' },
          { en: 'Verify position saves automatically', hu: 'Ellenőrizd, hogy a pozíció automatikusan mentődik' },
          { en: 'Assign guest by dragging to table', hu: 'Rendelj vendéget asztalhoz húzással' },
        ],
        expected: { en: 'Interactive drag-and-drop seating map', hu: 'Interaktív drag-and-drop ültetési térkép' }
      },
    ]
  },
  {
    version: '2.0.0',
    date: '2025-12-15',
    features: [
      {
        nameEn: 'Applicant Flow',
        nameHu: 'Jelentkező Flow',
        steps: [
          { en: 'Navigate to /apply (public page)', hu: 'Navigálj a /apply oldalra (publikus)' },
          { en: 'Fill application form', hu: 'Töltsd ki a jelentkezési űrlapot' },
          { en: 'Submit and verify confirmation', hu: 'Küld el és ellenőrizd a visszaigazolást' },
          { en: 'Login as admin and go to /admin/applicants', hu: 'Jelentkezz be adminként és menj a /admin/applicants oldalra' },
          { en: 'Approve or reject the application', hu: 'Hagyd jóvá vagy utasítsd el a jelentkezést' },
        ],
        expected: { en: 'Complete applicant approval workflow', hu: 'Teljes jelentkező jóváhagyási folyamat' }
      },
      {
        nameEn: 'PWA Guest App',
        nameHu: 'PWA Vendég App',
        steps: [
          { en: 'Open /pwa on mobile device', hu: 'Nyisd meg a /pwa-t mobil eszközön' },
          { en: 'Login with CEOG-XXXXXX code', hu: 'Jelentkezz be CEOG-XXXXXX kóddal' },
          { en: 'View dashboard, ticket, table info', hu: 'Nézd meg a dashboardot, jegyet, asztal infót' },
          { en: 'Install as PWA (Add to Home Screen)', hu: 'Telepítsd PWA-ként (Kezdőképernyőre)' },
        ],
        expected: { en: 'Full PWA functionality with offline support', hu: 'Teljes PWA funkcionalitás offline támogatással' }
      },
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
    showAll: 'Összes mutatása',
    total: 'Összesen',
    noResults: 'Nincs találat a szűrésnek megfelelően',
    clearFilter: 'Szűrő törlése',
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
    showAll: 'Show all',
    total: 'Total',
    noResults: 'No results match the filter',
    clearFilter: 'Clear filter',
  }
};

type TestStatus = 'passed' | 'failed' | 'not-tested';
type StatusFilter = 'all' | TestStatus;

export default function ReleaseTestingPage() {
  const { language } = useLanguage();
  const t = translations[language as 'hu' | 'en'] || translations.hu;

  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([releaseTests[0]?.version]));
  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({});
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Load test status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('release-test-status');
    if (saved) {
      try {
        setTestStatus(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }

    // Handle URL hash for direct version linking
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
  }, []);

  const updateTestStatus = (version: string, featureIdx: number, status: TestStatus) => {
    const key = `${version}-${featureIdx}`;
    const newStatus = { ...testStatus, [key]: status };
    setTestStatus(newStatus);
    localStorage.setItem('release-test-status', JSON.stringify(newStatus));
  };

  const getTestStatus = (version: string, featureIdx: number): TestStatus => {
    return testStatus[`${version}-${featureIdx}`] || 'not-tested';
  };

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const scrollToVersion = (version: string) => {
    if (!version) return;
    setExpandedVersions(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.add(version);
      return newSet;
    });
    setSelectedVersion(version);
    window.location.hash = `v${version.replace(/\./g, '-')}`;
    setTimeout(() => {
      document.getElementById(`version-${version.replace(/\./g, '-')}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const countSteps = (release: ReleaseTest) => {
    return release.features.reduce((sum, f) => sum + f.steps.length, 0);
  };

  // Calculate statistics for all tests
  const getStats = () => {
    let passed = 0;
    let failed = 0;
    let notTested = 0;
    let total = 0;

    releaseTests.forEach((release) => {
      release.features.forEach((_, fIdx) => {
        total++;
        const status = getTestStatus(release.version, fIdx);
        if (status === 'passed') passed++;
        else if (status === 'failed') failed++;
        else notTested++;
      });
    });

    return { passed, failed, notTested, total };
  };

  const stats = getStats();

  // Filter features based on status filter
  const getFilteredFeatures = (release: ReleaseTest) => {
    if (statusFilter === 'all') return release.features;
    return release.features.filter((_, fIdx) => {
      const status = getTestStatus(release.version, fIdx);
      return status === statusFilter;
    });
  };

  // Get filtered releases (only show versions that have matching features)
  const getFilteredReleases = () => {
    if (statusFilter === 'all') return releaseTests;
    return releaseTests.filter((release) => {
      const filtered = getFilteredFeatures(release);
      return filtered.length > 0;
    });
  };

  const filteredReleases = getFilteredReleases();

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle weight="fill" className="w-4 h-4 text-status-success" />;
      case 'failed':
        return <XCircle weight="fill" className="w-4 h-4 text-status-error" />;
      default:
        return <Question weight="fill" className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/admin/changelog"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToChangelog}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <TestTube weight="duotone" className="w-8 h-8 text-primary dark:text-white" />
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white font-serif">
              {t.title}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="mb-4 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{t.total}:</span>
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

          {/* Progress Bar */}
          <div className="flex-1 max-w-xs">
            <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex">
              {stats.passed > 0 && (
                <div
                  className="h-full bg-status-success"
                  style={{ width: `${(stats.passed / stats.total) * 100}%` }}
                />
              )}
              {stats.failed > 0 && (
                <div
                  className="h-full bg-status-error"
                  style={{ width: `${(stats.failed / stats.total) * 100}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Version Jump + Status Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Version Jump Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{t.jumpTo}:</span>
          <select
            value={selectedVersion}
            onChange={(e) => scrollToVersion(e.target.value)}
            className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          >
            <option value="">-- {t.allVersions} --</option>
            {releaseTests.map((release) => (
              <option key={release.version} value={release.version}>
                v{release.version} ({release.date})
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{t.filterBy}:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-accent-500 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-accent-500/20'
              }`}
            >
              {t.all} ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('passed')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'passed'
                  ? 'bg-status-success text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-status-success/20'
              }`}
            >
              <CheckCircle weight="fill" className="w-3 h-3" />
              {stats.passed}
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'failed'
                  ? 'bg-status-error text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-status-error/20'
              }`}
            >
              <XCircle weight="fill" className="w-3 h-3" />
              {stats.failed}
            </button>
            <button
              onClick={() => setStatusFilter('not-tested')}
              className={`px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'not-tested'
                  ? 'bg-neutral-500 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-400/20'
              }`}
            >
              <Question weight="fill" className="w-3 h-3" />
              {stats.notTested}
            </button>
          </div>
        </div>
      </div>

      {/* Version Cards */}
      <div className="space-y-4">
        {filteredReleases.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <Question weight="duotone" className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{t.noResults}</p>
            <button
              onClick={() => setStatusFilter('all')}
              className="px-4 py-2 text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
            >
              {t.clearFilter}
            </button>
          </div>
        ) : (
          filteredReleases.map((release) => {
            const isLatest = release.version === releaseTests[0]?.version;
            const filteredFeatures = getFilteredFeatures(release);

            return (
              <div
                key={release.version}
                id={`version-${release.version.replace(/\./g, '-')}`}
                className={`border bg-white dark:bg-neutral-800 ${
                  isLatest ? 'border-accent-500' : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {/* Version Header */}
                <button
                  onClick={() => toggleVersion(release.version)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedVersions.has(release.version) ? (
                      <CaretDown className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <CaretRight className="w-5 h-5 text-neutral-400" />
                    )}
                    <span className="font-semibold text-lg text-neutral-900 dark:text-white font-serif">
                      v{release.version}
                    </span>
                    {isLatest && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-accent-500 text-white uppercase">
                        {t.latest}
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                        {filteredFeatures.length}/{release.features.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{statusFilter === 'all' ? release.features.length : filteredFeatures.length} {t.features}</span>
                    <span>{countSteps(release)} {t.steps}</span>
                    <span>{release.date}</span>
                  </div>
                </button>

                {/* Version Content */}
                {expandedVersions.has(release.version) && (
                  <div className="px-4 pb-4 space-y-3 border-t border-neutral-100 dark:border-neutral-700">
                    {filteredFeatures.map((feature) => {
                      // Find the original index for status tracking
                      const originalIdx = release.features.findIndex(f => f.nameEn === feature.nameEn);
                      const status = getTestStatus(release.version, originalIdx);
                      return (
                        <div
                          key={originalIdx}
                          className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700"
                        >
                          {/* Feature Header */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <h3 className="font-medium text-neutral-900 dark:text-white">
                                {language === 'hu' ? feature.nameHu : feature.nameEn}
                              </h3>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateTestStatus(release.version, originalIdx, 'passed')}
                                className={`px-2 py-1 text-xs font-semibold transition-all ${
                                  status === 'passed'
                                    ? 'bg-status-success text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-status-success/20'
                                }`}
                              >
                                {t.passed}
                              </button>
                              <button
                                onClick={() => updateTestStatus(release.version, originalIdx, 'failed')}
                                className={`px-2 py-1 text-xs font-semibold transition-all ${
                                  status === 'failed'
                                    ? 'bg-status-error text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-status-error/20'
                                }`}
                              >
                                {t.failed}
                              </button>
                              <button
                                onClick={() => updateTestStatus(release.version, originalIdx, 'not-tested')}
                                className={`px-2 py-1 text-xs font-semibold transition-all ${
                                  status === 'not-tested'
                                    ? 'bg-neutral-500 text-white'
                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-400/20'
                                }`}
                              >
                                {t.notTested}
                              </button>
                            </div>
                          </div>

                          {/* Steps */}
                          <ol className="space-y-1.5 mb-3">
                            {feature.steps.map((step, sIdx) => (
                              <li key={sIdx} className="flex items-start gap-2 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-accent-500 text-white text-xs font-semibold">
                                  {sIdx + 1}
                                </span>
                                <span className="text-neutral-700 dark:text-neutral-300">
                                  {language === 'hu' ? step.hu : step.en}
                                </span>
                              </li>
                            ))}
                          </ol>

                          {/* Expected Result */}
                          <div className="pl-3 border-l-2 border-accent-500 bg-accent-50 dark:bg-accent-900/20 p-2">
                            <div className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase mb-0.5">
                              {t.expectedResult}
                            </div>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              {language === 'hu' ? feature.expected.hu : feature.expected.en}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
