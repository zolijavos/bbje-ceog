# Changelog

Legfrissebb fejlesztések és javítások / Latest updates and improvements

---

## v2.16.0 (2026-01-22)

### New Features / Új funkciók

- **Simplified VIP Registration Flow** / **Egyszerűsített VIP Regisztrációs Folyamat**
  - EN: Removed unnecessary intermediate "Thank You for Your Response" screen from VIP registration. Users now go directly from invitation to registration form.
  - HU: Eltávolítottuk a felesleges "Thank You for Your Response" közbülső képernyőt a VIP regisztrációból. A felhasználók most közvetlenül a meghívóról a regisztrációs űrlapra kerülnek.

- **Streamlined Magic Link Flow** / **Egyszerűsített Magic Link Folyamat**
  - EN: Magic link now redirects directly to the appropriate registration form (VIP or Paid) without intermediate welcome page.
  - HU: A magic link most közvetlenül a megfelelő regisztrációs űrlapra irányít (VIP vagy fizetős) közbülső üdvözlő oldal nélkül.

### Improvements / Javítások

- **Shortened GDPR Consent Text** / **Rövidített GDPR Hozzájárulás Szöveg**
  - EN: GDPR consent text simplified to a brief statement with link to Privacy Policy. Easier to read and understand.
  - HU: GDPR hozzájárulás szöveg egyszerűsítve rövid nyilatkozatra a Privacy Policy linkjével. Könnyebben olvasható és érthető.

- **Updated Footer Links** / **Frissített Footer Linkek**
  - EN: Changed "View Registration Guide" to "Find answers in our FAQs" across all guest-facing pages.
  - HU: "View Registration Guide" szöveg cserélve "Find answers in our FAQs"-ra minden vendégoldal footerében.

- **Smaller Footer Text** / **Kisebb Footer Szöveg**
  - EN: Footer text size reduced from 12px to 10px for better visual hierarchy.
  - HU: Footer szövegméret csökkentve 12px-ről 10px-re a jobb vizuális hierarchia érdekében.

- **Removed VIP Status Display** / **VIP Státusz Megjelenítés Eltávolítva**
  - EN: Removed "VIP guest status" indicator from guest pages. "Attendance confirmed" status remains visible.
  - HU: "VIP vendég státusz" jelző eltávolítva a vendég oldalakról. "Részvétel megerősítve" státusz továbbra is látható.

### Email Templates / Email Sablonok

- **Feedback Email** / **Visszajelzés Email**
  - EN: Updated feedback email template with improved formatting.
  - HU: Frissített visszajelzés email sablon javított formázással.

- **Confirmation Email** / **Visszaigazolás Email**
  - EN: Updated confirmation email template with improved formatting.
  - HU: Frissített visszaigazolás email sablon javított formázással.

### Fixes / Hibajavítások

- **Favicon Corrected** / **Favicon Javítva**
  - EN: Fixed favicon to display correct BBJ icon in browser tab.
  - HU: Favicon javítva, a helyes BBJ ikon jelenik meg a böngésző fülön.

- **Page Title Standardized** / **Oldal Cím Egységesítve**
  - EN: Standardized page title to "CEO Gala 2026" across all pages (removed accent and "- Event Platform" suffix).
  - HU: Oldal cím egységesítve "CEO Gala 2026"-ra minden oldalon (ékezet és "- Event Platform" utótag eltávolítva).

---

## v2.15.0 (2026-01-21)

### Breaking Changes / Törő Változások

- **Database Schema: Name Field Split** / **Adatbázis Séma: Név Mező Szétbontás**
  - EN: **MIGRATION REQUIRED** - The `name` fields have been split into `first_name` and `last_name` across all tables:
    - `guests.name` → `guests.first_name` + `guests.last_name`
    - `registrations.partner_name` → `registrations.partner_first_name` + `registrations.partner_last_name`
    - `users.name` → `users.first_name` + `users.last_name`
    - `billing_info.billing_name` → `billing_info.billing_first_name` + `billing_info.billing_last_name`
  - HU: **MIGRÁCIÓ SZÜKSÉGES** - A `name` mezők szét lettek bontva `first_name` és `last_name` mezőkre minden táblában.

### New Features / Új funkciók

- **Dark Theme Registration Pages** / **Sötét Téma Regisztrációs Oldalakon**
  - EN: All registration pages now feature a dark theme with `#0c0d0e` background and `#d1aa67` gold accents. Provides elegant, premium look matching event branding.
  - HU: Minden regisztrációs oldal sötét témát kapott `#0c0d0e` háttérrel és `#d1aa67` arany kiemelésekkel. Elegáns, prémium megjelenés az esemény arculatához.

- **Updated Magic Link Email Template** / **Frissített Magic Link Email Sablon**
  - EN: New HIPA-compliant email design with Verdana 15px font, BBJ logo, and dark blue guest name highlighting. More professional appearance.
  - HU: Új HIPA-kompatibilis email dizájn Verdana 15px betűtípussal, BBJ logóval és sötétkék vendégnév kiemeléssel.

- **Title Display in All Emails** / **Címzés Megjelenítés Minden Emailben**
  - EN: Guest titles (Dr., Prof., etc.) now appear in all email greetings including bulk emails, scheduled emails, and magic link emails.
  - HU: Vendég címzések (Dr., Prof., stb.) mostantól megjelennek minden email megszólításban, beleértve a tömeges, ütemezett és magic link emaileket.

