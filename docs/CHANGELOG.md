# Changelog

Legfrissebb fejlesztések és javítások / Latest updates and improvements

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
