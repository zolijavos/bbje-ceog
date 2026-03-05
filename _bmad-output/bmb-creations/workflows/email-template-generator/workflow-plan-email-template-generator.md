---
stepsCompleted: ['step-01-discovery', 'step-02-classification', 'step-03-requirements', 'step-04-tools', 'step-05-plan-review', 'step-06-design', 'step-07-foundation', 'step-08-build-step-01', 'step-09-build-steps', 'step-10-confirmation', 'step-11-completion']
created: 2026-03-05
status: COMPLETE
completionDate: 2026-03-05
confirmationType: new_workflow
coverageStatus: complete
approvedDate: 2026-03-05
---

# Workflow Creation Plan

## Discovery Notes

**User's Vision:**
Automatizált email sablon generáló workflow, amely a meglévő magic link invitation sablon HTML designját használja master template-ként. Az új sablon tartalma HTML/PDF/SVG formátumban érkezik, és a rendszer automatikusan összefűzi a master designnal. Az eredmény az EmailTemplate táblába kerül, és elérhető lesz a bulk email küldőben és vendéglista oldalon.

**Who It's For:**
Egyetlen felhasználó (Javo) - személyes, gyakran használt eszköz.

**What It Produces:**
Kész HTML email sablont, amely a master design struktúráját követi az új tartalommal. Az eredmény közvetlenül bekerül a rendszerbe (EmailTemplate DB tábla + admin felületen választható).

**Key Insights:**
- Heti többszöri használat → gyorsaság és minimális interakció a prioritás
- Egyetlen master design (magic link invitation template) - nincs design választás
- Bemenet: HTML/PDF/SVG formátumú tartalom
- A design elemek (színek, layout, fontok, CTA stílusok, struktúra) mindig azonosak maradnak
- Integráció szükséges: EmailTemplate tábla + bulk email küldő + vendéglista oldal

## Classification Decisions

**Workflow Name:** email-template-generator
**Target Path:** _bmad/bmm/workflows/email-template-generator/

**4 Key Decisions:**
1. **Document Output:** true (kész HTML email sablon)
2. **Module Affiliation:** BMM (szoftverfejlesztési modul, CEOG projekt része)
3. **Session Type:** single-session (gyors, ismétlődő, pár perc)
4. **Lifecycle Support:** create-only (steps-c/ mappa)

**Structure Implications:**
- Csak `steps-c/` mappa szükséges (nem kell steps-e/ és steps-v/)
- Nincs szükség `step-01b-continue.md`-re (single-session)
- Dokumentum kimenet: HTML email sablon → EmailTemplate tábla
- Egyszerű, lineáris struktúra: bemenet → design kinyerés → összefűzés → tesztelés/validáció → DB beszúrás
- Beépített tesztelő lépés a create flow-n belül (HTML validáció, preview, email kliens kompatibilitás ellenőrzés)

## Requirements

**Flow Structure:**
- Pattern: linear
- Phases: bemenet fogadása → master design betöltése → összefűzés → tesztelés → kód beszúrás
- Estimated steps: 4-5

**User Interaction:**
- Style: mostly autonomous (minimális interakció)
- Decision points: preview jóváhagyás a kód beszúrás előtt
- Checkpoint frequency: egyetlen checkpoint (preview utáni jóváhagyás)

**Inputs Required:**
- Required: tartalom fájl útvonala (HTML/PDF/SVG) + új sablon slug neve
- Optional: tárgy sor, változó nevek ({{variable}} szintaxis)
- Prerequisites: magic link invitation template elérhető az email-templates.ts-ben

**Output Specifications:**
- Type: document (TypeScript kód + HTML email sablon)
- Format: strict (kód-alapú sablon, specifikus struktúra szükséges)
- Target: lib/services/email-templates.ts - DEFAULT_TEMPLATES objektumba új entry
- Regisztráció: TemplateSlug típusba új slug + SAMPLE_DATA bővítés
- Frequency: heti többszöri, ismétlődő

**Success Criteria:**
- Az új sablon HTML designja vizuálisan azonos a magic link invitation sablonnal
- A tartalom helyesen került be a design struktúrába
- A slug regisztrálva van és elérhető a bulk email rendszerben
- A kód hiba nélkül build-el (tsc --noEmit)
- Preview megtekinthető a generált HTML-ből

