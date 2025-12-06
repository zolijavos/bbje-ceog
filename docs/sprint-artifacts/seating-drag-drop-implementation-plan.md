# Ültetés Drag & Drop Implementációs Terv

**Projekt**: CEO Gála Regisztrációs Rendszer
**Készült**: 2025-11-29
**Verzió**: 1.0

---

## 1. Áttekintés

### 1.1 Jelenlegi Állapot

A jelenlegi `SeatingDashboard.tsx` komponens **kattintás-alapú** ültetést használ:
1. Kattints egy vendégre a bal panelen
2. Kattints egy asztalra a jobb panelen
3. Kattints az "Ültetés" gombra

### 1.2 Cél

Modern **drag & drop** élmény megvalósítása:
- Vendégek húzása közvetlenül az asztalokra
- Páros vendégek együtt mozognak
- Valós idejű kapacitás-validáció
- Vizuális visszajelzés húzás közben

### 1.3 KRITIKUS KÖVETELMÉNY: Teljes Mozgathatóság

**Minden vendég kártya bármikor mozgatható:**
1. **Unassigned → Table**: Bal panelről asztalra húzás
2. **Table → Unassigned**: Asztalról vissza a bal panelre (eltávolítás)
3. **Table → Table**: Egyik asztalról a másikra (áthelyezés)

Ez azt jelenti, hogy az asztalon lévő vendégek is draggable elemek, nem csak a bal panelen lévők!

### 1.4 Választott Technológia

**@dnd-kit** - Már telepítve van a projektben:
```json
"@dnd-kit/core": "^6.1.0",
"@dnd-kit/sortable": "^8.0.0",
"@dnd-kit/utilities": "^3.2.2"
```

---

## 2. Adatszerkezet

### 2.1 Páros Vendég Felismerése

A Prisma séma alapján a páros vendégek így azonosíthatók:

```typescript
// Guest típus
interface Guest {
  id: number;
  name: string;
  email: string;
  guest_type: 'vip' | 'paying_single' | 'paying_paired';
  registration?: {
    ticket_type: 'vip_free' | 'paid_single' | 'paid_paired';
    partner_name: string | null;
    partner_email: string | null;
  } | null;
}
```

**Páros vendég kritérium**: `guest_type === 'paying_paired'` VAGY `registration.ticket_type === 'paid_paired'`

### 2.2 Páros Azonosítás Stratégia

Mivel a partner nem külön `Guest` rekord, hanem a `Registration` táblában `partner_name` + `partner_email` mezőkben tárolódik:

1. **Egy draggable elem** = 1 vendég + partner (ha van)
2. **2 helyet foglal** kapacitás számításnál
3. A partner adatai a fő vendég regisztrációjából jönnek

```typescript
interface DraggableGuest {
  id: string;           // "guest-{id}" vagy "paired-{id}"
  guestId: number;
  name: string;
  email: string;
  type: 'single' | 'paired';
  partner?: {
    name: string;
    email: string;
  };
  seatsRequired: 1 | 2;
}
```

---

## 3. Komponens Architektúra

### 3.1 Fájlstruktúra

```
app/admin/seating/
├── page.tsx                    # Server component (meglévő)
├── SeatingDashboard.tsx        # MÓDOSÍTANDÓ - fő kliens komponens
├── components/
│   ├── DraggableGuest.tsx      # ÚJ - húzható vendég chip
│   ├── DroppableTable.tsx      # ÚJ - cél asztal konténer
│   ├── GuestChip.tsx           # ÚJ - vendég megjelenítés
│   ├── PairedGuestChip.tsx     # ÚJ - páros vendég megjelenítés
│   └── TableCard.tsx           # ÚJ - asztal kártya komponens
└── hooks/
    └── useSeatingDnd.ts        # ÚJ - drag & drop logika
```

### 3.2 Komponens Hierarchia

