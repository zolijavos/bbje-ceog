# CEO Gála - Konfiguráció és Manuális Tesztelés

**Dátum:** 2025-12-14
**Verzió:** 1.0

---

## 1. Konfiguráció Állapot

### Ami KÉSZ és MŰKÖDIK ✅

| Elem | Státusz | Megjegyzés |
|------|---------|------------|
| Adatbázis (MySQL) | ✅ Működik | `ceog` adatbázis a VPS-en |
| App titkos kulcsok | ✅ Beállítva | APP_SECRET, QR_SECRET (64 kar.) |
| NextAuth | ✅ Működik | Admin bejelentkezés működik |
| SMTP kapcsolat | ✅ Működik | Brevo SMTP-relay tesztelve |
| SMTP_FROM | ✅ Hozzáadva | `9d86f7001@smtp-brevo.com` |

### Ami HIÁNYZIK / BEÁLLÍTANDÓ ❌

| Elem | Teendő | Prioritás |
|------|--------|-----------|
| **Stripe kulcsok** | Valódi `sk_live_` és `pk_live_` kulcsok kellenek | 🔴 KRITIKUS |
| **Stripe Webhook** | Webhook URL regisztrálása a Stripe dashboardon | 🔴 KRITIKUS |
| **Domain név** | Opcionális: `ceogala.hu` domain beállítása | 🟡 Ajánlott |
| **SSL tanúsítvány** | Let's Encrypt, ha domain lesz | 🟡 Ajánlott |

---

## 2. STRIPE Beállítás Lépései

### 2.1 Stripe Fiók Létrehozása (ha még nincs)
1. Menj a https://dashboard.stripe.com oldalra
2. Regisztrálj / jelentkezz be
3. Töltsd ki a cégadatokat az aktiváláshoz

### 2.2 API Kulcsok Megszerzése
1. Stripe Dashboard → Developers → API keys
2. Másold ki:
   - **Publishable key**: `pk_live_...` (publikus, frontend-nek)
   - **Secret key**: `sk_live_...` (titkos, backend-nek)

### 2.3 Webhook Beállítása
1. Stripe Dashboard → Developers → Webhooks
2. **Add endpoint** gomb
3. **Endpoint URL**: `http://46.202.153.178/api/stripe/webhook`
   - (Ha lesz domain: `https://ceogala.hu/api/stripe/webhook`)
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.refunded`
5. **Webhook signing secret**: Másold ki a `whsec_...` kulcsot

### 2.4 .env Fájl Frissítése
```bash
# SSH-val a szerverre
ssh root@46.202.153.178
nano /var/www/ceog/.env

# Cseréld ki ezeket:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXX  # A te kulcsod
STRIPE_SECRET_KEY=sk_live_XXXXXXX                   # A te kulcsod
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXX                 # Webhook-ból

# Mentés után újraindítás:
pm2 restart ceog --update-env
```

---

## 3. E-MAIL Manuális Tesztelés

### 3.1 Közvetlen E-mail Teszt (Terminálból)
```bash
cd /var/www/ceog

# Egyszerű teszt e-mail küldése
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER || '9d86f7001@smtp-brevo.com',
    pass: process.env.SMTP_PASS || 'tX9DY16dVWjmz5Sr'
  }
});
transport.sendMail({
  from: '9d86f7001@smtp-brevo.com',
  to: 'TE_EMAIL_CIMED@gmail.com',  // <-- Cseréld ki!
  subject: 'CEO Gála Teszt - ' + new Date().toLocaleString('hu-HU'),
  html: '<h1>Teszt sikeres!</h1><p>Az e-mail küldés működik.</p>'
}).then(() => console.log('✅ Elküldve!')).catch(e => console.log('❌ Hiba:', e.message));
"
```

### 3.2 Magic Link E-mail Teszt (Admin Felületen)
1. Nyisd meg: http://46.202.153.178/admin
2. Jelentkezz be: `admin@ceogala.test` / `Admin123!`
3. Vendéglista → Válassz egy vendéget
4. Kattints: **"Magic Link Küldése"** gomb
5. Ellenőrizd: Megérkezett-e az e-mail?

### 3.3 Hibaelhárítás Ha Nem Érkezik E-mail
1. **Spam mappa** - Ellenőrizd!
2. **Brevo dashboard** - https://app.brevo.com → Logs
3. **Szerver log**:
   ```bash
   pm2 logs ceog --lines 50 | grep -i email
   ```
4. **Gyakori hibák**:
   - "Invalid sender" → SMTP_FROM nincs beállítva
   - "Rate limited" → Brevo napi limit (300 free)
   - "Connection refused" → Tűzfal blokkolja a 587-es portot

---

## 4. STRIPE Manuális Tesztelés

### 4.1 Előkészületek
⚠️ **FONTOS**: Teszteléshez használj **Stripe Test Mode**-ot először!

1. Stripe Dashboard → Kapcsold be a **Test mode** kapcsolót
2. Használd a test kulcsokat: `pk_test_...`, `sk_test_...`
3. Test kártya számok:
   - **Sikeres**: `4242 4242 4242 4242`
   - **Elutasított**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0027 6000 3184`
   - Lejárat: Bármilyen jövőbeli dátum
   - CVC: Bármilyen 3 számjegy

