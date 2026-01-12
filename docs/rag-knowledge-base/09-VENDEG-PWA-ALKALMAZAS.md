# CEO Gala - Vendég PWA Alkalmazás

## Mi az a PWA?

A PWA (Progressive Web App) egy mobil-optimalizált webalkalmazás, amit a vendégek használnak:
- QR jegy megjelenítése
- Profil adatok kezelése
- Asztal információ megtekintése

**URL:** `/pwa`

## Bejelentkezés

### Bejelentkezési kód
- Formátum: `CEOG-XXXXXX` (6 karakter)
- A vendég emailben kapja a jeggyel együtt
- Egyedi minden vendéghez

### Bejelentkezés folyamata
1. Vendég megnyitja: `/pwa`
2. Beírja a 6 karakteres kódot
3. Sikeres belépés → Dashboard

### Hibás kód
Ha a kód nem működik:
- Ellenőrizze a formátumot (CEOG- előtag)
- Kis/nagybetű nem számít
- Nézze meg újra az emailt

## PWA funkciók

### Dashboard (Főoldal)
- Üdvözlő üzenet a vendég nevével
- QR jegy gyors elérés
- Asztal információ (ha van)
- Esemény countdown

### QR Jegy (`/pwa/ticket`)
- Teljes képernyős QR kód
- Működik offline is (ha korábban megnyitotta)
- Fényerő optimalizálás gomb
- Vendég neve és jegy típusa

### Profil (`/pwa/profile`)
**Megtekinthető:**
- Név
- Email

**Szerkeszthető:**
- Telefonszám
- Cég
- Pozíció
- Étkezési igények / allergiák
- Ültetési preferencia

### Asztal információ
Ha a vendéghez asztal van rendelve:
- Asztal neve/száma
- Asztaltársak (opcionálisan)

**Megjegyzés:** Az asztal kártya ideiglenesen el lehet rejtve a dashboard-on (feature flag), amíg az ültetési rend nem végleges.

### Lemondás (`/pwa/cancel`)
- Részvétel lemondása az esemény előtt 7 napig
- Lemondási ok választás (időpont ütközés, betegség, egyéb)
- Opcionális megjegyzés mező
- Megerősítés után a státusz "Lemondott"-ra változik

## Offline működés

### Mi működik offline?
- QR jegy megjelenítése (ha korábban betöltötte)
- Alapvető profil információk megtekintése

### Mi NEM működik offline?
- Profil módosítása
- Friss asztal információk
- Új adatok betöltése

### Service Worker
A PWA service worker-t használ a offline funkcióhoz:
- Cache-eli a szükséges fájlokat
- A QR kódot elmenti
- Automatikusan szinkronizál online állapotban

## Dark/Light mód

### Váltás
- A PWA követi a telefon beállításait
- Vagy manuálisan állítható a profil oldalon

### Miért fontos?
- Jobb olvashatóság különböző fényviszonyoknál
- QR kód kontrasztja fontos a szkennelésnél

## Admin információk a PWA-ról

### Vendég profil változások
Ha a vendég módosítja a profilját a PWA-ban:
- Az adatok azonnal frissülnek az admin felületen
- Látható a Guest részleteknél
- Étkezési igény változás fontos a catering-nek!

### PWA kód újraküldése
Ha a vendég elvesztette a kódot:
1. A jegyes email újraküldése tartalmazza
2. Vagy: Guest → Resend Ticket

### Vendég nem tud belépni a PWA-ba
**Ellenőrizd:**
1. Regisztrált és jóváhagyott-e
2. Fizető esetén: fizetett-e
3. Van-e kiállított QR jegy

## PWA telepítése (opcionális)

### iOS (Safari)
1. Nyisd meg a PWA-t Safari-ban
2. Koppints a "Share" ikonra
3. Válaszd az "Add to Home Screen" opciót
4. Adj nevet és mentsd

### Android (Chrome)
1. Nyisd meg a PWA-t Chrome-ban
2. Megjelenik egy "Add to Home Screen" banner
3. Vagy: menü → "Add to Home Screen"

### Előnyök
- Gyorsabb indulás
- Ikonnal a főképernyőn
- App-szerű élmény

## Gyakori vendég kérdések

### "Hol találom a QR kódot?"
A PWA Dashboard-on van egy "Jegyet mutat" gomb, vagy közvetlenül: `/pwa/ticket`

### "Mi a bejelentkezési kódom?"
A jegyes emailben található. Formátum: CEOG-XXXXXX

### "Módosíthatom az adataimat?"
Igen, a PWA Profil oldalon a telefonszám, cég, étkezési igény módosítható.

### "Működik offline a QR kód?"
Igen, ha korábban már megnyitottad a jegyet, offline is megjelenik.

### "Melyik asztalnál ülök?"
A PWA Dashboard-on látható, ha már hozzá lettél rendelve egy asztalhoz.

### "Lemondhatom a részvételt a PWA-ban?"
Igen! A `/pwa/cancel` oldalon lemondhatod a regisztrációdat az esemény előtt **7 nappal**.

**Lemondási folyamat:**
1. Nyisd meg a PWA Dashboard-ot
2. Kattints a "Részvétel lemondása" gombra
3. Válaszd ki a lemondás okát:
   - Időpont ütközés
   - Betegség
   - Egyéb (saját indoklás)
4. Opcionálisan adj meg megjegyzést
5. Erősítsd meg a lemondást

**Fontos:** 7 napnál rövidebb időn belül már nem mondható le online. No-show esetén díj számítható fel.

## Push értesítések (opcionális)

### Mire használható?
- Esemény emlékeztető
- Fontos bejelentések
- Asztal változás értesítése

### Engedélyezés
- A PWA kérheti a push engedélyt
- A vendég eldöntheti, hogy engedélyezi-e
- Bármikor kikapcsolható

### Admin küldés
Admin → Notifications menüpontból küldhető push értesítés a vendégeknek.

## Technikai követelmények

### Támogatott böngészők
- Safari (iOS 11.3+)
- Chrome (Android 5+)
- Firefox Mobile
- Samsung Internet

### Ajánlott
- Friss böngésző verzió
- Stabil internet a bejelentkezéshez
- Elegendő tárhely a cache-hez (~5MB)

## Branding

### "Powered by MyForge Labs"
A PWA alján megjelenik a fejlesztő logója és neve. Ez nem módosítható.

### Színek és téma
A PWA a BBJ Events 2026 arculatát követi:
- Navy alapú színpaletta (#000D38 elsődleges)
- Monokróm ikon rendszer (navy/fehér)
- Inter betűtípus elegáns hierarchiával
- Sötét és világos mód támogatás