```
SeatingDashboard
├── DndContext (provider)
│   ├── UnassignedPanel
│   │   ├── SearchInput
│   │   └── SortableContext
│   │       └── DraggableGuest[] (single vagy paired)
│   │
│   └── TablesGrid
│       └── DroppableTable[]
│           ├── TableHeader (név, foglaltság)
│           └── SortableContext
│               └── DraggableGuest[] (ültetett vendégek)
│
└── DragOverlay (húzás közben megjelenő elem)
```

---

## 4. Implementációs Lépések

### 4.1 Fázis 1: Alap DnD Infrastruktúra (2-3 óra)

**Feladatok:**

1. **DndContext Provider beállítása**
   ```tsx
   import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
   ```

2. **Sensors konfigurálása**
   ```tsx
   const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: { distance: 8 }
     }),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates
     })
   );
   ```

3. **Drag state menedzsment**
   ```tsx
   const [activeId, setActiveId] = useState<string | null>(null);
   const [activeGuest, setActiveGuest] = useState<DraggableGuest | null>(null);
   ```

### 4.2 Fázis 2: Draggable Guest Komponensek (2 óra)

**DraggableGuest.tsx:**
```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableGuestProps {
  guest: DraggableGuest;
  isOverlay?: boolean;
}

export function DraggableGuest({ guest, isOverlay }: DraggableGuestProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: guest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (guest.type === 'paired') {
    return (
      <PairedGuestChip
        ref={setNodeRef}
        style={style}
        guest={guest}
        {...attributes}
        {...listeners}
      />
    );
  }

  return (
    <GuestChip
      ref={setNodeRef}
      style={style}
      guest={guest}
      {...attributes}
      {...listeners}
    />
  );
}
```

**GuestChip.tsx (egyéni vendég):**
```tsx
export const GuestChip = forwardRef<HTMLDivElement, GuestChipProps>(
  ({ guest, style, ...props }, ref) => (
    <div
      ref={ref}
      style={style}
      className="bg-white border border-gray-300 rounded-md px-3 py-2
                 text-sm text-gray-900 shadow-sm cursor-grab
                 hover:shadow-md hover:-translate-y-0.5 transition-all"
      {...props}
    >
      <p className="font-medium truncate">{guest.name}</p>
      <p className="text-xs text-gray-500 truncate">{guest.email}</p>
      <GuestTypeBadge type={guest.guestType} />
    </div>
  )
);
```

**PairedGuestChip.tsx (páros vendég):**
```tsx
export const PairedGuestChip = forwardRef<HTMLDivElement, PairedGuestChipProps>(
  ({ guest, style, ...props }, ref) => (
    <div
      ref={ref}
      style={style}
      className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200
                 rounded-lg cursor-grab hover:shadow-md transition-all"
      {...props}
    >
      {/* Fő vendég */}
      <div className="flex-1 bg-white border-l-4 border-gray-700 rounded px-2 py-1.5">
        <p className="font-semibold text-xs">{guest.name}</p>
        <p className="text-xs text-gray-500">Fő vendég</p>
      </div>

      {/* Kapcsolat ikon */}
      <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />

      {/* Partner */}
      <div className="flex-1 bg-white border-l-4 border-gray-400 rounded px-2 py-1.5">
        <p className="font-semibold text-xs">{guest.partner?.name}</p>
        <p className="text-xs text-gray-500">Partner</p>
      </div>

      {/* 2 hely badge */}
      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
        2 hely
      </span>
    </div>
  )
);
```

### 4.3 Fázis 3: Droppable Table Komponens (2 óra)

