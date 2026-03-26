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
    version: '4.2.0',
    date: '2026-03-26',
    features: [
      {
        nameEn: 'Display — Zoom Controls',
        nameHu: 'Kijelző — Zoom Vezérlők',
        steps: [
          { en: 'Log in as admin and navigate to /display/seating', hu: 'Jelentkezz be adminként és navigálj a /display/seating oldalra' },
          { en: 'Move the mouse — verify +/- buttons, fullscreen button, and auto-zoom toggle appear in bottom-right, then auto-hide after 3 seconds', hu: 'Mozgasd az egeret — ellenőrizd hogy a +/- gombok, fullscreen gomb és auto-zoom toggle megjelenik jobb alul, majd 3 másodperc után eltűnik' },
          { en: 'Click the + button — verify zoom increases and zoom percentage indicator appears in top-right', hu: 'Kattints a + gombra — ellenőrizd hogy a zoom növekszik és a zoom százalék kijelző megjelenik jobb felül' },
          { en: 'Hold Ctrl and scroll — verify smooth zoom in/out centered on cursor position', hu: 'Tartsd lenyomva a Ctrl-t és görgess — ellenőrizd hogy smooth zoom be/ki a kurzor pozíciójára középre' },
          { en: 'Click near a table name — verify the display smooth-zooms to that table at 250%. Click again on the same table — verify it returns to 1:1', hu: 'Kattints egy asztal neve közelében — ellenőrizd hogy a kijelző smooth-zoomol az asztalra 250%-ra. Kattints újra ugyanarra — ellenőrizd hogy visszatér 1:1-re' },
        ],
        expected: { en: 'All zoom methods work smoothly, zoom indicator shows correct percentage, controls auto-hide after 3s', hu: 'Minden zoom módszer simán működik, zoom kijelző helyes százalékot mutat, vezérlők 3mp után eltűnnek' },
      },
      {
        nameEn: 'Display — Fullscreen',
        nameHu: 'Kijelző — Teljes Képernyő',
        steps: [
          { en: 'On the display page, move mouse to show controls and click the fullscreen button (arrows icon)', hu: 'A kijelző oldalon mozgasd az egeret a vezérlők megjelenítéséhez és kattints a fullscreen gombra (nyilak ikon)' },
          { en: 'Verify the page enters fullscreen mode. Press F key — verify it exits fullscreen', hu: 'Ellenőrizd hogy az oldal teljes képernyőre vált. Nyomd meg az F billentyűt — ellenőrizd hogy kilép a teljes képernyőből' },
          { en: 'Press F again — verify it re-enters fullscreen. Press Escape — verify it exits', hu: 'Nyomd meg az F-et újra — ellenőrizd hogy visszalép teljes képernyőre. Nyomd meg az Escape-t — ellenőrizd hogy kilép' },
        ],
        expected: { en: 'Fullscreen toggles correctly via button and F key', hu: 'Teljes képernyő helyesen vált gombbal és F billentyűvel' },
      },
      {
        nameEn: 'Display — Auto-zoom on Check-in',
        nameHu: 'Kijelző — Automatikus Zoom Becsekkoláskor',
        steps: [
          { en: 'Open /display/seating in one browser tab. Open /admin/guests in another tab', hu: 'Nyisd meg a /display/seating-et egy böngésző fülön. Nyisd meg a /admin/guests-et egy másik fülön' },
          { en: 'On the display, verify the eye icon (auto-zoom toggle) is green (enabled)', hu: 'A kijelzőn ellenőrizd hogy a szem ikon (auto-zoom toggle) zöld (bekapcsolva)' },
          { en: 'In admin guests, change any guest status to checked_in. Switch to the display tab — verify it auto-zooms to the guest\'s table for ~3 seconds then smoothly returns to 1:1', hu: 'Az admin vendégeknél változtasd bármely vendég státuszát checked_in-re. Válts a kijelző fülre — ellenőrizd hogy automatikusan ráközelít a vendég asztalára ~3 másodpercre, majd simán visszatér 1:1-re' },
          { en: 'Click the eye icon to disable auto-zoom (turns grey). Repeat the check-in — verify the display does NOT auto-zoom this time', hu: 'Kattints a szem ikonra az auto-zoom kikapcsolásához (szürkére vált). Ismételd a check-in-t — ellenőrizd hogy a kijelző NEM zoomol automatikusan' },
        ],
        expected: { en: 'Auto-zoom activates on check-in when enabled, skips when disabled, returns to 1:1 after 3 seconds', hu: 'Auto-zoom aktiválódik check-in-nél ha be van kapcsolva, kimarad ha ki van kapcsolva, 3 másodperc után visszatér 1:1-re' },
      },
      {
        nameEn: 'Admin Check-in — Display Real-time Update',
        nameHu: 'Admin Check-in — Kijelző Valós Idejű Frissítés',
        steps: [
          { en: 'Open /display/seating and /admin/guests side by side', hu: 'Nyisd meg a /display/seating-et és /admin/guests-et egymás mellett' },
          { en: 'Find a guest who is not checked in. Note their name on the display (should be italic/grey)', hu: 'Keress egy vendéget aki nincs becsekkolva. Jegyezd meg a nevüket a kijelzőn (dőlt/szürke)' },
          { en: 'In admin, edit the guest and change status to checked_in. Save', hu: 'Az admin felületen szerkeszd a vendéget és változtasd a státuszt checked_in-re. Mentés' },
          { en: 'Verify on the display: guest name changes to bold/black in real-time, check-in counter increments', hu: 'Ellenőrizd a kijelzőn: vendég neve félkövér/feketére vált valós időben, check-in számláló növekszik' },
        ],
        expected: { en: 'Admin status change triggers real-time display update via SSE', hu: 'Admin státuszváltozás valós idejű kijelző frissítést triggerel SSE-n keresztül' },
      },
      {
        nameEn: 'Scanner — Special Dietary Label',
        nameHu: 'Szkenner — Special Diétás Címke',
        steps: [
          { en: 'Ensure a test guest has dietary_requirements set (e.g., "vegetarian")', hu: 'Győződj meg hogy egy teszt vendégnek van dietary_requirements beállítva (pl. "vegetarian")' },
          { en: 'Check in the guest via QR scanner at /checkin', hu: 'Csekkolj be a vendéget a QR szkennerrel a /checkin oldalon' },
          { en: 'On the green check-in card, verify "Dietary: Special" appears instead of the actual dietary text', hu: 'A zöld check-in kártyán ellenőrizd hogy "Dietary: Special" jelenik meg a tényleges diétás szöveg helyett' },
        ],
        expected: { en: 'Scanner shows "Special" label instead of dietary details for privacy', hu: 'Szkenner "Special" címkét mutat a diétás részletek helyett a magánélet védelmében' },
      },
    ],
  },
  {
    version: '4.1.2',
    date: '2026-03-25',
    features: [
      {
        nameEn: 'Final Reminder Email — General',
        nameHu: 'Végső Emlékeztető Email — Általános',
        steps: [
          { en: 'Navigate to /admin/guests and select a registered guest with a QR code', hu: 'Navigálj a /admin/guests oldalra és válassz egy regisztrált vendéget QR kóddal' },
          { en: 'Click the email icon → Email preview modal opens', hu: 'Kattints az email ikonra → Email előnézet modal megnyílik' },
          { en: 'Select "Final Reminder - General" from the template dropdown', hu: 'Válaszd a "Végső emlékeztető - Általános" sablont a dropdown-ból' },
          { en: 'Click Send → verify success message appears', hu: 'Kattints a Küldés gombra → ellenőrizd, hogy megjelenik a sikeres üzenet' },
        ],
        expected: { en: 'Email arrives with guest name, title, event details, and valid scannable QR code', hu: 'Az email megérkezik a vendég nevével, titlusával, esemény részletekkel és érvényes beolvasható QR kóddal' },
      },
      {
        nameEn: 'Final Reminder Email — VIP',
        nameHu: 'Végső Emlékeztető Email — VIP',
        steps: [
          { en: 'Navigate to /admin/guests and select a VIP guest with a QR code', hu: 'Navigálj a /admin/guests oldalra és válassz egy VIP vendéget QR kóddal' },
          { en: 'Click the email icon → Email preview modal opens', hu: 'Kattints az email ikonra → Email előnézet modal megnyílik' },
          { en: 'Select "Final Reminder - VIP" from the template dropdown', hu: 'Válaszd a "Végső emlékeztető - VIP" sablont a dropdown-ból' },
          { en: 'Click Send → verify success message appears', hu: 'Kattints a Küldés gombra → ellenőrizd, hogy megjelenik a sikeres üzenet' },
          { en: 'Verify the email contains VIP Welcome Reception details (6:30 PM sharp)', hu: 'Ellenőrizd, hogy az email tartalmazza a VIP Welcome Reception részleteket (18:30-kor)' },
        ],
        expected: { en: 'Email arrives with VIP-specific content, guest name, and valid QR code', hu: 'Az email megérkezik VIP-specifikus tartalommal, vendég névvel és érvényes QR kóddal' },
      },
    ],
  },
  {
    version: '4.1.1',
    date: '2026-03-23',
    features: [
      // === PARTNER LIFECYCLE MANAGEMENT ===
      {
        nameEn: 'Partner Management — Remove Partner',
        nameHu: 'Partner Kezelés — Partner Törlése',
        steps: [
          { en: 'Log in as admin, open guest list, edit a guest with a partner', hu: 'Jelentkezz be adminként, nyisd meg a vendéglistát, szerkeszts egy vendéget akinek van partnere' },
          { en: 'In the partner section, click "Remove Partner"', hu: 'A partner szekcióban kattints a "Partner törlése" gombra' },
          { en: 'Verify confirmation modal shows partner name and warning', hu: 'Ellenőrizd, hogy a megerősítő ablak mutatja a partner nevét és a figyelmeztetést' },
          { en: 'Confirm removal and verify success message', hu: 'Erősítsd meg a törlést és ellenőrizd a sikeres üzenetet' },
          { en: 'Verify partner no longer appears in guest list', hu: 'Ellenőrizd, hogy a partner már nem jelenik meg a vendéglistában' },
        ],
        expected: { en: 'Partner is fully removed (guest record, registration, table assignment, email logs)', hu: 'Partner teljesen eltávolítva (vendég rekord, regisztráció, asztal-hozzárendelés, email logok)' },
      },
      {
        nameEn: 'Partner Management — Replace Partner',
        nameHu: 'Partner Kezelés — Partner Cseréje',
        steps: [
          { en: 'Edit a guest with a partner, click "Change Partner"', hu: 'Szerkeszts egy vendéget akinek van partnere, kattints a "Partner cseréje" gombra' },
          { en: 'Fill in new partner details (name, email)', hu: 'Töltsd ki az új partner adatait (név, email)' },
          { en: 'Submit and verify old partner removed, new partner created', hu: 'Küld el és ellenőrizd, hogy a régi partner törölve, az új létrehozva' },
          { en: 'Verify new partner appears in guest list with correct status', hu: 'Ellenőrizd, hogy az új partner megjelenik a vendéglistában helyes státusszal' },
          { en: 'Verify new partner auto-assigned to same table (if capacity)', hu: 'Ellenőrizd, hogy az új partner automatikusan ugyanahhoz az asztalhoz került (ha van hely)' },
        ],
        expected: { en: 'Old partner removed, new partner created with QR ticket and table assignment', hu: 'Régi partner törölve, új partner létrehozva QR jeggyel és asztal-hozzárendeléssel' },
      },
      {
        nameEn: 'Partner Management — Checked-in Partner Block',
        nameHu: 'Partner Kezelés — Bejelentkezett Partner Blokkolás',
        steps: [
          { en: 'Find a guest whose partner has already checked in', hu: 'Keress egy vendéget akinek a partnere már bejelentkezett' },
          { en: 'Open edit modal and try to remove/change the partner', hu: 'Nyisd meg a szerkesztő ablakot és próbáld meg törölni/cserélni a partnert' },
          { en: 'Verify the action is blocked with appropriate message', hu: 'Ellenőrizd, hogy a művelet blokkolva van megfelelő üzenettel' },
        ],
        expected: { en: 'Cannot remove/change a partner who has already checked in', hu: 'Nem lehet törölni/cserélni egy már bejelentkezett partnert' },
      },
      {
        nameEn: 'Partner Management — Validation Errors',
        nameHu: 'Partner Kezelés — Validációs Hibák',
        steps: [
          { en: 'Try to replace partner with the main guest\'s own email', hu: 'Próbáld meg cserélni a partnert a fő vendég saját email-jére' },
          { en: 'Try to replace with an email already registered as independent guest', hu: 'Próbáld meg cserélni egy már független vendégként regisztrált email-lel' },
          { en: 'Try to replace with an email already a partner of someone else', hu: 'Próbáld meg cserélni egy már más vendég partnereként regisztrált email-lel' },
          { en: 'Verify appropriate error messages for each case', hu: 'Ellenőrizd a megfelelő hibaüzeneteket minden esetre' },
        ],
        expected: { en: 'Clear error messages for self-pairing, existing email, and already-partnered email', hu: 'Egyértelmű hibaüzenetek önpárosítás, meglévő email és már párosított email esetén' },
      },
      // === CSV PARTNER AWARENESS ===
      {
        nameEn: 'Seating CSV — Partner Column in Export',
        nameHu: 'Ülésrend CSV — Partner Oszlop az Exportban',
        steps: [
          { en: 'Navigate to Seating page, click Export CSV', hu: 'Navigálj az Ülésrend oldalra, kattints az Export CSV gombra' },
          { en: 'Open the exported CSV file', hu: 'Nyisd meg az exportált CSV fájlt' },
          { en: 'Verify partner_of_email column is present in header', hu: 'Ellenőrizd, hogy a partner_of_email oszlop megjelenik a fejlécben' },
          { en: 'Verify partner guests show the main guest\'s email in this column', hu: 'Ellenőrizd, hogy partner vendégeknél a fő vendég email-je szerepel ebben az oszlopban' },
        ],
        expected: { en: 'CSV export contains partner relationship data', hu: 'CSV export tartalmazza a partner kapcsolati adatokat' },
      },
      // === ADMIN CROSS-NAVIGATION ===
      {
        nameEn: 'Admin Page Cross-Navigation — Badges & Deep Links',
        nameHu: 'Admin Oldal Keresztnavigáció — Badge-ek & Deep Linkek',
        steps: [
          { en: 'Go to Changelog page, verify Help Guide badge next to version headers', hu: 'Menj a Changelog oldalra, ellenőrizd a Help Guide badge-et a verzió fejléceknél' },
          { en: 'Click a Help Guide badge, verify it navigates to admin help', hu: 'Kattints egy Help Guide badge-re, ellenőrizd, hogy a help oldalra navigál' },
          { en: 'Go to Release Testing, verify Changelog and Help Guide badges per version', hu: 'Menj a Release Testing oldalra, ellenőrizd a Changelog és Help Guide badge-eket verziónként' },
        ],
        expected: { en: 'All three admin pages link to each other with version-specific badges', hu: 'Mindhárom admin oldal linkkel mutat egymásra verzió-specifikus badge-ekkel' },
      },
    ],
  },
  {
    version: '4.1.0',
    date: '2026-03-22',
    features: [
      // === LIVE SEATING DISPLAY ===
      {
        nameEn: 'Live Seating Display — Page Load',
        nameHu: 'Élő Ülésrend Kijelző — Oldal Betöltés',
        steps: [
          { en: 'Log in as admin', hu: 'Jelentkezz be adminként' },
          { en: 'Navigate to Dashboard → click "Live Display" card', hu: 'Navigálj a Dashboard-ra → kattints az "Élő Kijelző" kártyára' },
          { en: 'Verify the display loads full-screen with background image', hu: 'Ellenőrizd, hogy a kijelző teljes képernyőn betölt háttérképpel' },
          { en: 'Verify guest names appear at their table positions', hu: 'Ellenőrizd, hogy a vendégnevek megjelennek az asztal pozícióknál' },
          { en: 'Verify "X/Y CHECKED IN" counter is visible', hu: 'Ellenőrizd, hogy az "X/Y CHECKED IN" számláló látható' },
          { en: 'Verify non-checked-in guests are grey italic, checked-in are bold black', hu: 'Ellenőrizd, hogy a nem bejelentkezett vendégek szürke dőltek, a bejelentkezettek fekete félkövérek' },
        ],
        expected: { en: 'Full-screen display with background image, guest overlays, and counter', hu: 'Teljes képernyős kijelző háttérképpel, vendég overlay-ekkel és számlálóval' },
      },
      {
        nameEn: 'Live Seating Display — Real-time Updates',
        nameHu: 'Élő Ülésrend Kijelző — Valós Idejű Frissítés',
        steps: [
          { en: 'Open the live display on one screen', hu: 'Nyisd meg az élő kijelzőt egy képernyőn' },
          { en: 'On another device/tab, check in a guest via the scanner', hu: 'Egy másik eszközön/fülön jelentkeztesd be a vendéget a szkennerrel' },
          { en: 'Verify the guest name style changes on the display (grey→black bold)', hu: 'Ellenőrizd, hogy a vendég neve stílusa változik a kijelzőn (szürke→fekete félkövér)' },
          { en: 'Verify the counter increments', hu: 'Ellenőrizd, hogy a számláló növekszik' },
        ],
        expected: { en: 'Guest check-in updates live on display without page refresh', hu: 'Vendég bejelentkezés valós időben frissül a kijelzőn oldalfrissítés nélkül' },
      },
      // === CHECK-IN SCANNER ===
      {
        nameEn: 'Check-in Scanner — CEO Gala Theme',
        nameHu: 'Check-in Scanner — CEO Gála Arculat',
        steps: [
          { en: 'Navigate to /checkin', hu: 'Navigálj a /checkin oldalra' },
          { en: 'Verify dark-blue background with gold accents', hu: 'Ellenőrizd a sötétkék hátteret arany akcentusokkal' },
          { en: 'Verify "CEO Gala 2026" title with star decoration', hu: 'Ellenőrizd a "CEO Gala 2026" címet csillag dekorációval' },
          { en: 'Verify "Start Scanning" button is visible', hu: 'Ellenőrizd, hogy a "Start Scanning" gomb látható' },
          { en: 'Verify MyForge Labs footer at bottom', hu: 'Ellenőrizd a MyForge Labs lábléc alul' },
        ],
        expected: { en: 'Scanner page renders in CEO Gala dark-blue/gold theme', hu: 'Scanner oldal CEO Gála sötétkék-arany arculatban jelenik meg' },
      },
      {
        nameEn: 'Check-in Scanner — Guest Details on Valid Ticket',
        nameHu: 'Check-in Scanner — Vendég Részletek Érvényes Jegynél',
        steps: [
          { en: 'Scan a valid QR ticket', hu: 'Szkennelj be egy érvényes QR jegyet' },
          { en: 'Verify green card appears with guest name', hu: 'Ellenőrizd, hogy zöld kártya jelenik meg a vendég nevével' },
          { en: 'Verify table number is shown (if assigned)', hu: 'Ellenőrizd, hogy az asztal szám megjelenik (ha ki van osztva)' },
          { en: 'Verify VIP badge shown for VIP Reception guests', hu: 'Ellenőrizd, hogy VIP badge megjelenik a VIP Reception vendégeknél' },
          { en: 'Verify dietary requirements shown if set', hu: 'Ellenőrizd, hogy a diétás igények megjelennek ha be van állítva' },
          { en: 'Verify partner name shown for paired tickets', hu: 'Ellenőrizd, hogy a partner neve megjelenik páros jegynél' },
          { en: 'Press CHECK IN and verify success screen with guest info', hu: 'Nyomd meg a CHECK IN gombot és ellenőrizd a sikerképernyőt vendég infóval' },
        ],
        expected: { en: 'Guest details (table, VIP, diet, partner) visible before and after check-in', hu: 'Vendég részletek (asztal, VIP, diéta, partner) láthatóak check-in előtt és után' },
      },
      {
        nameEn: 'Check-in Scanner — Already Checked In (Yellow Card)',
        nameHu: 'Check-in Scanner — Már Bejelentkezett (Sárga Kártya)',
        steps: [
          { en: 'Scan a QR ticket that has already been checked in', hu: 'Szkennelj be egy már bejelentkezett QR jegyet' },
          { en: 'Verify yellow/amber card appears', hu: 'Ellenőrizd, hogy sárga/amber kártya jelenik meg' },
          { en: 'Verify "Already Checked In" message with previous check-in time', hu: 'Ellenőrizd az "Already Checked In" üzenetet az előző bejelentkezési idővel' },
          { en: 'As admin: verify "Admin Override" button is available', hu: 'Adminként: ellenőrizd, hogy az "Admin Override" gomb elérhető' },
          { en: 'As staff: verify override button is NOT shown', hu: 'Staffként: ellenőrizd, hogy az override gomb NEM jelenik meg' },
        ],
        expected: { en: 'Yellow card for duplicate check-in, admin override available', hu: 'Sárga kártya dupla bejelentkezésnél, admin felülírás elérhető' },
      },
      // === SEATING PAGE — SEARCH & COLLAPSE ===
      {
        nameEn: 'Seating Grid — Search & Collapse',
        nameHu: 'Ülésrend Grid — Keresés & Összecsukás',
        steps: [
          { en: 'Navigate to Seating page (admin/seating)', hu: 'Navigálj az Ülésrend oldalra (admin/seating)' },
          { en: 'With 5+ tables: verify all tables start collapsed', hu: '5+ asztalnál: ellenőrizd, hogy minden asztal csukva indul' },
          { en: 'Click a table header to expand/collapse', hu: 'Kattints egy asztal fejlécre a kinyitáshoz/becsukáshoz' },
          { en: 'Click "Összes kinyitása" button — verify all expand', hu: 'Kattints az "Összes kinyitása" gombra — ellenőrizd, hogy mind kinyílik' },
          { en: 'Type a guest name in global search bar', hu: 'Írj be egy vendég nevet a globális keresőbe' },
          { en: 'Verify matching tables auto-expand with highlighted guests (★ and amber ring)', hu: 'Ellenőrizd, hogy a talált asztalok automatikusan kinyílnak kiemelt vendégekkel (★ és amber keret)' },
          { en: 'Clear search — verify original collapse state restores', hu: 'Töröld a keresést — ellenőrizd, hogy az eredeti állapot visszaáll' },
          { en: 'Type a non-existing name — verify "Nincs találat" message', hu: 'Írj be nem létező nevet — ellenőrizd a "Nincs találat" üzenetet' },
        ],
        expected: { en: 'Tables collapse/expand correctly, search finds guests and auto-expands tables', hu: 'Asztalok helyesen csukódnak/nyílnak, keresés megtalálja a vendégeket és kinyitja az asztalokat' },
      },
      // === SEATING PAGE — FILTERS & SORTING ===
      {
        nameEn: 'Seating Grid — Filters, Sorting & Sections',
        nameHu: 'Ülésrend Grid — Szűrők, Rendezés & Szekciók',
        steps: [
          { en: 'Verify VIP and Standard sections are shown separately', hu: 'Ellenőrizd, hogy a VIP és Standard szekciók külön jelennek meg' },
          { en: 'Click "Van hely" filter — verify only tables with room shown', hu: 'Kattints a "Van hely" szűrőre — ellenőrizd, hogy csak a szabad helyes asztalok jelennek meg' },
          { en: 'Click "Tele" filter — verify only full tables shown', hu: 'Kattints a "Tele" szűrőre — ellenőrizd, hogy csak a tele asztalok jelennek meg' },
          { en: 'Click "Üres" filter — verify only empty tables shown', hu: 'Kattints az "Üres" szűrőre — ellenőrizd, hogy csak az üres asztalok jelennek meg' },
          { en: 'Change sort to "Legtöbb szabad hely" — verify order changes', hu: 'Váltsd a rendezést "Legtöbb szabad hely"-re — ellenőrizd a sorrend változást' },
          { en: 'Verify tables are in numeric order by default (1, 2, 3... 10, 11, not 1, 10, 11, 2)', hu: 'Ellenőrizd, hogy az asztalok numerikus sorrendben vannak (1, 2, 3... 10, 11, nem 1, 10, 11, 2)' },
        ],
        expected: { en: 'Filters, sorting and VIP/Standard sections work correctly', hu: 'Szűrők, rendezés és VIP/Standard szekciók helyesen működnek' },
      },
      // === SEATING PAGE — COLOR CODING ===
      {
        nameEn: 'Seating Grid — Color Coding & Statuses',
        nameHu: 'Ülésrend Grid — Színkódolás & Státuszok',
        steps: [
          { en: 'Verify empty tables have grey border', hu: 'Ellenőrizd, hogy az üres asztalok szürke keretűek' },
          { en: 'Verify partially filled tables (<50%) have blue border', hu: 'Ellenőrizd, hogy a részben telt asztalok (<50%) kék keretűek' },
          { en: 'Verify almost full tables (≥50%) have green border', hu: 'Ellenőrizd, hogy a majdnem tele asztalok (≥50%) zöld keretűek' },
          { en: 'Verify full tables have red border', hu: 'Ellenőrizd, hogy a tele asztalok piros keretűek' },
          { en: 'Verify guest chips show colored status dots', hu: 'Ellenőrizd, hogy a vendég kártyákon színes státusz pontok vannak' },
          { en: 'Verify VIP guests have gold VIP badge', hu: 'Ellenőrizd, hogy a VIP vendégeknél arany VIP badge van' },
          { en: 'Verify KPI stat cards have colored borders and numbers', hu: 'Ellenőrizd, hogy a KPI statisztika kártyákon színes keretek és számok vannak' },
          { en: 'Verify Color Guide panel at page bottom', hu: 'Ellenőrizd a Szín jelölések panelt az oldal alján' },
        ],
        expected: { en: 'All color coding matches the Color Guide legend', hu: 'Minden színkódolás megegyezik a Szín jelölések legendával' },
      },
      // === SEATING PAGE — DnD + COLLAPSE ===
      {
        nameEn: 'Seating Grid — DnD with Collapsed Tables',
        nameHu: 'Ülésrend Grid — DnD Csukott Asztalokkal',
        steps: [
          { en: 'Drag a guest from left panel onto a collapsed table', hu: 'Húzz egy vendéget a bal panelből egy csukott asztalra' },
          { en: 'Hold over collapsed table for 400ms — verify it auto-expands', hu: 'Tartsd a csukott asztal felett 400ms-ig — ellenőrizd, hogy automatikusan kinyílik' },
          { en: 'Drop the guest — verify successful assignment', hu: 'Ejtsd le a vendéget — ellenőrizd a sikeres hozzárendelést' },
          { en: 'Drop a guest on a collapsed table quickly (before 400ms) — verify it still assigns', hu: 'Ejtsd le a vendéget gyorsan egy csukott asztalra (400ms előtt) — ellenőrizd, hogy hozzárendeli' },
          { en: 'Drag a guest back to the left panel to remove assignment', hu: 'Húzd vissza a vendéget a bal panelbe a hozzárendelés törléséhez' },
        ],
        expected: { en: 'DnD works correctly with collapsed tables, auto-expand on hover', hu: 'DnD helyesen működik csukott asztalokkal, hover-re automatikusan kinyílik' },
      },
      // === SEATING PAGE — INLINE EDIT ===
      {
        nameEn: 'Seating Grid — Inline Table Edit',
        nameHu: 'Ülésrend Grid — Helyben Asztal Szerkesztés',
        steps: [
          { en: 'Hover over a table card — verify pencil icon appears', hu: 'Vidd az egeret egy asztal kártya fölé — ellenőrizd, hogy ceruza ikon megjelenik' },
          { en: 'Click pencil icon — verify edit modal opens', hu: 'Kattints a ceruza ikonra — ellenőrizd, hogy a szerkesztő ablak megnyílik' },
          { en: 'Change table name and save — verify name updates', hu: 'Változtasd meg az asztal nevét és mentsd — ellenőrizd, hogy a név frissül' },
          { en: 'Change table type to VIP — verify VIP badge appears and table moves to VIP section', hu: 'Változtasd az asztal típust VIP-re — ellenőrizd, hogy VIP badge megjelenik és az asztal a VIP szekcióba kerül' },
          { en: 'Try to reduce capacity below current occupancy — verify error message', hu: 'Próbáld csökkenteni a kapacitást a jelenlegi foglaltság alá — ellenőrizd a hibaüzenetet' },
        ],
        expected: { en: 'Table edit modal works, VIP type change reflected immediately', hu: 'Asztal szerkesztő modal működik, VIP típus változás azonnal megjelenik' },
      },
      // === FLOOR PLAN ===
      {
        nameEn: 'Floor Plan — Heatmap, Spotlight & Auto-Arrange',
        nameHu: 'Alaprajz — Heatmap, Spotlight & Automatikus Elrendezés',
        steps: [
          { en: 'Switch to Floor Plan view', hu: 'Válts Alaprajz nézetre' },
          { en: 'Verify heatmap colors: grey (empty), green (<50%), orange (≥50%), red (full)', hu: 'Ellenőrizd a heatmap színeket: szürke (üres), zöld (<50%), narancs (≥50%), piros (tele)' },
          { en: 'Verify heatmap legend at bottom of canvas', hu: 'Ellenőrizd a heatmap legendát a vászon alján' },
          { en: 'Type a table name in search bar', hu: 'Írj be egy asztal nevet a keresőbe' },
          { en: 'Verify matching table pulses with gold glow, others dim', hu: 'Ellenőrizd, hogy a talált asztal arany kerettel pulzál, a többi elhalványul' },
          { en: 'With single match — verify auto-pan/zoom to table', hu: 'Egyetlen találatnál — ellenőrizd az automatikus pan/zoom-ot az asztalra' },
          { en: 'Hover a table — verify tooltip with guest list (scrollable)', hu: 'Vidd az egeret asztalra — ellenőrizd a tooltip-ot vendéglistával (görgethető)' },
          { en: 'Click "Automatikus elrendezés" — confirm dialog — verify grid layout', hu: 'Kattints az "Automatikus elrendezés" gombra — erősítsd meg — ellenőrizd a rács elrendezést' },
        ],
        expected: { en: 'Heatmap, spotlight search, tooltip and auto-arrange all functional', hu: 'Heatmap, spotlight keresés, tooltip és automatikus elrendezés mind működik' },
      },
      // === SEARCH STATE PERSISTENCE ===
      {
        nameEn: 'Seating — Search Persists Across Views',
        nameHu: 'Ülésrend — Keresés Megmarad Nézet Váltáskor',
        steps: [
          { en: 'In Grid view, type a search query', hu: 'Grid nézetben írj be egy keresési kifejezést' },
          { en: 'Switch to Floor Plan view', hu: 'Válts Alaprajz nézetre' },
          { en: 'Verify search is still active (spotlight shows matching table)', hu: 'Ellenőrizd, hogy a keresés aktív marad (spotlight mutatja a találatot)' },
          { en: 'Clear search in Floor Plan view', hu: 'Töröld a keresést Alaprajz nézetben' },
          { en: 'Switch back to Grid — verify search is cleared', hu: 'Válts vissza Grid-re — ellenőrizd, hogy a keresés törölve van' },
        ],
        expected: { en: 'Search state persists when switching between Grid and Floor Plan', hu: 'Keresés állapot megmarad Grid és Alaprajz nézet váltásnál' },
      },
      // === DARK MODE ===
      {
        nameEn: 'Seating — Dark Mode Consistency',
        nameHu: 'Ülésrend — Dark Mode Konzisztencia',
        steps: [
          { en: 'Switch to dark mode', hu: 'Válts dark mode-ra' },
          { en: 'Verify KPI cards have visible colored borders and text', hu: 'Ellenőrizd, hogy a KPI kártyákon látható színes keretek és szöveg van' },
          { en: 'Verify table cards have proper dark backgrounds with colored borders', hu: 'Ellenőrizd, hogy az asztal kártyákon sötét háttér van színes kerettel' },
          { en: 'Verify search bar has dark background', hu: 'Ellenőrizd, hogy a kereső sáv sötét hátterű' },
          { en: 'Verify guest chips and status dots are visible', hu: 'Ellenőrizd, hogy a vendég kártyák és státusz pontok láthatóak' },
          { en: 'Verify edit modal has dark styling', hu: 'Ellenőrizd, hogy a szerkesztő modal sötét stílusú' },
          { en: 'Switch to Floor Plan — verify heatmap legend has dark background', hu: 'Válts Alaprajzra — ellenőrizd, hogy a heatmap legenda sötét hátterű' },
          { en: 'Verify Floor Plan tooltip has dark background', hu: 'Ellenőrizd, hogy az Alaprajz tooltip sötét hátterű' },
        ],
        expected: { en: 'All seating page elements render correctly in dark mode', hu: 'Minden ülésrend elem helyesen jelenik meg dark mode-ban' },
      },
    ],
  },
  {
    version: '3.11.0',
    date: '2026-03-19',
    features: [
      {
        nameEn: 'Two-Week Reminder Email Template',
        nameHu: '2 Hetes Emlékeztető Email Sablon',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Verify reminder_2wks template exists in the list', hu: 'Ellenőrizd, hogy a reminder_2wks sablon megjelenik a listában' },
          { en: 'Open the template preview', hu: 'Nyisd meg a sablon előnézetét' },
          { en: 'Verify partner branding is visible in the template', hu: 'Ellenőrizd, hogy a partner branding látható a sablonban' },
        ],
        expected: { en: 'reminder_2wks template renders correctly with partner branding', hu: 'reminder_2wks sablon helyesen jelenik meg partner brandinggel' },
      },
      {
        nameEn: 'Conditional QR Code Attachment',
        nameHu: 'Feltételes QR Kód Csatolás',
        steps: [
          { en: 'Send an email using a template that does NOT use guestQrCode variable', hu: 'Küldj emailt egy sablonnal ami NEM használja a guestQrCode változót' },
          { en: 'Verify no QR code image is attached to the email', hu: 'Ellenőrizd, hogy nincs QR kód kép csatolva az emailhez' },
          { en: 'Send an email using a template that uses guestQrCode', hu: 'Küldj emailt egy sablonnal ami használja a guestQrCode-ot' },
          { en: 'Verify QR code is attached as CID image', hu: 'Ellenőrizd, hogy a QR kód csatolva van CID képként' },
        ],
        expected: { en: 'QR code only attached when template uses the variable', hu: 'QR kód csak akkor csatolva, ha a sablon használja a változót' },
      },
      {
        nameEn: 'Email Preview Modal — Mobile Footer',
        nameHu: 'Email Előnézet Modal — Mobil Lábléc',
        steps: [
          { en: 'Open email preview on a mobile device or narrow viewport', hu: 'Nyisd meg az email előnézetet mobil eszközön vagy szűk nézetben' },
          { en: 'Scroll to the bottom of the preview', hu: 'Görgess a preview aljára' },
          { en: 'Verify content is not hidden behind the mobile footer bar', hu: 'Ellenőrizd, hogy a tartalom nem rejtett a mobil lábléc mögött' },
        ],
        expected: { en: 'Preview content has enough bottom padding for mobile footer', hu: 'Előnézet tartalom elegendő alsó paddingot kap a mobil lábléchez' },
      },
    ],
  },
  {
    version: '3.10.0',
    date: '2026-03-18',
    features: [
      {
        nameEn: 'VIP Invitation Email Template',
        nameHu: 'VIP Meghívó Email Sablon',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Verify vip_invitation template exists', hu: 'Ellenőrizd, hogy a vip_invitation sablon létezik' },
          { en: 'Preview the template', hu: 'Nézd meg a sablon előnézetét' },
          { en: 'Verify BBJ logo, 3 signatures, and personal notice section', hu: 'Ellenőrizd a BBJ logót, 3 aláírást és a személyes üzenet szekciót' },
          { en: 'Verify QR code section appears below BBJ logo', hu: 'Ellenőrizd, hogy a QR kód szekció a BBJ logó alatt jelenik meg' },
        ],
        expected: { en: 'vip_invitation template renders with all sections correctly', hu: 'vip_invitation sablon helyesen jelenik meg minden szekcióval' },
      },
      {
        nameEn: 'QR Code CID Attachment Delivery',
        nameHu: 'QR Kód CID Csatolás Kézbesítés',
        steps: [
          { en: 'Send a ticket email to a guest with QR code', hu: 'Küldj jegy emailt egy vendégnek QR kóddal' },
          { en: 'Check the received email', hu: 'Ellenőrizd a kapott emailt' },
          { en: 'Verify QR code image renders inline (not as broken image)', hu: 'Ellenőrizd, hogy a QR kód kép inline renderelődik (nem törött képként)' },
          { en: 'Test in Outlook, Gmail, and Apple Mail if possible', hu: 'Teszteld Outlook, Gmail és Apple Mail-ben ha lehetséges' },
        ],
        expected: { en: 'QR code renders correctly in major email clients via CID attachment', hu: 'QR kód helyesen jelenik meg a főbb email kliensekben CID csatolással' },
      },
      {
        nameEn: 'DB-First Template Loading',
        nameHu: 'DB-Elsőbbségű Sablon Betöltés',
        steps: [
          { en: 'Edit an email template via admin UI and save', hu: 'Szerkeszts egy email sablont az admin UI-on és mentsd el' },
          { en: 'Restart the server (PM2 restart)', hu: 'Indítsd újra a szervert (PM2 restart)' },
          { en: 'Preview the template again', hu: 'Nézd meg újra a sablon előnézetét' },
          { en: 'Verify your DB edits are preserved (not overwritten by code)', hu: 'Ellenőrizd, hogy a DB szerkesztéseid megmaradtak (nem írta felül a kód)' },
        ],
        expected: { en: 'Database template edits survive server restarts', hu: 'Adatbázis sablon szerkesztések túlélik a szerver újraindítást' },
      },
    ],
  },
  {
    version: '3.9.0',
    date: '2026-03-16',
    features: [
      {
        nameEn: 'Invite Reminder V3 Template',
        nameHu: 'Meghívó Emlékeztető V3 Sablon',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Verify invite_reminder_v3 appears in the list', hu: 'Ellenőrizd, hogy az invite_reminder_v3 megjelenik a listában' },
          { en: 'Preview the template', hu: 'Nézd meg a sablon előnézetét' },
          { en: 'Verify Little Minds and Corinthia logos in footer', hu: 'Ellenőrizd a Little Minds és Corinthia logókat a láblécben' },
          { en: 'Go to Guest List, verify invite_reminder_v3 in email template dropdown', hu: 'Menj a Vendéglistára, ellenőrizd az invite_reminder_v3-at az email sablon dropdown-ban' },
        ],
        expected: { en: 'invite_reminder_v3 template with partner logos available and selectable', hu: 'invite_reminder_v3 sablon partner logókkal elérhető és kiválasztható' },
      },
      {
        nameEn: 'Email Preview Base URL',
        nameHu: 'Email Előnézet Base URL',
        steps: [
          { en: 'Preview any email template with images', hu: 'Nézd meg bármely képeket tartalmazó email sablon előnézetét' },
          { en: 'Verify logos and images render correctly', hu: 'Ellenőrizd, hogy a logók és képek helyesen megjelennek' },
          { en: 'Verify no hardcoded URLs in image sources', hu: 'Ellenőrizd, hogy nincsenek hardcoded URL-ek a kép forrásokban' },
        ],
        expected: { en: 'All images use APP_URL for correct rendering across environments', hu: 'Minden kép APP_URL-t használ a helyes megjelenítéshez minden környezetben' },
      },
    ],
  },
  {
    version: '3.8.0',
    date: '2026-03-06',
    features: [
      {
        nameEn: 'Email Status Protection',
        nameHu: 'Email Státusz Védelem',
        steps: [
          { en: 'Find a guest with "approved" or "registered" status', hu: 'Keress egy "approved" vagy "registered" státuszú vendéget' },
          { en: 'Send a bulk email that includes this guest', hu: 'Küldj egy tömeges emailt ami tartalmazza ezt a vendéget' },
          { en: 'Verify the guest status has NOT been downgraded', hu: 'Ellenőrizd, hogy a vendég státusza NEM lett visszaírva' },
        ],
        expected: { en: 'Email sending does not downgrade guest registration status', hu: 'Email küldés nem írja vissza a vendég regisztrációs státuszát' },
      },
      {
        nameEn: '100/Page Pagination Option',
        nameHu: '100/Oldal Lapozási Opció',
        steps: [
          { en: 'Go to Admin → Guest List', hu: 'Menj az Admin → Vendéglista oldalra' },
          { en: 'Look at the pagination controls at the bottom', hu: 'Nézd meg a lapozás vezérlőket az oldal alján' },
          { en: 'Verify "100" option is available in the items per page selector', hu: 'Ellenőrizd, hogy a "100" opció elérhető az oldalankénti elemszám választóban' },
          { en: 'Select 100 and verify the list shows up to 100 items', hu: 'Válaszd a 100-at és ellenőrizd, hogy a lista legfeljebb 100 elemet mutat' },
        ],
        expected: { en: 'Guest list supports 100 items per page for large lists', hu: 'Vendéglista támogat 100 elem/oldal opciót nagy listákhoz' },
      },
    ],
  },
  {
    version: '3.7.0',
    date: '2026-03-06',
    features: [
      {
        nameEn: 'One-Month Reminder Template with Partner Logos',
        nameHu: '1 Hónapos Emlékeztető Sablon Partner Logókkal',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Find reminder_1month template', hu: 'Keresd meg a reminder_1month sablont' },
          { en: 'Preview the template', hu: 'Nézd meg a sablon előnézetét' },
          { en: 'Verify Corinthia and Little Minds logos in the footer', hu: 'Ellenőrizd a Corinthia és Little Minds logókat a láblécben' },
          { en: 'Verify equal spacing between partner logos', hu: 'Ellenőrizd az egyenletes térközöket a partner logók között' },
        ],
        expected: { en: 'reminder_1month template with properly spaced partner logos', hu: 'reminder_1month sablon megfelelően elrendezett partner logókkal' },
      },
      {
        nameEn: 'CBRE Email Template',
        nameHu: 'CBRE Email Sablon',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Find CBRE template in the list', hu: 'Keresd meg a CBRE sablont a listában' },
          { en: 'Preview and verify CBRE branding', hu: 'Nézd meg az előnézetet és ellenőrizd a CBRE arculatot' },
          { en: 'Verify it appears in Guest List email template dropdown', hu: 'Ellenőrizd, hogy megjelenik a Vendéglista email sablon dropdown-jában' },
        ],
        expected: { en: 'CBRE template available and selectable from guest list', hu: 'CBRE sablon elérhető és kiválasztható a vendéglistából' },
      },
      {
        nameEn: 'i18n PageHeader Translation',
        nameHu: 'i18n PageHeader Fordítás',
        steps: [
          { en: 'Switch language to Hungarian in admin header', hu: 'Válts magyar nyelvre az admin fejlécben' },
          { en: 'Navigate through admin pages (Guests, Tables, Emails, etc.)', hu: 'Navigálj az admin oldalakon (Vendégek, Asztalok, Emailek, stb.)' },
          { en: 'Verify page titles and descriptions are in Hungarian', hu: 'Ellenőrizd, hogy az oldal címek és leírások magyarul vannak' },
          { en: 'Switch to English and verify all titles translate', hu: 'Válts angolra és ellenőrizd, hogy minden cím lefordítódik' },
        ],
        expected: { en: 'All admin page headers translate correctly in both languages', hu: 'Minden admin oldal fejléc helyesen fordítódik mindkét nyelven' },
      },
    ],
  },
  {
    version: '3.6.0',
    date: '2026-03-02',
    features: [
      {
        nameEn: 'Email Template Selector in Guest List',
        nameHu: 'Email Sablon Választó a Vendéglistában',
        steps: [
          { en: 'Go to Admin → Guest List', hu: 'Menj az Admin → Vendéglista oldalra' },
          { en: 'Find the email template dropdown near the send email button', hu: 'Keresd meg az email sablon dropdown-ot a küldés gomb közelében' },
          { en: 'Verify multiple templates are listed (default, sponsor_invitation, etc.)', hu: 'Ellenőrizd, hogy több sablon is listázva van (default, sponsor_invitation, stb.)' },
          { en: 'Select a non-default template and send an email', hu: 'Válassz egy nem-default sablont és küldj emailt' },
          { en: 'Verify the email uses the selected template', hu: 'Ellenőrizd, hogy az email a kiválasztott sablont használja' },
        ],
        expected: { en: 'Can select and send emails using different templates from guest list', hu: 'Kiválasztható és küldhető email különböző sablonokkal a vendéglistából' },
      },
      {
        nameEn: 'Sponsor Invitation Template (PwC Hungary)',
        nameHu: 'Szponzor Meghívó Sablon (PwC Hungary)',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Find sponsor_invitation template', hu: 'Keresd meg a sponsor_invitation sablont' },
          { en: 'Preview the template', hu: 'Nézd meg a sablon előnézetét' },
          { en: 'Verify 3 signatures are visible including László Radványi, CEO PwC Hungary', hu: 'Ellenőrizd, hogy 3 aláírás látható, beleértve Radványi László, PwC Hungary CEO' },
          { en: 'Verify professional corporate invitation layout', hu: 'Ellenőrizd a professzionális vállalati meghívó elrendezést' },
        ],
        expected: { en: 'sponsor_invitation template with 3 signatures renders correctly', hu: 'sponsor_invitation sablon 3 aláírással helyesen jelenik meg' },
      },
    ],
  },
  {
    version: '3.5.0',
    date: '2026-02-15',
    features: [
      {
        nameEn: 'Codebase Cleanup — Build Verification',
        nameHu: 'Kódbázis Tisztítás — Build Ellenőrzés',
        steps: [
          { en: 'Run npm run build', hu: 'Futtasd az npm run build parancsot' },
          { en: 'Verify build completes without errors', hu: 'Ellenőrizd, hogy a build hiba nélkül befejeződik' },
          { en: 'Run npm run lint', hu: 'Futtasd az npm run lint parancsot' },
          { en: 'Verify no new lint errors', hu: 'Ellenőrizd, hogy nincs új lint hiba' },
        ],
        expected: { en: 'Clean build and lint after codebase cleanup', hu: 'Tiszta build és lint a kódbázis tisztítás után' },
      },
    ],
  },
  {
    version: '3.4.0',
    date: '2026-02-12',
    features: [
      {
        nameEn: 'Invitation Reminder V2 Template',
        nameHu: 'Meghívó Emlékeztető V2 Sablon',
        steps: [
          { en: 'Go to Admin → Email Templates', hu: 'Menj az Admin → Email Sablonok oldalra' },
          { en: 'Find invitation_reminder_v2 template', hu: 'Keresd meg az invitation_reminder_v2 sablont' },
          { en: 'Preview the template', hu: 'Nézd meg a sablon előnézetét' },
          { en: 'Verify improved layout and partner branding', hu: 'Ellenőrizd a javított elrendezést és partner brandinget' },
        ],
        expected: { en: 'invitation_reminder_v2 template renders with improved design', hu: 'invitation_reminder_v2 sablon javított designnal jelenik meg' },
      },
      {
        nameEn: 'Scheduled Emails — Batch Processing',
        nameHu: 'Ütemezett Emailek — Kötegelt Feldolgozás',
        steps: [
          { en: 'Schedule multiple emails for the same time', hu: 'Ütemezz több emailt ugyanarra az időre' },
          { en: 'Wait for the scheduled time', hu: 'Várd meg az ütemezett időt' },
          { en: 'Verify emails are sent in batches with correct delays', hu: 'Ellenőrizd, hogy az emailek kötegelve mennek ki helyes késleltetéssel' },
          { en: 'Check email logs for correct status updates', hu: 'Ellenőrizd az email logokat a helyes státusz frissítésekhez' },
        ],
        expected: { en: 'Scheduled emails sent in batches with proper tracking', hu: 'Ütemezett emailek kötegekben küldve megfelelő nyomkövetéssel' },
      },
    ],
  },
  {
    version: '3.3.0',
    date: '2026-02-03',
    features: [
      {
        nameEn: 'Sortable Guest List Columns',
        nameHu: 'Rendezhető Vendéglista Oszlopok',
        steps: [
          { en: 'Go to Admin → Guest List', hu: 'Menj az Admin → Vendéglista oldalra' },
          { en: 'Click on a column header (e.g., Name, Email, Status)', hu: 'Kattints egy oszlopfejlécre (pl. Név, Email, Státusz)' },
          { en: 'Verify the list sorts by that column', hu: 'Ellenőrizd, hogy a lista az oszlop szerint rendeződik' },
          { en: 'Click again to reverse sort order', hu: 'Kattints újra a rendezési sorrend megfordításához' },
          { en: 'Verify ascending/descending toggle works', hu: 'Ellenőrizd, hogy a növekvő/csökkenő váltás működik' },
        ],
        expected: { en: 'Guest list columns are sortable with asc/desc toggle', hu: 'Vendéglista oszlopok rendezhetők növekvő/csökkenő váltással' },
      },
      {
        nameEn: 'Admin Rate Limits & Partner Validation',
        nameHu: 'Admin Rate Limit & Partner Validáció',
        steps: [
          { en: 'Try to create a guest with an invalid partner email', hu: 'Próbálj vendéget létrehozni érvénytelen partner email-lel' },
          { en: 'Verify validation error message appears', hu: 'Ellenőrizd, hogy validációs hibaüzenet jelenik meg' },
          { en: 'Try to send many emails rapidly', hu: 'Próbálj sok emailt gyorsan küldeni' },
          { en: 'Verify rate limiting kicks in after threshold', hu: 'Ellenőrizd, hogy a rate limit bekapcsol a küszöb után' },
        ],
        expected: { en: 'Partner email validation and rate limiting work correctly', hu: 'Partner email validáció és rate limit helyesen működik' },
      },
      {
        nameEn: 'Dark Mode — Magic Link Badges',
        nameHu: 'Dark Mode — Magic Link Badge-ek',
        steps: [
          { en: 'Enable dark mode in admin', hu: 'Kapcsold be a dark mode-ot az adminban' },
          { en: 'Navigate to Guest List', hu: 'Navigálj a Vendéglistára' },
          { en: 'Find guests with magic link status badges', hu: 'Keress vendégeket magic link státusz badge-ekkel' },
          { en: 'Verify badges are readable with good contrast on dark background', hu: 'Ellenőrizd, hogy a badge-ek olvashatók jó kontraszttal sötét háttéren' },
        ],
        expected: { en: 'Magic link badges have proper contrast in dark mode', hu: 'Magic link badge-ek megfelelő kontraszttal rendelkeznek dark mode-ban' },
      },
    ],
  },
  {
    version: '3.2.0',
    date: '2026-01-28',
    features: [
      {
        nameEn: 'Outlook-Compatible Email Templates',
        nameHu: 'Outlook-Kompatibilis Email Sablonok',
        steps: [
          { en: 'Send a test email to an Outlook account', hu: 'Küldj teszt emailt egy Outlook fiókba' },
          { en: 'Verify email renders correctly (no broken layout)', hu: 'Ellenőrizd, hogy az email helyesen jelenik meg (nincs törött elrendezés)' },
          { en: 'Check images, logos, and formatting', hu: 'Ellenőrizd a képeket, logókat és formázást' },
          { en: 'Test in Gmail and Apple Mail for comparison', hu: 'Teszteld Gmail-ben és Apple Mail-ben összehasonlításként' },
        ],
        expected: { en: 'Email templates render correctly in Outlook, Gmail, and Apple Mail', hu: 'Email sablonok helyesen jelennek meg Outlook-ban, Gmail-ben és Apple Mail-ben' },
      },
    ],
  },
  {
    version: '3.1.0',
    date: '2026-01-26',
    features: [
      {
        nameEn: 'Registration Form — Seating Preferences Removed',
        nameHu: 'Regisztrációs Űrlap — Ülésrendi Preferenciák Eltávolítva',
        steps: [
          { en: 'Open a guest registration form via magic link', hu: 'Nyiss meg egy vendég regisztrációs űrlapot magic link-kel' },
          { en: 'Verify there is NO seating preferences field', hu: 'Ellenőrizd, hogy NINCS ülésrendi preferenciák mező' },
          { en: 'Complete the registration', hu: 'Fejezd be a regisztrációt' },
          { en: 'Check the admin feedback email for position field', hu: 'Ellenőrizd az admin visszajelző emailben a pozíció mezőt' },
        ],
        expected: { en: 'Seating preferences removed from registration, position shown in feedback emails', hu: 'Ülésrendi preferenciák eltávolítva a regisztrációból, pozíció megjelenik a visszajelző emailekben' },
      },
      {
        nameEn: 'Consent Checkboxes — Dark Background',
        nameHu: 'Hozzájárulás Checkboxok — Sötét Háttér',
        steps: [
          { en: 'Open registration form on a page with dark background', hu: 'Nyisd meg a regisztrációs űrlapot sötét hátterű oldalon' },
          { en: 'Look at the consent/GDPR checkboxes', hu: 'Nézd meg a hozzájárulás/GDPR checkboxokat' },
          { en: 'Verify text is readable and checkbox is visible', hu: 'Ellenőrizd, hogy a szöveg olvasható és a checkbox látható' },
        ],
        expected: { en: 'Consent checkboxes are clearly visible on dark backgrounds', hu: 'Hozzájárulás checkboxok jól láthatóak sötét háttéren' },
      },
    ],
  },
  {
    version: '3.0.0',
    date: '2026-01-25',
    features: [
      {
        nameEn: 'Client Feedback — Email Improvements',
        nameHu: 'Ügyfél Visszajelzés — Email Fejlesztések',
        steps: [
          { en: 'Preview various email templates', hu: 'Nézd meg a különböző email sablonok előnézetét' },
          { en: 'Verify wording, layout, and branding match latest client feedback', hu: 'Ellenőrizd, hogy a szövegezés, elrendezés és arculat megfelel a legfrissebb ügyfél visszajelzésnek' },
          { en: 'Send a test email and verify rendering', hu: 'Küldj teszt emailt és ellenőrizd a megjelenítést' },
        ],
        expected: { en: 'Email templates reflect client feedback improvements', hu: 'Email sablonok tükrözik az ügyfél visszajelzés javításait' },
      },
      {
        nameEn: 'Partner Display — Guest List Fix',
        nameHu: 'Partner Megjelenítés — Vendéglista Javítás',
        steps: [
          { en: 'Go to Guest List, find a guest who IS a partner', hu: 'Menj a Vendéglistára, keress egy vendéget aki partner' },
          { en: 'Verify the partner column does NOT show their own partner info redundantly', hu: 'Ellenőrizd, hogy a partner oszlop NEM mutatja redundánsan a saját partner infóját' },
          { en: 'Find a main guest with a partner', hu: 'Keress egy fő vendéget akinek van partnere' },
          { en: 'Verify partner info is shown correctly', hu: 'Ellenőrizd, hogy a partner info helyesen jelenik meg' },
        ],
        expected: { en: 'Partner info only shown for main guests, not for partner guests themselves', hu: 'Partner info csak fő vendégeknél jelenik meg, nem maguknál a partner vendégeknél' },
      },
      {
        nameEn: 'UI Fixes — Registration Screens',
        nameHu: 'UI Javítások — Regisztrációs Képernyők',
        steps: [
          { en: 'Open various registration pages (VIP, paid)', hu: 'Nyiss meg különböző regisztrációs oldalakat (VIP, fizetős)' },
          { en: 'Verify no status badge or VIP labels appear on registration screens', hu: 'Ellenőrizd, hogy nincs státusz badge vagy VIP címke a regisztrációs képernyőkön' },
          { en: 'Verify QR email delay is 3 minutes (not 5)', hu: 'Ellenőrizd, hogy a QR email késleltetés 3 perc (nem 5)' },
        ],
        expected: { en: 'Clean registration screens without unnecessary badges, faster QR delivery', hu: 'Tiszta regisztrációs képernyők felesleges badge-ek nélkül, gyorsabb QR kézbesítés' },
      },
    ],
  },
  {
    version: '2.16.0',
    date: '2026-01-22',
    features: [
      {
        nameEn: 'Simplified VIP Registration Flow',
        nameHu: 'Egyszerűsített VIP Regisztrációs Folyamat',
        steps: [
          { en: 'Open a VIP guest magic link', hu: 'Nyiss meg egy VIP vendég magic linket' },
          { en: 'Click "YES, I WILL ATTEND" button', hu: 'Kattints a "YES, I WILL ATTEND" gombra' },
          { en: 'Verify you go DIRECTLY to registration form', hu: 'Ellenőrizd, hogy KÖZVETLENÜL a regisztrációs űrlapra kerülsz' },
          { en: 'Verify NO "Thank You for Your Response" intermediate screen appears', hu: 'Ellenőrizd, hogy NINCS "Thank You for Your Response" közbülső képernyő' },
          { en: 'Fill out the form and submit', hu: 'Töltsd ki az űrlapot és küldd el' },
          { en: 'Verify registration succeeds', hu: 'Ellenőrizd, hogy a regisztráció sikeres' },
        ],
        expected: { en: 'VIP registration goes directly from invitation to form without intermediate screen', hu: 'VIP regisztráció közvetlenül a meghívóról az űrlapra megy közbülső képernyő nélkül' }
      },
      {
        nameEn: 'Streamlined Magic Link Flow',
        nameHu: 'Egyszerűsített Magic Link Folyamat',
        steps: [
          { en: 'Create a new VIP guest and send magic link', hu: 'Hozz létre új VIP vendéget és küldj magic linket' },
          { en: 'Click the magic link in the email', hu: 'Kattints a magic linkre az emailben' },
          { en: 'Verify you go DIRECTLY to VIP registration form', hu: 'Ellenőrizd, hogy KÖZVETLENÜL a VIP regisztrációs űrlapra kerülsz' },
          { en: 'Verify NO welcome/landing page appears', hu: 'Ellenőrizd, hogy NINCS üdvözlő/landing oldal' },
          { en: 'Create a paying guest and send magic link', hu: 'Hozz létre fizető vendéget és küldj magic linket' },
          { en: 'Click magic link - verify direct redirect to paid registration', hu: 'Kattints a magic linkre - ellenőrizd a közvetlen átirányítást a paid regisztrációra' },
        ],
        expected: { en: 'Magic link redirects directly to appropriate registration form without intermediate pages', hu: 'Magic link közvetlenül a megfelelő regisztrációs űrlapra irányít közbülső oldalak nélkül' }
      },
      {
        nameEn: 'Shortened GDPR Consent Text',
        nameHu: 'Rövidített GDPR Hozzájárulás',
        steps: [
          { en: 'Open VIP or Paid registration form', hu: 'Nyisd meg a VIP vagy Paid regisztrációs űrlapot' },
          { en: 'Scroll to the consent checkboxes section', hu: 'Görgess a beleegyezés checkboxok szekcióhoz' },
          { en: 'Verify GDPR text is SHORT (1-2 sentences)', hu: 'Ellenőrizd, hogy a GDPR szöveg RÖVID (1-2 mondat)' },
          { en: 'Verify "Privacy Policy" link is present', hu: 'Ellenőrizd, hogy a "Privacy Policy" link jelen van' },
          { en: 'Click Privacy Policy link - should open bbj.hu/about/privacy/', hu: 'Kattints a Privacy Policy linkre - meg kell nyílnia a bbj.hu/about/privacy/ oldalnak' },
        ],
        expected: { en: 'GDPR consent is brief with working Privacy Policy link', hu: 'GDPR hozzájárulás rövid, működő Privacy Policy linkkel' }
      },
      {
        nameEn: 'Updated Footer Links',
        nameHu: 'Frissített Footer Linkek',
        steps: [
          { en: 'Visit VIP registration page', hu: 'Látogasd meg a VIP regisztrációs oldalt' },
          { en: 'Scroll to footer, verify "Find answers in our FAQs" text', hu: 'Görgess a footerhez, ellenőrizd a "Find answers in our FAQs" szöveget' },
          { en: 'Visit registration success page', hu: 'Látogasd meg a regisztráció sikeres oldalt' },
          { en: 'Verify same FAQ link text in footer', hu: 'Ellenőrizd ugyanazt a FAQ link szöveget a footerben' },
          { en: 'Check /status page footer', hu: 'Ellenőrizd a /status oldal footerét' },
          { en: 'Check /pwa pages footer', hu: 'Ellenőrizd a /pwa oldalak footerét' },
        ],
        expected: { en: 'All pages show "Find answers in our FAQs" instead of "View Registration Guide"', hu: 'Minden oldal "Find answers in our FAQs" szöveget mutat "View Registration Guide" helyett' }
      },
      {
        nameEn: 'Removed VIP Status Display',
        nameHu: 'VIP Státusz Eltávolítva',
        steps: [
          { en: 'Register as VIP guest and go to AlreadyRegistered page', hu: 'Regisztrálj VIP vendégként és menj az AlreadyRegistered oldalra' },
          { en: 'Verify "✓ Attendance confirmed" status IS shown', hu: 'Ellenőrizd, hogy "✓ Részvétel megerősítve" státusz LÁTHATÓ' },
          { en: 'Verify "VIP guest status" or similar IS NOT shown', hu: 'Ellenőrizd, hogy "VIP vendég státusz" vagy hasonló NEM látható' },
          { en: 'Check registration success page for VIP', hu: 'Ellenőrizd a regisztráció sikeres oldalt VIP esetén' },
          { en: 'Verify no VIP-specific status badge appears', hu: 'Ellenőrizd, hogy nem jelenik meg VIP-specifikus státusz badge' },
        ],
        expected: { en: 'VIP status indicator removed, attendance confirmation remains', hu: 'VIP státusz jelző eltávolítva, részvétel megerősítés megmaradt' }
      },
      {
        nameEn: 'Favicon and Title Correction',
        nameHu: 'Favicon és Cím Javítás',
        steps: [
          { en: 'Visit any page on ceogala.mflevents.space', hu: 'Látogass meg bármely oldalt a ceogala.mflevents.space-en' },
          { en: 'Check browser tab - verify BBJ favicon (not default Next.js)', hu: 'Ellenőrizd a böngésző fület - BBJ favicon legyen (nem default Next.js)' },
          { en: 'Verify page title is "CEO Gala 2026" (no accent, no suffix)', hu: 'Ellenőrizd, hogy az oldal címe "CEO Gala 2026" (ékezet és utótag nélkül)' },
          { en: 'Check multiple pages - title should be consistent', hu: 'Ellenőrizz több oldalt - a cím legyen konzisztens' },
        ],
        expected: { en: 'BBJ favicon and "CEO Gala 2026" title on all pages', hu: 'BBJ favicon és "CEO Gala 2026" cím minden oldalon' }
      },
    ],
  },
  {
    version: '2.15.0',
    date: '2026-01-21',
    features: [
      {
        nameEn: 'Name Field Split (first_name / last_name)',
        nameHu: 'Név Mező Szétbontás (first_name / last_name)',
        steps: [
          { en: 'Open admin guest list', hu: 'Nyisd meg az admin vendéglistát' },
          { en: 'Click "Add Guest" button', hu: 'Kattints az "Add Guest" gombra' },
          { en: 'Verify separate "First Name" and "Last Name" fields exist', hu: 'Ellenőrizd, hogy külön "Keresztnév" és "Vezetéknév" mezők vannak' },
          { en: 'Create a guest with both name fields', hu: 'Hozz létre vendéget mindkét név mezővel' },
          { en: 'Edit the guest and verify names saved correctly', hu: 'Szerkeszd a vendéget és ellenőrizd, hogy a nevek helyesen mentődtek' },
          { en: 'Check guest appears correctly in list (full name displayed)', hu: 'Ellenőrizd, hogy a vendég helyesen jelenik meg a listában (teljes név)' },
        ],
        expected: { en: 'Name fields split into first_name and last_name across the system', hu: 'Név mezők szétbontva first_name és last_name mezőkre a rendszerben' }
      },
      {
        nameEn: 'Dark Theme Registration Pages',
        nameHu: 'Sötét Téma Regisztrációs Oldalakon',
        steps: [
          { en: 'Open VIP registration page via magic link', hu: 'Nyisd meg a VIP regisztrációs oldalt magic linkkel' },
          { en: 'Verify dark background (#0c0d0e or similar)', hu: 'Ellenőrizd a sötét hátteret (#0c0d0e vagy hasonló)' },
          { en: 'Verify gold accent colors (#d1aa67)', hu: 'Ellenőrizd az arany akcentszíneket (#d1aa67)' },
          { en: 'Check paid registration page', hu: 'Ellenőrizd a paid regisztrációs oldalt' },
          { en: 'Verify consistent dark theme', hu: 'Ellenőrizd a konzisztens sötét témát' },
        ],
        expected: { en: 'Registration pages have elegant dark theme with gold accents', hu: 'Regisztrációs oldalak elegáns sötét témával és arany kiemelésekkel' }
      },
      {
        nameEn: 'Title Display in All Emails',
        nameHu: 'Címzés Megjelenítés Minden Emailben',
        steps: [
          { en: 'Create a VIP guest with title (e.g., Dr.)', hu: 'Hozz létre VIP vendéget címzéssel (pl. Dr.)' },
          { en: 'Send magic link email', hu: 'Küldj magic link emailt' },
          { en: 'Verify greeting includes title: "Dear Dr. Name,"', hu: 'Ellenőrizd, hogy a megszólítás tartalmazza a címzést: "Dear Dr. Név,"' },
          { en: 'Complete registration and receive ticket email', hu: 'Fejezd be a regisztrációt és kapj jegy emailt' },
          { en: 'Verify title in ticket email greeting', hu: 'Ellenőrizd a címzést a jegy email megszólításában' },
        ],
        expected: { en: 'Guest titles appear in all email greetings', hu: 'Vendég címzések megjelennek minden email megszólításban' }
      },
      {
        nameEn: 'Subtle Decline Button',
        nameHu: 'Visszafogott Elutasítás Gomb',
        steps: [
          { en: 'Open VIP registration invitation page', hu: 'Nyisd meg a VIP regisztrációs meghívó oldalt' },
          { en: 'Verify "YES, I WILL ATTEND" button is prominent (solid, red)', hu: 'Ellenőrizd, hogy a "YES, I WILL ATTEND" gomb hangsúlyos (egyszínű, piros)' },
          { en: 'Verify "I cannot attend" button is subtle (outline style, muted)', hu: 'Ellenőrizd, hogy az "I cannot attend" gomb visszafogott (körvonal stílus, halványabb)' },
          { en: 'Verify visual hierarchy encourages acceptance', hu: 'Ellenőrizd, hogy a vizuális hierarchia a részvételt ösztönzi' },
        ],
        expected: { en: 'Decline button is less prominent than accept button', hu: 'Elutasítás gomb kevésbé hangsúlyos mint az elfogadás gomb' }
      },
      {
        nameEn: 'Updated Attendance Commitment Text',
        nameHu: 'Frissített Részvételi Kötelezettség',
        steps: [
          { en: 'Open VIP registration form', hu: 'Nyisd meg a VIP regisztrációs űrlapot' },
          { en: 'Scroll to "Attendance Commitment" checkbox', hu: 'Görgess az "Attendance Commitment" checkboxhoz' },
          { en: 'Verify text mentions "10 business days" cancellation notice', hu: 'Ellenőrizd, hogy a szöveg említi a "10 munkanap" lemondási határidőt' },
          { en: 'Verify text mentions "HUF 99,000 + VAT" no-show fee', hu: 'Ellenőrizd, hogy a szöveg említi a "HUF 99,000 + ÁFA" no-show díjat' },
        ],
        expected: { en: 'Attendance commitment includes cancellation policy and no-show fee', hu: 'Részvételi kötelezettség tartalmazza a lemondási szabályzatot és no-show díjat' }
      },
    ],
  },
  {
    version: '2.13.0',
    date: '2026-01-16',
    features: [
      {
        nameEn: 'Checked-In Registration Status',
        nameHu: 'Checked-In Regisztrációs Státusz',
        steps: [
          { en: 'Navigate to admin guest list', hu: 'Navigálj az admin vendéglistához' },
          { en: 'Note an approved guest\'s current status', hu: 'Jegyezd fel egy approved vendég jelenlegi státuszát' },
          { en: 'Go to check-in scanner (/checkin)', hu: 'Menj a check-in szkennerhez (/checkin)' },
          { en: 'Scan or manually check in the guest', hu: 'Szkenneld vagy manuálisan jelentkeztesd be a vendéget' },
          { en: 'Return to admin guest list', hu: 'Térj vissza az admin vendéglistához' },
          { en: 'Verify guest status changed to "Checked In" with emerald badge', hu: 'Ellenőrizd, hogy a vendég státusza "Checked In"-re változott smaragdzöld badge-dzsel' },
        ],
        expected: { en: 'Guest status automatically updates to checked_in with emerald green badge after check-in', hu: 'Vendég státusz automatikusan checked_in-re változik smaragdzöld badge-dzsel belépés után' }
      },
      {
        nameEn: 'Not Checked In Filter (No-Show)',
        nameHu: 'Nem Bejelentkezett Szűrő (No-Show)',
        steps: [
          { en: 'Navigate to admin guest list (/admin/guests)', hu: 'Navigálj az admin vendéglistához (/admin/guests)' },
          { en: 'Click on the Status filter dropdown', hu: 'Kattints a Státusz szűrő dropdownra' },
          { en: 'Verify "Not Checked In (No-Show)" option appears', hu: 'Ellenőrizd, hogy megjelenik a "Not Checked In (No-Show)" opció' },
          { en: 'Select "Not Checked In (No-Show)"', hu: 'Válaszd a "Not Checked In (No-Show)" opciót' },
          { en: 'Verify only approved guests without check-in are shown', hu: 'Ellenőrizd, hogy csak approved státuszú, be nem jelentkezett vendégek jelennek meg' },
          { en: 'Verify the list can be used for bulk email to no-show guests', hu: 'Ellenőrizd, hogy a lista használható no-show vendégeknek küldendő tömeges emailhez' },
        ],
        expected: { en: 'Filter shows only approved guests who have not checked in yet', hu: 'Szűrő csak azokat az approved vendégeket mutatja, akik még nem jelentkeztek be' }
      },
      {
        nameEn: 'Guest Name Highlighting',
        nameHu: 'Vendég Név Kiemelés',
        steps: [
          { en: 'Open a VIP registration magic link', hu: 'Nyiss meg egy VIP regisztrációs magic linket' },
          { en: 'Verify guest name is prominently displayed (large, bold, accent color)', hu: 'Ellenőrizd, hogy a vendég neve kiemelten jelenik meg (nagy, félkövér, akcentszín)' },
          { en: 'Open a Paid registration magic link', hu: 'Nyiss meg egy Paid regisztrációs magic linket' },
          { en: 'Verify guest name is prominently displayed', hu: 'Ellenőrizd, hogy a vendég neve kiemelten jelenik meg' },
          { en: 'Check RegisterWelcome page if applicable', hu: 'Ellenőrizd a RegisterWelcome oldalt ha alkalmazható' },
        ],
        expected: { en: 'Guest name is large, bold and visually prominent on all registration pages', hu: 'Vendég neve nagy, félkövér és vizuálisan kiemelt minden regisztrációs oldalon' }
      },
      {
        nameEn: 'Partner Title Required Validation',
        nameHu: 'Partner Címzés Kötelező Validáció',
        steps: [
          { en: 'Open VIP registration with magic link', hu: 'Nyiss meg VIP regisztrációt magic linkkel' },
          { en: 'Check "I would like to bring a partner"', hu: 'Jelöld be a "Szeretnék partnert hozni" opciót' },
          { en: 'Fill in partner name and email but leave title empty', hu: 'Töltsd ki a partner nevét és emailjét de hagyd üresen a címzést' },
          { en: 'Try to submit the form', hu: 'Próbáld elküldeni az űrlapot' },
          { en: 'Verify validation error appears for partner title', hu: 'Ellenőrizd, hogy validációs hiba jelenik meg a partner címzéshez' },
          { en: 'Select a partner title and verify form submits successfully', hu: 'Válassz partner címzést és ellenőrizd, hogy az űrlap sikeresen elküldhető' },
          { en: 'Repeat for Paid registration form', hu: 'Ismételd meg a Paid regisztrációs űrlapon' },
        ],
        expected: { en: 'Partner title is required and shows validation error when missing', hu: 'Partner címzés kötelező és validációs hibát mutat ha hiányzik' }
      },
      {
        nameEn: 'CEO Gála 2026 Branding',
        nameHu: 'CEO Gála 2026 Márkajelzés',
        steps: [
          { en: 'Visit homepage (/)', hu: 'Látogasd meg a főoldalt (/)' },
          { en: 'Verify "CEO Gála 2026" appears (not "BBJ Events 2026")', hu: 'Ellenőrizd, hogy "CEO Gála 2026" jelenik meg (nem "BBJ Events 2026")' },
          { en: 'Visit /apply page', hu: 'Látogasd meg az /apply oldalt' },
          { en: 'Verify "CEO Gála 2026" branding', hu: 'Ellenőrizd a "CEO Gála 2026" márkajelzést' },
          { en: 'Open VIP registration page via magic link', hu: 'Nyisd meg a VIP regisztrációs oldalt magic linkkel' },
          { en: 'Verify "CEO Gála 2026" appears in event details', hu: 'Ellenőrizd, hogy "CEO Gála 2026" jelenik meg az esemény részletekben' },
          { en: 'Check registration success page', hu: 'Ellenőrizd a regisztráció sikeres oldalt' },
          { en: 'Check PWA pages (/pwa)', hu: 'Ellenőrizd a PWA oldalakat (/pwa)' },
        ],
        expected: { en: '"CEO Gála 2026" appears everywhere instead of "BBJ Events 2026"', hu: '"CEO Gála 2026" jelenik meg mindenhol "BBJ Events 2026" helyett' }
      },
      {
        nameEn: 'Partner Seating Preferences Removed',
        nameHu: 'Partner Ültetési Preferenciák Eltávolítva',
        steps: [
          { en: 'Open VIP registration with partner option', hu: 'Nyiss meg VIP regisztrációt partner opcióval' },
          { en: 'Check "I would like to bring a partner"', hu: 'Jelöld be a "Szeretnék partnert hozni" opciót' },
          { en: 'Verify NO "Partner Seating Preferences" field exists', hu: 'Ellenőrizd, hogy NINCS "Partner Ültetési Preferenciák" mező' },
          { en: 'Verify main guest "Seating Preferences" field DOES exist', hu: 'Ellenőrizd, hogy a fő vendég "Ültetési Preferenciák" mezője LÉTEZIK' },
          { en: 'Repeat for Paid registration with paired ticket', hu: 'Ismételd meg Paid regisztrációnál páros jeggyel' },
        ],
        expected: { en: 'Partner seating preferences removed, main guest seating preferences retained', hu: 'Partner ültetési preferenciák eltávolítva, fő vendég preferenciái megmaradtak' }
      },
      {
        nameEn: 'Email Greeting Punctuation',
        nameHu: 'Email Megszólítás Írásjel',
        steps: [
          { en: 'Create a new VIP guest in admin', hu: 'Hozz létre új VIP vendéget az adminban' },
          { en: 'Send magic link email to the guest', hu: 'Küldj magic link emailt a vendégnek' },
          { en: 'Open the received email', hu: 'Nyisd meg a kapott emailt' },
          { en: 'Verify greeting uses comma: "Dear Dr. Kovács," (not "!")', hu: 'Ellenőrizd, hogy a megszólítás vesszőt használ: "Dear Dr. Kovács," (nem "!")' },
          { en: 'Check other email types (ticket, confirmation)', hu: 'Ellenőrizd a többi email típust (jegy, visszaigazolás)' },
        ],
        expected: { en: 'All email greetings use comma instead of exclamation mark', hu: 'Minden email megszólítás vesszőt használ felkiáltójel helyett' }
      },
    ],
  },
  {
    version: '2.12.0',
    date: '2026-01-15',
    features: [
      {
        nameEn: 'Partner Title Field',
        nameHu: 'Partner Címzés Mező',
        steps: [
          { en: 'Navigate to VIP registration page with magic link', hu: 'Navigálj a VIP regisztrációs oldalra magic link-kel' },
          { en: 'Check "I would like to bring a partner" checkbox', hu: 'Jelöld be a "Szeretnék partnert hozni" checkboxot' },
          { en: 'Verify Partner Title dropdown appears', hu: 'Ellenőrizd, hogy megjelenik a Partner Címzés dropdown' },
          { en: 'Select a title (Mr., Ms., Mrs., Dr., Prof., Prof. Dr.)', hu: 'Válassz egy címzést (Mr., Ms., Mrs., Dr., Prof., Prof. Dr.)' },
          { en: 'Fill partner details and submit registration', hu: 'Töltsd ki a partner adatait és küldd el a regisztrációt' },
          { en: 'Check admin guest list - verify partner title is saved', hu: 'Ellenőrizd az admin vendéglistát - a partner címzés mentve van' },
        ],
        expected: { en: 'Partner title dropdown works and saves correctly', hu: 'Partner címzés dropdown működik és helyesen ment' }
      },
      {
        nameEn: 'AlreadyRegistered Contrast Enhancement',
        nameHu: 'AlreadyRegistered Kontraszt Javítás',
        steps: [
          { en: 'Register a VIP guest through magic link', hu: 'Regisztrálj egy VIP vendéget magic link-kel' },
          { en: 'Click the same magic link again', hu: 'Kattints újra ugyanarra a magic linkre' },
          { en: 'Verify "Already Registered" page appears', hu: 'Ellenőrizd, hogy megjelenik az "Már Regisztráltál" oldal' },
          { en: 'Check text visibility - all text should be readable', hu: 'Ellenőrizd a szöveg láthatóságát - minden szöveg olvasható legyen' },
          { en: 'Verify green status box has proper contrast', hu: 'Ellenőrizd, hogy a zöld státusz doboz megfelelő kontraszttal rendelkezik' },
          { en: 'Verify event info box has proper contrast', hu: 'Ellenőrizd, hogy az esemény info doboz megfelelő kontraszttal rendelkezik' },
        ],
        expected: { en: 'All text is clearly visible with proper contrast on AlreadyRegistered page', hu: 'Minden szöveg jól látható megfelelő kontraszttal az AlreadyRegistered oldalon' }
      },
      {
        nameEn: 'BBJ Logo Size in Email',
        nameHu: 'BBJ Logo Méret Emailben',
        steps: [
          { en: 'Create a new VIP guest in admin', hu: 'Hozz létre új VIP vendéget az adminban' },
          { en: 'Send magic link email to the guest', hu: 'Küldj magic link emailt a vendégnek' },
          { en: 'Open the received email', hu: 'Nyisd meg a kapott emailt' },
          { en: 'Scroll to the BBJ logo at the bottom', hu: 'Görgess le a BBJ logóhoz az email alján' },
          { en: 'Verify logo is larger (300px width)', hu: 'Ellenőrizd, hogy a logo nagyobb (300px széles)' },
        ],
        expected: { en: 'BBJ logo displays at 300px width in invitation emails', hu: 'BBJ logo 300px szélességben jelenik meg a meghívó emailekben' }
      },
      {
        nameEn: 'Font Comparison Tool',
        nameHu: 'Font Összehasonlító Eszköz',
        steps: [
          { en: 'Navigate to /docs/font-comparison.html', hu: 'Navigálj a /docs/font-comparison.html oldalra' },
          { en: 'Verify original ceogala.com screenshot is displayed', hu: 'Ellenőrizd, hogy az eredeti ceogala.com screenshot megjelenik' },
          { en: 'Compare Arial, Arimo Light, Open Sans Light samples', hu: 'Hasonlítsd össze az Arial, Arimo Light, Open Sans Light mintákat' },
          { en: 'Verify all samples use #000d38 navy background', hu: 'Ellenőrizd, hogy minden minta #000d38 navy hátteret használ' },
          { en: 'Check that Arimo Light (300) is marked as "LEGJOBB EGYEZÉS"', hu: 'Ellenőrizd, hogy az Arimo Light (300) "LEGJOBB EGYEZÉS" jelzéssel van ellátva' },
        ],
        expected: { en: 'Font comparison tool displays all font options for client review', hu: 'Font összehasonlító eszköz megjeleníti az összes font opciót ügyfél áttekintéshez' }
      },
    ],
  },
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
    helpGuide: 'Súgó',
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
    helpGuide: 'Help Guide',
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
          <Link href={selectedVersion ? `/admin/changelog#v${selectedVersion.replace(/\./g, '-')}` : '/admin/changelog'} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary">
            <ArrowLeft className="w-4 h-4" />{t.backToChangelog}
          </Link>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <Link href="/admin/help" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-green-600 dark:hover:text-green-400">
            <Question className="w-4 h-4" />{t.helpGuide}
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
                  <a href={`/admin/changelog#v${release.version.replace(/\./g, '-')}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors border border-purple-300 dark:border-purple-600">
                    <ArrowLeft className="w-3 h-3" />{t.backToChangelog}
                  </a>
                  <a href="/admin/help" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors border border-green-300 dark:border-green-600">
                    <Question className="w-3 h-3" weight="bold" />{t.helpGuide}
                  </a>
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
