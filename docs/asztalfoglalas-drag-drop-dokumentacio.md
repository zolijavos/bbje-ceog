# Asztalfoglalás Oldal - Drag & Drop Dokumentáció

Ez a dokumentáció részletesen leírja az asztalfoglalás (seating chart) oldal felépítését és a drag & drop funkcionalitás implementációját, hogy bármikor újra lehessen építeni más projektben.

---

## Tartalomjegyzék

1. [Áttekintés](#áttekintés)
2. [Technológiai Stack](#technológiai-stack)
3. [Oldal Struktúra](#oldal-struktúra)
4. [CSS Stílusok](#css-stílusok)
5. [HTML Komponensek](#html-komponensek)
6. [SortableJS Implementáció](#sortablejs-implementáció)
7. [Páros Vendégek Kezelése](#páros-vendégek-kezelése)
8. [Backend API Végpontok](#backend-api-végpontok)
9. [Teljes Kód Referencia](#teljes-kód-referencia)

---

## Áttekintés

Az asztalfoglalás oldal egy 3-paneles elrendezést használ, ahol:
- **Bal panel**: Asztalok listája foglaltsági szintekkel
- **Középső panel**: Vizuális asztalelrendezés grid formában
- **Jobb panel**: Még nem beültetett vendégek

A vendégeket drag & drop módon lehet asztalok között mozgatni a **SortableJS** könyvtár segítségével.

---

## Technológiai Stack

| Technológia | Verzió | CDN Link |
|-------------|--------|----------|
| **TailwindCSS** | Latest | `https://cdn.tailwindcss.com` |
| **SortableJS** | Latest | `https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js` |

### Minimális Függőségek

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
```

---

## Oldal Struktúra

### 3-Paneles Layout (12-oszlopos grid)

```
+-------------------+---------------------------+-------------------+
|    Bal Panel      |      Középső Panel        |    Jobb Panel     |
|    (3 oszlop)     |       (6 oszlop)          |    (3 oszlop)     |
|                   |                           |                   |
|  Asztal Lista     |    Vizuális Layout        |  Unassigned       |
|  - Table 1        |    +-------+-------+      |  Guests           |
|  - Table 2        |    |  T1   |  T2   |      |  - Guest A        |
|  - Table 3        |    +-------+-------+      |  - Guest B        |
|  + Add Table      |    |  T3   |  T4   |      |  - Guest C        |
|                   |    +-------+-------+      |                   |
+-------------------+---------------------------+-------------------+
```

### Tailwind Grid Osztályok

```html
<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
    <div class="lg:col-span-3"><!-- Bal panel --></div>
    <div class="lg:col-span-6"><!-- Középső panel --></div>
    <div class="lg:col-span-3"><!-- Jobb panel --></div>
</div>
```

---

## CSS Stílusok

### Színpaletta (CSS Változók)

```css
:root {
    --color-success: #10B981;  /* Zöld - alacsony foglaltság */
    --color-warning: #F59E0B;  /* Sárga - közepes foglaltság */
    --color-error: #EF4444;    /* Piros - tele/full */
}
```

### Foglaltsági Szint Jelzők

```css
/* Alacsony foglaltság (0-50%) */
.occupancy-low {
    background-color: #D1FAE5;
    border-left: 4px solid var(--color-success);
}

/* Közepes foglaltság (50-90%) */
.occupancy-medium {
    background-color: #FEF3C7;
    border-left: 4px solid var(--color-warning);
}

/* Tele (90-100%) */
.occupancy-full {
    background-color: #FEE2E2;
    border-left: 4px solid var(--color-error);
}
```

### Vendég Chip Stílus

```css
.guest-chip {
    cursor: move;
    transition: all 0.2s ease;
}

.guest-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}
```

### SortableJS Ghost (Húzás Közben)

```css
.sortable-ghost {
    opacity: 0.4;
}
```

### Asztal Slot Stílus

```css
.table-slot {
    min-height: 180px;
    transition: background-color 0.2s ease;
}

.table-slot:hover {
    background-color: #F9FAFB;
}

/* Üres asztal (nincs vendég) */
.empty-state {
    border: 2px dashed #D1D5DB;
    background-color: #F9FAFB;
}
```

### Panel Alap Stílus

```css
.panel {
    min-height: 600px;
}

.shadow-elevation-2 {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

## HTML Komponensek

### 1. Navigációs Sáv

```html
<nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Seating Chart - CEO Gála 2025</h1>
        <div class="flex gap-3">
            <span class="text-sm text-gray-600">Info szöveg</span>
            <button class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                Save Changes
            </button>
        </div>
    </div>
</nav>
```

### 2. Asztal Lista Elem (Bal Panel)

```html
<div class="occupancy-medium p-3 rounded-lg transition-all hover:shadow-md">
    <div class="flex items-center justify-between mb-1">
        <h3 class="font-semibold text-gray-900 text-sm">Table 1</h3>
        <button class="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded underline"
                onclick="editTable(1, 'Table 1', 10)">Edit</button>
    </div>
    <div class="text-xs text-gray-500" id="table-1-summary">
        Capacity: 10 | Occupied: 70%
    </div>
</div>
```

### 3. Asztal Slot (Középső Panel)

```html
<div id="table-1-slot"
     class="table-slot bg-gray-50 border-2 border-gray-200 rounded-lg p-3"
     data-capacity="10"
     data-table-id="1">

    <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-900 text-sm">Table 1</h3>
        <span class="text-xs text-gray-500">7/10</span>
    </div>

    <div class="space-y-2 sortable-container">
        <!-- Vendég chipek ide kerülnek -->
        <div class="guest-chip bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 shadow-sm">
            John Doe
        </div>
    </div>
</div>
```

### 4. Vendég Chip (Egyéni Vendég)

```html
<div class="guest-chip bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 shadow-sm"
     data-guest-id="123">
    John Doe
</div>
```

### 5. Páros Vendég Csoport

```html
<div class="paired-guest-group"
     data-primary-id="123"
     data-partner-id="124"
     data-seats="2">

    <div class="guest-chip paired-primary bg-white border-l-4 rounded-md px-2 py-2 text-xs text-gray-900 shadow-sm flex-1">
        <div class="font-semibold">Michael Johnson</div>
        <div class="text-xs text-gray-500">Primary</div>
    </div>

    <svg class="paired-connector w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>

    <div class="guest-chip paired-partner bg-white border-l-4 rounded-md px-2 py-2 text-xs text-gray-900 shadow-sm flex-1">
        <div class="font-semibold">Sarah Johnson</div>
        <div class="text-xs text-gray-500">Partner</div>
    </div>
</div>
```

### 6. Tele Asztal (Nem Fogad Új Vendéget)

```html
<div id="table-2-slot"
     class="table-slot bg-red-50 border-2 border-red-200 rounded-lg p-3"
     data-capacity="10"
     data-table-id="2"
     data-full="true">

    <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-900 text-sm">Table 2</h3>
        <span class="text-xs font-semibold" style="color: var(--color-error);">10/10 FULL</span>
    </div>
    <!-- Vendégek... -->
</div>
```

### 7. Üres Asztal

```html
<div id="table-3-slot" class="table-slot empty-state rounded-lg p-3" data-capacity="10" data-table-id="3">
    <div class="sortable-container space-y-2">
        <div class="text-center pt-12">
            <div class="text-sm text-gray-500 font-medium mb-1">Table 3</div>
            <div class="text-xs text-gray-400">Drag guests here (10 seats available)</div>
        </div>
    </div>
</div>
```

### 8. Unassigned Panel (Jobb Oldal)

```html
<div class="lg:col-span-3 bg-white rounded-lg shadow-elevation-2 p-4 panel">
    <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Unassigned Guests</h2>

    <div id="unassigned-guests" class="space-y-2">
        <!-- Vendég chipek -->
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="text-xs text-gray-500">
            <span class="font-semibold text-gray-900">6</span> guests unassigned
        </div>
    </div>
</div>
```

---

## SortableJS Implementáció

### Alap Konfiguráció

```javascript
const sharedOptions = {
    group: 'seating',           // Azonos csoport = húzhatók egymás között
    animation: 150,             // Animáció hossza ms-ben
    ghostClass: 'sortable-ghost', // CSS osztály húzás közben

    onEnd: function(evt) {
        console.log('Guest moved:', evt.item.textContent, 'to', evt.to.id);
        // Backend hívás...
    }
};
```

### Inicializálás

```javascript
// Minden asztal slot-ra
document.querySelectorAll('.sortable-container').forEach(container => {
    Sortable.create(container, sharedOptions);
});

// Unassigned panel
Sortable.create(document.getElementById('unassigned-guests'), sharedOptions);
```

### Kapacitás Validáció (onMove)

```javascript
onMove: function(evt) {
    const draggedItem = evt.dragged;
    const targetTable = evt.to.closest('.table-slot');

    if (!targetTable) return true;

    // FULL asztalra nem lehet ráhúzni
    if (targetTable.dataset.full === 'true') {
        alert('Table is FULL!');
        return false;
    }

    const tableCapacity = parseInt(targetTable.dataset.capacity);

    // Páros vendég = 2 hely
    const pairedGroup = draggedItem.closest('.paired-guest-group');
    const seatsNeeded = pairedGroup ? parseInt(pairedGroup.dataset.seats) : 1;

    // Aktuális foglaltság számítása
    const currentGuests = targetTable.querySelectorAll('.guest-chip:not(.paired-primary):not(.paired-partner)').length;
    const currentPaired = targetTable.querySelectorAll('.paired-guest-group').length * 2;
    const currentOccupancy = currentGuests + currentPaired;

    // Ellenőrzés
    if (currentOccupancy + seatsNeeded > tableCapacity) {
        alert(`Not enough space! Need ${seatsNeeded} seats.`);
        return false;
    }

    return true;
}
```

### Backend Hívás (onEnd)

```javascript
onEnd: function(evt) {
    const draggedItem = evt.item;
    const targetTable = evt.to.closest('.table-slot');
    const tableId = targetTable.dataset.tableId;
    const pairedGroup = draggedItem.closest('.paired-guest-group');

    if (pairedGroup) {
        // PÁROS vendég
        fetch('/api/seating/assign-paired', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                primary_registration_id: pairedGroup.dataset.primaryId,
                partner_registration_id: pairedGroup.dataset.partnerId,
                table_id: tableId
            })
        });
    } else {
        // EGYÉNI vendég
        fetch('/api/seating/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guest_id: draggedItem.dataset.guestId,
                table_id: tableId
            })
        });
    }

    // UI frissítése
    updateTableHeader(tableId);
}
```

---

## Páros Vendégek Kezelése

### CSS Stílusok

```css
.paired-guest-group {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background-color: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    cursor: move;
    transition: all 0.2s ease;
}

.paired-guest-group:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}

.paired-connector {
    flex-shrink: 0;
    color: #9CA3AF;
}

.paired-primary {
    border-left: 3px solid #374151 !important; /* Sötét szürke */
}

.paired-partner {
    border-left: 3px solid #9CA3AF !important; /* Világos szürke */
}
```

### Logika

- A páros vendégek **egy egységként** mozognak
- **2 helyet foglalnak** (data-seats="2")
- A `data-primary-id` és `data-partner-id` attribútumok tárolják az ID-kat
- A backend **mindkét vendéget** ugyanahhoz az asztalhoz rendeli

---

## Backend API Végpontok

### 1. Egyéni Vendég Asztalhoz Rendelése

```
POST /api/seating/assign
Content-Type: application/json

{
    "guest_id": 123,
    "table_id": 1
}
```

### 2. Páros Vendégek Asztalhoz Rendelése

```
POST /api/seating/assign-paired
Content-Type: application/json

{
    "primary_registration_id": 123,
    "partner_registration_id": 124,
    "table_id": 1
}
```

### 3. Asztal Szerkesztése

```
PUT /api/tables/update
Content-Type: application/json

{
    "table_id": 1,
    "name": "VIP Table",
    "capacity": 12
}
```

---

## Segédfüggvények

### Foglaltság Számítása

```javascript
function calculateOccupancy(tableId) {
    const tableSlot = document.querySelector(`[data-table-id="${tableId}"]`);
    if (!tableSlot) return 0;

    const container = tableSlot.querySelector('.sortable-container');
    if (!container) return 0;

    // Egyéni vendégek (kivéve a páros chipeket)
    const individualGuests = container.querySelectorAll(
        '.guest-chip:not(.paired-primary):not(.paired-partner)'
    ).length;

    // Páros csoportok (mindegyik 2 hely)
    const pairedGroups = container.querySelectorAll('.paired-guest-group').length;

    return individualGuests + (pairedGroups * 2);
}
```

### Asztal Header Frissítése

```javascript
function updateTableHeader(tableId) {
    const tableSlot = document.querySelector(`[data-table-id="${tableId}"]`);
    if (!tableSlot) return;

    const capacity = parseInt(tableSlot.dataset.capacity);
    const occupancy = calculateOccupancy(tableId);

    const occupancySpan = tableSlot.querySelector('.text-xs');

    if (occupancy >= capacity) {
        occupancySpan.textContent = `${occupancy}/${capacity} FULL`;
        occupancySpan.style.color = 'var(--color-error)';
        tableSlot.dataset.full = 'true';
        tableSlot.classList.add('bg-red-50', 'border-red-200');
        tableSlot.classList.remove('bg-gray-50', 'border-gray-200');
    } else {
        occupancySpan.textContent = `${occupancy}/${capacity}`;
        occupancySpan.style.color = '';
        tableSlot.dataset.full = 'false';
        tableSlot.classList.add('bg-gray-50', 'border-gray-200');
        tableSlot.classList.remove('bg-red-50', 'border-red-200');
    }
}
```

### Asztal Szerkesztése (Prompt)

```javascript
function editTable(tableId, currentName, currentCapacity) {
    const newName = prompt('Edit Table Name:', currentName);
    if (!newName) return;

    const newCapacity = prompt('Edit Capacity:', currentCapacity);
    if (!newCapacity) return;

    const capacity = parseInt(newCapacity);
    if (isNaN(capacity) || capacity < 1) {
        alert('Invalid capacity!');
        return;
    }

    // UI frissítés
    const tableSlot = document.querySelector(`[data-table-id="${tableId}"]`);
    tableSlot.dataset.capacity = capacity;
    tableSlot.querySelector('h3').textContent = newName;

    updateTableHeader(tableId);

    // Backend hívás
    // fetch('/api/tables/update', {...});
}
```

---

## Teljes Kód Referencia

A teljes implementáció megtalálható:
- **Alap verzió**: `docs/ux-mockups/3-seating-chart-sortablejs.html`
- **Páros vendégekkel**: `docs/ux-mockups/3-seating-chart-sortablejs-UPDATED.html`

---

## Újraépítési Checklist

Új projektben való implementáláshoz:

- [ ] TailwindCSS CDN hozzáadása
- [ ] SortableJS CDN hozzáadása
- [ ] CSS változók definiálása (színek)
- [ ] Foglaltsági szint osztályok (.occupancy-*)
- [ ] Guest chip stílusok
- [ ] 3-paneles layout létrehozása
- [ ] Asztal lista panel (bal)
- [ ] Vizuális grid panel (közép)
- [ ] Unassigned panel (jobb)
- [ ] SortableJS inicializálása
- [ ] onMove validáció (kapacitás)
- [ ] onEnd backend hívás
- [ ] Páros vendég támogatás (opcionális)
- [ ] Asztal szerkesztés funkció
- [ ] Backend API végpontok implementálása

---

## Megjegyzések

1. **Reszponzivitás**: A `lg:grid-cols-12` biztosítja, hogy mobil nézetben egymás alá kerüljenek a panelek
2. **Accessibility**: A `cursor: move` jelzi, hogy az elem húzható
3. **Performance**: A SortableJS könnyű és gyors, nagy vendéglistákhoz is megfelelő
4. **FULL asztal**: Vendéget ki lehet húzni belőle, de újat nem lehet beletenni

---

*Dokumentáció készült: 2025-11-29*
*Projekt: CEO Gála - Asztalfoglalás Modul*
