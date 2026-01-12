# CEO Gala 2026 - Rendszer Áttekintés

## Mi ez a rendszer?

A CEO Gala Event Registration System egy komplett rendezvénykezelő platform, amely a következő funkciókat biztosítja:
- Vendégek regisztrációja és kezelése
- Online fizetés (Stripe) és banki átutalás kezelése
- QR kódos jegyrendszer
- Esemény napi check-in mobil szkennerrel
- Ültetési rend kezelése drag & drop felülettel
- Email kommunikáció a vendégekkel

## Felhasználói szerepkörök

### Admin (Adminisztrátor)
- Teljes hozzáférés minden funkcióhoz
- Vendégek hozzáadása, szerkesztése, törlése
- CSV import vendéglistából
- Fizetések jóváhagyása (banki átutalás esetén)
- Ültetési rend kezelése
- Email küldés
- Check-in override (duplikált belépés engedélyezése)

### Staff (Személyzet)
- Csak a check-in szkennerhez van hozzáférése
- QR kódok szkennelése az esemény napján
- NEM tud override-olni duplikált belépésnél
- NEM lát vendéglistát vagy admin funkciókat

## Vendég típusok

### VIP vendég
- Meghívott, ingyenes jegy
- Magic link emailben kapja a regisztrációs linket
- Regisztráció után azonnal megkapja a QR jegyet
- Nem kell fizetnie

### Fizető vendég (Egyéni)
- Meghívott vendég
- 1 fős jegy
- Fizethet kártyával (Stripe) vagy banki átutalással
- Fizetés után kapja meg a QR jegyet

### Fizető vendég (Páros)
- Meghívott vendég
- 2 fős jegy (fő vendég + partner)
- Partner adatait is meg kell adni regisztrációkor
- Mindketten külön QR jegyet kapnak
- Automatikusan ugyanahhoz az asztalhoz kerülnek

## Rendszer URL-ek

### Publikus oldalak
- `/` - Főoldal
- `/register?code=XXX&email=XXX` - Magic link regisztráció
- `/status?email=XXX` - Regisztrációs státusz ellenőrzés
- `/help` - Vendég súgó

### Admin felület
- `/admin` - Admin dashboard
- `/admin/guests` - Vendéglista
- `/admin/tables` - Asztalok kezelése
- `/admin/seating` - Ültetési rend (drag & drop)
- `/admin/payments` - Fizetések
- `/admin/email` - Email küldés
- `/admin/checkin-log` - Check-in napló
- `/admin/changelog` - Változásnapló (verziónkénti funkciók)
- `/admin/release-testing` - Manuális tesztelési lépések verziónként
- `/admin/help` - Admin súgó

### Check-in
- `/checkin` - QR szkenner (mobil optimalizált)

### Vendég PWA alkalmazás
- `/pwa` - Bejelentkezés
- `/pwa/dashboard` - Vendég főoldal
- `/pwa/ticket` - QR jegy
- `/pwa/profile` - Profil szerkesztés
- `/pwa/cancel` - Részvétel lemondása (7 nappal az esemény előtt)

## Bejelentkezés

### Admin/Staff bejelentkezés
- URL: `/admin/login`
- Email + jelszó
- Sikeres bejelentkezés után:
  - Admin → `/admin` dashboard
  - Staff → `/checkin` szkenner

### Vendég bejelentkezés (PWA)
- URL: `/pwa`
- 6 karakteres kód formátum: `CEOG-XXXXXX`
- A kód a regisztráció után emailben érkezik
- Offline is működik a QR jegy megjelenítése

## Nyelvek

A rendszer kétnyelvű:
- **Magyar** (alapértelmezett)
- **Angol**

Admin felületen a jobb felső sarokban lehet váltani.

## Technikai követelmények

### Admin felület használatához
- Modern böngésző (Chrome, Firefox, Safari, Edge)
- Stabil internetkapcsolat
- Minimum 1024px széles képernyő ajánlott

### Check-in szkenner használatához
- Okostelefon kamerával
- Modern mobil böngésző
- Stabil internetkapcsolat
- Jó fényviszonyok a QR olvasáshoz

### Vendég PWA használatához
- Okostelefon
- Modern mobil böngésző
- A QR jegy offline is működik (ha korábban betöltötte)
