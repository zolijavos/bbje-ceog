---
title: 'Seating Page Redesign - Search, Collapse & Visual Improvements'
slug: 'seating-redesign'
created: '2026-03-22'
status: 'done'
baseline_commit: '48d7bc9'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 14 App Router', 'React 18', '@dnd-kit/core + sortable', 'React-Konva', 'Tailwind CSS', 'TypeScript']
files_to_modify: ['app/admin/seating/SeatingDashboard.tsx', 'app/admin/seating/components/DroppableTable.tsx', 'app/admin/seating/components/FloorPlanCanvas.tsx', 'app/admin/seating/components/GuestChip.tsx', 'app/admin/seating/components/PairedGuestChip.tsx', 'lib/constants.ts']
files_to_create: ['app/admin/seating/components/SeatingSearchBar.tsx', 'app/admin/seating/components/SeatingFilters.tsx']
code_patterns: ['useState hooks only (no Redux/Context)', 'fetch + useEffect data fetching', 'useMemo for derived state', '@dnd-kit DroppableTable + SortableContext pattern', 'Tailwind utility classes + dark mode', 'useLanguage() i18n hook', 'Phosphor Icons']
test_patterns: ['Vitest unit tests in tests/unit/', 'Playwright E2E in tests/e2e/']
---

# Tech-Spec: Seating Page Redesign — Search, Collapse & Visual Improvements

**Created:** 2026-03-22

## Overview

### Problem Statement

Az ülésrend oldal (admin/seating) 24 asztallal és ~200 vendéggel átláthatatlan. Nincs globális kereső, nincs collapse, nincs szűrő — minden asztal egyszerre nyitva van az összes vendéggel, ami végtelen scrollolást eredményez. Az előkészítés során a leggyakoribb kérdés: "Már kiosztottam ezt a vendéget? Melyik asztalnál ül?" — erre jelenleg nincs gyors válasz.

### Solution

Globális kereső (vendég + asztal), collapsible asztalkártyák, VIP/Standard szekció csoportosítás, telítettség szűrők a Grid nézetben. Floor Plan nézetben heatmap telítettség színezés + spotlight kereső animáció. Közös keresés state a nézetek között.

### Scope

**In Scope:**
- Globális keresősáv a Grid és Floor Plan nézetben (vendég név/email + asztal név)
- Collapsible asztalkártyák (≤5 asztal: nyitva, >5: csukva alapértelmezetten)
- VIP / Standard szekció csoportosítás fejlécekkel
- Telítettség szűrő chipek (Van hely / Tele / Üres / Összes)
- Expand All / Collapse All toggle gomb
- Keresés auto-expand (talált asztal automatikusan kinyílik)
- DnD hover auto-expand (csukott asztalra húzott vendég → 400ms delay után kinyílik)
- Floor Plan heatmap színezés (telítettség alapú: piros/sárga/zöld/szürke)
- Floor Plan spotlight keresés (talált asztal pulzál, többi elhalványul, kamera auto-pan)
- Megosztott keresés state Grid ↔ Floor Plan váltásnál

**Out of Scope:**
- API endpoint módosítások (minden adat már rendelkezésre áll client-side)
- Adatmodell / Prisma schema változtatások
- Browse/Edit mód szétválasztás (az előkészítés a fő use case, nem a helyszíni keresés)
- Floor Plan side panel (tooltip elegendő)
- Floor Plan quick labels (teljesítmény kockázat 24 asztalnál)
- Új dependency-k hozzáadása

## Context for Development

### Codebase Patterns

