# Projekt Áttekintés - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-02-15
**Verzió:** 2.17.0 (Production Ready)
**Karbantartó:** MyForge Labs

---

## Összefoglaló

A CEO Gala Regisztrációs Rendszer egy webes SaaS platform VIP gála események kezelésére. A rendszer invitation-only alapon működik, és az alábbi fő funkciókat biztosítja:

- **Vendég regisztráció** - Magic link alapú meghívók, VIP és fizető vendégek kezelése
- **Fizetés feldolgozás** - Stripe integráció (kártyás fizetés + banki átutalás)
- **QR jegykezelés** - JWT-alapú e-jegyek automatikus generálása és email küldése
- **Check-in rendszer** - Mobil QR szkenner az esemény helyszínén
- **Ültetési rend** - Drag-and-drop asztalkezelés React-Konva canvas-szal
- **Admin dashboard** - Teljes körű vendég és esemény menedzsment
- **PWA alkalmazás** - Vendégeknek mobil app (jegy, asztal info, profil)
- **Jelentkezési rendszer** - Nem-meghívott vendégek pályázata
- **Többnyelvűség** - Magyar (alapértelmezett) és angol felület

## Státusz

| Metrika | Érték |
|---------|-------|
| Fejlesztési fázisok | 7/7 epic befejezve |
| User story-k | 38/38 kész |
| Production deployment | Hetzner VPS (PM2 + Nginx) |
| Adatbázis | MySQL 8.0 |
| Tesztelés | Unit (Vitest) + E2E (Playwright) |

## Technológiai Stack Összefoglaló

| Kategória | Technológia | Verzió |
|-----------|-------------|--------|
| **Framework** | Next.js (App Router) | ^14.2.0 |
| **Nyelv** | TypeScript | ^5.5.0 |
| **Runtime** | Node.js | >=18.0.0 |
| **Frontend** | React (Server + Client Components) | ^18.3.0 |
| **Stílus** | Tailwind CSS | ^3.4.0 |
| **ORM** | Prisma | ^5.19.0 |
| **Adatbázis** | MySQL | 8.0+ |
| **Auth** | NextAuth.js | ^4.24.11 |
| **Fizetés** | Stripe | ^16.12.0 |
| **Email** | Nodemailer | ^7.0.7 |
| **QR kód** | qrcode + html5-qrcode | ^1.5.4 / ^2.3.8 |
| **Ültetés** | React-Konva + @dnd-kit | ^18.2.14 / ^6.1.0 |
| **Validáció** | Zod | ^3.23.0 |
| **Tesztelés** | Vitest + Playwright | ^1.6.1 / ^1.44.0 |
| **Deployment** | PM2 + Nginx | standalone output |

## Architektúra Típus

**Monolith** - Egyetlen Next.js kódbázis, amely tartalmazza mind a frontend-et (React komponensek), mind a backend-et (API Route Handlers), mind az adatbázis réteget (Prisma ORM).

### Architektúra Minta

```
Next.js App Router - Layered Full-Stack Architecture
├── Presentation Layer (React Server/Client Components)
├── API Layer (Route Handlers - app/api/**/route.ts)
├── Business Logic Layer (lib/services/)
├── Data Access Layer (Prisma ORM - lib/db/prisma.ts)
└── Database (MySQL 8.0)
```

## Repository Struktúra

**Típus:** Monolith (egyetlen package.json, nincs workspace)

```
ceog-gala/
├── app/              # Next.js App Router (oldalak + API)
├── lib/              # Üzleti logika réteg
├── prisma/           # Adatbázis séma és migrációk
├── public/           # Statikus fájlok (ikonok, képek, manifest)
├── scripts/          # Deploy és karbantartó szkriptek
├── deploy/           # VPS telepítési szkriptek
├── docker/           # Docker konfigurációk
├── tests/            # Tesztek (unit + e2e)
├── docs/             # Dokumentáció
└── test-data/        # Teszt CSV fájlok
```

## Felhasználói szerepek

| Szerep | Leírás | Hozzáférés |
|--------|--------|------------|
| **Admin** | Teljes körű kezelés | Admin dashboard, vendégek, ültetés, email, fizetések, check-in override |
| **Staff** | Check-in személyzet | QR szkenner, check-in napló (csak olvasás) |
| **Vendég (meghívott)** | Ingyenes jegy | Magic link regisztráció, PWA app |
| **Vendég (fizető)** | Fizetős jegy | Magic link + Stripe fizetés, PWA app |
| **Jelentkező** | Pályázó vendég | Jelentkezési űrlap, admin jóváhagyás után magic link |

## Kapcsolódó Dokumentumok

- [Architektúra](./architecture.md) - Részletes technikai architektúra
- [Adatmodellek](./data-models.md) - Adatbázis séma és kapcsolatok
- [Forrás Fa Elemzés](./source-tree-analysis.md) - Teljes könyvtárstruktúra
- [Fejlesztési Útmutató](./development-guide.md) - Fejlesztési környezet és parancsok
- [Komponens Inventár](./component-inventory.md) - React komponensek katalógusa
