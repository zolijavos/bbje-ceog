# CEO Gala - Vendég Kezelés

## Vendéglista megtekintése

### Hol találom?
Admin → Guests (Vendégek) menüpont

### Szűrési lehetőségek
- **Kategória**: VIP, Fizető egyéni, Fizető páros
- **Státusz**: Meghívott, Regisztrált, Jóváhagyott, Visszautasított, Lemondott
- **Fizetési státusz**: Utalásra vár, Fizetve, Sikertelen, Visszatérítve
- **Asztal**: Adott asztalhoz rendelt vendégek
- **VIP fogadás**: Csak VIP / Nem VIP vendégek
- **Keresés**: Név, email, cég alapján

### Mit látok a listában?
- Vendég neve és emailje
- Típus (VIP / Fizető egyéni / Fizető páros)
- Regisztrációs státusz
- Fizetési státusz (ha releváns)
- Asztal (ha van hozzárendelve)
- Műveletek gombok

## Új vendég hozzáadása

### Manuális hozzáadás
1. Kattints az "Add Guest" (Vendég hozzáadása) gombra
2. Töltsd ki a mezőket:
   - **Email** (kötelező, egyedi)
   - **Név** (kötelező)
   - **Típus**: VIP, Fizető egyéni, vagy Fizető páros
   - **Cég** (opcionális)
   - **Pozíció** (opcionális)
   - **Telefon** (opcionális)
3. Mentés

### CSV import (tömeges hozzáadás)
1. Kattints az "Import CSV" gombra
2. Töltsd le a minta CSV fájlt a helyes formátumhoz
3. Töltsd ki a CSV fájlt a vendégek adataival
4. Töltsd fel a fájlt
5. Ellenőrizd az előnézetet
6. Erősítsd meg az importot

**CSV oszlopok:**
- `email` (kötelező)
- `first_name` (kötelező) - vendég keresztneve
- `last_name` (kötelező) - vendég vezetékneve
- `guest_type` (vip / paying_single / paying_paired)
- `title` (opcionális) - megszólítás (Dr., Mr., Ms., stb.)
- `company` (opcionális)
- `position` (opcionális)
- `phone` (opcionális)

## Vendég szerkesztése

1. Keress rá a vendégre a listában
2. Kattints a ceruza ikonra (Edit)
3. Módosítsd a kívánt mezőket
4. Mentés

**Szerkeszthető mezők:**
- Keresztnév (First Name)
- Vezetéknév (Last Name)
- Megszólítás / Title (Dr., Mr., Ms., stb.)
- Email (figyelem: ha már regisztrált, értesíteni kell!)
- Típus (csak ha még nem regisztrált)
- Cég, Pozíció, Telefon
- Étkezési igények
- Ültetési preferencia

## Vendég törlése

1. Keress rá a vendégre
2. Kattints a kuka ikonra (Delete)
3. Erősítsd meg a törlést

**Figyelem:** Törölt vendég minden adata elvész:
- Regisztráció
- Fizetés
- Check-in előzmények
- Asztal hozzárendelés

## Magic link küldése

### Mi az a magic link?
Egyedi, biztonságos link, amivel a vendég regisztrálhat. 24 óráig érvényes.

### Egyéni küldés
1. Keress rá a vendégre
2. Kattints az email ikonra
3. Válaszd a "Send Magic Link" opciót
4. A vendég emailben megkapja a linket

### Tömeges küldés
1. Jelöld ki a vendégeket a checkbox-okkal
2. Kattints a "Bulk Actions" gombra
3. Válaszd a "Send Magic Links" opciót
4. Erősítsd meg

**Mikor küldjek magic linket?**
- Új vendég hozzáadása után
- Ha a vendég nem kapta meg az emailt
- Ha lejárt a korábbi link (24 óra után)

## Vendég státuszok

### Invited (Meghívott)
- Magic link elküldve
- Még nem regisztrált
- Várja a vendég reakcióját

### Registered (Regisztrált)
- Kitöltötte a regisztrációs űrlapot
- Fizető vendégnél: fizetésre vár

### Approved (Jóváhagyott)
- Regisztráció és fizetés rendben
- QR jegy kiállítva
- Beléphet az eseményre

### Declined (Visszautasított)
- Vendég visszamondta a részvételt
- Magic linken a "Nem tudok részt venni" opciót választotta

### Cancelled (Lemondott)
- Vendég lemondta a részvételt a PWA-ban (`/pwa/cancel`)
- Narancssárga badge a vendéglistában
- Lemondási ok és megjegyzés rögzítve
- QR jegy érvénytelen (check-in-nél piros kártya)
- Az esemény előtt 7 napig mondható le online

## No-Show Statisztikák

### Mit jelent a No-Show?
A vendég regisztrált és jóváhagyott, de nem jelent meg az eseményen (nem történt check-in).

### Admin Dashboard statisztikák
- **Lemondottak száma**: Hány vendég mondta le a PWA-ban
- **Potenciális no-show**: Regisztrált de nem jelent meg
- **Friss lemondások**: Utolsó 7 nap lemondásai
- **Lemondási okok megoszlása**: Időpont ütközés / Betegség / Egyéb

### No-Show kezelés
1. Esemény után azonosíthatók a no-show vendégek
2. Automatikus email küldhető fizetési felszólítással
3. VIP vendégeknél no-show díj számítható fel

## Étkezési igények kezelése

### Hol látom?
- Vendéglista → Vendég részletei
- Vendég profil oldala
- Export funkcióval összesítve

### Gyakori étkezési igények
- Vegetáriánus
- Vegán
- Gluténmentes
- Laktózmentes
- Halat nem eszik
- Allergiák (mogyoró, tojás, stb.)

### Export catering-nek
1. Admin → Guests
2. "Export" gomb → "Dietary Requirements"
3. CSV vagy PDF formátum
4. Tartalmazza: név, asztal, étkezési igény

## Ültetési preferenciák

### Mit adhat meg a vendég?
- Kikkel szeretne egy asztalhoz kerülni
- Konkrét cégek vagy személyek
- Speciális kérések (pl. bejárathoz közel)

### Hol látom?
- Vendég részleteknél
- Seating (Ültetés) felületen tooltip-ben

## Páros jegyek kezelése

### Hogyan működik?
1. Fő vendég regisztrál páros jegyet
2. Megadja a partner adatait (név, email)
3. Fizetés után mindketten kapnak QR jegyet
4. Automatikusan ugyanahhoz az asztalhoz kerülnek

### Partner adatok módosítása
Jelenleg csak admin tudja módosítani:
1. Keress rá a fő vendégre
2. Szerkesztés
3. Partner adatok módosítása
4. Mentés

## Keresési tippek

### Gyors keresés
- Kezd el gépelni a nevet vagy emailt
- Automatikusan szűr már 2 karakter után

### Pontos keresés
- Használd az idézőjeleket: "Kiss János"
- Email esetén a teljes címet add meg

### Szűrők kombinálása
- Több szűrő is használható egyszerre
- Pl.: VIP + Jóváhagyott + 1-es asztal