- **SeatingDashboard.tsx** (504 sor): Fő orchestrátor. `useState` + `useEffect` data fetching 3 párhuzamos API hívásból (`/api/admin/tables`, `/api/admin/table-assignments?unassigned=true`, `/api/admin/seating-stats`). `DndContext` wrapper `closestCenter` collision detection-nel. `viewMode` state: `'grid' | 'floorplan'`. Transform helper-ek: `toDraggableGuest()`, `assignmentToDraggableGuest()`, `isPartnerAssignment()`.
- **DroppableTable.tsx** (145 sor): Stateless komponens, `useDroppable` hook-kal. Props: `table`, `guests`, `activeGuest`, `onRemoveGuest`. Fejléc: asztal név + típus color dot + occupancy bar. `SortableContext` a vendéglistához. Drop validation: `canAcceptGuest = (occupied + seatsRequired) <= capacity`. Jelenleg NINCS collapse logika.
- **FloorPlanCanvas.tsx** (638 sor): React-Konva `Stage` + `Layer`. Asztal színek: VIP=#B8860B, Standard=#3e6bb1, Sponsor=#71717a. Occupancy override: ≥100% → #EF4444, ≥50% → #F59E0B. Tooltip: smart positioned, 300ms hide delay, scrollable vendéglista. Zoom: 0.3x-3x, pan: drag background.
- **UnassignedPanel.tsx** (107 sor): Saját `searchQuery` state, `name || email` filter. Scrollable lista `max-h-[calc(100vh-400px)]`. Droppable zone ID: `'unassigned'`.
- **GuestChip.tsx** (59 sor): `forwardRef` + `memo`. Props: `guest`, `isDragging`, `isOverlay`, `style`. Típus badge színek: vip=purple, paying_single=gray, paying_paired=blue. NINCS highlight prop jelenleg.
- **PairedGuestChip.tsx** (80 sor): Hasonló GuestChip-hez, de side-by-side layout fő vendég + partner.
- **useSeatingDnd.ts** (107 sor): `activeGuest` + `sourceContainerId` state. Handler-ek: dragStart/Over/End/Cancel. Container ID pattern: `'unassigned' | 'table-{id}'`.
- **types.ts** (202 sor): `DraggableGuest`, `TableData`, `Guest`, `Assignment`, `SeatingStats` interfaces + helper functions.
- **lib/constants.ts** (195 sor): `TABLE_TYPE_COLORS` (Tailwind classes), `GUEST_TYPE_LABELS`. Ide kerül az `SEATING_AUTO_COLLAPSE_THRESHOLD`.

### Critical Gotchas

1. **DnD + Collapse interakció**: A `DroppableTable` `useDroppable` hook-ja a kártya egészére vonatkozik — a collapse NEM befolyásolja a drop zónát. A `SortableContext` viszont a vendéglistát wrappeli — csukott állapotban a sortable items üres tömb.
2. **Paired guest szűrés**: A `isPartnerAssignment()` function partner rekordokat kiszűri a table guest listából. A globális keresőnek is figyelembe kell vennie, hogy partner vendégek NEM jelennek meg külön chip-ként.
3. **Floor Plan szín override**: A `getOccupancyColor()` már tartalmaz occupancy-alapú szín logikát (red/orange/base). A heatmap ezt BŐVÍTI: zöld (<50%) és szürke (üres) hozzáadásával.
4. **Tooltip hide delay**: 300ms timeout + `isTooltipHovered` state. A spotlight keresés ne interferáljon ezzel.
5. **Konva animáció**: Pulzáló spotlight effect-hez Konva `Tween` vagy React state-alapú animáció kell. A projekt NEM használ `konva`-t közvetlenül animációra — `react-konva` deklaratív API-t használ.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `app/admin/seating/SeatingDashboard.tsx` | Fő komponens — globális search state, filter state, collapse state, szekciók ide kerülnek |
| `app/admin/seating/components/DroppableTable.tsx` | Asztal kártya — collapse toggle, highlight, auto-expand logika ide kerül |
| `app/admin/seating/components/FloorPlanCanvas.tsx` | Konva canvas — heatmap színek, spotlight animáció, auto-pan/zoom |
| `app/admin/seating/components/UnassignedPanel.tsx` | Bal panel — saját keresője marad, NEM módosítandó (csak referencia) |
| `app/admin/seating/components/GuestChip.tsx` | Vendég chip — `isHighlighted` prop hozzáadás |
| `app/admin/seating/components/PairedGuestChip.tsx` | Páros vendég chip — `isHighlighted` prop hozzáadás |
| `app/admin/seating/hooks/useSeatingDnd.ts` | DnD hook — NEM módosítandó |
| `app/admin/seating/types.ts` | Típus definíciók — NEM módosítandó |
| `lib/constants.ts` | Konstansok — `SEATING_AUTO_COLLAPSE_THRESHOLD` hozzáadás |
| `lib/i18n/translations.ts` | i18n — új fordítási kulcsok |

