# CEO Gala 2026 - Szervezői és Admin Folyamatok

## Dokumentum célja
Ez a dokumentum a CEO Gala szervezői és adminisztrátori folyamatait mutatja be, optimalizálva NotebookLM és Napkin AI infografika generáláshoz.

---

## 1. Esemény Előkészítés Timeline

### Fázisok és feladatok

```
TERVEZÉS (8 hét) → MEGHÍVÁS (6 hét) → REGISZTRÁCIÓ (4 hét) → VÉGLEGESÍTÉS (1 hét) → ESEMÉNY NAP
```

| Fázis | Időpont | Fő feladatok | Felelős |
|-------|---------|--------------|---------|
| Tervezés | E-8 hét | Helyszín, dátum, kapacitás, költségvetés | Szervezők |
| Vendéglista | E-7 hét | VIP lista összeállítása, kategorizálás | Szervezők |
| Rendszer konfig | E-6 hét | Asztalok létrehozása, jegyárak beállítása | Admin |
| VIP meghívás | E-6 hét | Magic link küldés VIP vendégeknek | Admin/Rendszer |
| Fizető meghívás | E-5 hét | Magic link küldés fizető vendégeknek | Admin/Rendszer |
| Nyilvános jelentkezés | E-4 hét | /apply oldal aktiválása | Admin |
| Regisztrációs időszak | E-4 - E-1 hét | Vendégek regisztrálnak | Vendégek |
| Fizetés nyomon követés | Folyamatos | Banki átutalások jóváhagyása | Admin |
| Ültetési rend | E-2 hét | Vendégek asztalokhoz rendelése | Admin |
| Véglegesítés | E-1 hét | Listák lezárása, catering export | Admin |
| Esemény nap | E-nap | Check-in, beléptetés | Staff |
| Utókövetés | E+1 hét | Statisztikák, visszajelzések | Szervezők |

---

## 2. Vendégkezelési Workflow

### 2.1 CSV Import Folyamat

```
EXCEL LISTA → CSV MENTÉS → FELTÖLTÉS → VALIDÁLÁS → IMPORT → MAGIC LINK
```

| Lépés | Teendő | Tippek |
|-------|--------|--------|
| 1. Excel előkészítés | Oszlopok: email, név, típus | Csak kitöltött sorok |
| 2. CSV mentés | UTF-8 kódolás | Magyar karakterek! |
| 3. Admin feltöltés | Guests → Import CSV | Max 500 sor/batch |
| 4. Előnézet ellenőrzés | Hibás sorok áttekintése | Dupla email ellenőrzés |
| 5. Import megerősítés | Végleges import | Visszavonhatatlan |
| 6. Magic link küldés | Bulk email küldés | Ütemezés lehetséges |

### CSV oszlopok

| Oszlop | Kötelező | Formátum | Példa |
|--------|----------|----------|-------|
| email | IGEN | email | ceo@company.hu |
| name | IGEN | szöveg | Kovács János |
| guest_type | IGEN | vip/paying_single/paying_paired | vip |
| company | NEM | szöveg | ABC Kft. |
| position | NEM | szöveg | Ügyvezető |
| phone | NEM | +36... | +36301234567 |

### 2.2 Manuális Vendég Hozzáadás

```
GUESTS → ADD GUEST → ADATOK → MENTÉS → MAGIC LINK KÜLDÉS
```

| Mező | Típus | Kötelező |
|------|-------|----------|
| Email | email | IGEN |
| Név | szöveg | IGEN |
| Vendég típus | dropdown | IGEN |
| Cég | szöveg | NEM |
| Pozíció | szöveg | NEM |
| Telefonszám | szám | NEM |

---

## 3. Jelentkező Elbírálási Workflow

### Folyamat áttekintés

```
ÚJ JELENTKEZÉS → ÉRTESÍTÉS → ÁTTEKINTÉS → DÖNTÉS → ÉRTESÍTÉS
```

### Admin teendők

| Szám | Lépés | Hol | Részletek |
|------|-------|-----|-----------|
| 1 | Értesítés fogadása | Email | "Új jelentkezés érkezett" |
| 2 | Applicants megnyitása | Admin → Applicants | Várakozó lista |
| 3 | Jelentkező megtekintés | Kártya kinyitás | Minden adat látható |
| 4 | Céges háttér ellenőrzés | Google/LinkedIn | Relevancia felmérés |
| 5 | Döntés | Gomb | Approve vagy Reject |

