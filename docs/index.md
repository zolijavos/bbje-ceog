# CEO Gala Regisztrációs Rendszer - Projekt Dokumentáció

**Generálva:** 2026-02-15
**Szkennelési mód:** Exhaustive (teljes forráskód elemzés)
**Verzió:** 2.17.0 (Production Ready)

---

## Projekt Áttekintés

| Tulajdonság | Érték |
|-------------|-------|
| **Típus** | Monolith Full-Stack Web Alkalmazás |
| **Nyelv** | TypeScript ^5.5.0 |
| **Framework** | Next.js ^14.2.0 (App Router) |
| **Architektúra** | Layered (Presentation → API → Service → Data Access) |
| **Adatbázis** | MySQL 8.0+ (Prisma ORM) |
| **Deployment** | Hetzner VPS (PM2 + Nginx, standalone build) |
| **Státusz** | Production Ready (7/7 epic, 38/38 story) |

### Gyors Referencia

- **Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma, MySQL, Stripe, Nodemailer
- **Belépési pont:** `app/layout.tsx` (Root Layout)
- **API belépés:** `app/api/` (~50+ REST endpoint)
- **Üzleti logika:** `lib/services/` (15 szolgáltatás)
- **Adatbázis:** `prisma/schema.prisma` (16 modell, 10 enum)
- **Auth:** NextAuth.js (admin) + Magic Link (vendég) + PWA Code (app)

---

## Generált Dokumentáció

### Alap Dokumentumok

- [Projekt Áttekintés](./project-overview.md) - Összefoglaló, tech stack, szerepek, státusz
- [Architektúra](./architecture.md) - Magas szintű architektúra, rétegek, biztonság, integrációk
- [Forrás Fa Elemzés](./source-tree-analysis.md) - Teljes annotált könyvtárstruktúra
- [Adatmodellek](./data-models.md) - Prisma séma, 16 tábla, kapcsolatok, indexek
- [Komponens Inventár](./component-inventory.md) - ~80+ React komponens katalógusa
- [Fejlesztési Útmutató](./development-guide.md) - Beállítás, parancsok, konvenciók, deployment

### Meglévő Projekt Dokumentáció

#### Gyökér Szintű Útmutatók
- [README.md](../README.md) - Projekt főoldal és gyors indulás
- [CLAUDE.md](../CLAUDE.md) - AI fejlesztési instrukciók (átfogó referencia)
- [INSTALL.md](../INSTALL.md) - Részletes telepítési útmutató
- [QUICKSTART.md](../QUICKSTART.md) - Gyors indulás
- [RELEASE-NOTES.md](../RELEASE-NOTES.md) - Verziótörténet és changelog

#### Deployment & Kliens
- [Deploy README](../deploy/README.md) - VPS telepítési szkriptek leírása
- [CLIENT-SETUP-GUIDE.md](./CLIENT-SETUP-GUIDE.md) - Kliens számára telepítési útmutató
- [CLIENT-DEPLOYMENT-CHECKLIST.md](./CLIENT-DEPLOYMENT-CHECKLIST.md) - Deployment checklist
- [CLIENT-INFO-REQUEST.md](./CLIENT-INFO-REQUEST.md) - Kliens információ kérdőív

#### Specifikációk & Design
- [Partner Change Feature Spec](./specs/PARTNER-CHANGE-FEATURE-SPEC.md) - Páros jegy partner csere funkció
- [Registration Screens English Text](./design-specs/registration-screens-english-text.md) - Regisztráció angol szövegek

#### Email Sablonok
- [Magic Link Invitation](./email-templates/magic-link-invitation.md) - Meghívó email sablon

#### Hibák & Javítások
- [Email Scheduler Bugs](./bugs/email-scheduler-bugs-2026-02-12.md) - Email ütemező hibák

#### Diagramok
- User Journey: Kártyás fizetés (Excalidraw)
- User Journey: Banki átutalás (Excalidraw)
- User Journey: Páros jegy (Excalidraw)

---

## Kezdő Lépések

### AI-Segített Fejlesztéshez

1. **Olvasd el ezt az index.md-t** - Áttekintés a teljes dokumentáció struktúráról
2. **Részletes kontextushoz:** [architecture.md](./architecture.md) - Rétegek, biztonság, integrációk
3. **Adatbázis módosításhoz:** [data-models.md](./data-models.md) - Prisma séma és kapcsolatok
4. **UI fejlesztéshez:** [component-inventory.md](./component-inventory.md) - Komponens katalógus
5. **Újrahasznosítható minták:** [source-tree-analysis.md](./source-tree-analysis.md) - Hol mi található

### Brownfield PRD-hez

Amikor új funkciót tervezel erre az alkalmazásra:

1. **Teljes kontextus:** Mutasd rá a PRD workflow-t erre a `docs/index.md`-re
2. **UI feature-höz:** Hivatkozz `architecture.md` + `component-inventory.md`
3. **API bővítéshez:** Nézd meg az API pattern-eket az `architecture.md` 4. fejezetében
4. **Adatbázis módosításhoz:** Használd a `data-models.md`-t a séma bővítés tervezéséhez

### Lokális Fejlesztés Indítása

```bash
# 1. Dependencies
npm install

# 2. MySQL (Docker)
docker-compose up -d

# 3. Environment
cp .env.example .env
# Töltsd ki a titkos kulcsokat!

# 4. Adatbázis
npx prisma generate
npx prisma migrate dev
npm run db:seed

# 5. Szerver
npm run dev
# → http://localhost:3000
# Admin: admin@ceogala.test / Admin123!
```

---

## Fájlok Összesítése

| Dokumentum | Státusz | Méret |
|------------|---------|-------|
| index.md | ✅ Generálva | - |
| project-overview.md | ✅ Generálva | - |
| architecture.md | ✅ Generálva | - |
| source-tree-analysis.md | ✅ Generálva | - |
| data-models.md | ✅ Generálva | - |
| component-inventory.md | ✅ Generálva | - |
| development-guide.md | ✅ Generálva | - |

---

*Generálva a BMad Method document-project workflow-val (v1.2.0)*
*Exhaustive scan - minden forrásfájl elemezve*