### Technical Decisions

- **Client-side only** — az összes adat a 3 meglévő API hívásból rendelkezésre áll, nincs szükség új endpointra
- **Collapse state a SeatingDashboard szinten** — `Record<number, boolean>` objektum, asztal ID → collapsed boolean
- **Globális kereső a SeatingDashboard szinten** — `searchQuery` state, mindkét nézet (Grid + Floor Plan) használja
- **Szűrők a SeatingDashboard szinten** — `filters` state, chip-ek a SeatingFilters komponensben
- **Heatmap KIEGÉSZÍTI a meglévő occupancy színezést** — nem cseréli le, hanem bővíti a zöld (<50%) és szürke (üres) kategóriákkal
- **Konva spotlight**: CSS-ből NEM vezérelhető, React state-alapú opacity + scale animáció `useEffect` + `requestAnimationFrame`-mel
- **DnD hover auto-expand**: `onDragOver` handler-ben `setTimeout` 400ms delay-jel, `onDragEnd`/`onDragCancel`-ben clear

## Implementation Plan

### Tasks

#### Fázis 1: Konstansok & i18n alapok

- [ ] Task 1: Seating konstansok hozzáadása
  - File: `lib/constants.ts`
  - Action: `SEATING_AUTO_COLLAPSE_THRESHOLD = 5` konstans hozzáadása
  - Notes: Export named const, a meglévő TABLE_TYPE_COLORS mellé

- [ ] Task 2: i18n fordítási kulcsok hozzáadása
  - File: `lib/i18n/translations.ts`
  - Action: Új kulcsok mindkét nyelvre (HU + EN):
    - `seatingSearch` / `seatingSearchPlaceholder` ("Vendég vagy asztal keresése..." / "Search guest or table...")
    - `seatingSearchResults` ("{{count}} találat" / "{{count}} results")
    - `seatingNoResults` ("Nincs találat" / "No results")
    - `seatingExpandAll` / `seatingCollapseAll` ("Összes kinyitása" / "Összes becsukása")
    - `seatingFilterAll` / `seatingFilterAvailable` / `seatingFilterFull` / `seatingFilterEmpty` ("Összes" / "Van hely" / "Tele" / "Üres")
    - `seatingVipSection` / `seatingStandardSection` ("VIP asztalok" / "Standard asztalok")
    - `seatingTableCount` ("({{count}})" — asztalszám a szekció fejlécben)
  - Notes: A meglévő `translations` objektumba, `hu` és `en` kulcsok alá

#### Fázis 2: GuestChip & PairedGuestChip highlight

- [ ] Task 3: `isHighlighted` prop hozzáadása a GuestChip-hez
  - File: `app/admin/seating/components/GuestChip.tsx`
  - Action:
    - Props interface bővítése: `isHighlighted?: boolean`
    - Conditional class hozzáadása: ha `isHighlighted`, akkor `ring-2 ring-amber-400 bg-amber-50` keret + háttér
    - A vendég neve mellé `★` karakter ha highlighted
  - Notes: `memo` wrapper megmarad, a `isHighlighted` a memoization dependency

- [ ] Task 4: `isHighlighted` prop hozzáadása a PairedGuestChip-hez
  - File: `app/admin/seating/components/PairedGuestChip.tsx`
  - Action: Ugyanaz mint Task 3 — `isHighlighted` prop, ring + ★ jelölés
  - Notes: A fő vendég ÉS a partner nevét is highlight-olja ha match

#### Fázis 3: SeatingSearchBar komponens

