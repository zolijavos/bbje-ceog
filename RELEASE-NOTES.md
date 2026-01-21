# CEO Gala 2026 - Release Notes

## Verzió: 2.15.0 (2026-01-21)

Ez a kiadás tartalmazza az összes fejlesztést az első production-ready verzió óta.

---

## Főbb funkciók

### 1. Név mezők szétválasztása (firstName/lastName)
- **Adatbázis**: `name` mező → `first_name` + `last_name`
- **API**: Minden endpoint frissítve az új mezőkkel
- **Admin**: Vendég szerkesztés külön név mezőkkel
- **Regisztráció**: VIP és fizetős flow frissítve
- **Partner adatok**: Páros jegynél partner firstName/lastName

### 2. Sötét téma arany akcentusokkal
- Minden regisztrációs oldal átdolgozva
- Új színséma: `#0a0a0a` háttér, `#d1aa67` arany
- "CEO Gála" → "CEO Gala" (ékezet nélkül a konzisztencia érdekében)
- Frissített footer dizájn minden oldalon

### 3. Email sablonok v2
- Magic link sablon az ügyfél specifikáció szerint
- Vendég titulus megjelenítése az üdvözlésben
- Fire-and-forget feedback emailek (gyorsabb regisztráció)
- BBJ privacy linkek

### 4. Regisztrációs flow javítások
- Diszkrét "elutasítás" gomb (nem feltűnő)
- Frissített "Részvételi Nyilatkozat" szöveg
- 19:00 kezdés az event időpontnál
- Titulus opciók angolra váltva (Mr./Ms./Dr./Prof.)

### 5. Egyszerűsített telepítés
- Automatikus konfiguráció (`deploy/configure.sh`)
- Gyors teszt mód (`deploy/quick-setup.sh`)
- Health check endpoint és automatizált deploy
- Részletes dokumentáció (INSTALL.md, QUICKSTART.md)

### 6. Opcionális külső szolgáltatások
Az app elindul és működik alapfunkciókkal ezek nélkül is:

| Szolgáltatás | Ha nincs konfigurálva |
|--------------|----------------------|
| **SMTP** | Email küldés nem működik (magic link, jegy) |
| **Stripe** | Kártyás fizetés nem elérhető |

---

## Telepítés

### Gyors teszt
```bash
git clone git@github.com:zolijavos/bbje-ceog.git /var/www/ceog
cd /var/www/ceog
npm install
bash deploy/quick-setup.sh --db-url "mysql://user:pass@localhost:3306/ceog"
npx prisma db push
npm run build
pm2 start ecosystem.config.js
```

### Production
```bash
bash deploy/configure.sh  # Interaktív - végigvezet minden beállításon
bash deploy/start.sh      # Build + indítás
```

---

## Környezeti változók

### Kötelező
```env
DATABASE_URL="mysql://user:pass@localhost:3306/ceog"
APP_SECRET="min. 64 karakter random string"
QR_SECRET="min. 64 karakter random string"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="min. 64 karakter random string"
```

### Opcionális (később beállítható)
```env
# Stripe - kártyás fizetéshez
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SMTP - email küldéshez
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@..."
SMTP_PASS="..."
SMTP_FROM="noreply@yourdomain.com"
```

---

## Commit történet (legfontosabbak)

| Commit | Változás |
|--------|----------|
| `56acf51` | firstName/lastName refaktor - adatbázis és API |
| `c3d7f5b` | Sötét téma regisztrációs oldalakhoz |
| `bc3c438` | Magic link email sablon v2 |
| `2e93058` | Partner firstName/lastName + diszkrét decline |
| `051cb69` | Részvételi Nyilatkozat szöveg frissítés |
| `43084da` | Event idő 19:00-ra, egyszerűsített szöveg |
| `5108507` | Automatizált deploy health check-kel |
| `8c6d4d6` | SMTP opcionális |
| `a721dc2` | Stripe opcionális |
| `00ae791` | Deploy scriptek javítása |

---

## Tesztelés

### Health check
```bash
curl http://localhost:3000/api/health
# {"status":"healthy","timestamp":"...","database":"connected"}
```

### Admin belépés (seed adatokkal)
- **Admin**: admin@ceogala.test / Admin123!
- **Staff**: staff@ceogala.test / Staff123!

---

## Támogatás

- **Dokumentáció**: `docs/INSTALL.md`, `docs/QUICKSTART.md`
- **Fejlesztő**: Javos Zoltán
- **Repó**: https://github.com/zolijavos/bbje-ceog

---

*Utolsó frissítés: 2026-01-21*
