# CEO Gala - Ügyfél Tesztelési Útmutató

**Verzió**: 1.0
**Dátum**: 2025-12-18
**URL**: https://ceogala.mflevents.space

---

## 1. Teszt Belépési Adatok

### Admin Felhasználók (Teljes hozzáférés)

| Email | Jelszó | Megjegyzés |
|-------|--------|------------|
| `admin@ceogala.test` | `Admin123!` | Fő admin teszt fiók |
| `admin2@ceogala.test` | `Admin123!` | Másodlagos admin |
| `admin3@ceogala.test` | `Admin123!` | Tartalék admin |

**Admin funkciók**: Vendéglista, CSV import, ültetés, fizetés jóváhagyás, email küldés, statisztikák, check-in override

### Staff Felhasználók (Csak check-in)

| Email | Jelszó | Megjegyzés |
|-------|--------|------------|
| `staff@ceogala.test` | `Staff123!` | Fő staff teszt fiók |
| `staff2@ceogala.test` | `Staff123!` | Másodlagos staff |
| `staff3@ceogala.test` | `Staff123!` | Tartalék staff |

**Staff funkciók**: QR szkenner, check-in napló megtekintés (NEM tud override-olni duplikált belépésnél!)

---

## 2. Vendég Teszt Fiókok

### VIP Vendégek (Ingyenes jegy)

| Email | Név | Státusz | Magic Link |
|-------|-----|---------|------------|
| `vip1@ceogala.test` | Dr. Kovács János | Invited | Küldésre vár |
| `vip2@ceogala.test` | Nagy Éva | Registered | Regisztrált |
| `vip3@ceogala.test` | Szabó Péter | Approved | Van QR jegye |

**Tesztelési forgatókönyv**:
1. Admin → Guest List → VIP1 → Send Magic Link
2. Email megérkezik → Kattints a linkre
3. Regisztráció kitöltése → Instant QR jegy

### Fizető Egyéni Vendégek

| Email | Név | Fizetés | Státusz |
|-------|-----|---------|---------|
| `paying1@ceogala.test` | Kiss Anna | Paid (card) | Van QR jegy |
| `paying2@ceogala.test` | Tóth Gábor | Pending | Fizetésre vár |
| `paying3@ceogala.test` | Barna Kata | Invited | Még nem regisztrált |

**Tesztelési forgatókönyv**:
1. Admin → Guest List → paying3 → Send Magic Link
2. Regisztráció → Számlázási adatok → Stripe fizetés
3. Sikeres fizetés → QR jegy email

### Fizető Páros Vendégek

| Fő vendég | Partner | Fizetés | Megjegyzés |
|-----------|---------|---------|------------|
| `paired1@ceogala.test` (Molnár László) | `partner1@ceogala.test` (Molnár Réka) | Paid (bank) | Glutén/laktózmentes |
| `paired2@ceogala.test` (Horváth Attila) | `partner2@ceogala.test` (Horváth Krisztina) | Paid (card) | Vegetáriánus partner |
| `paired3@ceogala.test` (Szilágyi Márton) | `partner3@ceogala.test` (Szilágyi Nóra) | Pending | Vegán mindketten |

**Fontos**: Páros jegynél mindkét vendég kap külön QR kódot!

### Jelentkezők (Applicant)

| Email | Név | Státusz |
|-------|-----|---------|
| `applicant1@ceogala.test` | Teszt Jelentkező 1 | Pending approval |
| `applicant2@ceogala.test` | Teszt Jelentkező 2 | Pending approval |
| `applicant3@ceogala.test` | Teszt Jelentkező 3 | Pending approval |

**Tesztelési forgatókönyv**:
1. https://ceogala.mflevents.space/apply → Kitöltés
2. Admin → Applications → Jóváhagyás/Elutasítás
3. Jóváhagyás esetén → Magic link küldés → Fizetés → QR jegy

---

## 3. Email Tesztelés - Több Cím, Egy Inbox

Ha saját email címekkel szeretnéd tesztelni a rendszert, de minden email ugyanabba a postafiókba érkezzen:

### Gmail "+" Alias (Ajánlott)

A Gmail támogatja a `+` karaktert az email címben. Minden ilyen cím ugyanabba a fiókba érkezik:

```
alap_email@gmail.com           → Eredeti cím
alap_email+vip@gmail.com       → VIP vendég teszt
alap_email+paying@gmail.com    → Fizető vendég teszt
alap_email+paired@gmail.com    → Páros jegy fő vendég
alap_email+partner@gmail.com   → Páros jegy partner
alap_email+applicant@gmail.com → Jelentkező teszt
```