- [ ] Task 5: SeatingSearchBar komponens létrehozása
  - File: `app/admin/seating/components/SeatingSearchBar.tsx` (ÚJ)
  - Action: Új komponens:
    - Props: `searchQuery: string`, `onSearchChange: (query: string) => void`, `resultCount: { guests: number, tables: number } | null`
    - Input mező: Phosphor `MagnifyingGlass` ikon, placeholder a `t('seatingSearchPlaceholder')`-ból, `×` clear gomb ha van szöveg
    - Találat összesítő: `"{guests} vendég, {tables} asztal"` ha van aktív keresés
    - "Nincs találat" üzenet ha `resultCount` 0/0
    - Tailwind styling: `w-full` input, ikonokkal, dark mode support
    - `useLanguage()` hook i18n-hez
  - Notes: Tisztán prezentációs komponens, logika a SeatingDashboard-ban

#### Fázis 4: SeatingFilters komponens

- [ ] Task 6: SeatingFilters komponens létrehozása
  - File: `app/admin/seating/components/SeatingFilters.tsx` (ÚJ)
  - Action: Új komponens:
    - Props: `activeFilter: 'all' | 'available' | 'full' | 'empty'`, `onFilterChange: (filter) => void`, `isAllExpanded: boolean`, `onToggleExpandAll: () => void`
    - 4 szűrő chip gomb (Összes / Van hely / Tele / Üres): aktív = `bg-accent-600 text-white`, inaktív = `bg-gray-100 text-gray-700`
    - Expand All / Collapse All toggle gomb: Phosphor `ArrowsOut` / `ArrowsIn` ikon
    - Vízszintes elrendezés: chipek balra, expand/collapse gomb jobbra
    - `useLanguage()` hook i18n-hez
  - Notes: Chip styling a meglévő view mode toggle mintájára (SeatingDashboard.tsx)

#### Fázis 5: DroppableTable collapse + highlight

- [ ] Task 7: DroppableTable collapse és highlight logika
  - File: `app/admin/seating/components/DroppableTable.tsx`
  - Action:
    - Props interface bővítése: `isCollapsed?: boolean`, `onToggleCollapse?: () => void`, `isHighlighted?: boolean`, `highlightedGuestIds?: Set<number>`
    - Fejléc kattinthatóvá tétele: `onClick={onToggleCollapse}`, `cursor-pointer`
    - Chevron ikon a fejlécben: `CaretDown` (nyitva) / `CaretRight` (csukva) Phosphor ikon
    - Vendéglista rejtése ha `isCollapsed`: a `SortableContext` + vendég lista `div` conditionally rendered (`{!isCollapsed && ...}`)
    - Csukott állapotban is mutatja: asztal név, típus dot, occupancy bar — tehát a fejléc MINDIG renderelődik
    - Ha `isHighlighted`: `border-amber-400 bg-amber-50/50` keret szín
    - `highlightedGuestIds` továbbadása a `GuestChip`/`PairedGuestChip` komponenseknek `isHighlighted` prop-ként
    - A `useDroppable` hook MINDIG aktív marad (csukott állapotban is fogad drop-ot)
  - Notes: A SortableContext items-e csukott állapotban üres tömb lesz — ez @dnd-kit-ben OK, a droppable zóna ettől független

#### Fázis 6: SeatingDashboard orchestráció