- **Removed Link Fallback from Emails** / **Link Fallback Eltávolítva Emailekből**
  - EN: Removed "If the button doesn't work, copy this link" fallback section from magic link and applicant approval emails for cleaner design.
  - HU: "Ha a gomb nem működik, másold ki a linket" fallback szekció eltávolítva a magic link és jelentkező jóváhagyás emailekből a tisztább dizájn érdekében.

### Improvements / Javítások

- **Subtle Decline Button** / **Visszafogott Elutasítás Gomb**
  - EN: The decline/reject button on registration pages is now less prominent (outline style) to encourage acceptance.
  - HU: Az elutasítás gomb a regisztrációs oldalakon visszafogottabb (körvonal stílus) a részvétel ösztönzésére.

- **"Gála" → "Gala" Text Change** / **"Gála" → "Gala" Szöveg Változás**
  - EN: Changed Hungarian "Gála" spelling to English "Gala" across all user-facing text for consistency.
  - HU: Magyar "Gála" helyett angol "Gala" írás minden felhasználói szövegben az egységesség érdekében.

- **English Title Dropdown Options** / **Angol Címzés Dropdown Opciók**
  - EN: Changed Hungarian title options (ifj., id.) to English equivalents (Jr., Sr.) in the dropdown.
  - HU: Magyar címzés opciók (ifj., id.) lecserélve angol megfelelőkre (Jr., Sr.) a legördülő menüben.

- **Updated Attendance Commitment Text** / **Frissített Részvételi Kötelezettség Szöveg**
  - EN: Updated consent checkbox with 10 business days cancellation notice and HUF 99,000 + VAT no-show fee policy.
  - HU: Frissített beleegyezés checkbox 10 munkanap lemondási határidővel és HUF 99,000 + ÁFA no-show díj szabályzattal.

---

## v2.13.5 (2026-01-19)

### Deployment Fixes / Telepítési Javítások

