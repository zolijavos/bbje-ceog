# CEO Gala - Telepítési Útmutató

Ez az útmutató a CEO Gala rendszer első indításához szükséges lépéseket tartalmazza.

---

## 1. Előfeltételek

A szerver már konfigurálva van az alábbi komponensekkel:
- Node.js 18+
- MySQL 8.0
- Nginx (reverse proxy)
- PM2 (process manager)

---

## 2. Admin Felhasználó Létrehozása

A rendszer első indítása után létre kell hozni egy admin felhasználót.

### Lépések:

**1. Csatlakozz a szerverhez SSH-val:**
```bash
ssh user@szerver-ip
```

**2. Lépj be a projekt mappába:**
```bash
cd /var/www/ceog
```

**3. Hozd létre az admin felhasználót:**
```bash
npx tsx scripts/create-admin.ts EMAIL JELSZO "NEV"
```

**Példa:**
```bash
npx tsx scripts/create-admin.ts admin@ceogala.hu TitkosJelszo123! "Rendszergazda"
```

### Jelszó követelmények:
- Minimum 8 karakter
- Legalább 1 nagybetű (A-Z)
- Legalább 1 kisbetű (a-z)
- Legalább 1 szám (0-9)

**4. Sikeres létrehozás után:**
```
✅ Admin user created successfully!

📋 Details:
   Email: admin@ceogala.hu
   Name:  Rendszergazda
   Role:  admin

🌐 Login at: /admin/login
```

---

## 3. Bejelentkezés az Admin Felületre

1. Nyisd meg a böngészőben: `https://ceogala.hu/admin/login`
2. Add meg az email címet és jelszót
3. Kattints a "Bejelentkezés" gombra

---

## 4. Első Lépések az Admin Felületen

### 4.1 Vendéglista Feltöltése

1. Navigálj: **Vendégek** → **Import**
2. Töltsd fel a CSV fájlt az alábbi formátumban:

```csv
email,name,guest_type
vip@example.com,Dr. Kiss János,vip
fizeto@example.com,Nagy Éva,paying_single
parban@example.com,Szabó Péter,paying_paired
```

**Guest type értékek:**
- `vip` - VIP vendég (ingyenes)
- `paying_single` - Fizető vendég (egyedül)
- `paying_paired` - Fizető vendég (párban)

### 4.2 Asztalok Létrehozása

1. Navigálj: **Asztalok** → **Új Asztal**
2. Add meg:
   - Asztal neve (pl. "VIP Asztal 1")
   - Kapacitás (férőhelyek száma)
   - Típus (VIP / Standard)

### 4.3 Magic Link Meghívók Küldése

1. Navigálj: **Vendégek**
2. Jelöld ki a vendégeket
3. Kattints: **Email küldése** → **Magic Link meghívó**

A vendégek emailben kapják meg a regisztrációs linket.

---

## 5. Hasznos Parancsok

### Jelszó Visszaállítása
```bash
cd /var/www/ceog
npx tsx scripts/reset-password.ts EMAIL UJJELSZO
```

**Példa:**
```bash
npx tsx scripts/reset-password.ts admin@ceogala.hu UjTitkosJelszo456!
```

### Alkalmazás Újraindítása
```bash
cd /var/www/ceog
pm2 restart ceog
```

### Logok Megtekintése
```bash
pm2 logs ceog --lines 100
```

### Adatbázis Frissítése (séma változás után)
```bash
cd /var/www/ceog
npx prisma db push
pm2 restart ceog
```

---

## 6. Hibaelhárítás

### "User already exists" hiba
Az email cím már foglalt. Használd a jelszó visszaállító scriptet:
```bash
npx tsx scripts/reset-password.ts EMAIL UJJELSZO
```

### Nem tudok bejelentkezni
1. Ellenőrizd az email/jelszó helyességét
2. Győződj meg róla, hogy a jelszó megfelel a követelményeknek
3. Próbáld meg újra létrehozni az admin usert vagy resetelni a jelszót

### Az oldal nem tölt be
```bash
pm2 status          # Ellenőrizd fut-e az alkalmazás
pm2 restart ceog    # Indítsd újra
pm2 logs ceog       # Nézd meg a hibákat
```

---

## 7. Támogatás

Technikai segítségért fordulj a fejlesztőhöz:
- **MyForge Labs**
- Email: support@myforgelabs.com

---

*Utolsó frissítés: 2026. január*
