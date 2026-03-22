# Adatmodellek - CEO Gala Regisztrációs Rendszer

**Generálva:** 2026-02-15 | **Frissítve:** 2026-03-22
**Adatbázis:** MySQL 8.0+ (Prisma ORM ^5.19.0)
**Séma fájl:** `prisma/schema.prisma`

---

## Áttekintés

A rendszer 16 Prisma modellt és 10 enum-ot tartalmaz, amelyek az alábbi fő doméneket fedik le:

1. **Vendégek és Regisztrációk** - Guest, Registration, Payment, BillingInfo
2. **Check-in Rendszer** - Checkin
3. **Ültetési Rend** - Table, TableAssignment
4. **Admin Felhasználók** - User
5. **Email Rendszer** - EmailLog, EmailTemplate, ScheduledEmail, SchedulerConfig
6. **Biztonság** - RateLimitEntry
7. **Audit** - AuditLog
8. **Tesztelés** - TestResult

## Entitás-Kapcsolat Diagram

```
┌──────────┐     1:0..1     ┌──────────────┐     1:0..1     ┌─────────┐
│  Guest   │────────────────│ Registration │────────────────│ Payment │
│          │                │              │                │         │
│ id (PK)  │                │ id (PK)      │                │ id (PK) │
│ email    │                │ guest_id(FK) │                │ reg_id  │
│ name     │                │ ticket_type  │                │ amount  │
│ guest_   │                │ qr_code_hash │                │ status  │
│  type    │                │ gdpr_consent │                │ paid_at │
│ status   │                └──────┬───────┘                └─────────┘
└────┬─────┘                       │
     │                        1:0..1│
     │                    ┌────────▼────────┐
     │                    │  BillingInfo    │
     │                    │ billing_name   │
     │                    │ company, tax   │
     │                    │ address        │
     │                    └────────────────┘
     │
     │    1:0..1     ┌─────────┐
     ├──────────────│ Checkin  │──────── User (staff)
     │               │ method  │
     │               │ is_     │
     │               │ override│
     │               └─────────┘
     │
     │    1:0..*     ┌─────────────────┐     N:1     ┌─────────┐
     ├──────────────│ TableAssignment │────────────│  Table  │
     │               │ seat_number    │             │ name    │
     │               └────────────────┘             │capacity │
     │                                              │ pos_x/y │
     │    1:0..*     ┌──────────┐                   └─────────┘
     └──────────────│ EmailLog │
                     │ type    │
                     │ status  │
                     └─────────┘

Standalone táblák:
┌────────────────┐ ┌──────────────┐ ┌───────────────┐ ┌────────────┐
│ EmailTemplate  │ │SchedulerConf │ │ScheduledEmail │ │RateLimitEn │
│ slug (UNIQUE)  │ │ config_key   │ │ template_slug │ │ key(UNIQUE)│
│ html_body      │ │ send_time    │ │ scheduled_for │ │ attempts   │
│ text_body      │ │ target_*     │ │ status        │ │ expires_at │
└────────────────┘ └──────────────┘ └───────────────┘ └────────────┘

┌──────────┐ ┌────────────┐
│ AuditLog │ │ TestResult │
│ action   │ │ version    │
│ entity_* │ │ status     │
│ old/new  │ │ tester_id  │
└──────────┘ └────────────┘
```

## Modellek Részletesen

### Guest (guests)

A vendég az alapvető entitás - minden vendéghez tartozhat regisztráció, ültetés, check-in és email napló.

| Mező | Típus | Attribútumok | Leírás |
|------|-------|--------------|--------|
| id | Int | PK, autoincrement | Azonosító |
| email | String | UNIQUE | Email cím |
| name | String | - | Teljes név |
| title | String? | - | Megszólítás (Dr., Prof.) |
| phone | String? | - | Telefonszám |
| company | String? | - | Cég neve |
| position | String? | - | Beosztás |
| guest_type | GuestType | default: invited | Vendég típus |
| status | RegistrationStatus | default: invited | Regisztrációs státusz |
| dietary_requirements | String? | Text | Diétás igények |
| seating_preferences | String? | Text | Ültetési preferenciák |
| magic_link_code | String? | - | Magic link hash kód |
| magic_link_expires | DateTime? | - | Magic link lejárat |
| is_vip_reception | Boolean | default: false | Külön VIP fogadásra meghívott |
| pwa_auth_code | String? | UNIQUE | PWA belépési kód (CEOG-XXXXXX) |
| push_token | String? | Text | Firebase FCM push token |
| application_message | String? | Text | Jelentkezési üzenet |
| rejection_reason | String? | Text | Elutasítás oka |
| created_at | DateTime | default: now() | Létrehozás |
| updated_at | DateTime | @updatedAt | Módosítás |