- **Build Dependencies in Production** / **Build Függőségek Production-ben**
  - EN: Moved build-time dependencies from devDependencies to dependencies for `npm install --omit=dev` compatibility: `prisma`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, and all `@types/*` packages (7 packages).
  - HU: Build idejű függőségek átkerültek a devDependencies-ből a dependencies-be az `npm install --omit=dev` kompatibilitásért: `prisma`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript` és az összes `@types/*` csomag (7 csomag).

- **Smart Database Setup** / **Intelligens Adatbázis Beállítás**
  - EN: `start.sh` now automatically detects fresh vs. existing database. Uses `prisma db push` for clean installs and `prisma migrate deploy` for existing databases.
  - HU: `start.sh` mostantól automatikusan felismeri a friss vs. létező adatbázist. Friss telepítéshez `prisma db push`-t, létező adatbázishoz `prisma migrate deploy`-t használ.

- **Node.js Version Check** / **Node.js Verzió Ellenőrzés**
  - EN: Added Node.js 18+ version check at startup. Deployment fails with clear error message if older Node.js version detected.
  - HU: Node.js 18+ verzió ellenőrzés hozzáadva induláskor. Telepítés érthetően hibaüzenettel leáll, ha régebbi Node.js verzió van.

- **Environment Validation** / **Környezeti Változók Validálása**
  - EN: `NEXTAUTH_SECRET` must be at least 64 characters. Build will fail with clear error if shorter.
  - HU: `NEXTAUTH_SECRET` minimum 64 karakter kell legyen. Build világos hibaüzenettel leáll, ha rövidebb.

- **npmrc Inclusion** / **npmrc Beépítés**
  - EN: Release package now includes `.npmrc` with `legacy-peer-deps=true` to resolve nodemailer peer dependency conflicts.
  - HU: Release csomag mostantól tartalmazza az `.npmrc` fájlt `legacy-peer-deps=true` beállítással a nodemailer peer dependency konfliktusok megoldásához.

---

## v2.13.0 (2026-01-16)

### New Features / Új funkciók

- **Checked-In Registration Status** / **Checked-In Regisztrációs Státusz**
  - EN: New `checked_in` registration status added. When a guest checks in at the event, their status automatically updates to `checked_in`. Displayed with emerald green badge in admin guest list.
  - HU: Új `checked_in` regisztrációs státusz. Amikor a vendég belép az eseményre, státusza automatikusan `checked_in`-re változik. Smaragdzöld badge-dzsel jelenik meg az admin vendéglistában.

- **Not Checked In Filter (No-Show)** / **Nem Bejelentkezett Szűrő (No-Show)**
  - EN: New "Not Checked In (No-Show)" filter option in admin guest list. Shows guests with `approved` status who haven't checked in yet. Useful for sending follow-up emails to no-show guests.
  - HU: Új "Not Checked In (No-Show)" szűrő opció az admin vendéglistában. Azokat a vendégeket mutatja, akik `approved` státuszúak de még nem jelentkeztek be. Hasznos no-show vendégeknek küldendő emailekhez.

### Improvements / Javítások

- **Guest Name Highlighting** / **Vendég Név Kiemelés**
  - EN: Guest name is now prominently displayed on all registration pages (RegisterWelcome, VIP, Paid). Large bold text with accent color for easy identification.
  - HU: Vendég neve mostantól kiemelten jelenik meg minden regisztrációs oldalon (RegisterWelcome, VIP, Paid). Nagy, félkövér szöveg akcentszínnel a könnyű azonosítás érdekében.

- **Partner Title Required** / **Partner Címzés Kötelező**
  - EN: Partner title field is now required on both VIP and Paid registration forms. Validation error shown if not selected when bringing a partner.
  - HU: Partner címzés mező mostantól kötelező mind a VIP, mind a Paid regisztrációs űrlapokon. Validációs hiba jelenik meg ha nincs kiválasztva partner hozásakor.

- **CEO Gála 2026 Branding** / **CEO Gála 2026 Márkajelzés**
  - EN: Updated branding from "BBJ Events 2026" to "CEO Gála 2026" across all guest-facing pages, email templates, and payment flows.
  - HU: Márkajelzés frissítve "BBJ Events 2026"-ról "CEO Gála 2026"-ra minden vendég-oldali oldalon, email sablonokban és fizetési folyamatokban.

- **Partner Seating Preferences Removed** / **Partner Ültetési Preferenciák Eltávolítva**
  - EN: Partner seating preferences field removed from registration forms. Main guest seating preferences still available.
  - HU: Partner ültetési preferenciák mező eltávolítva a regisztrációs űrlapokból. Fő vendég ültetési preferenciái továbbra is elérhetőek.

- **Email Greeting Punctuation** / **Email Megszólítás Írásjel**
  - EN: Changed email greeting punctuation from exclamation mark to comma. Example: "Dear Dr. Kovács," instead of "Dear Dr. Kovács!"
  - HU: Email megszólítás írásjele felkiáltójelről vesszőre változott. Példa: "Dear Dr. Kovács," a "Dear Dr. Kovács!" helyett.

---

## v2.12.0 (2026-01-15)

### New Features / Új funkciók

- **Partner Title Field** / **Partner Címzés Mező**
  - EN: VIP registration form now includes a title dropdown for partners (Mr., Ms., Mrs., Dr., Prof., Prof. Dr.). Title is stored and displayed with partner name.
  - HU: VIP regisztrációs űrlap mostantól tartalmaz címzés választót partnerekhez (Mr., Ms., Mrs., Dr., Prof., Prof. Dr.). A címzés tárolásra kerül és megjelenik a partner névvel.

### Improvements / Javítások

- **AlreadyRegistered Contrast Enhancement** / **AlreadyRegistered Kontraszt Javítás**
  - EN: Further improved text visibility on VIP AlreadyRegistered page. Changed backgrounds to lighter shades (green-50, slate-50) with proper borders for better readability.
  - HU: További javított szöveg láthatóság a VIP AlreadyRegistered oldalon. Világosabb háttérszínek (green-50, slate-50) megfelelő keretekkel a jobb olvashatóságért.

- **BBJ Logo Size in Email** / **BBJ Logo Méret Emailben**
  - EN: Increased BBJ logo size in invitation emails from 200px to 300px per client request.
  - HU: BBJ logo méret növelve a meghívó emailekben 200px-ről 300px-re ügyfél kérésre.

### Developer Tools / Fejlesztői Eszközök

- **Font Comparison Tool** / **Font Összehasonlító Eszköz**
  - EN: Created HTML comparison tool (`docs/font-comparison.html`) to evaluate Helvetica alternatives (Arimo, Open Sans, Arial) against ceogala.com design. Includes original screenshot reference with exact #000d38 navy background.
  - HU: HTML összehasonlító eszköz készült (`docs/font-comparison.html`) Helvetica alternatívák kiértékeléséhez (Arimo, Open Sans, Arial) a ceogala.com dizájnhoz. Tartalmazza az eredeti screenshotot #000d38 navy háttérrel.

- **Test Data CSV Files** / **Teszt Adat CSV Fájlok**
  - EN: Added test CSV files with sample guests (20 and 35 records) in various guest types (invited, paying_single, paying_paired) for testing imports.
  - HU: Teszt CSV fájlok hozzáadva minta vendégekkel (20 és 35 rekord) különböző vendég típusokkal (invited, paying_single, paying_paired) import teszteléshez.

---

## v2.11.0 (2026-01-14)

### New Features / Új funkciók

- **Bulk Email Guest Preview** / **Tömeges Email Vendég Előnézet**
  - EN: Guest list table now displays before bulk email scheduling. Shows filtered guests (max 50) with "X more guests..." indicator. Schedule button shows total guest count.
  - HU: Vendéglista táblázat mostantól megjelenik a tömeges email ütemezés előtt. Szűrt vendégeket mutat (max 50) "X további vendég..." jelzéssel. Ütemezés gomb mutatja az összes vendégszámot.

- **Array-Based Guest Filtering API** / **Tömb-Alapú Vendég Szűrő API**
  - EN: New API parameters for bulk operations: `guest_types` (comma-separated), `registration_statuses` (comma-separated), `is_vip_reception`, `has_ticket`, `has_table`. Limit increased from 100 to 500.
  - HU: Új API paraméterek tömeges műveletekhez: `guest_types` (vesszővel elválasztott), `registration_statuses` (vesszővel elválasztott), `is_vip_reception`, `has_ticket`, `has_table`. Limit növelve 100-ról 500-ra.

- **Release Testing Database Persistence** / **Release Tesztelés Adatbázis Perzisztencia**
  - EN: Release testing page now saves results to database. Features: checkbox per test step, comment section per feature, tester name tracking, CSV export (per version or all). New TestResult model in Prisma schema.
  - HU: Release tesztelés oldal mostantól adatbázisba menti az eredményeket. Funkciók: checkbox minden teszt lépéshez, megjegyzés szekció minden funkcióhoz, tesztelő név nyilvántartás, CSV export (verziónként vagy összes). Új TestResult model a Prisma sémában.

### Improvements / Javítások

- **VIP Registration Status Fix** / **VIP Regisztráció Státusz Javítás**
  - EN: VIP registration now correctly sets status to 'registered' instead of 'approved'. Fixed in 4 locations within registration service.
  - HU: VIP regisztráció most helyesen állítja a státuszt 'registered'-re 'approved' helyett. Javítva 4 helyen a regisztrációs szolgáltatásban.

- **AlreadyRegistered Page Contrast** / **AlreadyRegistered Oldal Kontraszt**
  - EN: Improved text visibility on VIP AlreadyRegistered page. Changed background from green-50 to green-100, added border, and darkened text color.
  - HU: Javított szöveg láthatóság a VIP AlreadyRegistered oldalon. Háttér módosítva green-50-ről green-100-ra, keret hozzáadva, szöveg színe sötétítve.

- **Seating - Invited Guests Visible** / **Ültetés - Meghívott Vendégek Láthatóak**
  - EN: Invited guests (status 'invited') now appear in the unassigned guests list for seating assignment. Previously only registered/approved guests were shown.
  - HU: Meghívott vendégek ('invited' státusz) mostantól megjelennek a nem hozzárendelt vendégek listájában ültetéshez. Korábban csak regisztrált/jóváhagyott vendégek jelentek meg.

- **Partner Detection Improvements** / **Partner Detektálás Javítások**
  - EN: Improved partner detection on seating tables page. Now detects partners via: guest_type 'paying_paired', ticket_type 'paid_paired', partner_of field, and registration partner_name.
  - HU: Javított partner detektálás az ültetési táblák oldalon. Partnerek felismerése: guest_type 'paying_paired', ticket_type 'paid_paired', partner_of mező, és registration partner_name alapján.

- **Date/Time Input Visibility** / **Dátum/Idő Input Láthatóság**
  - EN: Fixed date and time input visibility across all admin pages. Applied `bg-white text-gray-900` and `colorScheme: 'light'` styling to scheduled emails, check-in log, audit log, and payments pages.
  - HU: Javított dátum és idő input láthatóság minden admin oldalon. `bg-white text-gray-900` és `colorScheme: 'light'` stílus alkalmazva ütemezett emailek, check-in napló, audit napló és fizetések oldalakon.

- **Date/Time Input Split** / **Dátum/Idő Input Szétbontás**
  - EN: Separated datetime-local input into separate date and time inputs for better usability. Default time set to 10:00.
  - HU: datetime-local input szétbontva külön dátum és idő inputokra a jobb használhatóságért. Alapértelmezett idő 10:00-ra állítva.

- **MyForge Labs Logo Added** / **MyForge Labs Logo Hozzáadva**
  - EN: Added MyForge Labs logo to Check-in Scanner footer and PWA layout footer. Logo appears before "Built By MyForge Labs" text.
  - HU: MyForge Labs logo hozzáadva a Check-in Scanner és PWA layout lábléchez. Logo megjelenik a "Built By MyForge Labs" szöveg előtt.

### Bug Fixes / Hibajavítások

- **Partner Registration Unique Constraint** / **Partner Regisztráció Egyediség Hiba**
  - EN: Fixed "Unique constraint failed on registrations.guest_id_key" error during paired ticket registration. Added check for existing partner registration and friendly error handling.
  - HU: Javítva a "Unique constraint failed on registrations.guest_id_key" hiba páros jegy regisztrációkor. Ellenőrzés hozzáadva létező partner regisztrációra és barátságos hibakezelés.

- **Feedback Email Seating Preferences** / **Visszaigazoló Email Ültetési Preferenciák**
  - EN: Added guestSeating and partnerSeating fields to automatic feedback email templates. Previously these fields were missing from the email content.
  - HU: guestSeating és partnerSeating mezők hozzáadva az automatikus visszaigazoló email sablonokhoz. Korábban ezek a mezők hiányoztak az email tartalomból.

---

## v2.10.0 (2026-01-13)

### New Features / Új funkciók

- **Automatic Registration Feedback Emails** / **Automatikus Regisztráció Visszaigazoló Emailek**
  - EN: New email templates automatically sent after VIP registration to confirm received data. Main guest receives full registration summary (name, company, phone, dietary requirements, partner info). Partner receives notification that they were registered by the main guest.
  - HU: Új email sablonok automatikusan kiküldve VIP regisztráció után a kapott adatok visszaigazolására. A fővendég megkapja a teljes regisztrációs összefoglalót (név, cég, telefon, étrendi igények, partner adatok). A partner értesítést kap, hogy a fővendég regisztrálta.

- **Paired Ticket Confirmation Emails** / **Páros Jegy Megerősítő Emailek**
  - EN: Both guests in a paired ticket receive BOTH QR codes in their ticket email. Main guest gets their own QR + partner's QR. Partner gets their own QR + main guest's QR. Ensures both parties can check in if one forgets their phone.
  - HU: Páros jegynél mindkét vendég megkapja MINDKÉT QR kódot a jegy emailben. A fővendég megkapja a sajátját + partner QR-jét. A partner megkapja a sajátját + fővendég QR-jét. Biztosítja, hogy mindketten be tudjanak lépni, ha egyikük otthon felejti a telefonját.

### Improvements / Javítások

- **VIP Registration Email Order** / **VIP Regisztráció Email Sorrend**
  - EN: VIP registration now sends feedback email FIRST, then ticket email. Previous order was reversed. This ensures guests receive immediate confirmation of their submitted data before the QR ticket.
  - HU: VIP regisztráció most ELŐSZÖR küld visszaigazoló emailt, aztán jegy emailt. A korábbi sorrend fordított volt. Ez biztosítja, hogy a vendégek azonnal megkapják a beküldött adataik visszaigazolását a QR jegy előtt.

- **Partner Handling as Separate Guest** / **Partner Kezelés Külön Vendégként**
  - EN: Partners are now created as separate Guest records with their own Registration and unique QR code. Previously partners were just additional data on the main guest's registration. Now both guests have independent check-in capability.
  - HU: Partnerek most külön Guest rekordként jönnek létre saját Registrationnel és egyedi QR kóddal. Korábban a partnerek csak további adatok voltak a fővendég regisztrációján. Most mindkét vendég független beléptetési képességgel rendelkezik.

- **Ticket Email Simplified** / **Jegy Email Egyszerűsítve**
  - EN: Removed PWA deep link section from ticket delivery emails. The PWA auth code is no longer included in emails - guests access PWA directly via ceogala.hu/pwa with their code shown on the ticket.
  - HU: PWA deep link szekció eltávolítva a jegy küldő emailekből. A PWA auth kód már nem szerepel az emailekben - vendégek közvetlenül a ceogala.hu/pwa oldalon érhetik el a PWA-t a jegyen megjelenített kóddal.

---

## v2.9.0 (2026-01-11)

### New Features / Új funkciók

- **PWA Cancel Page** / **PWA Lemondás Oldal**
  - EN: Guests can now cancel their registration via `/pwa/cancel`. Includes cancellation reason selection (schedule conflict, illness, other) with optional comment. Available until 7 days before the event.
  - HU: Vendégek mostantól lemondhatják regisztrációjukat a `/pwa/cancel` oldalon. Lemondási ok választás (időpont ütközés, betegség, egyéb) opcionális megjegyzéssel. Az esemény előtt 7 napig elérhető.

- **Cancel API Endpoints** / **Lemondás API Végpontok**
  - EN: New `/api/registration/cancel` POST endpoint for cancellation. New `/api/registration/cancel-status` GET endpoint for checking cancellation eligibility.
  - HU: Új `/api/registration/cancel` POST végpont lemondáshoz. Új `/api/registration/cancel-status` GET végpont a lemondási jogosultság ellenőrzéséhez.

- **Cancelled Status** / **Lemondott Státusz**
  - EN: New "Cancelled" registration status with orange badge. Cancelled guests appear in guest list with filter support.
  - HU: Új "Lemondott" regisztrációs státusz narancssárga badge-dzsel. Lemondott vendégek megjelennek a vendéglistában szűrő támogatással.

- **No-Show Statistics** / **No-Show Statisztikák**
  - EN: Admin dashboard now shows attendance statistics: cancelled count, potential no-shows (registered but not checked in), recent cancellations, and cancellation reasons breakdown.
  - HU: Admin dashboard mostantól mutatja a részvételi statisztikákat: lemondottak száma, potenciális no-show-k (regisztrált de nem jelent meg), friss lemondások, lemondási okok megoszlása.

### Improvements / Javítások

- **Attendance Commitment Consent** / **Részvételi Kötelezettségvállalás**
  - EN: Updated consent checkbox text to include no-show fee warning for VIP and applicant guests. Clear policy: cancellation possible until 7 days before event, no-show may result in fee equivalent to ticket price.
  - HU: Frissített consent checkbox szöveg no-show díj figyelmeztetéssel VIP és jelentkező vendégeknek. Egyértelmű szabály: lemondás lehetséges az esemény előtt 7 napig, no-show esetén jegyár-egyenértékű díj számítható fel.

- **E-10 Reminder Email Template** / **E-10 Emlékeztető Email Sablon**
  - EN: New email template for 10-day event reminder with cancellation link and attendance confirmation request.
  - HU: Új email sablon 10 napos esemény emlékeztetőhöz lemondási linkkel és részvétel megerősítés kéréssel.

- **E-7 Reminder Email Template** / **E-7 Emlékeztető Email Sablon**
  - EN: New email template for 7-day reminder - last chance to cancel without penalty.
  - HU: Új email sablon 7 napos emlékeztetőhöz - utolsó esély lemondásra büntetés nélkül.

- **No-Show Payment Request Email** / **No-Show Fizetési Felszólítás Email**
  - EN: Post-event email template for requesting payment from no-show guests. Includes invoice details and payment deadline.
  - HU: Esemény utáni email sablon no-show vendégek felszólításához. Tartalmazza a számla adatokat és fizetési határidőt.

- **Email Scheduler Automation** / **Email Ütemező Automatizálás**
  - EN: New automatic scheduler configurations for E-10 (10 days before), E-7 (7 days before) event reminders and post-event no-show payment requests. All event reminder emails now include cancellation URL. Scheduler supports bulk scheduling with configurable date offsets.
  - HU: Új automatikus ütemező konfigurációk E-10 (10 nappal előtte), E-7 (7 nappal előtte) esemény emlékeztetőkhöz és esemény utáni no-show fizetési felszólításokhoz. Minden esemény emlékeztető email mostantól tartalmazza a lemondási linket. Ütemező támogatja a tömeges ütemezést konfigurálható dátum eltolásokkal.

- **Check-in Validation for Cancelled Guests** / **Lemondott Vendégek Beléptetés Blokkolása**
  - EN: QR code scanner now shows error for cancelled registrations. Prevents accidental check-in of guests who cancelled.
  - HU: QR kód olvasó mostantól hibát jelez lemondott regisztrációknál. Megakadályozza a lemondott vendégek véletlen beléptetését.

- **Sample GDPR Consent Text** / **Minta GDPR Hozzájárulás Szöveg**
  - EN: Registration consent checkbox now includes detailed inline GDPR text explaining data collection (name, email, phone, company, position, dietary requirements), processing purposes, retention period (12 months), and data subject rights.
  - HU: Regisztrációs consent checkbox mostantól részletes inline GDPR szöveget tartalmaz az adatgyűjtésről (név, email, telefon, cég, beosztás, étrendi igények), feldolgozási célokról, megőrzési időről (12 hónap), és érintetti jogokról.

- **PWA Table Section Hidden** / **PWA Asztal Szekció Elrejtve**
  - EN: Table assignment card temporarily hidden on PWA dashboard via feature flag. Can be re-enabled when seating is finalized.
  - HU: Asztal hozzárendelés kártya ideiglenesen elrejtve a PWA dashboardon feature flag-gel. Újra engedélyezhető amikor az ültetés végleges.

- **Magic Link Invitation Email Redesign** / **Magic Link Meghívó Email Újratervezés**
  - EN: Complete redesign of magic link invitation email. New elegant typography (Georgia serif), CEO Gala 2026 branding, detailed event description (12th edition, Corinthia Hotel Budapest, March 27 2026), awards section (Expat CEO of the Year, CEO Community Award), dual signatures (Tamas Botka - Publisher, Balazs Roman - CEO), navy button styling, and professional footer with website link.
  - HU: Magic link meghívó email teljes újratervezése. Új elegáns tipográfia (Georgia serif), CEO Gala 2026 arculat, részletes esemény leírás (12. kiadás, Corinthia Hotel Budapest, 2026. március 27.), díjak szekció (Expat CEO of the Year, CEO Community Award), kettős aláírás (Botka Tamás - Publisher, Roman Balázs - CEO), navy gomb stílus, és professzionális lábléc weboldal linkkel.

---

## v2.8.1 (2026-01-11)

### New Features / Új funkciók

- **Release Testing Admin Page** / **Release Tesztelés Admin Oldal**
  - EN: New admin page at `/admin/release-testing` for manual test steps by version. Features include: version-by-version test procedures, test status tracking (Passed/Failed/Not Tested), localStorage persistence, direct version linking via URL hash, and bilingual support (HU/EN).
  - HU: Új admin oldal a `/admin/release-testing` címen manuális teszt lépésekhez verziónként. Funkciók: verziónkénti teszteljárások, teszt státusz követés (Sikeres/Sikertelen/Nem tesztelt), localStorage mentés, közvetlen verzió linkelés URL hash-sel, és kétnyelvű támogatás (HU/EN).

### Improvements / Javítások

- **Changelog Test Links** / **Változásnapló Teszt Linkek**
  - EN: Each version in the changelog now has a "Tesztelés" badge linking directly to its test steps.
  - HU: A változásnaplóban minden verzió mellett mostantól "Tesztelés" badge található, ami a teszt lépésekre mutat.

- **Testing Hub Integration** / **Testing Hub Integráció**
  - EN: Release Testing added as 4th card in Testing Hub dashboard.
  - HU: Release Tesztelés hozzáadva 4. kártyaként a Testing Hub dashboardhoz.

---

## v2.8.0 (2026-01-10)

### New Features / Új funkciók

- **Floor Plan Export (PNG/PDF)** / **Ültetési térkép exportálás (PNG/PDF)**
  - EN: Export the floor plan canvas as high-quality PNG image or PDF document. PDF includes header with room name, dimensions, table count, and legend. Access via the download dropdown in Floor Plan view.
  - HU: Ültetési térkép exportálása magas minőségű PNG képként vagy PDF dokumentumként. A PDF tartalmaz fejlécet terem nevével, méretekkel, asztalszámmal és jelmagyarázattal. Elérhető a letöltés menüből a Floor Plan nézetben.

### Improvements / Javítások

- **Smart Tooltip Positioning** / **Okos Tooltip Pozicionálás**
  - EN: Floor plan table tooltips now intelligently position themselves to stay within canvas bounds. Tooltips for bottom/right tables appear above/left of cursor instead of being cut off.
  - HU: Az ültetési térkép asztal tooltipjei most okosan pozicionálják magukat, hogy a canvas határain belül maradjanak. Az alsó/jobb oldali asztalok tooltipjei a kurzor felett/balra jelennek meg, nem vágódnak le.

- **Hoverable Tooltips** / **Görögethető Tooltipek**
  - EN: Table tooltips now remain visible when hovering over them, allowing scrolling through guest lists on tables with many guests. 300ms delay before hiding.
  - HU: Az asztal tooltipek most láthatóak maradnak amikor fölöttük van a kurzor, lehetővé téve a vendéglista görgetését sok vendéges asztaloknál. 300ms késleltetés eltűnés előtt.

- **Dashboard Dark Mode Colors** / **Vezérlőpult Sötét Mód Színek**
  - EN: Fixed dashboard link visibility in dark mode. "Open" buttons and accent colors now properly visible in both light and dark themes.
  - HU: Javítva a vezérlőpult linkek láthatósága sötét módban. A "Megnyitás" gombok és kiemelő színek most megfelelően láthatóak mindkét témában.

---

## v2.7.0 (2026-01-09)

### New Features / Új funkciók

- **BBJ Events 2026 Color Scheme** / **BBJ Events 2026 Színséma**
  - EN: Complete visual refresh with new navy-based color palette (#000D38 primary). Dark mode and light mode fully redesigned for elegant, VIP event branding. All PWA pages, admin screens, and registration flows updated.
  - HU: Teljes vizuális frissítés új navy alapú színpalettával (#000D38 elsődleges). Sötét és világos téma újratervezve elegáns, VIP esemény arculathoz. Minden PWA oldal, admin képernyő és regisztrációs folyamat frissítve.

- **UX Design Wireframes** / **UX Design Wireframe-ek**
  - EN: Created complete Excalidraw wireframes for all 6 guest-facing screens (PWA Login, Dashboard, Ticket, Table, VIP Registration, Payment Success) in both dark and light modes. Exported as portable HTML viewer.
  - HU: Elkészültek a teljes Excalidraw wireframe-ek mind a 6 vendég oldali képernyőhöz (PWA Bejelentkezés, Dashboard, Jegy, Asztal, VIP Regisztráció, Sikeres Fizetés) sötét és világos módban. Exportálva hordozható HTML megjelenítőként.

### Improvements / Javítások

- **Monochrome Icon System** / **Monokróm Ikon Rendszer**
  - EN: All icons converted to monochrome navy/white palette. No colored icons in the UI for consistent VIP aesthetic.
  - HU: Minden ikon monokróm navy/fehér palettára konvertálva. Nincsenek színes ikonok a felületen az egységes VIP esztétikáért.

- **Inter Typography** / **Inter Tipográfia**
  - EN: Inter font standardized across all pages with proper weight hierarchy (400 Regular, 500 Medium, 600 SemiBold).
  - HU: Inter betűtípus szabványosítva minden oldalon megfelelő súly hierarchiával (400 Regular, 500 Medium, 600 SemiBold).

---

## v2.6.0 (2026-01-09)

### Improvements / Javítások

- **Form Validation Error Summary** / **Űrlap Validációs Hibaösszesítő**
  - EN: All forms now display a clear error summary box at the top when validation fails. The summary lists all errors with clickable links that scroll to and focus on the problematic field. Implemented on: Admin Guest Form, VIP Registration, Paid Registration, and Public Application forms.
  - HU: Minden űrlapon mostantól megjelenik egy hibaösszesítő doboz validációs hiba esetén. Az összesítő felsorolja a hibákat kattintható linkekkel, amelyek a problémás mezőhöz görgetnek és fókuszálnak. Implementálva: Admin Vendég Űrlap, VIP Regisztráció, Fizetős Regisztráció és Nyilvános Jelentkezés űrlapokon.

---

## v2.5.0 (2026-01-08)

### New Features / Új funkciók

- **Payment Status Column & Filter** / **Fizetési Státusz Oszlop & Szűrő**
  - EN: Added Payment Status column to guest list with color-coded badges. New filter allows filtering by payment status (Awaiting Transfer, Paid, Failed, Refunded).
  - HU: Fizetési státusz oszlop hozzáadva a vendéglistához színkódolt jelzésekkel. Új szűrő a fizetési státusz szerinti szűréshez (Utalásra vár, Fizetve, Sikertelen, Visszatérítve).

- **VIP Filter for Bulk Emails** / **VIP Szűrő Tömeges Emailekhez**
  - EN: Added VIP Reception filter to bulk email scheduling. Now you can send emails to VIP-only or non-VIP guests.
  - HU: VIP Fogadás szűrő hozzáadva a tömeges email küldéshez. Most már küldhetsz emailt csak VIP vagy csak nem-VIP vendégeknek.

### Bug Fixes / Hibajavítások

- **VIP Filter & Checkbox Fix** / **VIP Szűrő & Checkbox Javítás**
  - EN: Fixed VIP filter not working on guest list. Fixed VIP checkbox not saving when editing guests.
  - HU: Javítva a VIP szűrő, ami nem működött a vendéglistában. Javítva a VIP checkbox mentése szerkesztésnél.

### Improvements / Javítások

- **Inter Font** / **Inter Betűtípus**
  - EN: Changed primary font from Open Sans to Inter for better readability across all pages.
  - HU: Elsődleges betűtípus cserélve Open Sans-ról Inter-re a jobb olvashatóság érdekében minden oldalon.

---

## v2.4.0 (2026-01-08)

### New Features / Új funkciók

- **VIP Reception Column** / **VIP Fogadás oszlop**
  - EN: Added VIP Reception indicator column to guest list. VIP guests are marked with a star icon. Edit guests to toggle VIP status.
  - HU: VIP Fogadás jelző oszlop hozzáadva a vendéglistához. VIP vendégek csillag ikonnal jelölve. Vendég szerkesztésekor állítható.

- **Partner Registration for All Guests** / **Partner regisztráció minden vendégnek**
  - EN: All paying guests can now bring a partner. Previously only paired ticket holders could register partners.
  - HU: Minden fizető vendég hozhat partnert. Korábban csak páros jegyes vendégek regisztrálhattak partnert.

### Improvements / Javítások

- **Complete CSV Export** / **Teljes CSV export**
  - EN: Guest export now includes all fields: billing info, check-in status, payment details, paired guest info, and more.
  - HU: A vendég export már tartalmazza az összes mezőt: számlázási adatok, check-in státusz, fizetési adatok, partner adatok és még több.

- **BBJ Events Branding** / **BBJ Events branding**
  - EN: Updated all email templates and payment references from "CEO Gala" to "BBJ Events".
  - HU: Frissítve az összes email sablon és fizetési hivatkozás "CEO Gala"-ról "BBJ Events"-re.

### Bug Fixes / Hibajavítások

- **Status Filter Improvements** / **Státusz szűrő javítások**
  - EN: Fixed status filtering to properly distinguish "Declined" (guest cancelled) from "Rejected" (admin rejected). Hungarian translations corrected.
  - HU: Javítva a státusz szűrés, hogy megkülönböztesse a "Lemondta" (vendég lemondta) és "Elutasítva" (admin elutasította) státuszokat.

---

## v2.3.0 (2026-01-06)

### New Features / Új funkciók

- **Admin Audit Log** / **Admin Audit Napló**
  - EN: New audit log page tracks all admin actions: guest changes, email sends, payment approvals, and more. Filter by action type, entity, or date.
  - HU: Új audit napló oldal követi az összes admin műveletet: vendég változtatások, email küldések, fizetés jóváhagyások és még több.

- **Company & Position Fields** / **Cég & Beosztás mezők**
  - EN: Added Company and Position fields to guest edit modal. These are now required fields.
  - HU: Cég és Beosztás mezők hozzáadva a vendég szerkesztő modalhoz. Ezek most kötelező mezők.

### Bug Fixes / Hibajavítások

- **Guest List Refresh Button** / **Vendég lista frissítés gomb**
  - EN: Added refresh button to guest list for manual data reload without page refresh.
  - HU: Frissítés gomb hozzáadva a vendéglistához a kézi adat újratöltéshez oldal frissítés nélkül.

---

## v2.2.0 (2026-01-03)

### New Features / Új funkciók

- **Gala App (PWA) Enhancements** / **Gala App (PWA) fejlesztések**
  - EN: Improved offline support, faster loading, and better QR code display. Push notifications ready.
  - HU: Javított offline támogatás, gyorsabb betöltés, és jobb QR kód megjelenítés. Push értesítések készen.

### Improvements / Javítások

- **Comprehensive Help System** / **Átfogó súgó rendszer**
  - EN: New searchable FAQ with 50+ entries covering all admin features. Available in Hungarian and English.
  - HU: Új kereshető GYIK 50+ bejegyzéssel, minden admin funkciót lefed. Elérhető magyarul és angolul.

---

## v2.1.0 (2025-12-20)

### New Features / Új funkciók

- **Email Rate Limiting** / **Email korlátozás**
  - EN: Prevents email spam: max 5 emails per type per hour, 20 total per hour per guest.
  - HU: Megakadályozza az email spamet: max 5 email típusonként óránként, 20 összes óránként vendégenként.

- **Drag-and-Drop Seating Map** / **Drag-and-drop ültetési térkép**
  - EN: Interactive visual seating map with drag-and-drop guest assignment.
  - HU: Interaktív vizuális ültetési térkép drag-and-drop vendég hozzárendeléssel.

---

## v2.0.0 (2025-12-15)

### New Features / Új funkciók

- **Applicant Flow** / **Jelentkező flow**
  - EN: Public application form for non-invited guests. Admin approval workflow with email notifications.
  - HU: Nyilvános jelentkezési űrlap nem meghívott vendégeknek. Admin jóváhagyási folyamat email értesítésekkel.

- **PWA Guest App Launch** / **PWA Gala App indulás**
  - EN: Progressive Web App for guests with offline QR ticket, table info, and profile management.
  - HU: Progressive Web App vendégeknek offline QR jeggyel, asztal infóval, és profil kezeléssel.

---

*Kérdése van? Keresse az adminisztrátort. / Have questions? Contact your administrator.*
