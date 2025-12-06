# Epic 3: Check-in System - Technikai Specifikáció

## Epic Áttekintés
Mobil-barát check-in rendszer QR kód beolvasással az esemény beléptetéshez. A rendszer valós időben ellenőrzi a jegyek érvényességét és rögzíti a belépéseket.

## Stories
- **3-1**: QR Code Validation API (JWT Verification)
- **3-2**: Mobile QR Scanner Interface
- **3-3**: Check-in Recording & Duplicate Prevention
- **3-4**: Admin Check-in Log Dashboard

## Technikai Architektúra

### QR Kód Tartalom (JWT)
```typescript
// JWT Payload (from Story 2.3)
interface TicketJWTPayload {
  registration_id: number;
  guest_id: number;
  ticket_type: 'vip_free' | 'paid_single' | 'paid_paired';
  guest_name: string;
  iat: number;  // issued at
  exp: number;  // expiry (event day + 1 midnight)
}
```

### Check-in Flow
```
[QR Scan] → [JWT Verify] → [DB Lookup] → [Duplicate Check] → [Record Check-in]
     ↓            ↓             ↓               ↓                   ↓
  Camera      HS256 +      Registration    checkins table      checkins.create()
  html5-qrcode  QR_SECRET    + Guest        UNIQUE constraint
```

### API Endpoints

#### POST /api/checkin/validate
Validálja a QR kódot és visszaadja a vendég adatokat.
```typescript
// Request
{ qrToken: string }

// Response - Success
{
  valid: true,
  guest: {
    id: number,
    name: string,
    ticketType: string,
    partnerName?: string
  },
  alreadyCheckedIn: boolean,
  previousCheckin?: {
    checkedInAt: string,
    staffName: string
  }
}

// Response - Invalid
{
  valid: false,
  error: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'REGISTRATION_NOT_FOUND'
}
```

#### POST /api/checkin/submit
Rögzíti a check-in eseményt.
```typescript
// Request
{
  registrationId: number,
  override?: boolean  // Admin override for duplicate
}

// Response
{
  success: boolean,
  checkinId?: number,
  error?: string
}
```

### Adatbázis Schema
```sql
-- Existing from prisma/schema.prisma
model Checkin {
  id              Int          @id @default(autoincrement())
  registration_id Int          @unique  -- Prevents duplicate check-ins
  guest_id        Int
  staff_user_id   Int?
  checked_in_at   DateTime     @default(now())
  is_override     Boolean      @default(false)

  registration    Registration @relation(...)
  guest           Guest        @relation(...)
  staff_user      User?        @relation(...)
}
```

### UI Komponensek

#### Mobile Scanner Page (/checkin)
- Full-screen kamera nézet
- QR scanner (html5-qrcode)
- Eredmény kártyák:
  - **ZÖLD**: Érvényes jegy → Vendég név, típus → "Check In" gomb
  - **SÁRGA**: Már beléptetve → Figyelmeztetés, előző belépés ideje → "Admin Override" gomb
  - **PIROS**: Érvénytelen QR → Hibaüzenet → "Újra szkennelés" gomb

#### Admin Check-in Log (/admin/checkin-log)
- Szűrők: dátum, vendég név, státusz
- Táblázat: időpont, vendég, jegy típus, staff
- Export CSV

### Biztonsági Megfontolások
1. JWT HS256 aláírás ellenőrzés QR_SECRET-tel
2. Token lejárat ellenőrzés (event day + 1)
3. UNIQUE constraint a dupla belépés ellen
4. Admin session ellenőrzés az override-hoz
5. Rate limiting a scanner API-n

### Függőségek
- **Story 2.3**: QR kód generálás és JWT struktúra ✅
- **Story 1.2**: Admin authentikáció ✅
- **html5-qrcode**: NPM csomag mobil QR olvasáshoz

### Tesztelési Stratégia
1. Unit tesztek: JWT validáció, check-in logika
2. Integration tesztek: teljes check-in flow
3. E2E tesztek: Scanner UI (Playwright mobile viewport)