**Kapcsolatok:** Registration (1:0..1), TableAssignment (1:0..*), Checkin (1:0..1), EmailLog (1:0..*)

### Registration (registrations)

| Mező | Típus | Attribútumok | Leírás |
|------|-------|--------------|--------|
| id | Int | PK, autoincrement | Azonosító |
| guest_id | Int | UNIQUE, FK→Guest | Vendég FK |
| ticket_type | String? | - | Jegy típus (vip_free, paid_single, paid_paired) |
| payment_method | String? | - | Fizetési mód (card, bank_transfer) |
| qr_code_hash | String? | Text | JWT token QR kódhoz |
| gdpr_consent | Boolean | default: false | GDPR hozzájárulás |
| cancellation_acceptance | Boolean | default: false | Lemondási feltételek |
| partner_name | String? | - | Partner neve (páros jegy) |
| partner_email | String? | - | Partner email (páros jegy) |

**Kapcsolatok:** Guest (N:1), Payment (1:0..1), BillingInfo (1:0..1), Checkin (1:0..1)

### Payment (payments)

| Mező | Típus | Attribútumok | Leírás |
|------|-------|--------------|--------|
| id | Int | PK, autoincrement | Azonosító |
| registration_id | Int | UNIQUE, FK→Registration | Regisztráció FK |
| stripe_session_id | String? | UNIQUE | Stripe Session ID |
| stripe_payment_intent_id | String? | - | Stripe Payment Intent ID (visszatérítéshez) |
| amount | Decimal | Decimal(10,2) | Összeg |
| currency | String | default: "HUF" | Pénznem |
| payment_status | PaymentStatus | default: pending | Fizetési státusz |
| payment_method | PaymentMethod | - | Fizetési mód (card, bank_transfer) |
| paid_at | DateTime? | - | Fizetés időpontja |
| created_at | DateTime | default: now() | Létrehozás |

### BillingInfo (billing_infos)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| registration_id | Int | UNIQUE, FK |
| name | String | Számlázási név |
| company | String? | Cégnév |
| tax_number | String? | Adószám |
| address | String (Text) | Számlázási cím |

### Checkin (checkins)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| registration_id | Int | UNIQUE, FK |
| guest_id | Int | UNIQUE, FK |
| staff_user_id | Int? | FK→User (beléptető személy) |
| method | String | "qr_scan" (default) / "manual" |
| is_override | Boolean | Admin override (duplikáció felülírás) |
| checked_in_at | DateTime | Check-in időpont |

### Table (tables)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| name | String | UNIQUE, asztal neve |
| capacity | Int | Helyek száma |
| type | String | "standard" (default) / "vip" |
| pos_x | Float | X koordináta (alaprajz) |
| pos_y | Float | Y koordináta (alaprajz) |
| status | TableStatus | available/full/reserved |

### TableAssignment (table_assignments)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| table_id | Int | FK→Table |
| guest_id | Int | UNIQUE, FK→Guest |
| seat_number | Int? | Szék szám |

### User (users)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| email | String | UNIQUE |
| name | String | Teljes név |
| password_hash | String | bcrypt hash |
| role | UserRole | admin / staff |

### EmailLog (email_logs)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| guest_id | Int? | FK→Guest |
| email_type | String | magic_link, ticket, reminder, stb. |
| recipient | String | Címzett email |
| subject | String? | Email tárgy |
| status | String | pending/sent/failed/bounced |
| error_message | String? | Hiba üzenet |
| sent_at | DateTime? | Küldés időpont |

### EmailTemplate (email_templates)

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK |
| slug | String | UNIQUE, sablon azonosító |
| subject | String | Email tárgy sablon |
| html_body | String (LongText) | HTML sablon |
| text_body | String (Text) | Plaintext sablon |
| variables | String (Text) | JSON - elérhető változók |

### SchedulerConfig (scheduler_configs)

Email ütemező konfigurációk (payment reminder, event reminder, stb.)