### Jóváhagyás (Approve)
- Kattintás: "Approve" gomb
- Eredmény: Magic link automatikus küldés
- Státusz: "Pending" → "Invited"
- Vendég: 24 órán belül regisztrálhat

### Elutasítás (Reject)
- Kattintás: "Reject" gomb
- Kötelező: Indoklás megadása
- Eredmény: Elutasító email küldés
- Státusz: "Pending" → "Rejected"

### Elbírálási szempontok mátrix

| Szempont | Jóváhagyás valószínű | Elutasítás valószínű |
|----------|----------------------|----------------------|
| Pozíció | CEO, Ügyvezető, Tulajdonos | Junior, gyakornok |
| Cég | Nagyvállalat, ismert márka | Nem releváns iparág |
| Kapacitás | Van hely | Túljelentkezés |
| Korábbi részvétel | Volt vendég | Ismeretlen |

---

## 4. Fizetéskezelési Workflow

### 4.1 Kártyás fizetések (automatikus)

```
STRIPE FIZETÉS → WEBHOOK → STÁTUSZ FRISSÍTÉS → QR GENERÁLÁS → EMAIL
```

| Lépés | Ki végzi | Idő | Admin teendő |
|-------|----------|-----|--------------|
| Fizetés | Vendég | ~2 perc | Nincs |
| Webhook | Rendszer | <1 mp | Nincs |
| Státusz | Rendszer | Azonnal | Nincs |
| QR jegy | Rendszer | Azonnal | Nincs |
| Email | Rendszer | <1 perc | Nincs |

**Teljes mértékben automatikus - nincs admin beavatkozás!**

### 4.2 Banki átutalások (manuális jóváhagyás)

```
ÁTUTALÁS → BEÉRKEZÉS → ADMIN ELLENŐRZÉS → JÓVÁHAGYÁS → QR GENERÁLÁS
```

| Lépés | Ki végzi | Idő | Admin teendő |
|-------|----------|-----|--------------|
| Átutalás | Vendég | Változó | Bankszámla ellenőrzés |
| Beérkezés | Bank | 1-3 munkanap | Várakozás |
| Ellenőrzés | Admin | 5 perc | Összeg és közlemény |
| Jóváhagyás | Admin | 1 kattintás | "Approve Payment" |
| QR jegy | Rendszer | Azonnal | Nincs |

### Banki átutalás jóváhagyási checklist

| Ellenőrzés | Mit nézz | Példa |
|------------|----------|-------|
| Összeg | Egyezik a jegy árával? | 100.000 Ft |
| Közlemény | Tartalmazza a nevet/emailt? | "Kovács János" |
| Dátum | Logikus időzítés? | Regisztráció után |
| Feladó | Banki kivonat | Azonosítható |

### Payments dashboard szűrők

| Szűrő | Mit mutat |
|-------|-----------|
| Pending | Várakozó átutalások |
| Paid | Sikeres fizetések |
| Failed | Sikertelen kártyás |
| All | Minden fizetés |

---

## 5. Ültetési Rend Kezelés

### 5.1 Asztalok beállítása

```
TABLES → ADD TABLE → KONFIGURÁCIÓ → POZÍCIÓ BEÁLLÍTÁS
```

| Asztal tulajdonság | Opciók | Ajánlás |
|-------------------|--------|---------|
| Név | Szabadon | "VIP 1", "Asztal 12" |
| Típus | VIP / Standard | VIP: színpadhoz közel |
| Kapacitás | 4-12 fő | Általában 10 fő |
| Pozíció | X, Y koordináta | Drag & drop |

### 5.2 Drag & Drop ültetés

```
SEATING OLDAL → VENDÉG MEGFOGÁS → ASZTALRA HÚZÁS → AUTOMATIKUS MENTÉS
```

| Művelet | Hogyan | Eredmény |
|---------|--------|----------|
| Beültetés | Vendég → Asztal húzás | Vendég az asztalnál |
| Áthelyezés | Asztalról → Másik asztal | Új hely |
| Eltávolítás | X gomb az asztalon | Vissza a listára |
| Páros mozgatás | Automatikus | Partner is mozog |

### Kapacitás jelzések

| Szín | Jelentés | Teendő |
|------|----------|--------|
| Zöld | Van hely | Ültethető |
| Sárga | 80%+ tele | Figyelj |
| Piros | Tele | Válassz másik asztalt |

### 5.3 CSV-ből tömeges ültetés

```
EXCEL ÜLÉSREND → CSV → IMPORT → VALIDÁLÁS → ALKALMAZÁS
```

CSV formátum:
```
email,table_name
ceo@company.hu,VIP 1
partner@company.hu,VIP 1
```

