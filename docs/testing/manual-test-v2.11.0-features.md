# Manuális Teszt Dokumentum - v2.11.0 Funkciók

**Verzió:** 2.11.0
**Dátum:** 2026-01-14
**Dokumentum típusa:** Manuális teszt instrukciók tesztelőknek

---

## Tartalomjegyzék

1. [Teszt Környezet Előkészítése](#1-teszt-környezet-előkészítése)
2. [Teszt 1: Tömeges Email Vendég Előnézet](#2-teszt-1-tömeges-email-vendég-előnézet)
3. [Teszt 2: Tömb-Alapú Vendég Szűrő API](#3-teszt-2-tömb-alapú-vendég-szűrő-api)
4. [Teszt 3: VIP Regisztráció Státusz Javítás](#4-teszt-3-vip-regisztráció-státusz-javítás)
5. [Teszt 4: Meghívott Vendégek Ültetési Listában](#5-teszt-4-meghívott-vendégek-ültetési-listában)
6. [Teszt 5: Partner Detektálás](#6-teszt-5-partner-detektálás)
7. [Teszt 6: Dátum/Idő Input Láthatóság](#7-teszt-6-dátumidő-input-láthatóság)
8. [Teszt 7: MyForge Labs Logo](#8-teszt-7-myforge-labs-logo)
9. [Teszt 8: Partner Regisztráció Hibakezelés](#9-teszt-8-partner-regisztráció-hibakezelés)
10. [Teszt 9: AlreadyRegistered Oldal Kontraszt](#10-teszt-9-alreadyregistered-oldal-kontraszt)
11. [Teszt Eredmények Összesítő](#11-teszt-eredmények-összesítő)

---

## 1. Teszt Környezet Előkészítése

### Előfeltételek

| Követelmény | Leírás |
|-------------|--------|
| Admin hozzáférés | `admin@ceogala.test` / `Admin123!` |
| Böngésző | Chrome, Firefox vagy Safari (legújabb verzió) |
| Teszt URL | `https://ceogala.mflevents.space` vagy lokális dev környezet |
| DevTools | Network fül engedélyezve API tesztekhez |

### Admin Belépés

1. Navigálj a `/admin` oldalra
2. Jelentkezz be az admin fiókkal
3. Ellenőrizd, hogy a Dashboard betöltődik

---

## 2. Teszt 1: Tömeges Email Vendég Előnézet

### Cél
Ellenőrizni, hogy a tömeges email ütemezésnél megjelenik a szűrt vendégek előnézete.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 1.1 | Navigálj `/admin/scheduled-emails` oldalra | Scheduled Emails dashboard betölt | |
| 1.2 | Kattints a "Schedule Bulk Email" / "Tömeges Email Ütemezés" fülre | Bulk email form megjelenik | |
| 1.3 | Válassz email sablont | Sablon kiválasztva | |
| 1.4 | Válassz Guest Types szűrőt (pl. VIP) | Szűrő beállítva | |
| 1.5 | Ellenőrizd, hogy vendéglista táblázat megjelenik a szűrők alatt | Táblázat látható nevekkel és email címekkel | |
| 1.6 | Ellenőrizd, hogy max 50 vendég jelenik meg | Max 50 sor a táblázatban | |
| 1.7 | Ha több mint 50 vendég van, ellenőrizd "X more guests..." üzenetet | Üzenet megjelenik a táblázat alatt | |
| 1.8 | Ellenőrizd, hogy az ütemezés gomb mutatja a vendégszámot | "Schedule Bulk Emails (X guests)" szöveg | |
| 1.9 | Változtasd a szűrőket és ellenőrizd, hogy a lista frissül | Lista automatikusan frissül | |

### Sikerkritériumok

- [ ] Vendéglista táblázat megjelenik a szűrők alatt
- [ ] Maximum 50 vendég jelenik meg a táblázatban
- [ ] "X more guests..." üzenet látható ha több mint 50 vendég van
- [ ] Ütemezés gomb mutatja a pontos vendégszámot
- [ ] Lista automatikusan frissül szűrőváltáskor

---

## 3. Teszt 2: Tömb-Alapú Vendég Szűrő API

### Cél
Ellenőrizni, hogy az API helyesen kezeli a tömb-alapú szűrő paramétereket.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 2.1 | Nyisd meg a böngésző DevTools-t (F12) | DevTools megnyílik | |
| 2.2 | Navigálj a Network fülre | Network fül aktív | |
| 2.3 | Navigálj `/admin/scheduled-emails` és a Bulk fülre | Bulk email form megjelenik | |
| 2.4 | Válassz több Guest Type-ot (pl. VIP + Paying Single) | Több típus kiválasztva | |
| 2.5 | Ellenőrizd a Network fülön az API hívást | `guest_types=vip,paying_single` paraméter látható | |
| 2.6 | Válassz több Registration Status-t | Több státusz kiválasztva | |
| 2.7 | Ellenőrizd a Network fülön az API hívást | `registration_statuses=invited,registered` paraméter látható | |
| 2.8 | Ellenőrizd a `limit` paraméter értékét | `limit=500` látható | |

### API Paraméter Ellenőrzés

| Paraméter | Formátum | Ellenőrizve |
|-----------|----------|-------------|
| `guest_types` | Comma-separated (vip,paying_single,paying_paired,applicant) | |
| `registration_statuses` | Comma-separated (invited,registered,approved,declined) | |
| `is_vip_reception` | Boolean (true/false) | |
| `has_ticket` | Boolean (true/false) | |
| `has_table` | Boolean (true/false) | |
| `limit` | 500 | |

### Sikerkritériumok

- [ ] API helyesen formázza a tömb paramétereket vesszővel elválasztva
- [ ] Limit 500-ra van állítva
- [ ] Szűrők kombinálhatók

---

## 4. Teszt 3: VIP Regisztráció Státusz Javítás

### Cél
Ellenőrizni, hogy VIP regisztráció után a státusz "registered" (nem "approved").

### Előkészítés

| Lépés | Művelet | Elvárt eredmény |
|-------|---------|-----------------|
| 3.1 | Navigálj `/admin/guests` oldalra | Vendéglista megjelenik |
| 3.2 | Kattints "Vendég hozzáadása" gombra | Modal megnyílik |
| 3.3 | Töltsd ki: Név: `Teszt VIP v2.11`, Email: `test-vip-v211@example.com`, Típus: `VIP` | - |
| 3.4 | Kattints "Mentés" | Vendég létrejön |

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 4.1 | Keresd meg a vendéget a listában | Megjelenik "Invited" státusszal | |
| 4.2 | Küldj magic linket a vendégnek | Küldés sikeres | |
| 4.3 | Navigálj `/admin/email-log` oldalra | Email napló megjelenik | |
| 4.4 | Másold ki a magic link URL-t | URL másolva | |
| 4.5 | Nyisd meg a magic linket inkognitó ablakban | VIP regisztrációs oldal betölt | |
| 4.6 | Töltsd ki a regisztrációs űrlapot minimális adatokkal | - | |
| 4.7 | Kattints "Regisztráció" gombra | Sikeres regisztráció | |
| 4.8 | Navigálj vissza `/admin/guests` oldalra | Vendéglista | |
| 4.9 | **KRITIKUS:** Ellenőrizd a vendég státuszát | "Registered" (NEM "Approved") | |

### Sikerkritériumok

- [ ] VIP regisztráció után a státusz "Registered"
- [ ] A státusz NEM "Approved"
- [ ] A státusz NEM változik automatikusan "Approved"-ra

---

## 5. Teszt 4: Meghívott Vendégek Ültetési Listában

### Cél
Ellenőrizni, hogy "invited" státuszú vendégek megjelennek az ültetési listában.

### Előkészítés

| Lépés | Művelet | Elvárt eredmény |
|-------|---------|-----------------|
| 5.1 | Hozz létre új vendéget (ne küldj magic linket) | Vendég "Invited" státusszal |
| 5.2 | Jegyezd fel a vendég nevét | - |

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 6.1 | Navigálj `/admin/seating` oldalra | Ültetési térkép betölt | |
| 6.2 | Keresd a "Nem hozzárendelt vendégek" panelt | Panel látható | |
| 6.3 | Keress rá a korábban létrehozott vendégre | Vendég megjelenik a listában | |
| 6.4 | **KRITIKUS:** Ellenőrizd, hogy az "invited" státuszú vendég látható | Vendég a listában van | |
| 6.5 | Húzd a vendéget egy asztalhoz | Vendég hozzárendelve | |
| 6.6 | Ellenőrizd, hogy a hozzárendelés mentődött | Vendég az asztalnál látható | |

### Sikerkritériumok

- [ ] Invited státuszú vendégek megjelennek az unassigned listában
- [ ] Invited vendégeket hozzá lehet rendelni asztalhoz
- [ ] ABC sorrendben vannak rendezve

---

## 6. Teszt 5: Partner Detektálás

### Cél
Ellenőrizni, hogy a partner detektálás működik az ültetési oldalakon.

### Előkészítés

| Lépés | Művelet | Elvárt eredmény |
|-------|---------|-----------------|
| 7.1 | Hozz létre `paying_paired` típusú vendéget | Vendég létrejön |
| 7.2 | Küldj magic linket és végezd el a regisztrációt partnerrel | Regisztráció sikeres |

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 8.1 | Navigálj `/admin/seating` oldalra (Tables nézet) | Seating oldal betölt | |
| 8.2 | Keresd a páros vendéget az unassigned listában | Vendég megjelenik | |
| 8.3 | **KRITIKUS:** Ellenőrizd, hogy partner jelző látható | Partner ikon vagy "paired" jelzés | |
| 8.4 | Húzd a vendéget egy asztalhoz | - | |
| 8.5 | Ellenőrizd, hogy 2 hely foglalódik le | 2 szék foglalt az asztalnál | |

### Partner Detektálási Módok

| Módszer | Ellenőrizve |
|---------|-------------|
| `guest_type === 'paying_paired'` | |
| `ticket_type === 'paid_paired'` | |
| `partner_of` mező kitöltve | |
| `registration.partner_name` kitöltve | |

### Sikerkritériumok

- [ ] Partner jelző megjelenik a paired vendégeknél
- [ ] Mindegyik detektálási mód működik
- [ ] Páros hozzárendelés 2 helyet foglal

---

## 7. Teszt 6: Dátum/Idő Input Láthatóság

### Cél
Ellenőrizni, hogy a dátum és idő inputok jól láthatók minden admin oldalon.

### Teszt Lépések

| Lépés | Oldal | Ellenőrizendő | ✓/✗ |
|-------|-------|---------------|-----|
| 9.1 | `/admin/scheduled-emails` | Date picker sötét szöveggel | |
| 9.2 | `/admin/scheduled-emails` | Time picker sötét szöveggel | |
| 9.3 | `/admin/checkin-log` | "From" date input sötét szöveggel | |
| 9.4 | `/admin/checkin-log` | "To" date input sötét szöveggel | |
| 9.5 | `/admin/audit-log` | "From" date input sötét szöveggel | |
| 9.6 | `/admin/audit-log` | "To" date input sötét szöveggel | |
| 9.7 | `/admin/payments` | "From" date input sötét szöveggel | |
| 9.8 | `/admin/payments` | "To" date input sötét szöveggel | |

### Stílus Ellenőrzés

Minden date/time inputnak a következő stílussal kell rendelkeznie:
- Fehér háttér (`bg-white`)
- Sötét szöveg (`text-gray-900`)
- `colorScheme: 'light'` (light mode ikren a böngészőben)

### Sikerkritériumok

- [ ] Scheduled emails oldalon látható a dátum és idő
- [ ] Check-in log oldalon látható a dátum szűrő
- [ ] Audit log oldalon látható a dátum szűrő
- [ ] Payments oldalon látható a dátum szűrő
- [ ] Minden inputon sötét, olvasható szöveg

---

## 8. Teszt 7: MyForge Labs Logo

### Cél
Ellenőrizni, hogy a MyForge Labs logo megjelenik a megfelelő láblécekben.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 10.1 | Navigálj `/checkin` oldalra (staff login szükséges lehet) | QR scanner oldal betölt | |
| 10.2 | Görgess a lábléc területre | Lábléc látható | |
| 10.3 | **KRITIKUS:** Ellenőrizd a MyForge Labs logo-t | Logo megjelenik a "Built By MyForge Labs" előtt | |
| 10.4 | Navigálj `/pwa` oldalra | PWA login oldal | |
| 10.5 | Jelentkezz be vendég kóddal | PWA dashboard | |
| 10.6 | Ellenőrizd a láblécet bármely PWA oldalon | Logo látható | |

### Logo Specifikáció

| Attribútum | Érték |
|------------|-------|
| Fájl | `/myforgelabs-logo.png` |
| Méret | 21x21 px |
| Opacity | 0.8 (80%) |
| Pozíció | A szöveg előtt |

### Sikerkritériumok

- [ ] Logo látható a Check-in Scanner láblécében
- [ ] Logo látható a PWA layout láblécében
- [ ] Logo megfelelő méretű és átlátszóságú

---

## 9. Teszt 8: Partner Regisztráció Hibakezelés

### Cél
Ellenőrizni, hogy a rendszer barátságos hibaüzenettel kezeli a duplikált partner regisztrációt.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 11.1 | Hozz létre `paying_paired` vendéget | Vendég létrejön | |
| 11.2 | Küldj magic linket és végezd el a regisztrációt | - | |
| 11.3 | Adj meg partner email címet: `partner-test@example.com` | - | |
| 11.4 | Fejezd be a regisztrációt (fizess/jóváhagyás) | Regisztráció sikeres | |
| 11.5 | Hozz létre MÁSIK `paying_paired` vendéget | Vendég létrejön | |
| 11.6 | Küldj magic linket és kezd el a regisztrációt | - | |
| 11.7 | Próbáld UGYANAZT a partner email címet megadni | - | |
| 11.8 | **KRITIKUS:** Ellenőrizd a hibaüzenetet | Barátságos üzenet (NEM adatbázis hiba) | |

### Sikerkritériumok

- [ ] Rendszer felismeri a duplikált partner email-t
- [ ] Barátságos hibaüzenet jelenik meg
- [ ] NEM jelenik meg adatbázis "unique constraint" hiba
- [ ] A felhasználó tudja, mit tegyen

---

## 10. Teszt 9: AlreadyRegistered Oldal Kontraszt

### Cél
Ellenőrizni, hogy a VIP AlreadyRegistered oldal szövege jól olvasható.

### Teszt Lépések

| Lépés | Művelet | Elvárt eredmény | ✓/✗ |
|-------|---------|-----------------|-----|
| 12.1 | Használd a korábban regisztrált VIP vendéget | - | |
| 12.2 | Próbáld újra megnyitni a magic linket | AlreadyRegistered oldal jelenik meg | |
| 12.3 | Ellenőrizd a zöld doboz háttérszínét | Sötétebb zöld (green-100) | |
| 12.4 | Ellenőrizd a szöveg színét | Sötét zöld (green-900) | |
| 12.5 | Ellenőrizd, hogy van-e keret a doboz körül | Zöld keret (green-300) | |
| 12.6 | **KRITIKUS:** Ellenőrizd az olvashatóságot | Szöveg jól olvasható | |

### Stílus Ellenőrzés

| Elem | Régi érték | Új érték |
|------|------------|----------|
| Háttér | `bg-green-50` | `bg-green-100` |
| Keret | nincs | `border border-green-300` |
| Szöveg | halványabb | `text-green-900` |

### Sikerkritériumok

- [ ] Háttér sötétebb zöld
- [ ] Keret látható a doboz körül
- [ ] Szöveg jól olvasható sötétebb színnel
- [ ] Megfelelő kontraszt arány

---

## 11. Teszt Eredmények Összesítő

### Tesztelő Adatok

| Mező | Érték |
|------|-------|
| Tesztelő neve | |
| Tesztelés dátuma | |
| Környezet | [ ] Produkció [ ] Staging [ ] Lokális |
| Böngésző | |
| Verzió | v2.11.0 |

### Összesített Eredmények

| Teszt | Név | Eredmény | Megjegyzés |
|-------|-----|----------|------------|
| 1 | Tömeges Email Vendég Előnézet | [ ] SIKERES [ ] SIKERTELEN | |
| 2 | Tömb-Alapú Vendég Szűrő API | [ ] SIKERES [ ] SIKERTELEN | |
| 3 | VIP Regisztráció Státusz Javítás | [ ] SIKERES [ ] SIKERTELEN | |
| 4 | Meghívott Vendégek Ültetési Listában | [ ] SIKERES [ ] SIKERTELEN | |
| 5 | Partner Detektálás | [ ] SIKERES [ ] SIKERTELEN | |
| 6 | Dátum/Idő Input Láthatóság | [ ] SIKERES [ ] SIKERTELEN | |
| 7 | MyForge Labs Logo | [ ] SIKERES [ ] SIKERTELEN | |
| 8 | Partner Regisztráció Hibakezelés | [ ] SIKERES [ ] SIKERTELEN | |
| 9 | AlreadyRegistered Oldal Kontraszt | [ ] SIKERES [ ] SIKERTELEN | |

### Összesítés

| Metrika | Érték |
|---------|-------|
| Összes teszt | 9 |
| Sikeres | /9 |
| Sikertelen | /9 |
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
| Scheduled Emails | `/admin/scheduled-emails` |
| Vendéglista | `/admin/guests` |
| Ültetés | `/admin/seating` |
| Check-in Log | `/admin/checkin-log` |
| Audit Log | `/admin/audit-log` |
| Fizetések | `/admin/payments` |
| Email napló | `/admin/email-log` |
| Changelog | `/admin/changelog` |
| Release tesztelés | `/admin/release-testing` |

### Új API Paraméterek (v2.11.0)

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `guest_types` | string (comma-separated) | VIP, paying_single, paying_paired, applicant |
| `registration_statuses` | string (comma-separated) | invited, registered, approved, declined |
| `is_vip_reception` | boolean | VIP fogadás szűrő |
| `has_ticket` | boolean | Van-e regisztráció |
| `has_table` | boolean | Van-e asztal hozzárendelés |

### Teszt Fiók

```
Admin: admin@ceogala.test / Admin123!
Staff: staff@ceogala.test / Staff123!
```

---

*Dokumentum vége - CEO Gala v2.11.0 Manuális Teszt*
