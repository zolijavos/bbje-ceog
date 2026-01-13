# CEO Gala - Biztonsági Architektúra

**Verzió**: 1.0.0
**Készült**: 2026-01-13
**Projekt**: CEO Gala Regisztrációs Rendszer

---

## Tartalomjegyzék

1. [Biztonsági Áttekintés](#biztonsági-áttekintés)
2. [Hitelesítési Rendszerek](#hitelesítési-rendszerek)
3. [Adatvédelem](#adatvédelem)
4. [API Biztonság](#api-biztonság)
5. [Fizetési Biztonság](#fizetési-biztonság)
6. [Infrastruktúra Biztonság](#infrastruktúra-biztonság)
7. [Implementált Védelmi Rétegek](#implementált-védelmi-rétegek)
8. [További Javaslatok](#további-javaslatok)
9. [Biztonsági Checklist](#biztonsági-checklist)

---

## Biztonsági Áttekintés

### Defense in Depth (Rétegzett Védelem)

A rendszer több védelmi réteget alkalmaz:

```
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUKTÚRA RÉTEG                     │
│  • Izolált VPS • Tűzfal (UFW) • SSH kulcs auth • HTTPS     │
├─────────────────────────────────────────────────────────────┤
│                     HÁLÓZATI RÉTEG                          │
│  • Nginx reverse proxy • SSL/TLS • Security headers        │
├─────────────────────────────────────────────────────────────┤
│                   ALKALMAZÁS RÉTEG                          │
│  • CSRF védelem • Rate limiting • Input validáció          │
├─────────────────────────────────────────────────────────────┤
│                   HITELESÍTÉS RÉTEG                         │
│  • Magic link (SHA-256) • JWT (HS256) • bcrypt • NextAuth  │
├─────────────────────────────────────────────────────────────┤
│                    ADATBÁZIS RÉTEG                          │
│  • Prisma ORM (parameterezett) • Lokális MySQL • Backup    │
└─────────────────────────────────────────────────────────────┘
```

### Biztonsági Státusz Összefoglaló

| Kategória | Státusz | Megjegyzés |
|-----------|---------|------------|
| Hitelesítés | ✅ Erős | Magic link + JWT + bcrypt |
| Adatvédelem | ✅ Erős | Prisma ORM, GDPR consent |
| API védelem | ✅ Erős | CSRF, Rate limit, Validáció |
| Fizetés | ✅ Erős | Stripe webhook signature |
| Infrastruktúra | ✅ Erős | Izolált VPS, HTTPS |
| Monitoring | ⚠️ Alapszintű | Logolás van, alerting nincs |

---

## Hitelesítési Rendszerek

### 1. Magic Link (Vendég Hitelesítés)

**Fájl**: `lib/auth/magic-link.ts`

```typescript
// Algoritmus: SHA-256(email + APP_SECRET + timestamp)
const hash = crypto.createHash('sha256')
  .update(`${email}${appSecret}${timestamp}`)
  .digest('hex');
```

**Biztonsági jellemzők:**

| Tulajdonság | Érték | Leírás |
|-------------|-------|--------|
| Algoritmus | SHA-256 | Kriptográfiailag biztonságos |
| Secret hossz | Min. 64 karakter | Brute force védelem |
| Lejárat | 24 óra | Korlátozott időablak |
| Egyszer használatos | ✅ | Hash törlődik használat után |
| Timing-safe összehasonlítás | ✅ | Side-channel támadás védelem |

```typescript
// Timing-safe hash összehasonlítás
const hashMatch = crypto.timingSafeEqual(
  Buffer.from(hash, 'hex'),
  Buffer.from(guest.magic_link_hash, 'hex')
);
```

### 2. Admin/Staff Hitelesítés

**Fájl**: `lib/auth/auth-options.ts`

```typescript
// Jelszó hash: bcrypt cost=12
const isValidPassword = await bcrypt.compare(
  credentials.password,
  user.password_hash
);
```

**Biztonsági jellemzők:**

| Tulajdonság | Érték | Leírás |
|-------------|-------|--------|
| Hash algoritmus | bcrypt | Lassú hash (brute force védelem) |
| Cost factor | 12 | ~300ms hash idő |
| Session | JWT | 24 órás lejárat |
| Rate limiting | ✅ | 5 próbálkozás / 5 perc |

### 3. QR Jegy Token (Check-in)

**Fájl**: `lib/services/qr-ticket.ts`

```typescript
// JWT generálás HS256 algoritmussal
const token = jwt.sign(payload, QR_SECRET, {
  expiresIn: expiresInSeconds,
  algorithm: 'HS256',
});
```

**Biztonsági jellemzők:**

| Tulajdonság | Érték | Leírás |
|-------------|-------|--------|
| Algoritmus | HMAC-SHA256 | Aláírt token |
| Secret hossz | Min. 64 karakter | Erős titkosítás |
| Lejárat | Event nap + 24h | Időkorlátos érvényesség |
| Token tárolás | DB-ben | Összehasonlítás ellenőrzéshez |
| Duplikáció védelem | ✅ | Atomic lock mechanizmus |

```typescript
// Race condition védelem atomic update-tel
export async function tryAcquireTicketLock(registrationId: number): Promise<boolean> {
  const result = await prisma.registration.updateMany({
    where: {
      id: registrationId,
      qr_code_hash: null, // Csak ha még nincs token
    },
    data: {
      qr_code_generated_at: new Date(),
    },
  });
  return result.count > 0;
}
```

### 4. PWA Session

**Fájl**: `lib/services/pwa-auth.ts`

- JWT alapú session cookie
- Vendég azonosító + regisztráció összekapcsolás
- HttpOnly, Secure cookie beállítások

---

## Adatvédelem

### SQL Injection Védelem

**Prisma ORM** - Minden lekérdezés automatikusan parameterezett:

```typescript
// BIZTONSÁGOS - Prisma automatikusan escape-eli
const guest = await prisma.guest.findUnique({
  where: { email: userInput }  // Nem lehet SQL injection
});

// SOHA NE HASZNÁLJ raw SQL-t user inputtal!
// prisma.$queryRaw`SELECT * FROM guests WHERE email = ${userInput}` // KERÜLENDŐ
```

### XSS Védelem

- **React alapértelmezett escape**: JSX automatikusan escape-eli a változókat
- **Nincs dangerouslySetInnerHTML**: A kódbázisban nincs használva
- **Content-Type headers**: API válaszok explicit JSON type-pal

### Input Validáció (Zod)

**Fájl**: `lib/validations/guest-profile.ts`

```typescript
// Minden input Zod sémával validálva
export const guestProfileSchema = z.object({
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone format'),
  company: z.string()
    .min(1).max(255),
  // ...
});

// Magyar adószám validáció
export const billingInfoSchema = z.object({
  tax_number: z.string()
    .regex(/^[0-9]{8}-[0-9]-[0-9]{2}$/, 'Invalid tax number'),
  postal_code: z.string()
    .regex(/^[0-9]{4}$/, '4 digits required'),
});
```

### GDPR Megfelelőség

- **Explicit consent**: `gdpr_consent` és `cancellation_accepted` checkbox-ok
- **Consent tárolás**: Timestamp-pel együtt mentve az adatbázisban
- **Adat minimalizálás**: Csak szükséges adatok gyűjtése

---

## API Biztonság

### CSRF Védelem

**Fájl**: `middleware.ts`

```typescript
// Origin/Referer header ellenőrzés minden mutáló kérésnél
function validateCsrf(request: NextRequest): boolean {
  // Stripe webhooks kivétel (saját signature-rel védett)
  if (pathname === '/api/stripe/webhook') return true;

  // Origin header ellenőrzés
  if (originUrl.host === expectedHost) return true;

  // Referer fallback
  if (refererUrl.host === expectedHost) return true;

  return false;
}
```

### Rate Limiting

**Fájl**: `lib/services/rate-limit.ts`

```typescript
export const RATE_LIMITS = {
  AUTH: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000,    // 5 perc
  },
  EMAIL: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,   // 1 óra
  },
  API: {
    maxAttempts: 30,
    windowMs: 60 * 1000,        // 1 perc
  },
  MAGIC_LINK_IP: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000,   // 1 óra per IP
  },
  CANCEL: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,   // 1 óra
  },
};
```

**Jellemzők:**
- ✅ Adatbázis alapú (perzisztens, cluster-kompatibilis)
- ✅ Automatikus cleanup (1% eséllyel minden kérésnél)
- ✅ Reset sikeres művelet után

### Role-Based Access Control (RBAC)

**Fájl**: `middleware.ts`

| Route | Admin | Staff |
|-------|-------|-------|
| `/admin/guests` | ✅ | ❌ |
| `/admin/tables` | ✅ | ❌ |
| `/admin/payments` | ✅ | ❌ |
| `/admin/checkin-log` | ✅ | ✅ |
| `/checkin` | ✅ + override | ✅ |
| `/admin/help` | ✅ | ✅ |

```typescript
// Staff role korlátozás middleware-ben
if (userRole === 'staff') {
  const staffAllowedPaths = ['/admin', '/admin/checkin-log', '/admin/help'];
  if (!isAllowed) {
    return NextResponse.redirect(new URL('/checkin', request.url));
  }
}
```

---

## Fizetési Biztonság

### Stripe Webhook Signature Validáció

**Fájl**: `lib/services/payment.ts` + `app/api/stripe/webhook/route.ts`

```typescript
// Webhook signature ellenőrzés
export function constructWebhookEvent(payload: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
```

**Biztonsági jellemzők:**

| Tulajdonság | Státusz | Leírás |
|-------------|---------|--------|
| Signature validáció | ✅ | HMAC-SHA256 |
| Raw body használat | ✅ | JSON parse előtt |
| Idempotencia | ✅ | Dupla webhook kezelés |
| Error handling | ✅ | Transient vs permanent hibák |

### Fizetési Státusz Kezelés

```typescript
// Idempotens hibakezelés
const safeErrors = [
  'PAYMENT_NOT_FOUND',     // Már feldolgozva
  'ALREADY_PAID',          // Dupla webhook
  'TICKET_ALREADY_EXISTS', // Jegy már kiküldve
];
```

---

## Infrastruktúra Biztonság

### VPS Konfiguráció

| Komponens | Beállítás | Státusz |
|-----------|-----------|---------|
| **Tűzfal (UFW)** | Csak 22, 80, 443 | ✅ |
| **SSH** | Kulcs alapú, jelszó letiltva | ✅ |
| **MySQL** | Csak localhost | ✅ |
| **Nginx** | Reverse proxy, SSL | ✅ |
| **PM2** | Process manager, auto-restart | ✅ |

### Nginx Security Headers

**Fájl**: `/etc/nginx/sites-available/ceog`

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Powered-by header eltávolítása (Next.js config-ban is)
proxy_hide_header X-Powered-By;
```

### SSL/TLS Konfiguráció

- **Let's Encrypt** tanúsítvány automatikus megújítással
- **TLS 1.2+** minimum verzió
- **HSTS** header (strict-transport-security) - JAVASLAT

### Next.js Security Config

**Fájl**: `next.config.js`

```javascript
const nextConfig = {
  // Powered-by header eltávolítása
  poweredByHeader: false,

  // ETag letiltása (Nginx kezeli)
  generateEtags: false,
};
```

---

## Implementált Védelmi Rétegek

### Összefoglaló Táblázat

| Támadás Típus | Védelem | Implementáció |
|---------------|---------|---------------|
| **SQL Injection** | ✅ Védett | Prisma ORM parameterezett lekérdezések |
| **XSS** | ✅ Védett | React auto-escape, no dangerouslySetInnerHTML |
| **CSRF** | ✅ Védett | Origin/Referer header validáció middleware-ben |
| **Brute Force** | ✅ Védett | Rate limiting (DB-based) |
| **Session Hijacking** | ✅ Védett | HttpOnly cookies, JWT |
| **Timing Attack** | ✅ Védett | crypto.timingSafeEqual() |
| **Man-in-the-Middle** | ✅ Védett | HTTPS + SSL certificate |
| **Clickjacking** | ✅ Védett | X-Frame-Options: SAMEORIGIN |
| **Supply Chain** | ✅ Védett | package-lock.json, npm audit |
| **Webhook Spoofing** | ✅ Védett | Stripe signature validation |

---

## További Javaslatok

### 1. Magas Prioritású (Ajánlott)

#### 1.1 Content Security Policy (CSP) Header

**Státusz**: ❌ Nincs implementálva
**Kockázat**: Közepes
**Effort**: Alacsony

```nginx
# Nginx-ben vagy Next.js middleware-ben
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.stripe.com;
  frame-src https://js.stripe.com;
" always;
```

#### 1.2 HSTS (HTTP Strict Transport Security)

**Státusz**: ❌ Nincs implementálva
**Kockázat**: Alacsony
**Effort**: Alacsony

```nginx
# Nginx-ben
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

#### 1.3 Security Monitoring & Alerting

**Státusz**: ⚠️ Csak logolás
**Kockázat**: Közepes
**Effort**: Közepes

**Javaslat:**
- Fail2ban beállítása ismételt sikertelen bejelentkezésekre
- PM2 Plus vagy hasonló monitoring
- Email alert kritikus hibákra

```bash
# Fail2ban telepítése
sudo apt install fail2ban
# Konfiguráció: /etc/fail2ban/jail.local
```

#### 1.4 Database Backup Automatizálás

**Státusz**: ⚠️ Manuális
**Kockázat**: Magas
**Effort**: Alacsony

```bash
# Cron job napi mentéshez
0 3 * * * mysqldump -u ceog_user -p'JELSZO' ceog_production | gzip > /backups/ceog_$(date +\%Y\%m\%d).sql.gz

# 7 napnál régebbi mentések törlése
0 4 * * * find /backups -name "ceog_*.sql.gz" -mtime +7 -delete
```

### 2. Közepes Prioritású

#### 2.1 Two-Factor Authentication (2FA) Admin Accountokhoz

**Státusz**: ❌ Nincs implementálva
**Kockázat**: Közepes
**Effort**: Közepes

**Javaslat:** TOTP (Google Authenticator) integráció NextAuth-tal

#### 2.2 API Request Logging

**Státusz**: ⚠️ Részleges
**Kockázat**: Alacsony
**Effort**: Közepes

**Javaslat:** Strukturált JSON logolás minden API végpontra:
- Request timestamp
- User/Guest ID
- IP cím
- Endpoint
- Response status

#### 2.3 Dependency Vulnerability Scanning CI/CD-ben

**Státusz**: ❌ Nincs automatizálva
**Kockázat**: Közepes
**Effort**: Alacsony

```yaml
# GitHub Actions példa
- name: Security Audit
  run: npm audit --audit-level=high

- name: Dependency Check
  uses: snyk/actions/node@master
```

### 3. Alacsony Prioritású (Nice to Have)

#### 3.1 Web Application Firewall (WAF)

**Opciók:**
- Cloudflare (free tier)
- ModSecurity Nginx-hez

#### 3.2 Penetration Testing

**Javaslat:** Event előtt 2-4 héttel külső pentest

#### 3.3 Security Headers Audit

**Eszköz:** https://securityheaders.com

---

## Biztonsági Checklist

### Deployment Előtt

- [ ] `npm audit` futtatás, kritikus sérülékenységek javítása
- [ ] Next.js frissítés 14.2.35-re
- [ ] Környezeti változók ellenőrzése (min. 64 karakter secrets)
- [ ] SSL tanúsítvány érvényesség ellenőrzése
- [ ] Tűzfal szabályok ellenőrzése
- [ ] Backup működésének tesztelése

### Event Előtt (1 hét)

- [ ] Adatbázis backup készítése
- [ ] Rate limit értékek felülvizsgálata
- [ ] Check-in rendszer tesztelése
- [ ] Stripe webhook működésének ellenőrzése
- [ ] PM2 monitoring beállítása

### Event Után

- [ ] Logok átnézése anomáliákra
- [ ] Adatbázis backup készítése
- [ ] Ideiglenes adatok tisztítása (rate limit entries)
- [ ] Biztonsági jelentés készítése

---

## Kapcsolódó Dokumentumok

- [NODEJS-REACT-SECURITY-ANALYSIS-2025.md](./NODEJS-REACT-SECURITY-ANALYSIS-2025.md) - Supply chain elemzés
- [../DEPLOYMENT-GUIDE.md](../DEPLOYMENT-GUIDE.md) - Telepítési útmutató
- [../CHANGELOG.md](../CHANGELOG.md) - Változásnapló

---

## Verzió Történet

| Verzió | Dátum | Változás |
|--------|-------|----------|
| 1.0.0 | 2026-01-13 | Első verzió |