| Mező | Típus | Leírás |
|------|-------|--------|
| config_key | String | UNIQUE, konfig azonosító |
| enabled | Boolean | Aktív-e |
| days_before/after | Int? | Napok az esemény előtt/után |
| send_time | String | Küldési idő (HH:MM) |
| target_status | String? | JSON - cél státuszok |
| target_types | String? | JSON - cél vendég típusok |
| template_slug | String | Email sablon slug |

### ScheduledEmail (scheduled_emails)

| Mező | Típus | Leírás |
|------|-------|--------|
| guest_id | Int? | Opcionális FK→Guest |
| template_slug | String | Email sablon |
| scheduled_for | DateTime | Ütemezett időpont |
| status | ScheduledEmailStatus | pending/processing/sent/failed/cancelled |
| schedule_type | String | manual/payment_reminder/event_reminder/auto |

### AuditLog (audit_logs)

| Mező | Típus | Leírás |
|------|-------|--------|
| user_id | Int? | Admin felhasználó |
| action | String | CREATE/UPDATE/DELETE/APPROVE/REJECT/SEND_EMAIL/LOGIN |
| entity_type | String | guest/table/payment/email/applicant |
| entity_id | Int? | Érintett entitás ID |
| old_values | String? | JSON - korábbi értékek |
| new_values | String? | JSON - új értékek |
| ip_address | String? | IP cím |

### RateLimitEntry (rate_limit_entries)

| Mező | Típus | Leírás |
|------|-------|--------|
| key | String | UNIQUE, pl. "email:123:magic_link" |
| attempts | Int | Próbálkozások száma |
| expires_at | DateTime | Lejárat |

### TestResult (test_results)

Manuális release tesztelés eredményeinek tárolása. Minden verzió minden feature-jéhez külön rekord.

| Mező | Típus | Leírás |
|------|-------|--------|
| id | Int | PK, autoincrement |
| version | String | Verzió szám (pl. "2.11.0") |
| feature_index | Int | Feature index a verzión belül |
| feature_name | String | Feature név (referencia) |
| status | TestStatus | passed/failed/not_tested |
| comment | String? | Tesztelő megjegyzése |
| tester_id | Int | FK→User (tesztelő) |
| tester_name | String | Tesztelő neve (cache-elve exporthoz) |
| step_results | String? | JSON - lépés eredmények ({ stepIndex: boolean }) |
| tested_at | DateTime | Tesztelés időpontja |
| updated_at | DateTime | Módosítás |

**Unique constraint:** `(version, feature_index)` — egy feature verzión belül egyedi
**Kapcsolatok:** User (N:1, tester_id → User.id)

## Enumerációk

```prisma
enum GuestType { invited, paying_single, paying_paired, applicant }
enum RegistrationStatus { pending, invited, registered, approved, declined, pending_approval, rejected, cancelled, checked_in }
enum TicketType { vip_free, paid_single, paid_paired }
enum PaymentMethod { card, bank_transfer }
enum PaymentStatus { pending, paid, failed, refunded }
enum TableStatus { available, full, reserved }
enum TableType { vip, standard }
enum UserRole { admin, staff }
enum ScheduledEmailStatus { pending, processing, sent, failed, cancelled }
enum TestStatus { passed, failed, not_tested }
```

## Indexek és Constraint-ek

### Unique Constraint-ek
- `Guest.email` - Egy email = egy vendég
- `Guest.pwa_auth_code` - Egyedi PWA belépési kód
- `Registration.guest_id` - Egy vendég = egy regisztráció
- `Payment.registration_id` - Egy regisztráció = egy fizetés
- `BillingInfo.registration_id` - Egy regisztráció = egy számlázási adat
- `Checkin.registration_id` + `Checkin.guest_id` - Duplikáció megelőzés
- `TableAssignment.guest_id` - Egy vendég = egy asztal
- `Table.name` - Egyedi asztal nevek
- `User.email` - Egyedi admin email
- `EmailTemplate.slug` - Egyedi sablon azonosítók
- `RateLimitEntry.key` - Egyedi rate limit kulcsok
- `TestResult.(version, feature_index)` - Egyedi teszt eredmény per feature per verzió

## Migrációs Stratégia

A Prisma Migrate kezelőeszközt használjuk:

```bash
npx prisma migrate dev     # Fejlesztési migráció (SQL generálás + alkalmazás)
npx prisma migrate deploy  # Production migráció (csak alkalmazás)
npx prisma db push         # Schema push (dev - nincs migráció fájl)
```

A migrációk a `prisma/migrations/` könyvtárban tárolódnak automatikusan generált SQL fájlokként.