- [ ] Task 8: Globális keresés, szűrés, collapse state és szekció logika
  - File: `app/admin/seating/SeatingDashboard.tsx`
  - Action:
    - **Új state-ek:**
      - `const [globalSearch, setGlobalSearch] = useState('')`
      - `const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'available' | 'full' | 'empty'>('all')`
      - `const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})`
      - `const [searchExpandedIds, setSearchExpandedIds] = useState<Set<number>>(new Set())`
    - **Collapse inicializálás** (`useEffect` tables változásra):
      - `tables.length > SEATING_AUTO_COLLAPSE_THRESHOLD` → minden asztal `collapsed[id] = true`
      - `tables.length <= SEATING_AUTO_COLLAPSE_THRESHOLD` → minden asztal `collapsed[id] = false`
      - Csak az első betöltéskor fut (ref flag-gel)
    - **Keresés logika** (`useMemo`):
      - `globalSearch` alapján szűrés: asztal name match VAGY bármely guest name/email match
      - Visszatér: `{ matchingTableIds: Set<number>, matchingGuestIds: Set<number>, resultCount: { guests, tables } }`
      - Ha van keresés: a matchingTableIds asztalokat auto-expand-olja (`searchExpandedIds` state)
      - Ha keresés törlődik: `searchExpandedIds` reset, eredeti collapse state visszaáll
    - **Szűrés logika** (`useMemo`):
      - `occupancyFilter === 'available'` → csak ahol `occupied < capacity`
      - `occupancyFilter === 'full'` → csak ahol `occupied >= capacity`
      - `occupancyFilter === 'empty'` → csak ahol `occupied === 0`
      - `occupancyFilter === 'all'` → minden asztal
    - **Szekció csoportosítás** (`useMemo`):
      - `vipTables = filteredTables.filter(t => t.type === 'vip')`
      - `standardTables = filteredTables.filter(t => t.type !== 'vip')`
    - **Effective collapse**: `isCollapsed(tableId) = collapsed[tableId] && !searchExpandedIds.has(tableId)`
    - **Expand All / Collapse All**: `setCollapsed` az összes table ID-t `false`/`true`-ra
    - **DnD hover auto-expand**: `handleDragOver` bővítése — ha az `over` target egy csukott asztal, `setTimeout(400ms)` után `setCollapsed(prev => ({...prev, [tableId]: false}))`. A timeout ID-t ref-ben tároljuk, `handleDragEnd`/`handleDragCancel`-ben clearTimeout.
    - **Layout módosítás** (Grid nézet JSX):
      - `<SeatingSearchBar>` a statisztika kártyák alá
      - `<SeatingFilters>` a keresősáv alá
      - VIP szekció fejléc: `"VIP asztalok (N)"` — collapsible szekció div
      - Standard szekció fejléc: `"Standard asztalok (N)"` — collapsible szekció div
      - Asztalok grid a szekción belül: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
      - Ha nincs keresési/szűrési találat Grid nézetben: "Nincs találat" üzenet
    - **Floor Plan-nek továbbadott props**:
      - `searchQuery={globalSearch}` — a FloorPlanCanvas spotlight-hoz
      - `matchingTableIds` — a spotlight kiemeléséhez
    - **Import-ok**: `SeatingSearchBar`, `SeatingFilters`, `SEATING_AUTO_COLLAPSE_THRESHOLD`, `CaretDown`, `CaretRight`
  - Notes: Ez a legnagyobb task — a legtöbb logika ide kerül. A DnD context (`DndContext`) NEM változik, csak új state-ek és derived state-ek kerülnek hozzá.

#### Fázis 7: Floor Plan heatmap + spotlight

- [ ] Task 9: FloorPlanCanvas heatmap és spotlight keresés
  - File: `app/admin/seating/components/FloorPlanCanvas.tsx`
  - Action:
    - **Props bővítése**: `searchQuery?: string`, `matchingTableIds?: Set<number>`
    - **Heatmap színezés** — `getOccupancyColor()` bővítése:
      - `occupied === 0` → `#9ca3af` (gray-400, üres)
      - `occupied < capacity * 0.5` → `#22c55e` (green-500, van hely)
      - `occupied < capacity` → `#F59E0B` (orange, félig tele) — MEGLÉVŐ
      - `occupied >= capacity` → `#EF4444` (red, tele) — MEGLÉVŐ
    - **Heatmap legenda**: Új `Group` a canvas alján — 4 szín kör + label (Üres, Van hely, Részben, Tele)
    - **Spotlight effect** ha `searchQuery` aktív és `matchingTableIds` nem üres:
      - Nem matching asztalok: `opacity: 0.2`
      - Matching asztalok: `opacity: 1` + pulzáló ring animáció (React state-based: `useState` + `useEffect` + `setInterval` 800ms-enként toggle `glowRadius` 0→10→0)
      - A pulsating glow: extra `Circle` a matching asztal körül, `stroke: '#facc15'` (yellow-400), `strokeWidth: 3`, `radius: tableRadius + glowRadius`
    - **Auto-pan/zoom**: Ha `matchingTableIds` változik és pontosan 1 matching asztal van:
      - Kiszámítja az asztal pixel pozícióját
      - `setPosition()` + `setScale(1.5)` hogy az asztal középre kerüljön
      - Ha több match van: NEM pan-el, csak highlight
    - **Keresés törlése**: `matchingTableIds` üres → opacity reset, glow eltávolítás, NO pan reset (a user ott marad ahol van)
  - Notes: A Konva `Circle` opacity prop-ja közvetlenül vezérelhető React state-ből. A glow animációhoz NEM kell Konva Tween — elég egy `setInterval` ami `glowRadius`-t toggle-öl 0 és 10 között.