### 4.2 Fizetési Folyamat Tesztelése
1. **Teszt vendég létrehozása**:
   ```sql
   -- MySQL-ben vagy admin felületen
   INSERT INTO Guest (email, name, guest_type, registration_status)
   VALUES ('teszt@example.com', 'Teszt Vendég', 'paying_single', 'invited');
   ```

2. **Magic link generálása** (Admin → Vendéglista → "Magic Link Küldése")

3. **Regisztráció végigvitele**:
   - Nyisd meg a magic linket
   - Töltsd ki az űrlapot
   - Válaszd a kártyás fizetést
   - Használd a teszt kártya számot: `4242 4242 4242 4242`

4. **Ellenőrzés**:
   - Sikeres fizetés után QR jegy generálódik
   - E-mail érkezik a jeggyel
   - Admin felületen: Fizetések → státusz "paid"

### 4.3 Webhook Tesztelése (Stripe CLI-vel)
```bash
# Stripe CLI telepítése
curl -fsSL https://cli.stripe.com/cli-download/linux | sudo tar -xz -C /usr/local/bin

# Bejelentkezés
stripe login

# Webhook események továbbítása lokálisan
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Teszt esemény küldése (másik terminálban)
stripe trigger checkout.session.completed
```

---

## 5. CSV IMPORT + MAGIC LINK Teszt

### 5.1 Teszt CSV Fájl Készítése
Hozz létre egy `teszt-vendegek.csv` fájlt:
```csv
email,name,guest_type
vendeg1@teszt.hu,Teszt Vendég Egy,vip
vendeg2@teszt.hu,Teszt Vendég Kettő,paying_single
vendeg3@teszt.hu,Teszt Vendég Három,paying_paired
```

### 5.2 Import Folyamat
1. Admin felület → **CSV Import** menü
2. Fájl feltöltése
3. Oszlop mapping ellenőrzése:
   - email → email
   - name → name
   - guest_type → guest_type
4. **Import indítása**
5. Ellenőrzés: Vendéglista → Megjelentek az új vendégek?

### 5.3 Tömeges Magic Link Küldés
1. Vendéglista → Jelöld be a vendégeket (checkbox)
2. **Tömeges műveletek** → "Magic Link Küldése Kijelölteknek"
3. Ellenőrzés:
   - Admin felületen: Email Naplók → Státusz
   - Brevo dashboard: Küldési log
   - Teszt e-mail cím: Megérkezett?

### 5.4 Magic Link Tesztelése
1. Nyisd meg a kapott e-mailt
2. Kattints a linkre
3. Elvárt eredmény:
   - VIP vendég: Közvetlen megerősítő oldal
   - Fizető vendég: Jegytípus választó → Számlázási adatok → Fizetés

---

## 6. Teljes End-to-End Teszt Forgatókönyv

### Forgatókönyv: Fizető Vendég Regisztrációja

| Lépés | Művelet | Elvárt Eredmény |
|-------|---------|-----------------|
| 1 | CSV import 1 teszt vendéggel | Vendég megjelenik a listában |
| 2 | Magic Link küldése | E-mail megérkezik |
| 3 | Link megnyitása | Regisztrációs oldal betölt |
| 4 | Űrlap kitöltése | Validáció működik |
| 5 | Fizetés (teszt kártya) | Stripe Checkout megnyílik |
| 6 | Sikeres fizetés | Visszairányítás success oldalra |
| 7 | QR jegy ellenőrzés | Jegy e-mail megérkezik |
| 8 | PWA belépés | 6 jegyű kóddal működik |
| 9 | Check-in teszt | QR szkennelés sikeres |

---

## 7. Hasznos Parancsok

```bash
# Alkalmazás státusz
pm2 status

# Logok megtekintése
pm2 logs ceog --lines 100

# Alkalmazás újraindítása
pm2 restart ceog --update-env

# Adatbázis ellenőrzés
npx prisma studio

# E-mail log lekérdezés
mysql -u ceog_user -p ceog -e "SELECT * FROM EmailLog ORDER BY sent_at DESC LIMIT 10;"
```

---

## 8. Kapcsolat Hibák Esetén

**Brevo Support**: https://help.brevo.com
**Stripe Support**: https://support.stripe.com

**Szerver elérés**:
```bash
ssh root@46.202.153.178
cd /var/www/ceog
```
