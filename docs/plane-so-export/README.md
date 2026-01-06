# Plane.so Import - CEO Gala Project

## Tartalom

- `epics-stories.csv` - 7 Epic + 38 Story CSV formátumban

## Import Lépések

### 1. Plane.so Projekt Létrehozás

1. Nyisd meg a [Plane.so](https://plane.so) dashboardot
2. Kattints "Create Project" gombra
3. Projekt neve: **CEO Gala Registration v2**
4. Projekt kulcs: **CEOG**

### 2. CSV Import

**Megjegyzés:** A Plane.so jelenleg nem támogatja a natív CSV importot (2024-es állapot). Alternatív megoldások:

#### Opció A: Manuális bevitel (ajánlott kis projekt esetén)
- A CSV alapján kézzel hozd létre az Epic-eket és Story-kat
- Előny: Teljes kontroll a struktúra felett

#### Opció B: Plane API használata
1. Generálj API kulcsot: Settings → API Tokens
2. Használd a `/var/www/ceog/docs/plane-so-export/import-script.js` scriptet
3. Futtatás: `node import-script.js`

#### Opció C: GitHub Issues Import
1. Importáld a CSV-t GitHub Issues-ba (gh CLI)
2. Használd a Plane.so GitHub integrációt szinkronizáláshoz

### 3. CSV Struktúra

| Oszlop | Leírás |
|--------|--------|
| id | Egyedi azonosító (epic-X vagy X.Y) |
| name | Cím |
| type | `epic` vagy `story` |
| status | `done` (minden kész) |
| priority | `high`, `medium`, `low` |
| epic_id | Parent epic ID (story-knál) |
| description | Rövid leírás |

### 4. Státusz Beállítás

A projektben minden story **done** státuszú. Plane.so-ban:

1. Hozz létre egy "Done" státuszt
2. Állítsd be alapértelmezettnek az importhoz
3. Vagy használd a "Completed" beépített státuszt

### 5. Epic Áttekintés

| # | Epic | Stories | Leírás |
|---|------|---------|--------|
| 1 | Core Registration (MVP) | 9 | Alap regisztráció, admin, vendégkezelés |
| 2 | Payment & Ticketing | 6 | Stripe, QR kód, e-ticket |
| 3 | Check-in System | 4 | Mobil scanner, napló |
| 4 | Seating Management | 5 | Asztalok, drag-drop térkép |
| 5 | Guest Profile Extension | 4 | Profil bővítés |
| 6 | PWA Guest App | 8 | Progressive Web App |
| 7 | Applicant Flow | 2 | Nyilvános jelentkezés |

**Összesen: 7 Epic, 38 Story** - Mind 100% kész

---

## Forrás Dokumentumok

A teljes részletekért lásd:
- `/docs/epics.md` - Teljes epic breakdown BDD acceptance criteria-val
- `/docs/sprint-artifacts/sprint-status.yaml` - Státusz tracking

---

Generálva: 2025-12-26
