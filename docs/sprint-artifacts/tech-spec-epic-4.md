# Epic 4: Seating Management - Technikai Specifikáció

## 1. Áttekintés

Az Epic 4 célja az ültetési rend kezelésének teljes körű implementálása:
- Asztalok CRUD műveletei
- Vendégek asztalhoz rendelése (egyéni és tömeges)
- Interaktív drag-and-drop térkép
- Ültetési rend exportálása

## 2. Adatbázis Séma (Prisma - már létezik)

### Table Model
```prisma
model Table {
  id         Int         @id @default(autoincrement())
  name       String      @unique @db.VarChar(100)
  capacity   Int         // Székek száma
  type       String      @default("standard") // standard, vip, reserved
  pos_x      Int?        // X koordináta a térképen
  pos_y      Int?        // Y koordináta a térképen
  status     TableStatus @default(available) // available, full, reserved
  created_at DateTime    @default(now())

  assignments TableAssignment[]
}

enum TableStatus {
  available
  full
  reserved
}
```

### TableAssignment Model
```prisma
model TableAssignment {
  id          Int      @id @default(autoincrement())
  table_id    Int
  guest_id    Int      @unique  // Egy vendég csak 1 asztalnál
  seat_number Int?     // Szék pozíció az asztalnál
  assigned_at DateTime @default(now())
  assigned_by Int?     // User ID aki hozzárendelte

  @@unique([table_id, seat_number]) // Egy szék - egy vendég
}
```

## 3. API Endpointok

### 3.1 Table CRUD
```
GET    /api/admin/tables           - Összes asztal listázása
POST   /api/admin/tables           - Új asztal létrehozása
GET    /api/admin/tables/:id       - Egyedi asztal lekérdezése
PATCH  /api/admin/tables/:id       - Asztal módosítása
DELETE /api/admin/tables/:id       - Asztal törlése
PATCH  /api/admin/tables/:id/position - Pozíció frissítése (drag-drop)
```

### 3.2 Table Assignments
```
GET    /api/admin/table-assignments              - Összes hozzárendelés
POST   /api/admin/table-assignments              - Vendég asztalhoz rendelése
DELETE /api/admin/table-assignments/:id          - Hozzárendelés törlése
POST   /api/admin/table-assignments/bulk         - Tömeges CSV import
POST   /api/admin/table-assignments/move         - Vendég áthelyezése másik asztalhoz
```

### 3.3 Export
```
GET    /api/admin/seating-export?format=csv      - Ültetési rend export
```

## 4. Service Réteg

### lib/services/seating.ts

```typescript
// Table CRUD
createTable(data: CreateTableData): Promise<Table>
updateTable(id: number, data: UpdateTableData): Promise<Table>
deleteTable(id: number): Promise<void>
getTable(id: number): Promise<TableWithAssignments>
getAllTables(): Promise<TableWithAssignments[]>
updateTablePosition(id: number, pos_x: number, pos_y: number): Promise<Table>

// Assignments
assignGuestToTable(guestId: number, tableId: number, seatNumber?: number): Promise<TableAssignment>
removeGuestFromTable(assignmentId: number): Promise<void>
moveGuestToTable(guestId: number, newTableId: number, newSeatNumber?: number): Promise<TableAssignment>
bulkAssignFromCsv(csv: string): Promise<BulkAssignResult>

// Queries
getUnassignedGuests(): Promise<Guest[]>
getTableAvailability(tableId: number): Promise<{ available: number, total: number }>

// Export
exportSeatingArrangement(): Promise<string> // CSV
```

## 5. Frontend Komponensek

### 5.1 Admin Oldalak
- `/admin/tables` - Asztalok listája és CRUD
- `/admin/seating` - Interaktív ültetési térkép

### 5.2 Komponensek

```
app/admin/tables/
├── page.tsx                 - Asztalok lista oldal
├── TableList.tsx            - Táblázatos lista
├── TableForm.tsx            - Asztal létrehozás/szerkesztés
└── TableCard.tsx            - Egyedi asztal kártya

app/admin/seating/
├── page.tsx                 - Ültetési térkép oldal
├── SeatingMap.tsx           - Drag-drop canvas (React-DnD-Kit)
├── TableNode.tsx            - Asztal elem a térképen
├── GuestList.tsx            - Hozzá nem rendelt vendégek
├── AssignmentPanel.tsx      - Vendég hozzárendelés panel
└── ExportButton.tsx         - CSV export gomb
```

## 6. Validációs Szabályok

### Asztal létrehozás
- `name`: kötelező, egyedi, max 100 karakter
- `capacity`: kötelező, 1-20 között
- `type`: standard | vip | reserved

### Hozzárendelés
- Egy vendég csak egy asztalhoz rendelhető
- Asztal kapacitás nem léphető túl
- Seat number egyedi az asztalon belül

### CSV Import formátum
```csv
table_name,guest_email,seat_number
VIP-01,john@example.com,1
VIP-01,jane@example.com,2
Standard-05,bob@example.com,
```

## 7. Hibaüzenetek

```typescript
const SEATING_ERRORS = {
  TABLE_NOT_FOUND: 'Asztal nem található',
  TABLE_NAME_EXISTS: 'Ilyen nevű asztal már létezik',
  TABLE_NOT_EMPTY: 'Asztal nem törölhető, vendégek vannak hozzárendelve',
  GUEST_ALREADY_ASSIGNED: 'Vendég már másik asztalhoz van rendelve',
  TABLE_FULL: 'Asztal megtelt',
  SEAT_TAKEN: 'Ez a szék már foglalt',
  INVALID_SEAT_NUMBER: 'Érvénytelen székszám',
  GUEST_NOT_FOUND: 'Vendég nem található',
};
```

## 8. Story-k

### Story 4-1: Table CRUD Operations
- Asztalok létrehozása, módosítása, törlése
- Admin dashboard oldal
- Validáció

### Story 4-2: Manual Guest-to-Table Assignment
- Egyéni hozzárendelés UI
- Vendég lista (hozzá nem rendeltek)
- Drag & drop támogatás

### Story 4-3: Bulk CSV Table Assignment
- CSV feltöltés
- Validáció és hibajelentés
- Részleges import támogatás

### Story 4-4: Interactive Drag-and-Drop Seating Map
- React-DnD-Kit integráció
- Asztalok pozícionálása
- Vendégek áthúzása asztalok között
- Real-time mentés

### Story 4-5: Seating Arrangement Export/Reports
- CSV export
- Szűrési lehetőségek
- Statisztikák (foglaltság %)