**Előny**: Korlátlan számú alias, szűrőkkel rendezheted őket
**Működik**: Gmail, Google Workspace

### Gmail "." Trükk

A Gmail figyelmen kívül hagyja a pontokat a felhasználónévben:

```
johnsmith@gmail.com
john.smith@gmail.com
j.o.h.n.s.m.i.t.h@gmail.com
```

Mind ugyanabba a fiókba érkezik!

### Outlook/Hotmail "+" Alias

Az Outlook is támogatja a `+` aliast:

```
teszt@outlook.com
teszt+vip@outlook.com
teszt+paying@outlook.com
```

### Saját Domain - Catch-All

Ha van saját domained (pl. `cegem.hu`), beállíthatsz catch-all címet:

```
vip@cegem.hu        → mind a
paying@cegem.hu     → info@cegem.hu
bármi@cegem.hu      → fiókba érkezik
```

### iCloud "+" Alias

Az iCloud email is támogatja:

```
nev@icloud.com
nev+test1@icloud.com
nev+test2@icloud.com
```

### Proton Mail Alias

Proton Mail esetén használható a `+` alias vagy külön aliasok a beállításokban.

---

## 4. Stripe Teszt Kártyák

A rendszer teszt módban van, ezért valódi bankkártya **NEM** szükséges!

### Sikeres Fizetés

| Kártyaszám | Lejárat | CVC |
|------------|---------|-----|
| `4242 4242 4242 4242` | Bármilyen jövőbeli dátum | Bármilyen 3 számjegy |

### Sikertelen Fizetés (teszteléshez)

| Kártyaszám | Eredmény |
|------------|----------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 9987` | Lost card |

### 3D Secure Teszt

| Kártyaszám | Eredmény |
|------------|----------|
| `4000 0025 0000 3155` | Sikeres 3DS |
| `4000 0082 6000 3178` | Sikertelen 3DS |

---

## 5. Tesztelési Forgatókönyvek

### A) Teljes VIP Folyamat
1. Admin bejelentkezés → `admin@ceogala.test` / `Admin123!`
2. Guest List → `vip1@ceogala.test` → Send Magic Link
3. Email megérkezik a VIP címre
4. Kattints a magic linkre
5. Regisztráció kitöltése → Azonnal QR jegy

### B) Teljes Fizetős Folyamat
1. Admin → Guest List → `paying3@ceogala.test` → Send Magic Link
2. Email megérkezik
3. Magic link → Regisztráció → Számlázási adatok
4. Stripe checkout → Teszt kártya használata
5. Sikeres fizetés → QR jegy email

### C) Páros Jegy Folyamat
1. Admin → Add Guest → `sajat.email+paired@gmail.com` → Type: Paying Paired
2. Send Magic Link
3. Regisztráció → Partner adatok megadása (`sajat.email+partner@gmail.com`)
4. Fizetés → Mindkét vendég kap QR kódot

### D) Jelentkező Folyamat
1. https://ceogala.mflevents.space/apply
2. Űrlap kitöltése saját email címmel
3. Admin → Applications → Pending lista
4. Jóváhagyás → Magic link küldés
5. Regisztráció → Fizetés → QR jegy

### E) Check-in Folyamat
1. **Admin** bejelentkezés → `/checkin` oldal
2. QR kód szkennelése (use vip3@ceogala.test - már van QR jegye)
3. Zöld kártya → "Check In" gomb
4. **Újra szkennel** → Sárga kártya (duplikált)
5. Admin látja az "Override" gombot
6. **Staff** bejelentkezés → `/checkin`
7. Szkennel duplikáltat → Sárga kártya, DE nincs Override gomb!

### F) Ültetés Tesztelés
1. Admin → Seating
2. Drag & drop vendégeket asztalokhoz
3. Páros vendégnél mindkét személy megjelenik
4. Export CSV → Ellenőrzés

---

## 6. PWA Vendég App Tesztelés

A vendégek PWA alkalmazásban látják jegyüket:

1. Nyisd meg mobilon: https://ceogala.mflevents.space/pwa
2. Bejelentkezés kóddal (pl. `CEOG-ABC123`)
3. Dashboard → Profil → Jegy (QR kód) → Asztal info

**PWA teszt kód generálás**: Admin → Guest List → Guest details → PWA Auth Code

---

## 7. Kapcsolat

Kérdés esetén: [fejlesztő email/telefon]

**Hibajelentés formátum**:
- Mi történt?
- Melyik oldalon?
- Melyik böngészőben?
- Screenshot ha van

---

*Generálva: 2025-12-18*