### Acceptance Criteria

#### Grid nézet — Keresés

- [ ] AC 1: Given az admin az ülésrend Grid nézetben van 24 asztallal, when beír "Kovács" a globális keresőbe, then csak azok az asztalok jelennek meg amelyeknél van "Kovács" nevű vendég VAGY az asztal neve tartalmazza a "Kovács" szót, és a talált asztalok automatikusan kinyílnak
- [ ] AC 2: Given aktív keresés eredménye 2 vendég 2 asztalnál, when a keresett vendégek chip-jei megjelennek, then azok `★` jellel és sárga kiemeléssel (ring) vannak jelölve
- [ ] AC 3: Given aktív keresés van, when a user törli a keresőmezőt (× gomb vagy backspace), then az összes asztal visszaáll az eredeti collapse állapotába és a highlight eltűnik
- [ ] AC 4: Given a keresőbe beírt szó nem egyezik egyetlen vendéggel vagy asztallal sem, when a keresés fut, then "Nincs találat" üzenet jelenik meg

#### Grid nézet — Collapse

- [ ] AC 5: Given az ülésrend oldalon >5 asztal van (pl. 24), when az oldal betöltődik, then minden asztal csukott állapotban jelenik meg (csak fejléc: név, típus, occupancy bar látszik)
- [ ] AC 6: Given az ülésrend oldalon ≤5 asztal van, when az oldal betöltődik, then minden asztal nyitott állapotban jelenik meg a vendéglistával
- [ ] AC 7: Given egy csukott asztal, when rákattintok a fejlécre, then kinyílik és mutatja a vendéglistát. Újra kattintva visszacsukódik.
- [ ] AC 8: Given több asztal különböző collapse állapotban van, when az "Összes kinyitása" gombra kattintok, then minden asztal kinyílik. A gomb szövege "Összes becsukása"-ra változik.

#### Grid nézet — Szekciók és szűrők

- [ ] AC 9: Given 24 asztal (VIP + Standard típusok), when a Grid nézet renderelődik, then a VIP asztalok külön szekcióban jelennek meg ("VIP asztalok (N)") a Standard asztalok felett ("Standard asztalok (N)")
- [ ] AC 10: Given "Van hely" szűrő aktív, when a szűrés fut, then csak azok az asztalok látszanak ahol `occupied < capacity`, a tele asztalok eltűnnek
- [ ] AC 11: Given "Tele" szűrő aktív, when a szűrés fut, then csak a teljesen foglalt asztalok látszanak
- [ ] AC 12: Given "Üres" szűrő aktív, when a szűrés fut, then csak a vendég nélküli asztalok látszanak

#### Grid nézet — DnD + Collapse interakció

- [ ] AC 13: Given egy csukott asztal, when egy vendéget ráhúzok (drag) és 400ms-ig az asztal felett tartom, then az asztal automatikusan kinyílik
- [ ] AC 14: Given egy csukott asztal, when egy vendéget rádobok (drop) DnD-vel, then a vendég sikeresen hozzárendelődik az asztalhoz (a droppable zóna csukott állapotban is aktív)
- [ ] AC 15: Given egy vendéget DnD-vel húzok, when a drag megszakad (cancel/drop máshova), then az auto-expand timeout törlődik és az asztal csukva marad

#### Floor Plan — Heatmap