**Instruction Style:**
- Overall: prescriptive (pontos utasítások, kód generálás)
- Notes: minimális interakció, gyors végrehajtás, csak a preview-nál áll meg

**Invocation:**
- Slash command: /bmad-bmm-generate-email-template
- Bemenet: fájl útvonal (HTML/PDF/SVG tartalom)

## Tools Configuration

**Core BMAD Tools:**
- **Party Mode:** excluded - nem szükséges (prescriptive flow)
- **Advanced Elicitation:** excluded - nem szükséges (nincs mélyelemzés)
- **Brainstorming:** excluded - nem szükséges (nincs ötletelés)

**LLM Features:**
- **Web-Browsing:** excluded - nincs külső adat igény
- **File I/O:** included - tartalom fájl olvasása + email-templates.ts módosítása
- **Sub-Agents:** excluded - egyszerű lineáris flow
- **Sub-Processes:** excluded - nincs párhuzamos munka

**Memory:**
- Type: single-session
- Tracking: nem szükséges (nincs állapot követés)

**External Integrations:**
- Nincs külső integráció szükséges

**Installation Requirements:**
- Nincs extra telepítés szükséges

## Workflow Structure Preview

**Phase 1: Bemenet fogadása**
- Tartalom fájl útvonal bekérése (HTML/PDF/SVG)
- Slug név és tárgy sor bekérése
- Fájl beolvasása és tartalom kinyerése

**Phase 2: Master design betöltése**
- magic_link sablon HTML kinyerése az email-templates.ts-ből
- Design elemek azonosítása (header, footer, színek, CTA stílus, layout)

**Phase 3: Sablon generálás**
- Új tartalom beillesztése a master design struktúrába
- {{variable}} placeholderek kezelése
- TypeScript kód generálása (DEFAULT_TEMPLATES entry)

**Phase 4: Tesztelés**
- HTML preview generálása és megjelenítése
- Felhasználói jóváhagyás kérése

**Phase 5: Kód beszúrás**
- DEFAULT_TEMPLATES bővítése az email-templates.ts-ben
- TemplateSlug típus frissítése
- SAMPLE_DATA bővítése

## Detailed Design

### Step Files (4 db, lineáris):

**step-01-init.md** (Init, Non-Continuable, Auto-proceed)
- Bemenet bekérése: tartalom fájl útvonal, slug név, tárgy sor
- Opcionális: változó nevek megadása
- Fájl beolvasása és tartalom kinyerése (HTML/PDF/SVG)
- Menu: nincs (auto-proceed step-02-re)

**step-02-generate.md** (Middle, Simple, Auto-proceed)
- Master design betöltése: magic_link sablon HTML-je az email-templates.ts-ből
- Design struktúra kinyerése (header, footer, színek, layout, CTA)
- Új tartalom beillesztése a design keretbe
- TypeScript kód generálása (DEFAULT_TEMPLATES entry + TemplateSlug + SAMPLE_DATA)
- HTML preview fájl mentése _bmad-output/ mappába
- Menu: nincs (auto-proceed step-03-ra)

**step-03-test-and-review.md** (Middle, Standard - egyetlen checkpoint)
- HTML preview megjelenítése a felhasználónak
- Vizuális ellenőrzés: design egyezik-e a master-rel
- Tartalom helyes-e
- Menu: [C] Jóváhagyás → tovább / Módosítási kérés → újragenerálás

**step-04-insert.md** (Final Step)
- email-templates.ts módosítása:
  - Új entry a DEFAULT_TEMPLATES objektumba
  - TemplateSlug típus bővítése
  - SAMPLE_DATA bővítése
- Összefoglaló: slug, fájl módosítások

### File Structure:
```
email-template-generator/
├── workflow.md
├── data/
│   └── master-design-reference.md
└── steps-c/
    ├── step-01-init.md
    ├── step-02-generate.md
    ├── step-03-test-and-review.md
    └── step-04-insert.md
```

### AI Role:
- Email template architect - prescriptive, gyors, minimális interakció
- Hangnem: tömör, célorientált

### Data Flow:
- step-01: fájl útvonal + slug + tárgy → tartalom kinyerése
- step-02: tartalom + master design → generált HTML + TS kód
- step-03: preview → felhasználói jóváhagyás
- step-04: jóváhagyott kód → email-templates.ts módosítás

### Subprocess Optimization:
- Nem szükséges - egyszerű lineáris flow
