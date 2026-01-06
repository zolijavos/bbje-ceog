# CEO Gala 2026 - Jelentkező Útja

## Folyamat Összefoglaló

**Típus**: Jelentkező (nem meghívott, önjelentkezés)
**Első lépés**: Nyilvános űrlap kitöltése
**Döntés**: Admin elbírálás szükséges

---

## Folyamat Vizuálisan

```
JELENTKEZÉS → ADMIN ELBÍRÁLÁS → DÖNTÉS
      │              │              │
      ▼              ▼              ├── JÓVÁHAGYÁS → Magic Link → Regisztráció → Fizetés
   Űrlap         Értesítés         │
   kitöltés      Adminnak          └── ELUTASÍTÁS → Indoklás → Email értesítés
```

---

## 1. Jelentkezési Űrlap

**URL**: ceogala.hu/apply

| Mező | Kötelező | Cél |
|------|----------|-----|
| Név | IGEN | Azonosítás |
| Email | IGEN | Kommunikáció |
| Cég | IGEN | Relevancia felmérés |
| Pozíció | IGEN | Szint megállapítás |
| Motiváció | IGEN | Döntés alapja |

---

## 2. Admin Elbírálás

### Admin Teendők:

| # | Lépés | Hol |
|---|-------|-----|
| 1 | Értesítés fogadása | Email |
| 2 | Applicants megnyitása | Admin → Applicants |
| 3 | Jelentkező megtekintése | Kártya részletek |
| 4 | Háttér ellenőrzés | Google/LinkedIn |
| 5 | Döntés | Approve / Reject gomb |

---

## 3. Elbírálási Szempontok

| Szempont | JÓVÁHAGYÁS valószínű | ELUTASÍTÁS valószínű |
|----------|----------------------|----------------------|
| **Pozíció** | CEO, Ügyvezető, Tulajdonos | Junior, Gyakornok |
| **Cég** | Nagyvállalat, Ismert márka | Nem releváns iparág |
| **Kapacitás** | Van hely | Túljelentkezés |
| **Előzmény** | Korábbi résztvevő | Ismeretlen |
| **Motiváció** | Üzleti kapcsolatok | Nem egyértelmű |

---

## 4A. JÓVÁHAGYÁS Útvonal

```
Approve gomb → Magic Link küldés → Fizető vendég regisztráció
```

| Lépés | Eredmény |
|-------|----------|
| Admin: Approve | Státusz: Jóváhagyva |
| Rendszer: Magic Link | Email elküldve |
| Jelentkező: Regisztráció | Fizető vendég folyamat |
| Jelentkező: Fizetés | Kártya vagy átutalás |
| Rendszer: QR jegy | Fizetés után |

---

## 4B. ELUTASÍTÁS Útvonal

```
Reject gomb → Indoklás megadása → Elutasító email
```

| Lépés | Eredmény |
|-------|----------|
| Admin: Reject | Indoklás kötelező |
| Admin: Indoklás | Pl. "Kapacitás betelt" |
| Rendszer: Email | Jelentkező értesítve |
| Státusz | Elutasítva (végleges) |

---

## Státuszok

| Státusz | Jelentés | Következő lépés |
|---------|----------|-----------------|
| **Pending** | Várakozik elbírálásra | Admin dönt |
| **Approved** | Jóváhagyva | Magic link elküldve |
| **Rejected** | Elutasítva | Folyamat vége |

---

## Tipikus Elutasítási Okok

| Ok | Használat |
|-----|-----------|
| Kapacitás betelt | Túl sok jelentkező |
| Nem releváns iparág | Célcsoport kívül |
| Pozíció nem megfelelő | Nem vezető szint |
| Hiányos jelentkezés | Motiváció nem egyértelmű |