---

## 6. Email Kommunikáció

### Email típusok és triggerek

| Email típus | Trigger | Címzett | Tartalom |
|-------------|---------|---------|----------|
| Magic Link | Admin küld / Approve | Vendég | Regisztrációs link |
| Regisztráció OK | Sikeres regisztráció | Vendég | Megerősítés |
| Fizetési emlékeztető | Admin küld | Várakozó | Fizetési link |
| E-Ticket | Fizetés OK / VIP regisztráció | Vendég | QR jegy |
| Elutasítás | Admin Reject | Jelentkező | Indoklás |

### Bulk email küldés workflow

```
EMAIL → SZŰRÉS → CÍMZETTEK → SABLON → ELŐNÉZET → KÜLDÉS
```

| Lépés | Opciók |
|-------|--------|
| Szűrés | Státusz, típus, asztal, fizetés |
| Sablon | Meglévő vagy egyedi |
| Változók | {name}, {ticket_type}, {table} |
| Ütemezés | Azonnal vagy időzítve |

### Rate limit korlátok

| Korlát | Érték | Cél |
|--------|-------|-----|
| Per típus / óra | 5 email | Spam megelőzés |
| Összes / óra / vendég | 20 email | Túlterhelés védelem |

---

## 7. Esemény Napi Műveletek

### 7.1 Check-in előkészítés

| Feladat | Mikor | Felelős |
|---------|-------|---------|
| Staff fiókok ellenőrzése | E-1 nap | Admin |
| Szkenner teszt | E-1 nap | Staff |
| WiFi ellenőrzés | E-1 nap | Helyszín |
| Vendéglista PDF export | E-1 nap | Admin |
| Tartalék eszközök | E-1 nap | Staff |

### 7.2 Check-in szervezés

| Pont | Eszközök | Személyzet |
|------|----------|------------|
| Fő bejárat | 2-3 szkenner | 2-3 Staff |
| VIP bejárat | 1 szkenner | 1 Admin |
| Tartalék | 1 szkenner | Készenlétben |

### 7.3 Valós idejű monitoring

```
ADMIN DASHBOARD → CHECK-IN LOG → STATISZTIKÁK
```

| Mutató | Mit jelez |
|--------|-----------|
| Belépettek száma | Aktuális vendégszám |
| Várt vendégek | Még nem érkezett meg |
| Check-in arány | % |
| Override-ok | Dupla belépések |
| Utolsó 10 belépés | Élő feed |

### 7.4 Problémakezelés

| Probléma | Megoldás | Ki oldja meg |
|----------|----------|--------------|
| Érvénytelen QR | Manuális keresés | Staff |
| Dupla belépés | Override | Admin |
| Nincs jegy | Email újraküldés | Admin |
| Nincs internet | Offline lista PDF | Staff |
| Kamera nem működik | Eszközcsere | Staff |

---

## 8. Utómunkálatok

### Esemény után checklist

| Feladat | Mikor | Kimenete |
|---------|-------|----------|
| Check-in napló export | E+1 nap | CSV/PDF |
| Fizetési összesítő | E+1 nap | Pénzügyi riport |
| No-show lista | E+1 nap | Nem jelent meg |
| Statisztikák | E+1 hét | Vezetői riport |
| Visszajelzés kérés | E+1 hét | Vendég feedback |

### Exportálható riportok

| Riport | Tartalom | Formátum |
|--------|----------|----------|
| Vendéglista | Összes vendég adatai | CSV |
| Check-in log | Minden belépés | CSV/PDF |
| Fizetések | Tranzakciók | CSV |
| Ültetési rend | Asztal-vendég párosítás | CSV/PDF |
| Étkezési igények | Diéták asztalonként | CSV |

---

## Admin vs Staff Jogosultságok

### Szerepkör mátrix

| Funkció | Admin | Staff |
|---------|-------|-------|
| Vendéglista megtekintés | IGEN | NEM |
| Vendég CRUD | IGEN | NEM |
| CSV import | IGEN | NEM |
| Jelentkezők elbírálása | IGEN | NEM |
| Fizetés jóváhagyás | IGEN | NEM |
| Ültetési rend | IGEN | NEM |
| Email küldés | IGEN | NEM |
| Check-in szkenner | IGEN | IGEN |
| Check-in napló | IGEN | NEM |
| Override dupla belépés | IGEN | NEM |

### Staff korlátozások
- Bejelentkezés után automatikusan /checkin oldalra irányít
- Nincs admin menü elérés
- Dupla belépésnél csak Admin hívható
