# Manuális Tesztelési Útmutató: Admin Email Kezelés

> **Cél:** Email sablonok → Email napló → Ütemezett emailek → Tömeges küldés
>
> **Időtartam:** ~8 perc
>
> **Előfeltételek:** Admin hozzáférés, SMTP konfiguráció

---

## Előkészületek

### SMTP Konfiguráció Ellenőrzése

```bash
# .env fájl ellenőrzése
grep "^SMTP" /var/www/ceog/.env
```

Várt értékek:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@ceogala.hu
```

---

## 1. FÁZIS: Admin Bejelentkezés

### 1.1 Login
1. Nyisd meg: **https://ceogala.mflevents.space/admin**
2. Bejelentkezési adatok:
   - Email: `admin@ceogala.test`
   - Jelszó: `Admin123!`
3. Dashboard betöltődik

---

## 2. FÁZIS: Email Sablonok

### 2.1 Email Sablonok Oldal
1. Navigálj: **Comms** → **Email Templates** (`/admin/email-templates`)
2. Megjelenik a sablonok listája

### 2.2 Elérhető Sablonok

| Sablon | Leírás | Változók |
|--------|--------|----------|
| `magic-link` | Meghívó link | {name}, {link}, {expires} |
| `ticket` | E-jegy | {name}, {qr_code}, {event_date} |
| `reminder` | Emlékeztető | {name}, {event_date}, {days_until} |
| `welcome` | Üdvözlő | {name} |

### 2.3 Sablon Megtekintése
1. Kattints egy sablon sorára
2. Megjelenik a sablon tartalma:
   - Tárgy (subject)
   - HTML body
   - Text body
   - Használt változók

### 2.4 Sablon Tesztelése (ha van ilyen funkció)
1. Kattints: **Teszt küldés** / **Send Test**
2. Add meg a teszt email címet
3. Ellenőrizd a beérkező emailt

---

## 3. FÁZIS: Email Napló

### 3.1 Email Napló Oldal
1. Navigálj: **Comms** → **Email Logs** (`/admin/email-logs`)
2. Megjelenik a küldött emailek listája

### 3.2 Napló Oszlopok

| Oszlop | Leírás |
|--------|--------|
| Dátum | Küldés időpontja |
| Címzett | Email cím |
| Típus | magic_link, ticket, reminder, stb. |
| Státusz | sent, failed, pending |
| Hiba | Hibaüzenet (ha van) |

### 3.3 Szűrés
1. **Státusz szerint:** sent, failed, pending
2. **Típus szerint:** magic_link, ticket, stb.
3. **Dátum szerint:** tól-ig

### 3.4 Részletek Megtekintése
1. Kattints egy napló bejegyzésre
2. Látható:
   - Teljes email tartalom
   - Küldési kísérletek
   - Hibák részletesen

---

## 4. FÁZIS: Ütemezett Emailek

### 4.1 Ütemezett Emailek Oldal
1. Navigálj: **Comms** → **Scheduled Emails** (`/admin/scheduled-emails`)
2. Megjelenik az ütemezett emailek listája

### 4.2 Státuszok

| Státusz | Jelentés |
|---------|----------|
| pending | Várakozik küldésre |
| sent | Elküldve |
| cancelled | Törölve |
| failed | Sikertelen |

### 4.3 Új Ütemezett Email (ha elérhető)
1. Kattints: **Új ütemezés** / **Schedule New**
2. Válassz sablont
3. Válassz címzetteket
4. Állítsd be az időpontot
5. Mentés

### 4.4 Ütemezés Törlése
1. Kattints: **Törlés** / **Cancel** a pending emailnél
2. Státusz: `cancelled`

---

## 5. FÁZIS: Tömeges Email Küldés

### 5.1 Vendégek Oldalról
1. Navigálj: `/admin/guests`
2. Jelöld be a vendégeket (checkbox)
3. Kattints: **Művelet** → **Email küldés**

### 5.2 Bulk Email API (SQL/Direct)

```sql
-- Pending emailek lekérdezése
SELECT
    se.id,
    se.guest_id,
    g.email,
    se.email_type,
    se.scheduled_for,
    se.status
FROM ScheduledEmail se
JOIN Guest g ON se.guest_id = g.id
WHERE se.status = 'pending'
ORDER BY se.scheduled_for;
```

### 5.3 Email Küldés Manuálisan (Teszt)

```bash
# Node.js script futtatása
cd /var/www/ceog
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'test@example.com',
  subject: 'Teszt Email',
  text: 'Ez egy teszt email.'
}).then(info => console.log('Sent:', info.messageId));
"
```

---

## 6. FÁZIS: Adatbázis Ellenőrzés

### 6.1 Email Napló Statisztika

```sql
SELECT
    email_type,
    status,
    COUNT(*) AS count
FROM EmailLog
GROUP BY email_type, status
ORDER BY email_type, status;
```

### 6.2 Sikertelen Emailek

```sql
SELECT
    el.id,
    g.email,
    el.email_type,
    el.status,
    el.error_message,
    el.created_at
FROM EmailLog el
JOIN Guest g ON el.guest_id = g.id
WHERE el.status = 'failed'
ORDER BY el.created_at DESC
LIMIT 10;
```

### 6.3 Email Sablonok

```sql
SELECT
    id,
    slug,
    subject,
    LENGTH(html_body) AS html_length,
    LENGTH(text_body) AS text_length,
    variables
FROM EmailTemplate
ORDER BY slug;
```

---

## 7. FÁZIS: Hibaelhárítás

### Probléma: Email nem küldődik el
**Lehetséges okok és megoldások:**

1. **SMTP konfiguráció hibás**
   ```bash
   # Teszteld a kapcsolatot
   telnet smtp.gmail.com 587
   ```

2. **App password szükséges (Gmail)**
   - Google Account → Security → 2FA bekapcsolva
   - App passwords → Generate

3. **Rate limit**
   ```sql
   SELECT * FROM RateLimitEntry WHERE key LIKE '%email%';
   ```

### Probléma: "Template not found"
```sql
-- Ellenőrizd a sablont
SELECT * FROM EmailTemplate WHERE slug = 'magic-link';
```

### Probléma: Változók nem helyettesítődnek
- Ellenőrizd a template `variables` mezőjét
- Ellenőrizd, hogy a kód átadja-e a változókat

---

## Automatizált Teszt

```bash
cd /var/www/ceog
BASE_URL=http://localhost:3000 npx playwright test --project=video-journey 04-admin-email.journey.spec.ts
```

**Videó:** `public/test-videos/04-admin-email-journey.webm`

---

## Kapcsolódó Dokumentumok

- [E2E Teszt Státusz](./E2E-TEST-STATUS.md)
- [Email Service](../../lib/services/email.ts)
- [Journey Teszt Fájl](../../tests/e2e/specs/04-admin-email.journey.spec.ts)

---

*Utolsó frissítés: 2025-12-17*
*Készítette: Paige (Tech Writer) + Murat (TEA)*
