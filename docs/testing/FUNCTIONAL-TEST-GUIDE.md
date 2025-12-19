# CEO Gala - Funkcionális Tesztelési Útmutató

> **Célcsoport:** Nem-technikai tesztelők, üzleti felhasználók, QA tesztelők
>
> **Verzió:** 1.0
>
> **Utolsó frissítés:** 2025-12-17

---

## Tartalom

1. [Bevezetés](#1-bevezetés)
2. [Teszt Környezet](#2-teszt-környezet)
3. [Teszt Adatok](#3-teszt-adatok)
4. [Tesztesetek](#4-tesztesetek)
   - [TC-01: VIP Vendég Regisztráció](#tc-01-vip-vendég-regisztráció)
   - [TC-02: Fizető Vendég Regisztráció](#tc-02-fizető-vendég-regisztráció)
   - [TC-03: Páros Jegy Regisztráció](#tc-03-páros-jegy-regisztráció)
   - [TC-04: Jelentkező Jóváhagyás](#tc-04-jelentkező-jóváhagyás)
   - [TC-05: Banki Átutalás Jóváhagyás](#tc-05-banki-átutalás-jóváhagyás)
   - [TC-06: PWA Bejelentkezés](#tc-06-pwa-bejelentkezés)
   - [TC-07: QR Jegy Megjelenítés](#tc-07-qr-jegy-megjelenítés)
   - [TC-08: Check-in Folyamat](#tc-08-check-in-folyamat)
   - [TC-09: Ültetési Rend Kezelés](#tc-09-ültetési-rend-kezelés)
   - [TC-10: Email Küldés](#tc-10-email-küldés)
5. [Elfogadási Feltételek Összesítő](#5-elfogadási-feltételek-összesítő)
6. [Hibajegy Sablon](#6-hibajegy-sablon)

---

## 1. Bevezetés

### Mi ez a dokumentum?

Ez az útmutató segít a CEO Gala rendszer manuális tesztelésében. Minden teszteset tartalmaz:

- **Lépésről lépésre utasításokat** (képernyőképekkel)
- **Teszt adatokat** (másolható példák)
- **Elfogadási feltétel checklistet** (mit kell ellenőrizni)

### Ki használhatja?

- Üzleti elemzők
- Manuális tesztelők
- Ügyfél oldali tesztelők
- Bárki, aki nem programozó, de tesztelni szeretne

### Szükséges előismeretek

- Böngésző használata (Chrome ajánlott)
- Email fogadás
- Alapvető webes felhasználói ismeretek

---

## 2. Teszt Környezet

### Hozzáférési adatok

| Környezet | URL |
|-----------|-----|
| **Teszt szerver** | https://ceogala.mflevents.space |
| **Admin felület** | https://ceogala.mflevents.space/admin |
| **PWA alkalmazás** | https://ceogala.mflevents.space/pwa |
| **Check-in scanner** | https://ceogala.mflevents.space/checkin |

### Admin bejelentkezés

| Mező | Érték |
|------|-------|
| **Email** | `admin@ceogala.test` |
| **Jelszó** | `Admin123!` |

### Staff bejelentkezés (check-in)

| Mező | Érték |
|------|-------|
| **Email** | `staff@ceogala.test` |
| **Jelszó** | `Staff123!` |

---

## 3. Teszt Adatok

### 3.1 Vendég típusok

| Típus | Kód | Leírás | Jegy ár |
|-------|-----|--------|---------|
| VIP | `vip` | Meghívott VIP vendég | Ingyenes |
| Fizető (egyéni) | `paying_single` | Egyéni jegyet vásárló | 100.000 Ft |
| Fizető (páros) | `paying_paired` | Páros jegyet vásárló | 150.000 Ft |
| Jelentkező | `applicant` | Nyilvánosan jelentkező | Jóváhagyás után |

### 3.2 Személyes adatok sablon

```
Név:           Teszt Vendég [Dátum]
Email:         teszt-[tipus]-[datum]@ceogala.hu
Telefon:       +36 30 123 4567
Cégnév:        Teszt Kft.
Pozíció:       Vezérigazgató
Étrendi igény: Vegetáriánus
```

**Példa:** `teszt-vip-20251217@ceogala.hu`

### 3.3 Számlázási adatok sablon

```
Számlázási név:  Teszt Kft.
Adószám:         12345678-2-42
Cím:             Fő utca 1.
Város:           Budapest
Irányítószám:    1011
```

### 3.4 Partner adatok sablon (páros jegyhez)

```
Partner neve:    Partner Vendég
Partner email:   partner@teszt.hu
```

---

## 4. Tesztesetek

---

### TC-01: VIP Vendég Regisztráció

**Cél:** VIP vendég sikeres regisztrációja meghívó linkkel

**Előfeltétel:** Admin hozzáférés, VIP vendég létrehozva a rendszerben

**Időtartam:** ~5 perc

#### Teszt adatok

| Mező | Érték |
|------|-------|
| Név | VIP Teszt 2025 |
| Email | `vip-test-[mai dátum]@ceogala.hu` |
| Típus | VIP |

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Nyisd meg az admin felületet: `/admin` | Bejelentkező oldal megjelenik |
| 2 | Jelentkezz be az admin adatokkal | Dashboard megjelenik |
| 3 | Menj a **Vendégek** menüpontra | Vendéglista megjelenik |
| 4 | Kattints az **+ Új vendég** gombra | Vendég űrlap megjelenik |
| 5 | Töltsd ki a teszt adatokkal, típus: **VIP** | Mezők kitöltve |
| 6 | Kattints a **Mentés** gombra | Sikeres mentés üzenet |
| 7 | Kattints a vendég sorában a **Meghívó küldése** ikonra | Magic link email elküldve |
| 8 | Nyisd meg az emailt és kattints a meghívó linkre | Regisztrációs oldal megnyílik |
| 9 | Ellenőrizd: VIP badge látható | "VIP Guest" felirat megjelenik |
| 10 | Pipáld be a GDPR és lemondási feltételeket | Checkboxok bepipálva |
| 11 | Kattints a **Regisztráció** gombra | Sikeres regisztráció oldal |

#### Elfogadási feltételek checklist

- [ ] VIP vendég létrejött az admin felületen
- [ ] Meghívó email megérkezett
- [ ] Magic link működik (nem lejárt, nem érvénytelen)
- [ ] Regisztrációs oldalon "VIP Guest" badge látható
- [ ] GDPR és lemondási checkbox kötelező
- [ ] Sikeres regisztráció után átirányítás a success oldalra
- [ ] Vendég státusza "registered" lett
- [ ] QR kód automatikusan generálódott (VIP-nél azonnal)

---

### TC-02: Fizető Vendég Regisztráció

**Cél:** Egyéni jegyes vendég regisztrációja

**Előfeltétel:** Admin hozzáférés

**Időtartam:** ~8 perc

#### Teszt adatok

| Mező | Érték |
|------|-------|
| Név | Fizető Teszt 2025 |
| Email | `fizeto-test-[mai dátum]@ceogala.hu` |
| Típus | Fizető (egyéni) |
| Telefonszám | +36 30 123 4567 |
| Cégnév | Fizető Kft. |
| Pozíció | Igazgató |
| Számlázási név | Fizető Kft. |
| Adószám | 12345678-2-42 |
| Cím | Váci út 1. |
| Város | Budapest |
| Irányítószám | 1138 |

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Hozz létre új vendéget (típus: fizető egyéni) | Vendég létrejött |
| 2 | Küldj meghívó emailt | Email elküldve |
| 3 | Nyisd meg a meghívó linket | Regisztrációs oldal |
| 4 | Válaszd ki: **Egyéni jegy (100.000 Ft)** | Jegy típus kiválasztva |
| 5 | Töltsd ki a személyes adatokat | Tovább gomb aktív |
| 6 | Töltsd ki a számlázási adatokat | Tovább gomb aktív |
| 7 | Fogadd el a beleegyezéseket | Checkboxok bepipálva |
| 8 | Kattints a **Regisztráció** gombra | Fizetési módszer választó |
| 9 | Válaszd: **Bankkártya** vagy **Banki átutalás** | Fizetési folyamat indul |

#### Elfogadási feltételek checklist

- [ ] Jegy típus választó megjelenik (egyéni/páros)
- [ ] Egyéni jegy ára helyesen: 100.000 Ft
- [ ] Személyes adatok űrlap validál (kötelező mezők)
- [ ] Számlázási adatok űrlap validál
- [ ] Fizetési módszer választható (kártya/átutalás)
- [ ] Bankkártyánál Stripe oldal megnyílik
- [ ] Átutalásnál bankszámla adatok megjelennek

---

### TC-03: Páros Jegy Regisztráció

**Cél:** Páros jegy vásárlása partner adatokkal

**Előfeltétel:** Admin hozzáférés

**Időtartam:** ~10 perc

#### Teszt adatok

**Fő vendég:**

| Mező | Érték |
|------|-------|
| Név | Páros Teszt 2025 |
| Email | `paros-test-[mai dátum]@ceogala.hu` |
| Típus | Fizető (páros) |
| Telefonszám | +36 30 999 8888 |
| Cégnév | Páros Kft. |

**Partner:**

| Mező | Érték |
|------|-------|
| Partner neve | Partner Anna |
| Partner email | partner-anna@teszt.hu |

**Számlázás:**

| Mező | Érték |
|------|-------|
| Számlázási név | Páros Kft. |
| Adószám | 87654321-2-42 |
| Cím | Andrássy út 100. |
| Város | Budapest |
| Irányítószám | 1062 |

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Hozz létre vendéget (típus: fizető páros) | Vendég létrejött |
| 2 | Küldj meghívót és nyisd meg | Regisztrációs oldal |
| 3 | Válaszd: **Páros jegy (150.000 Ft)** | Jegy kiválasztva |
| 4 | Töltsd ki a személyes adatokat | Tovább gomb aktív |
| 5 | Töltsd ki a számlázási adatokat | Tovább gomb aktív |
| 6 | Töltsd ki a **Partner adatokat** | Partner mezők kitöltve |
| 7 | Fogadd el a beleegyezéseket | Checkboxok bepipálva |
| 8 | Fejezd be a regisztrációt | Sikeres regisztráció |

#### Elfogadási feltételek checklist

- [ ] Páros jegy ára helyesen: 150.000 Ft
- [ ] Partner adatok lépés megjelenik (név + email)
- [ ] Partner név kötelező mező
- [ ] Partner email kötelező mező és valid formátum
- [ ] Regisztráció után mindkét vendég (fő + partner) szerepel
- [ ] Mindkét vendég ugyanahhoz az asztalhoz lesz rendelve (ha van ültetés)

---

### TC-04: Jelentkező Jóváhagyás

**Cél:** Nyilvános jelentkezés benyújtása és admin jóváhagyás

**Előfeltétel:** Admin hozzáférés

**Időtartam:** ~8 perc

#### Teszt adatok

| Mező | Érték |
|------|-------|
| Név | Jelentkező Teszt 2025 |
| Email | `jelentkezo-[mai dátum]@ceogala.hu` |
| Cégnév | Jelentkező Startup Kft. |
| Pozíció | CEO |
| Motiváció | Szeretnék részt venni az eseményen, mert... |

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Nyisd meg: `/apply` (jelentkezési oldal) | Jelentkezési űrlap megjelenik |
| 2 | Töltsd ki az összes mezőt | Mezők kitöltve |
| 3 | Pipáld be a GDPR beleegyezést | Checkbox bepipálva |
| 4 | Kattints a **Jelentkezés** gombra | Sikeres üzenet |
| 5 | Admin: Menj a **Jelentkezők** menüpontra | Jelentkező listában látható |
| 6 | Kattints a jelentkező sorában a **Jóváhagyás** gombra | Megerősítő ablak |
| 7 | Erősítsd meg a jóváhagyást | Státusz: Jóváhagyva |
| 8 | Ellenőrizd: Email küldve a jelentkezőnek | Magic link email megérkezett |

#### Elfogadási feltételek checklist

- [ ] Jelentkezési űrlap elérhető publikusan (bejelentkezés nélkül)
- [ ] Minden kötelező mező validál (név, email, motiváció)
- [ ] GDPR beleegyezés kötelező
- [ ] Sikeres jelentkezés után visszajelzés
- [ ] Admin látja a jelentkezőt a listában
- [ ] Jóváhagyás gomb működik
- [ ] Jóváhagyás után magic link email megy ki
- [ ] Elutasítás gomb működik (opcionális indoklással)

---

### TC-05: Banki Átutalás Jóváhagyás

**Cél:** Admin jóváhagyja a banki átutalással fizető vendéget

**Előfeltétel:** Van függő banki átutalásos fizetés

**Időtartam:** ~5 perc

#### Teszt adatok

Használj egy korábban regisztrált, banki átutalásos vendéget.

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Admin: Menj a **Fizetések** menüpontra | Fizetések lista megjelenik |
| 2 | Szűrj: **Függőben** + **Banki átutalás** | Szűrt lista |
| 3 | Keresd meg a teszt vendéget | Vendég megtalálva |
| 4 | Ellenőrizd az adatokat (összeg, módszer) | Adatok helyesek |
| 5 | Kattints a **Jóváhagyás** gombra | Megerősítő ablak |
| 6 | Erősítsd meg | Fizetés státusz: Fizetve |
| 7 | Ellenőrizd: QR jegy generálódott | Vendég státusz frissült |

#### Elfogadási feltételek checklist

- [ ] Fizetések oldal mutatja a függő fizetéseket
- [ ] Szűrés működik (státusz, módszer)
- [ ] Jóváhagyás gomb csak admin számára elérhető
- [ ] Jóváhagyás után fizetés státusz = "paid"
- [ ] Jóváhagyás után QR kód automatikusan generálódik
- [ ] Jóváhagyás után vendég kap értesítő emailt a jegyről

---

### TC-06: PWA Bejelentkezés

**Cél:** Vendég bejelentkezés a PWA alkalmazásba

**Előfeltétel:** Regisztrált vendég PWA kóddal

**Időtartam:** ~3 perc

#### Teszt adatok

| Mező | Érték |
|------|-------|
| PWA kód | `CEOG-XXXXXX` (6 karakteres kód) |

*A PWA kód az admin felületen vagy az adatbázisban található.*

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Nyisd meg: `/pwa` | CEO Gala welcome screen |
| 2 | Kattints a **Kód megadása** gombra | Kód beviteli mező |
| 3 | Írd be a PWA kódot: `CEOG-XXXXXX` | Kód beírva |
| 4 | Kattints a **Belépés** gombra | Dashboard megjelenik |
| 5 | Ellenőrizd: Vendég neve látható | Név megjelenik |
| 6 | Navigálj a menüpontok között | Minden menü elérhető |

#### Elfogadási feltételek checklist

- [ ] PWA főoldal betölt (welcome screen)
- [ ] Kód beviteli mező működik
- [ ] Hibás kód esetén hibaüzenet jelenik meg
- [ ] Sikeres belépés után dashboard látható
- [ ] Vendég neve helyesen jelenik meg
- [ ] Menü navigáció működik (Jegy, Profil, Asztal)

---

### TC-07: QR Jegy Megjelenítés

**Cél:** QR jegy megtekintése a PWA-ban

**Előfeltétel:** Bejelentkezett vendég a PWA-ban, fizetett státusszal

**Időtartam:** ~2 perc

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | PWA: Navigálj a **Jegy** menüpontra | Jegy oldal megjelenik |
| 2 | Ellenőrizd: QR kód látható | QR kód renderelődik |
| 3 | Ellenőrizd: Vendég neve a jegyen | Név megjelenik |
| 4 | Ellenőrizd: Jegy típusa | VIP/Egyéni/Páros |
| 5 | Próbáld beolvasni a QR kódot | Kód beolvasható |

#### Elfogadási feltételek checklist

- [ ] Jegy oldal betölt
- [ ] QR kód megjelenik (nem üres, nem hibás)
- [ ] QR kód beolvasható (telefonnal, scannerrel)
- [ ] Vendég neve helyesen jelenik meg
- [ ] Jegy típusa helyesen jelenik meg
- [ ] Offline módban is látható a jegy (PWA cache)

---

### TC-08: Check-in Folyamat

**Cél:** Vendég beléptető QR kód leolvasása

**Előfeltétel:** Staff bejelentkezés, vendég QR jeggyel

**Időtartam:** ~5 perc

#### Teszt adatok

Használj egy regisztrált vendéget, akinek van QR jegye.

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Nyisd meg: `/checkin` | Check-in scanner oldal |
| 2 | Jelentkezz be staff felhasználóval | Scanner aktiválódik |
| 3 | Engedélyezd a kamera hozzáférést | Kamera kép látható |
| 4 | Olvasd be a vendég QR kódját | Vendég adatok megjelennek |
| 5 | Ellenőrizd: **ZÖLD kártya** (érvényes jegy) | Vendég neve, típusa látható |
| 6 | Kattints a **Beléptetés** gombra | Sikeres beléptetés |
| 7 | Próbáld újra beolvasni ugyanazt a kódot | **SÁRGA kártya** (már belépett) |

#### Elfogadási feltételek checklist

- [ ] Check-in oldal betölt
- [ ] Staff bejelentkezés szükséges
- [ ] Kamera engedélykérés megjelenik
- [ ] QR kód beolvasás működik
- [ ] Érvényes jegy = ZÖLD kártya + vendég adatok
- [ ] Beléptetés gomb működik
- [ ] Már belépett vendég = SÁRGA kártya + figyelmeztetés
- [ ] Érvénytelen QR = PIROS kártya + hibaüzenet
- [ ] Admin override lehetőség (dupla beléptetés felülírása)

---

### TC-09: Ültetési Rend Kezelés

**Cél:** Asztalok létrehozása és vendégek hozzárendelése

**Előfeltétel:** Admin hozzáférés, regisztrált vendégek

**Időtartam:** ~10 perc

#### Teszt adatok

**Asztal:**

| Mező | Érték |
|------|-------|
| Név | VIP Asztal 1 |
| Kapacitás | 8 fő |
| Típus | VIP |

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Admin: Menj az **Asztalok** menüpontra | Asztalok lista |
| 2 | Kattints az **+ Új asztal** gombra | Asztal űrlap |
| 3 | Töltsd ki: Név, Kapacitás, Típus | Mezők kitöltve |
| 4 | Mentsd el | Asztal létrejött |
| 5 | Menj az **Ültetés** menüpontra | Ültetési térkép |
| 6 | Válassz ki egy vendéget a listából | Vendég kiválasztva |
| 7 | Húzd rá az asztalra (drag & drop) | Vendég hozzárendelve |
| 8 | Ellenőrizd az asztal kapacitását | Helyes szám jelenik meg |

#### Elfogadási feltételek checklist

- [ ] Asztal létrehozás működik
- [ ] Asztal név egyedi (duplikált név esetén hiba)
- [ ] Kapacitás szám validál (1-20 között)
- [ ] Ültetési térkép betölt
- [ ] Drag & drop működik (vendég → asztal)
- [ ] Kapacitás túllépés esetén figyelmeztetés
- [ ] Vendég eltávolítása asztalról működik
- [ ] Páros jegy esetén mindkét vendég ugyanarra az asztalra kerül

---

### TC-10: Email Küldés

**Cél:** Email küldése vendégeknek

**Előfeltétel:** Admin hozzáférés, regisztrált vendégek

**Időtartam:** ~5 perc

#### Teszt adatok

| Mező | Érték |
|------|-------|
| Címzett | Teszt vendég email |
| Sablon | Magic Link |
| Tárgy | CEO Gala 2026 - Meghívó |

#### Lépések

| # | Lépés | Várt eredmény |
|---|-------|---------------|
| 1 | Admin: Menj az **Email** menüpontra | Email küldő oldal |
| 2 | Válassz sablont: **Magic Link** | Sablon betöltődik |
| 3 | Válaszd ki a címzettet | Vendég kiválasztva |
| 4 | Tekintsd meg az előnézetet | Email előnézet látható |
| 5 | Kattints a **Küldés** gombra | Email elküldve |
| 6 | Ellenőrizd az **Email napló** menüpontban | Küldés naplózva |

#### Elfogadási feltételek checklist

- [ ] Email sablonok elérhetők
- [ ] Sablon előnézet működik
- [ ] Címzett választás működik (egyéni/tömeges)
- [ ] Email küldés sikeres
- [ ] Email napló mutatja a küldött emaileket
- [ ] Sikertelen küldés esetén hibaüzenet és újrapróbálkozás

---

## 5. Elfogadási Feltételek Összesítő

### Kritikus funkciók (MUST PASS)

| # | Funkció | Teszteset | Státusz |
|---|---------|-----------|---------|
| 1 | VIP regisztráció | TC-01 | [ ] |
| 2 | Fizető regisztráció | TC-02 | [ ] |
| 3 | Páros jegy regisztráció | TC-03 | [ ] |
| 4 | PWA bejelentkezés | TC-06 | [ ] |
| 5 | QR jegy megjelenítés | TC-07 | [ ] |
| 6 | Check-in QR leolvasás | TC-08 | [ ] |

### Fontos funkciók (SHOULD PASS)

| # | Funkció | Teszteset | Státusz |
|---|---------|-----------|---------|
| 7 | Jelentkező jóváhagyás | TC-04 | [ ] |
| 8 | Banki átutalás jóváhagyás | TC-05 | [ ] |
| 9 | Ültetési rend | TC-09 | [ ] |
| 10 | Email küldés | TC-10 | [ ] |

### Eredmény összesítés

| Kategória | Összes | Sikeres | Sikertelen |
|-----------|--------|---------|------------|
| Kritikus | 6 | _ / 6 | _ / 6 |
| Fontos | 4 | _ / 4 | _ / 4 |
| **Összesen** | **10** | _ / 10 | _ / 10 |

**Elfogadás kritériuma:** Minden kritikus teszt sikeres + legalább 3/4 fontos teszt sikeres.

---

## 6. Hibajegy Sablon

Ha hibát találsz, használd az alábbi sablont a jelentéshez:

```
## Hiba összefoglaló
[Rövid, 1 mondatos leírás]

## Teszteset azonosító
TC-XX

## Lépések a hiba reprodukálásához
1. [Első lépés]
2. [Második lépés]
3. [...]

## Várt eredmény
[Mi kellett volna történjen]

## Tényleges eredmény
[Mi történt valójában]

## Képernyőkép
[Ha van, csatold]

## Környezet
- Böngésző: Chrome/Firefox/Safari
- Verzió: [pl. Chrome 120]
- Eszköz: Desktop/Mobil
- Operációs rendszer: Windows/Mac/iOS/Android

## Prioritás
- [ ] Kritikus (blokkoló, nem használható a funkció)
- [ ] Magas (funkció hibás, de van workaround)
- [ ] Közepes (zavaró, de nem blokkoló)
- [ ] Alacsony (kozmetikai, javaslat)
```

---

## Kapcsolódó dokumentumok

- [E2E Teszt Státusz (technikai)](./E2E-TEST-STATUS.md)
- [VIP Regisztráció részletes útmutató](./MANUAL-VIP-REGISTRATION.md)
- [Fizetési folyamat részletes útmutató](./MANUAL-PAYMENT-FLOW-TEST.md)
- [Check-in részletes útmutató](./MANUAL-STAFF-CHECKIN.md)

---

*Utolsó frissítés: 2025-12-17*

*Készítette: QA Team*
