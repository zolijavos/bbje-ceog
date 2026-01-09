# Changelog

Legfrissebb fejlesztések és javítások / Latest updates and improvements

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