**DroppableTable.tsx:**
```tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableTableProps {
  table: TableData;
  guests: DraggableGuest[];
  onRemoveGuest: (assignmentId: number) => void;
}

export function DroppableTable({ table, guests, onRemoveGuest }: DroppableTableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `table-${table.id}`,
    data: {
      type: 'table',
      table,
      capacity: table.capacity,
      currentOccupancy: calculateOccupancy(guests)
    }
  });

  const isFull = calculateOccupancy(guests) >= table.capacity;

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 rounded-lg p-4 transition-all min-h-[180px]
        ${isFull ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}
        ${isOver && !isFull ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' : ''}
        ${isOver && isFull ? 'border-red-400 bg-red-100' : ''}
      `}
    >
      <TableHeader table={table} occupancy={calculateOccupancy(guests)} />

      <SortableContext
        items={guests.map(g => g.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 mt-3">
          {guests.length === 0 ? (
            <EmptyTablePlaceholder capacity={table.capacity} />
          ) : (
            guests.map(guest => (
              <DraggableGuest
                key={guest.id}
                guest={guest}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function calculateOccupancy(guests: DraggableGuest[]): number {
  return guests.reduce((sum, g) => sum + g.seatsRequired, 0);
}
```

### 4.4 Fázis 4: Drag Event Handlers (2 óra)

**useSeatingDnd.ts hook:**
```tsx
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';

export function useSeatingDnd(
  tables: TableData[],
  unassignedGuests: Guest[],
  onAssign: (guestId: number, tableId: number) => Promise<void>,
  onUnassign: (assignmentId: number) => Promise<void>,
  onMove: (guestId: number, fromTableId: number, toTableId: number) => Promise<void>
) {
  const [activeGuest, setActiveGuest] = useState<DraggableGuest | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const guest = findGuestById(active.id as string);
    setActiveGuest(guest);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Kapacitás validáció itt
    const targetTable = getTableFromDroppableId(over.id);
    if (targetTable) {
      const guest = findGuestById(active.id as string);
      const currentOccupancy = calculateTableOccupancy(targetTable.id);
      const availableSeats = targetTable.capacity - currentOccupancy;

      if (guest.seatsRequired > availableSeats) {
        // Vizuális jelzés: nem fér el
        // (CSS-ben kezeljük)
      }
    }
  };

  /**
   * KRITIKUS: Teljes mozgathatóság támogatása
   *
   * 3 fő forgatókönyv:
   * 1. Unassigned → Table (új ültetés)
   * 2. Table → Unassigned (eltávolítás)
   * 3. Table → Table (áthelyezés másik asztalra)
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveGuest(null);

    if (!over) return;

    const guestId = extractGuestId(active.id as string);
    const sourceContainer = active.data.current?.sortable?.containerId;
    const targetContainer = over.id as string;

    // 1. Unassigned → Table (ÚJ ÜLTETÉS)
    if (sourceContainer === 'unassigned' && targetContainer.startsWith('table-')) {
      const tableId = extractTableId(targetContainer);
      await onAssign(guestId, tableId);
    }

    // 2. Table → Unassigned (ELTÁVOLÍTÁS - vendég visszakerül a várólistára)
    if (sourceContainer?.startsWith('table-') && targetContainer === 'unassigned') {
      const assignmentId = findAssignmentId(guestId, sourceContainer);
      await onUnassign(assignmentId);
    }

    // 3. Table → Table (ÁTHELYEZÉS másik asztalra)
    if (
      sourceContainer?.startsWith('table-') &&
      targetContainer.startsWith('table-') &&
      sourceContainer !== targetContainer
    ) {
      const fromTableId = extractTableId(sourceContainer);
      const toTableId = extractTableId(targetContainer);
      await onMove(guestId, fromTableId, toTableId);
    }

    // Ha ugyanarra az asztalra ejtjük, nem csinálunk semmit (sorrend változás nem támogatott)
  };

  return {
    activeGuest,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
```

### 4.5 Fázis 5: Kapacitás Validáció (1 óra)

**Validációs logika:**
```tsx
function canDropOnTable(
  guest: DraggableGuest,
  table: TableData,
  currentAssignments: DraggableGuest[]
): { canDrop: boolean; reason?: string } {
  const currentOccupancy = currentAssignments.reduce(
    (sum, g) => sum + g.seatsRequired,
    0
  );

  const availableSeats = table.capacity - currentOccupancy;

  if (guest.seatsRequired > availableSeats) {
    if (guest.type === 'paired') {
      return {
        canDrop: false,
        reason: `Páros vendég: 2 hely kell, csak ${availableSeats} van`
      };
    }
    return {
      canDrop: false,
      reason: 'Az asztal megtelt'
    };
  }

  return { canDrop: true };
}
```

**Vizuális visszajelzés:**
```tsx
// DroppableTable-ben
const dropValidation = canDropOnTable(activeGuest, table, guests);

<div className={`
  ${isOver && dropValidation.canDrop ? 'ring-2 ring-green-400 bg-green-50' : ''}
  ${isOver && !dropValidation.canDrop ? 'ring-2 ring-red-400 bg-red-50' : ''}
`}>
  {isOver && !dropValidation.canDrop && (
    <div className="absolute inset-0 flex items-center justify-center
                    bg-red-100/80 rounded-lg">
      <p className="text-red-600 font-medium text-sm">
        {dropValidation.reason}
      </p>
    </div>
  )}
</div>
```

### 4.6 Fázis 6: DragOverlay (1 óra)

**Húzás közben megjelenő elem:**
```tsx
<DragOverlay>
  {activeGuest ? (
    <div className="transform scale-105 shadow-2xl">
      {activeGuest.type === 'paired' ? (
        <PairedGuestChip guest={activeGuest} isOverlay />
      ) : (
        <GuestChip guest={activeGuest} isOverlay />
      )}
    </div>
  ) : null}
</DragOverlay>
```

### 4.7 Fázis 7: API Integráció (1 óra)

**API Endpoint-ok a 3 művelethez:**

```tsx
// 1. ÚJ ÜLTETÉS: Unassigned → Table
POST /api/admin/table-assignments
Body: { guestId: number, tableId: number }
Response: { success: true, assignment: {...} }

// 2. ELTÁVOLÍTÁS: Table → Unassigned
DELETE /api/admin/table-assignments/{assignmentId}
Response: { success: true }

// 3. ÁTHELYEZÉS: Table → Table (új endpoint!)
PATCH /api/admin/table-assignments/{assignmentId}
Body: { tableId: number }
Response: { success: true, assignment: {...} }
```

**Áthelyezés implementáció (új API route):**
```typescript
// app/api/admin/table-assignments/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { tableId } = await request.json();

  // Ellenőrzés: van-e hely az új asztalon?
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { _count: { select: { assignments: true } } }
  });

  if (table._count.assignments >= table.capacity) {
    return Response.json({ error: 'Az asztal megtelt' }, { status: 400 });
  }

  // Áthelyezés
  const updated = await prisma.tableAssignment.update({
    where: { id: parseInt(params.id) },
    data: { table_id: tableId }
  });

  return Response.json({ success: true, assignment: updated });
}
```

**Páros vendég speciális kezelés:**
- A partner NINCS külön Guest rekordként tárolva
- Csak 1 TableAssignment keletkezik (a fő vendégé)
- A foglaltság számításnál `ticket_type === 'paid_paired'` esetén +1 hely

---

## 5. UI Wireframe Leírás

### 5.1 Layout (2-Paneles)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  CEO Gála Admin - Ültetési Rend                              [CSV] [Export] │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  ÜLTETÉSRE VÁRÓ VENDÉGEK    │  │  ASZTALOK                            │ │
│  │  ─────────────────────────  │  │  ────────────────────────────────    │ │
│  │  [🔍 Keresés...           ] │  │                                      │ │
│  │                             │  │  ┌──────────┐  ┌──────────┐          │ │
│  │  ┌─────────────────────┐    │  │  │ VIP-01   │  │ VIP-02   │          │ │
│  │  │ Dr. Kovács János    │    │  │  │ 8/10     │  │ 5/10     │          │ │
│  │  │ kovacs@email.hu     │    │  │  │ ████████░│  │ █████░░░░│          │ │
│  │  │ [VIP]               │    │  │  │          │  │          │          │ │
│  │  └─────────────────────┘    │  │  │ • Vendég1│  │ • Vendég5│          │ │
│  │                             │  │  │ • Vendég2│  │ • Vendég6│          │ │
│  │  ┌─────────────────────┐    │  │  │ • Vendég3│  │          │          │ │
│  │  │ Nagy Éva            │    │  │  │ +5 más   │  │          │          │ │
│  │  │ nagy.eva@email.hu   │    │  │  └──────────┘  └──────────┘          │ │
│  │  │ [Fizető]            │    │  │                                      │ │
│  │  └─────────────────────┘    │  │  ┌──────────┐  ┌──────────┐          │ │
│  │                             │  │  │ STD-01   │  │ STD-02   │          │ │
│  │  ╔═════════════════════╗    │  │  │ 10/10    │  │ 0/10     │          │ │
│  │  ║ Molnár L. + Partner ║    │  │  │ ██████████│  │ ░░░░░░░░░│          │ │
│  │  ║ ┌────────┐ ⚡ ┌────┐ ║    │  │  │ TELE     │  │          │          │ │
│  │  ║ │Molnár L│   │Part.│ ║    │  │  └──────────┘  └──────────┘          │ │
│  │  ║ │Fő vend.│   │     │ ║    │  │                                      │ │
│  │  ║ └────────┘   └────┘ ║    │  │                                      │ │
│  │  ║         [2 hely]    ║    │  │                                      │ │
│  │  ╚═════════════════════╝    │  │                                      │ │
│  │                             │  │                                      │ │
│  │  ─────────────────────────  │  │                                      │ │
│  │  6 vendég vár ültetésre     │  │                                      │ │
│  └─────────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💡 Húzd a vendégeket az asztalokra az ültetéshez                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Drag Állapotok

**Normál állapot:**
- Vendég chip: fehér háttér, szürke keret

**Dragging (húzás közben):**
- Eredeti helyen: 50% átlátszóság
- Kurzornál: árnyék, 105% méret

**Drop érvényes:**
- Asztal: zöld keret, világoszöld háttér

**Drop érvénytelen (tele):**
- Asztal: piros keret, világospiros háttér
- Hibaüzenet overlay

---

## 6. Hibakezelés

### 6.1 Optimista Frissítés + Rollback

```tsx
const handleDragEnd = async (event: DragEndEvent) => {
  // 1. UI optimisztikusan frissül
  const previousState = { tables, unassignedGuests };
  updateStateOptimistically(event);

  try {
    // 2. Backend hívás
    await apiCall();
  } catch (error) {
    // 3. Rollback hiba esetén
    restoreState(previousState);
    toast.error('Hiba történt az ültetés során');
  }
};
```

### 6.2 Hálózati Hibák

- Toast notification hibaüzenettel
- Automatikus újrapróbálkozás (3x)
- Manuális "Újra" gomb

---

## 7. Teljesítmény Optimalizáció

### 7.1 Virtualizáció (opcionális, 100+ vendég esetén)

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={unassignedGuests.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <DraggableGuest guest={unassignedGuests[index]} />
    </div>
  )}
</FixedSizeList>
```

### 7.2 Memoization

```tsx
const memoizedGuests = useMemo(
  () => unassignedGuests.map(transformToDraggable),
  [unassignedGuests]
);

const MemoizedGuestChip = memo(GuestChip);
```

---

## 8. Tesztelési Terv

### 8.1 Unit Tesztek

- `canDropOnTable()` validáció
- `calculateOccupancy()` számítás
- Páros vendég azonosítás

### 8.2 Integrációs Tesztek

- Drag & drop műveletek
- API hívások megfelelő body-val
- Rollback működése

### 8.3 E2E Tesztek (Playwright)

```typescript
test('Vendég húzása asztalra', async ({ page }) => {
  const guest = page.locator('[data-guest-id="1"]');
  const table = page.locator('[data-table-id="1"]');

  await guest.dragTo(table);

  await expect(table).toContainText('Dr. Kovács János');
});

test('Páros vendég 2 helyet foglal', async ({ page }) => {
  const pairedGuest = page.locator('[data-paired-id="5"]');
  const table = page.locator('[data-table-id="2"]');

  const before = await page.locator('[data-table-id="2"] [data-occupancy]').textContent();
  await pairedGuest.dragTo(table);
  const after = await page.locator('[data-table-id="2"] [data-occupancy]').textContent();

  expect(parseInt(after) - parseInt(before)).toBe(2);
});
```

---

## 9. Becslés és Prioritások

| Fázis | Leírás | Becsült Idő |
|-------|--------|-------------|
| 1 | Alap DnD infrastruktúra | 2-3 óra |
| 2 | Draggable Guest komponensek | 2 óra |
| 3 | Droppable Table komponens | 2 óra |
| 4 | Drag Event Handlers | 2 óra |
| 5 | Kapacitás validáció | 1 óra |
| 6 | DragOverlay | 1 óra |
| 7 | API integráció | 1 óra |
| **Összesen** | | **11-12 óra** |

### MVP (minimum viable)
- Fázis 1-4 + 7 = 8-9 óra
- Egyéni vendégek drag & drop működik
- Páros vendégek egyszerűsített kezelése (1 chip, 2 hely)

### Teljes verzió
- Összes fázis + tesztek
- 15-16 óra

---

## 10. Következő Lépések

1. [ ] Wireframe jóváhagyása
2. [ ] Komponens fájlok létrehozása
3. [ ] MVP implementáció
4. [ ] Tesztelés
5. [ ] Finomhangolás és UX javítások

---

## 11. FÁZIS 2: Vizuális Teremtérkép (Kerekasztalok)

### 11.1 Koncepció

Interaktív teremtérkép vizualizáció:
- **Kerek asztalok** elhelyezése egy virtuális térképen
- **Székek körben** az asztalok körül
- **Kattintásra popup** a vendég információkkal
- **TV nézet** - fullscreen megjelenítés rendezvényen

### 11.2 Új Oldalak

```
/admin/seating/map          # Térkép szerkesztő (admin)
/admin/seating/map?view=tv  # TV nézet (read-only, fullscreen)
```

### 11.3 Adatbázis Bővítés

```prisma
// Meglévő Table modell bővítése:
model Table {
  // ... meglévő mezők ...
  pos_x      Int?        // X koordináta (már létezik!)
  pos_y      Int?        // Y koordináta (már létezik!)

  // ÚJ mezők:
  radius     Int?     @default(60)   // Asztal sugár pixelben
  rotation   Int?     @default(0)    // Székek kezdő forgatása (0-360°)
}

// ÚJ modell: Terem konfiguráció
model RoomConfig {
  id              Int     @id @default(1)
  name            String  @default("Főterem")
  width           Int     @default(1200)   // Terem szélesség px
  height          Int     @default(800)    // Terem magasság px
  background_url  String? // Háttérkép URL (opcionális alaprajz)
  grid_size       Int     @default(20)     // Rács méret px
  updated_at      DateTime @updatedAt

  @@map("room_config")
}
```

### 11.4 Komponens Architektúra

```
app/admin/seating/map/
├── page.tsx                    # Server component
├── RoomEditor.tsx              # Fő szerkesztő komponens
├── components/
│   ├── RoomCanvas.tsx          # SVG/Canvas térkép
│   ├── RoundTable.tsx          # Kerek asztal komponens
│   ├── TableSeat.tsx           # Szék komponens (körben)
│   ├── GuestPopup.tsx          # Vendég info popup
│   ├── RoomSettings.tsx        # Terem méret beállítások
│   └── TableEditor.tsx         # Asztal szerkesztő panel
└── hooks/
    ├── useRoomConfig.ts        # Terem konfig kezelés
    └── useTableDrag.ts         # Asztal drag & drop
```

### 11.5 Kerek Asztal Vizualizáció

```tsx
// RoundTable.tsx - Kerek asztal székekkel körben
interface RoundTableProps {
  table: TableData;
  guests: Guest[];
  onClick: () => void;
  isSelected: boolean;
}

function RoundTable({ table, guests, onClick, isSelected }: RoundTableProps) {
  const { capacity, radius = 60 } = table;
  const seatRadius = 15;
  const seatDistance = radius + seatRadius + 5;

  // Székek egyenletes elosztása körben
  const seats = Array.from({ length: capacity }, (_, i) => {
    const angle = (360 / capacity) * i - 90; // -90: felülről kezd
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * seatDistance,
      y: Math.sin(rad) * seatDistance,
      guest: guests[i] || null,
      seatNumber: i + 1,
    };
  });

  return (
    <g
      transform={`translate(${table.pos_x}, ${table.pos_y})`}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* Asztal kör */}
      <circle
        r={radius}
        fill={isSelected ? '#e3f2fd' : '#f5f5f5'}
        stroke={isSelected ? '#2196f3' : '#9e9e9e'}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Asztal név */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight="bold"
        fill="#424242"
      >
        {table.name}
      </text>

      {/* Foglaltság */}
      <text
        y={18}
        textAnchor="middle"
        fontSize={11}
        fill="#757575"
      >
        {guests.length}/{capacity}
      </text>

      {/* Székek */}
      {seats.map((seat, i) => (
        <TableSeat
          key={i}
          x={seat.x}
          y={seat.y}
          guest={seat.guest}
          seatNumber={seat.seatNumber}
        />
      ))}
    </g>
  );
}
```

### 11.6 Szék Komponens

```tsx
// TableSeat.tsx
interface TableSeatProps {
  x: number;
  y: number;
  guest: Guest | null;
  seatNumber: number;
}

function TableSeat({ x, y, guest, seatNumber }: TableSeatProps) {
  const isOccupied = !!guest;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={15}
        fill={isOccupied ? '#4caf50' : '#ffffff'}
        stroke={isOccupied ? '#388e3c' : '#bdbdbd'}
        strokeWidth={2}
      />
      {isOccupied ? (
        // Vendég kezdőbetűi
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="#ffffff"
          fontWeight="bold"
        >
          {guest.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </text>
      ) : (
        // Szék szám
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fill="#9e9e9e"
        >
          {seatNumber}
        </text>
      )}
    </g>
  );
}
```

### 11.7 Vendég Popup

```tsx
// GuestPopup.tsx - Kattintáskor megjelenő részletek
interface GuestPopupProps {
  table: TableData;
  guests: Guest[];
  position: { x: number; y: number };
  onClose: () => void;
}

function GuestPopup({ table, guests, position, onClose }: GuestPopupProps) {
  return (
    <div
      className="absolute bg-white rounded-lg shadow-xl p-4 min-w-64 z-50"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">{table.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-3">
        {guests.length} / {table.capacity} hely foglalt
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {guests.map((guest, i) => (
          <div key={guest.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <span className="w-6 h-6 bg-green-500 text-white rounded-full
                           flex items-center justify-center text-xs">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-sm">{guest.name}</p>
              <p className="text-xs text-gray-500">{guest.email}</p>
            </div>
            {guest.guest_type === 'vip' && (
              <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700
                             text-xs rounded">VIP</span>
            )}
          </div>
        ))}

        {guests.length === 0 && (
          <p className="text-gray-400 text-center py-4">Üres asztal</p>
        )}
      </div>
    </div>
  );
}
```

### 11.8 TV Nézet Mód

```tsx
// page.tsx - TV view query param kezelés
export default function SeatingMapPage({
  searchParams
}: {
  searchParams: { view?: string }
}) {
  const isTvMode = searchParams.view === 'tv';

  return (
    <div className={isTvMode ? 'fixed inset-0 bg-gray-900' : ''}>
      {!isTvMode && <AdminHeader />}

      <RoomCanvas
        fullscreen={isTvMode}
        showControls={!isTvMode}
        autoRefresh={isTvMode}  // TV módban auto-refresh
        refreshInterval={30000} // 30 másodpercenként
      />

      {isTvMode && (
        <div className="fixed bottom-4 right-4 text-white/50 text-sm">
          CEO Gála 2025 - Ülésrend
        </div>
      )}
    </div>
  );
}
```

### 11.9 Asztal Drag & Drop (Szerkesztő mód)

```tsx
// useTableDrag.ts - Asztalok mozgatása a térképen
function useTableDrag(onPositionChange: (tableId: number, x: number, y: number) => void) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (tableId: number, e: React.MouseEvent, tablePos: { x: number; y: number }) => {
    setDragging(tableId);
    setOffset({
      x: e.clientX - tablePos.x,
      y: e.clientY - tablePos.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;

    const newX = Math.round((e.clientX - offset.x) / 20) * 20; // Grid snap
    const newY = Math.round((e.clientY - offset.y) / 20) * 20;

    onPositionChange(dragging, newX, newY);
  };

  const handleMouseUp = () => {
    if (dragging) {
      // Mentés API-n keresztül
      saveTablePosition(dragging);
    }
    setDragging(null);
  };

  return { handleMouseDown, handleMouseMove, handleMouseUp, isDragging: !!dragging };
}
```

### 11.10 API Végpontok (Fázis 2)

```typescript
// Terem konfiguráció
GET  /api/admin/room-config
PUT  /api/admin/room-config
Body: { width, height, background_url, grid_size }

// Asztal pozíció frissítés
PATCH /api/admin/tables/{id}/position
Body: { pos_x: number, pos_y: number, radius?: number, rotation?: number }

// Összes asztal pozícióval (térkép betöltés)
GET /api/admin/tables?include=positions,guests
```

### 11.11 Komplexitás Becslés

| Komponens | Leírás | Idő |
|-----------|--------|-----|
| DB migráció | RoomConfig + Table bővítés | 0.5 óra |
| RoomCanvas | SVG alapú térkép container | 1.5 óra |
| RoundTable | Kerek asztal + székek | 2 óra |
| GuestPopup | Vendég lista popup | 1 óra |
| Drag & Drop | Asztalok mozgatása | 2 óra |
| RoomSettings | Terem méret beállítás | 1 óra |
| TV View | Fullscreen + auto-refresh | 1.5 óra |
| API routes | 3 új endpoint | 1.5 óra |
| **Összesen** | | **11 óra** |

### 11.12 Vizuális Példa

```
┌─────────────────────────────────────────────────────────────┐
│  CEO Gála 2025 - Teremtérkép                    [Szerkesztés]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ●●●              ●●●              ●●●               │
│        ●   ●            ●   ●            ●   ●              │
│       ● VIP ●          ● VIP ●          ● STD ●             │
│       ●  01  ●          ●  02  ●          ●  01  ●           │
│        ● 8/10●           ● 5/10●           ●10/10●           │
│         ●●●              ●●●              ●●●               │
│                                                             │
│                    ●●●              ●●●                     │
│                   ●   ●            ●   ●                    │
│                  ● STD ●          ● STD ●                   │
│                  ●  02  ●          ●  03  ●                  │
│                   ● 0/10●           ● 4/10●                  │
│                    ●●●              ●●●                     │
│                                                             │
│  [+ Új asztal]  [Terem beállítások]  [TV nézet megnyitása]  │
└─────────────────────────────────────────────────────────────┘

Jelmagyarázat:
● = foglalt szék (zöld)
○ = üres szék (szürke)
```

### 11.13 Fázis 2 Prioritás

Ez a fázis **OPCIONÁLIS** és csak az 1. fázis befejezése után kezdhető:

- [ ] Fázis 1 kész (drag & drop lista)
- [ ] DB migráció (RoomConfig, Table bővítés)
- [ ] Alap térkép nézet
- [ ] Kerek asztalok renderelése
- [ ] Vendég popup
- [ ] Asztal drag & drop (szerkesztő)
- [ ] TV nézet mód
- [ ] Auto-refresh WebSocket/polling
