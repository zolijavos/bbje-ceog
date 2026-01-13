# Manuális Teszt Dokumentum - v2.10.0 Email Változások

**Verzió:** 2.10.0
**Dátum:** 2026-01-13
**Dokumentum típusa:** Manuális teszt instrukciók tesztelőknek

---

## Tartalomjegyzék

1. [Teszt Környezet Előkészítése](#1-teszt-környezet-előkészítése)
2. [Teszt 1: Automatikus Visszaigazoló Emailek](#2-teszt-1-automatikus-visszaigazoló-emailek)
3. [Teszt 2: Páros Jegy Dupla QR Kód](#3-teszt-2-páros-jegy-dupla-qr-kód)
4. [Teszt 3: Email Sorrend Ellenőrzés](#4-teszt-3-email-sorrend-ellenőrzés)
5. [Teszt 4: Partner Külön Guest Rekord](#5-teszt-4-partner-külön-guest-rekord)
6. [Teszt 5: Jegy Email PWA Link Eltávolítás](#6-teszt-5-jegy-email-pwa-link-eltávolítás)
7. [Teszt Eredmények Összesítő](#7-teszt-eredmények-összesítő)

---

## 1. Teszt Környezet Előkészítése

### Előfeltételek

| Követelmény | Leírás |
|-------------|--------|
| Admin hozzáférés | `admin@ceogala.test` / `Admin123!` |
| Email hozzáférés | Hozzáférés a teszt email fiókokhoz vagy admin email naplóhoz |
| Böngésző | Chrome, Firefox vagy Safari (legújabb verzió) |
| Teszt URL | `https://ceogala.mflevents.space` vagy lokális dev környezet |

### Teszt Adatok Előkészítése

Minden teszthez friss teszt adatokra van szükség. Használj egyedi email címeket a tesztek elkülönítéséhez:

```
Ajánlott formátum: test-[DÁTUM]-[TESZTSZÁM]@example.com
Példa: test-0113-01@example.com
```

### Admin Belépés

1. Navigálj a `/admin` oldalra
2. Jelentkezz be az admin fiókkal
3. Ellenőrizd, hogy a Dashboard betöltődik

---

## 2. Teszt 1: Automatikus Visszaigazoló Emailek

### Cél
Ellenőrizni, hogy VIP regisztráció után mindkét fél (fővendég és partner) megkapja a visszaigazoló emailt a beküldött adatokkal.

### Előkészítés

| Lépés | Művelet | Elvárt eredmény |
|-------|---------|-----------------|
| 1.1 | Navigálj `/admin/guests` oldalra | Vendéglista megjelenik |
| 1.2 | Kattints "Vendég hozzáadása" gombra | Modal megnyílik |
| 1.3 | Töltsd ki az alábbi adatokkal: | - |
| | - Név: `Teszt Vendég VIP` | |
| | - Email: `test-vip-main@example.com` | |
| | - Típus: `VIP` | |
| | - Cég: `Teszt Cég Kft.` | |
| | - Beosztás: `CEO` | |
| 1.4 | Kattints "Mentés" | Vendég létrejön |

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 2.1 | Keresd meg a vendéget a listában | Megjelenik a listában | |
| 2.2 | Kattints a "Magic Link Küldés" gombra | Küldés sikeres üzenet | |
| 2.3 | Navigálj `/admin/email-log` oldalra | Email napló megjelenik | |
| 2.4 | Keresd meg a magic link emailt | `magic_link` típusú email látható | |
| 2.5 | Másold ki a magic link URL-t az email naplóból | URL másolva | |
| 2.6 | Nyisd meg a magic linket új inkognitó ablakban | VIP regisztrációs oldal betölt | |
| 2.7 | Töltsd ki a regisztrációs űrlapot: | - | |
| | - Megszólítás: `Dr.` | | |
| | - Telefonszám: `+36 30 123 4567` | | |
| | - Étrendi igény: `Vegetáriánus` | | |
| | - Partner: ✓ (igen) | | |
| | - Partner neve: `Teszt Partner` | | |
| | - Partner email: `test-vip-partner@example.com` | | |
| 2.8 | Fogadd el a feltételeket és kattints "Regisztráció" | Sikeres regisztráció üzenet | |
| 2.9 | Navigálj vissza `/admin/email-log` oldalra | Email napló frissül | |
| 2.10 | Keress `registration_feedback` típusú emailt a fővendégnek | Email megtalálható | |
| 2.11 | Ellenőrizd az email tartalmát: | - | |
| | - Tartalmazza: "Dr. Teszt Vendég VIP" | | |
| | - Tartalmazza: "Teszt Cég Kft." | | |
| | - Tartalmazza: "+36 30 123 4567" | | |
| | - Tartalmazza: "Vegetáriánus" | | |
| | - Tartalmazza: Partner információk | | |
| | - CEO Gala 2026 fejléc kép látható | | |
| 2.12 | Keress `registration_feedback_partner` típusú emailt | Partner email megtalálható | |
| 2.13 | Ellenőrizd a partner email tartalmát: | - | |
| | - Címzett: `test-vip-partner@example.com` | | |
| | - Tartalmazza: "Teszt Partner" | | |
| | - Tartalmazza: regisztráló neve | | |

### Sikerkritériumok

- [ ] Fővendég kapott `registration_feedback` emailt
- [ ] Partner kapott `registration_feedback_partner` emailt
- [ ] Mindkét email tartalmazza a beküldött adatokat
- [ ] CEO Gala 2026 fejléc kép megjelenik

### Megjegyzések

```
[Ide írd a tesztelés közben tapasztalt megjegyzéseket]
```

---

## 3. Teszt 2: Páros Jegy Dupla QR Kód

### Cél
Ellenőrizni, hogy páros jegynél mindkét vendég megkapja MINDKÉT QR kódot a jegy emailben.

### Előkészítés

| Lépés | Művelet | Elvárt eredmény |
|-------|---------|-----------------|
| 3.1 | Hozz létre új fizető vendéget: | - |
| | - Név: `Teszt Fizető Páros` | |
| | - Email: `test-paired-main@example.com` | |
| | - Típus: `paying_paired` | |
| | - Cég, Beosztás kitöltve | |
| 3.2 | Küldj magic linket | Email elküldve |

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 4.1 | Nyisd meg a magic linket | Fizetős regisztrációs oldal | |
| 4.2 | Töltsd ki a regisztrációt: | - | |
| | - Partner neve: `Páros Partner` | | |
| | - Partner email: `test-paired-partner@example.com` | | |
| | - Számlázási adatok kitöltve | | |
| 4.3 | Válaszd a "Banki átutalás" fizetési módot | Átutalás részletek megjelennek | |
| 4.4 | Fejezd be a regisztrációt | Sikeres, várakozás fizetésre | |
| 4.5 | Navigálj `/admin/guests` oldalra | Vendéglista | |
| 4.6 | Keresd meg a fővendéget | Megtalálható, "Utalásra vár" státusz | |
| 4.7 | Kattints a vendégre, majd "Fizetés jóváhagyása" | Fizetés jóváhagyva | |
| 4.8 | Várj 5-10 másodpercet a jegy generálásra | - | |
| 4.9 | Navigálj `/admin/email-log` oldalra | Email napló | |
| 4.10 | Keresd a `ticket_delivery` emailt a fővendégnek | Email megtalálható | |
| 4.11 | **KRITIKUS:** Ellenőrizd a fővendég email tartalmát: | - | |
| | - Tartalmaz QR kódot a fővendégnek (első QR) | | |
| | - Tartalmaz QR kódot a partnernek (második QR) | | |
| | - Mindkét QR kód különböző | | |
| | - Szöveg jelzi melyik kié | | |
| 4.12 | Keresd a `partner_ticket_delivery` emailt | Partner email megtalálható | |
| 4.13 | **KRITIKUS:** Ellenőrizd a partner email tartalmát: | - | |
| | - Tartalmaz QR kódot a partnernek (első QR) | | |
| | - Tartalmaz QR kódot a fővendégnek (második QR) | | |
| | - Mindkét QR kód különböző | | |

### Sikerkritériumok

- [ ] Fővendég email 2 QR kódot tartalmaz (saját + partner)
- [ ] Partner email 2 QR kódot tartalmaz (saját + fővendég)
- [ ] A QR kódok megfelelően címkézettek
- [ ] Mindkét QR kód egyedi és beolvasható

### Megjegyzések

```
[Ide írd a tesztelés közben tapasztalt megjegyzéseket]
```

---

## 4. Teszt 3: Email Sorrend Ellenőrzés

### Cél
Ellenőrizni, hogy a VIP regisztráció után ELŐSZÖR a visszaigazoló email érkezik, és UTÁNA a jegy email.

### Előkészítés

Használd az 1. tesztben létrehozott VIP regisztrációt, vagy hozz létre újat.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 5.1 | Navigálj `/admin/email-log` oldalra | Email napló | |
| 5.2 | Szűrj a teszt vendég email címére | Csak az adott vendég emailjei | |
| 5.3 | Rendezd időrend szerint (legrégebbi elöl) | Rendezett lista | |
| 5.4 | Azonosítsd a regisztráció utáni emaileket: | - | |
| | 1. `registration_feedback` (visszaigazoló) | | |
| | 2. `ticket_delivery` (jegy) | | |
| 5.5 | Hasonlítsd össze az időbélyegeket | - | |
| | - `registration_feedback` időbélyeg: ______ | | |
| | - `ticket_delivery` időbélyeg: ______ | | |
| 5.6 | **KRITIKUS:** Ellenőrizd a sorrendet | Visszaigazoló ELŐBB mint jegy | |

### Időbélyeg Ellenőrzés

| Email típus | Időbélyeg | Sorrend |
|-------------|-----------|---------|
| `registration_feedback` | __________ | 1. (első) |
| `ticket_delivery` | __________ | 2. (második) |

### Sikerkritériumok

- [ ] `registration_feedback` email időbélyege korábbi
- [ ] `ticket_delivery` email időbélyege későbbi
- [ ] A különbség néhány másodperc

### Megjegyzések

```
[Ide írd a tesztelés közben tapasztalt megjegyzéseket]
```

---

## 5. Teszt 4: Partner Külön Guest Rekord

### Cél
Ellenőrizni, hogy a partner külön Guest rekordként jön létre saját Registration-nel és egyedi QR kóddal.

### Előkészítés

Használd a 2. tesztben létrehozott páros regisztrációt.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 6.1 | Navigálj `/admin/guests` oldalra | Vendéglista | |
| 6.2 | Keress a partner nevére: `Páros Partner` | - | |
| 6.3 | **KRITIKUS:** Partner külön sorként jelenik meg | Külön sor a listában | |
| 6.4 | Ellenőrizd a partner adatait a listában: | - | |
| | - Név: `Páros Partner` | | |
| | - Email: `test-paired-partner@example.com` | | |
| | - Típus: megjelenik | | |
| 6.5 | Kattints a partnerre a részletek megtekintéséhez | Vendég részletek modal | |
| 6.6 | Ellenőrizd a Registration adatokat: | - | |
| | - Van saját Registration rekord | | |
| | - Regisztrációs státusz látható | | |
| 6.7 | Ellenőrizd a QR kód adatokat: | - | |
| | - Van egyedi QR kód hash | | |
| | - A QR kód különbözik a fővendégétől | | |
| 6.8 | Hasonlítsd össze a fővendég és partner QR kódját | Különböző QR hash értékek | |

### QR Kód Összehasonlítás

| Vendég | QR Kód Hash (első 8 karakter) |
|--------|-------------------------------|
| Fővendég (`Teszt Fizető Páros`) | __________ |
| Partner (`Páros Partner`) | __________ |

### Sikerkritériumok

- [ ] Partner külön sorként jelenik meg a vendéglistában
- [ ] Partner saját Guest rekorddal rendelkezik
- [ ] Partner saját Registration rekorddal rendelkezik
- [ ] Partner egyedi QR kóddal rendelkezik
- [ ] A QR kódok különbözőek

### Megjegyzések

```
[Ide írd a tesztelés közben tapasztalt megjegyzéseket]
```

---

## 6. Teszt 5: Jegy Email PWA Link Eltávolítás

### Cél
Ellenőrizni, hogy a jegy emailekből eltávolításra került a PWA deep link szekció.

### Előkészítés

Használd bármelyik korábbi teszt jegy emailjét, vagy generálj újat.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 7.1 | Navigálj `/admin/email-log` oldalra | Email napló | |
| 7.2 | Keress egy `ticket_delivery` típusú emailt | Email megtalálható | |
| 7.3 | Nyisd meg az email tartalmát (Preview) | Email tartalom megjelenik | |
| 7.4 | Görgess végig az egész email tartalmon | - | |
| 7.5 | **KRITIKUS:** Keress "Open in Gala App" szöveget | NEM található | |
| 7.6 | **KRITIKUS:** Keress "PWA" szöveget | NEM található | |
| 7.7 | **KRITIKUS:** Keress "ceogala.hu/pwa" linket | NEM található az email szövegben | |
| 7.8 | Ellenőrizd, hogy az alábbiak MEGVANNAK: | - | |
| | - QR kód kép | | |
| | - Esemény dátum és helyszín | | |
| | - Vendég neve | | |
| | - Jegy típusa | | |

### Email Tartalom Ellenőrzőlista

| Elem | Jelen kell legyen | Státusz |
|------|-------------------|---------|
| QR kód kép | ✓ IGEN | |
| Vendég neve | ✓ IGEN | |
| Esemény dátum | ✓ IGEN | |
| Helyszín | ✓ IGEN | |
| "Open in Gala App" gomb | ✗ NEM | |
| PWA deep link | ✗ NEM | |
| PWA auth kód | ✗ NEM | |

### Sikerkritériumok

- [ ] Nincs "Open in Gala App" vagy hasonló szekció
- [ ] Nincs PWA deep link az emailben
- [ ] Nincs PWA auth kód megjelenítve
- [ ] Az email továbbra is tartalmazza a szükséges elemeket (QR, esemény info)

### Megjegyzések

```
[Ide írd a tesztelés közben tapasztalt megjegyzéseket]
```

---

## 7. Teszt Eredmények Összesítő

### Tesztelő Adatok

| Mező | Érték |
|------|-------|
| Tesztelő neve | |
| Tesztelés dátuma | |
| Környezet | [ ] Produkció [ ] Staging [ ] Lokális |
| Böngésző | |
| Verzió | v2.10.0 |

### Összesített Eredmények

| Teszt | Név | Eredmény | Megjegyzés |
|-------|-----|----------|------------|
| 1 | Automatikus Visszaigazoló Emailek | [ ] SIKERES [ ] SIKERTELEN | |
| 2 | Páros Jegy Dupla QR Kód | [ ] SIKERES [ ] SIKERTELEN | |
| 3 | Email Sorrend Ellenőrzés | [ ] SIKERES [ ] SIKERTELEN | |
| 4 | Partner Külön Guest Rekord | [ ] SIKERES [ ] SIKERTELEN | |
| 5 | Jegy Email PWA Link Eltávolítás | [ ] SIKERES [ ] SIKERTELEN | |

### Összesítés

| Metrika | Érték |
|---------|-------|
| Összes teszt | 5 |
| Sikeres | /5 |
| Sikertelen | /5 |
| Blokkoló hiba | [ ] Igen [ ] Nem |

### Azonosított Hibák

| # | Teszt | Leírás | Súlyosság | Státusz |
|---|-------|--------|-----------|---------|
| 1 | | | [ ] Kritikus [ ] Magas [ ] Közepes [ ] Alacsony | [ ] Nyitott [ ] Javítva |
| 2 | | | [ ] Kritikus [ ] Magas [ ] Közepes [ ] Alacsony | [ ] Nyitott [ ] Javítva |
| 3 | | | [ ] Kritikus [ ] Magas [ ] Közepes [ ] Alacsony | [ ] Nyitott [ ] Javítva |

### Végső Értékelés

```
[ ] ELFOGADVA - Minden teszt sikeres, release kész
[ ] FELTÉTELESEN ELFOGADVA - Kisebb hibák, javítás után release
[ ] ELUTASÍTVA - Kritikus hibák, újratesztelés szükséges
```

### Aláírások

| Szerep | Név | Dátum | Aláírás |
|--------|-----|-------|---------|
| Tesztelő | | | |
| Fejlesztő | | | |
| Product Owner | | | |

---

## Függelék: Gyors Referencia

### Admin URL-ek

| Oldal | URL |
|-------|-----|
| Vendéglista | `/admin/guests` |
| Email napló | `/admin/email-log` |
| Email sablonok | `/admin/email-templates` |
| Changelog | `/admin/changelog` |
| Release tesztelés | `/admin/release-testing` |

### Email Típusok

| Slug | Leírás |
|------|--------|
| `magic_link` | Regisztrációs meghívó |
| `registration_feedback` | Visszaigazoló email (fővendég) |
| `registration_feedback_partner` | Visszaigazoló email (partner) |
| `ticket_delivery` | Jegy kézbesítés (fővendég) |
| `partner_ticket_delivery` | Jegy kézbesítés (partner) |

### Teszt Fiók

```
Admin: admin@ceogala.test / Admin123!
Staff: staff@ceogala.test / Staff123!
```

---

*Dokumentum vége - CEO Gala v2.10.0 Manuális Teszt*