- [ ] AC 16: Given a Floor Plan nézet aktív, when az asztalok renderelődnek, then a színezés telítettség alapú: szürke (üres), zöld (<50%), narancs (50-99%), piros (100%/tele)
- [ ] AC 17: Given a Floor Plan nézet aktív, when a canvas renderelődik, then alul megjelenik egy legenda a 4 szín kategóriával

#### Floor Plan — Spotlight keresés

- [ ] AC 18: Given a Floor Plan nézet aktív és a user beír "VIP 2" a globális keresőbe, when a keresés match-el egy asztalt, then a talált asztal pulzáló sárga glow animációval kiemelődik, a többi asztal elhalványul (opacity 20%)
- [ ] AC 19: Given pontosan 1 asztal match-el a keresésre a Floor Plan-ben, when a keresés lefut, then a kamera automatikusan pan-el és zoom-ol az asztalra
- [ ] AC 20: Given aktív spotlight keresés a Floor Plan-ben, when a user törli a keresőt, then az összes asztal visszaáll normál opacity-ra és a glow animáció leáll

#### Közös

- [ ] AC 21: Given a user Grid nézetben keres "Kovács"-ra, when átvált Floor Plan nézetre, then a keresés aktív marad és a Floor Plan spotlight mutatja a találatot
- [ ] AC 22: Given magyar nyelv aktív, when az ülésrend oldal renderelődik, then minden label, placeholder, gomb magyar nyelven jelenik meg. Angolra váltva angol.

## Additional Context

### Dependencies

- **Nincs új dependency** — minden meglévő library-vel megoldható:
  - `@dnd-kit/core` + `@dnd-kit/sortable` — DnD (változatlan)
  - `react-konva` + `konva` — Floor Plan canvas (változatlan)
  - `@phosphor-icons/react` — új ikonok: `MagnifyingGlass`, `X`, `CaretDown`, `CaretRight`, `ArrowsOut`, `ArrowsIn`
  - `tailwind-merge` + `clsx` — conditional class-ok (már használt)
- **API dependency**: A 3 meglévő endpoint változatlan:
  - `GET /api/admin/tables` — asztalok + assignments
  - `GET /api/admin/table-assignments?unassigned=true` — kioszttatlan vendégek
  - `GET /api/admin/seating-stats` — statisztikák

### Testing Strategy

- **Unit tesztek** (Vitest):
  - Keresés logika: `globalSearch` match vendég név/email/asztal név — edge case-ek: üres string, ékezetes karakterek, partial match
  - Collapse inicializálás: ≤5 asztal → nyitva, >5 → csukva
  - Szűrő logika: available/full/empty szűrés helyessége
  - Heatmap szín kalkuláció: 0%, 25%, 50%, 75%, 100% telítettségre helyes szín
- **Manuális tesztelés**:
  - 24 asztal betöltése → minden csukva
  - Keresés → asztal kinyílik, vendég kiemelve
  - DnD csukott asztalra → auto-expand 400ms után
  - Floor Plan heatmap színek vizuális ellenőrzés
  - Floor Plan spotlight keresés → pulzálás + pan
  - Grid ↔ Floor Plan váltás keresés közben → state megmarad
  - HU/EN nyelvi váltás → minden label frissül

### Notes

- Party mode brainstormingban Sally (UX), Winston (Architect), Amelia (Dev), John (PM) közösen tervezték meg
- 24 asztal (sok VIP + Standard), ~200 vendég — mind csukva az alapértelmezés
- Prioritási sorrend: 1) Kereső+Collapse, 2) Szekciók+Szűrők, 3) Floor Plan, 4) Polish
- Zero API change, zero Prisma change, zero dependency change
- Becsült scope: ~400-500 sor kód
- **Kockázat**: A Konva spotlight animáció performanciája 24 asztalnál — ha lassú, egyszerűsíthető static opacity-ra (glow nélkül)
- **Jövőbeli lehetőség**: Keyboard shortcut (`/` vagy `Ctrl+F`) a globális keresőre — most out of scope, de érdemes megjegyezni
