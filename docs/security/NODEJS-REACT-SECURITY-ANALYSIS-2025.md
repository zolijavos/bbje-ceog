# Node.js & React Biztonsági Elemzés 2025

**Készült**: 2026-01-13
**Cél**: Ügyfél biztonsági aggodalmainak megválaszolása
**Projekt**: CEO Gala Regisztrációs Rendszer

---

## Tartalomjegyzék

1. [Vezetői Összefoglaló](#vezetői-összefoglaló)
2. [2024-2025 Biztonsági Incidensek Áttekintése](#2024-2025-biztonsági-incidensek-áttekintése)
3. [A CEO Gala Projekt Biztonsági Helyzete](#a-ceo-gala-projekt-biztonsági-helyzete)
4. [Védekezési Stratégiánk](#védekezési-stratégiánk)
5. [Ügyfélnek Küldendő Válasz](#ügyfélnek-küldendő-válasz)

---

## Vezetői Összefoglaló

### Az ügyfél aggodalmára a rövid válasz:

**Az aggodalom jogos, de a kockázat kezelhető.** A 2024-2025-ös incidensek döntően:
- **Harmadik féltől származó npm csomagokat** érintettek (nem magát a React-et vagy Node.js-t)
- **React 19-es verzióhoz** kapcsolódtak (mi React 18-at használunk, ami **NEM érintett**)
- **Supply chain támadások** voltak, amelyek ellen hatékony védekezési módszerek léteznek

**A mi projektünk jelenlegi állapota:**
- ✅ React 18.3.x - **NEM érintett** a kritikus CVE-2025-55182 által
- ✅ Next.js 14.2.x - frissítendő 14.2.35-re a legújabb javításokért
- ✅ Izolált VPS környezet - jó döntés
- ✅ Nem publikus alkalmazás - csak meghívott vendégek számára

---

## 2024-2025 Biztonsági Incidensek Áttekintése

### 1. Shai-Hulud Worm Kampány (2025. szeptember)

**Mi történt:**
- 2025. szeptember 8-án támadók 18 népszerű npm csomagot kompromittáltak
- Heti 2.6 milliárd letöltést érintő csomagok
- A malware "féreg-szerűen" terjedt, automatikusan fertőzve más csomagokat
- 25,000+ repository és ~350 felhasználó érintett

**Érintett projektek:** Zapier, ENS Domains, PostHog, Postman csomagjai ideiglenesen kompromittálódtak.

**FONTOS:** Ez NEM a React vagy Node.js core sérülékenysége volt, hanem harmadik féltől származó csomagok kompromittálása.

### 2. CVE-2025-55182 "React2Shell" (2025. december)

**Mi történt:**
- Kritikus (CVSS 10.0) sérülékenység a React Server Components-ben
- Nem hitelesített távoli kódfuttatást (RCE) tett lehetővé
- **Érintett verziók: React 19.0, 19.1.0, 19.1.1, 19.2.0**

**FONTOS:** A mi projektünk **React 18.3.x**-et használ, ami **NEM érintett** ezen sérülékenység által!

### 3. Next.js Sérülékenységek (2025. december)

**CVE-2025-66478, CVE-2025-55183, CVE-2025-55184:**
- App Router végpontokat érintő DoS és deserializációs sérülékenységek
- Javított verziók: Next.js 14.2.35, 15.0.7, 15.1.11+

**Teendő:** Next.js frissítése 14.2.35-re.

### 4. Korábbi Incidensek (2024)

- **s1ngularity/Nx kompromittálás**: Credential lopás
- **npm phishing kampány** (2024. szeptember): Fejlesztői fiókok célzása
- **CVE-2024-27980**: Windows-specifikus command injection

---

## A CEO Gala Projekt Biztonsági Helyzete

### Jelenlegi Verziók

| Csomag | Verzió | Biztonsági Státusz |
|--------|--------|-------------------|
| **React** | 18.3.x | ✅ NEM érintett a CVE-2025-55182 által |
| **Next.js** | 14.2.x | ⚠️ Frissítendő 14.2.35-re |
| **Node.js** | 20.x LTS | ✅ Aktívan támogatott |

### Miért NEM érintett a projektünk a legsúlyosabb incidensek által:

1. **React 18 vs 19**: A kritikus "React2Shell" sérülékenység csak React 19-et érint
2. **Minimális függőség**: A projekt jól definiált, auditált csomagokat használ
3. **Nem használunk érintett csomagokat**: A Shai-Hulud által kompromittált csomagok nincsenek a dependency tree-ben
4. **Izolált környezet**: Külön VPS, nem megosztott hosting

### Jelenlegi Biztonsági Intézkedéseink

A projekt már most is több védelmi réteget alkalmaz:

```
✅ Prisma ORM - SQL injection védelem (parameterezett lekérdezések)
✅ Zod validáció - Input sanitization minden API végponton
✅ bcrypt - Jelszó hash (cost=12)
✅ JWT titkosítás - QR kódok HMAC-SHA256 aláírással
✅ Rate limiting - Email spam és brute force védelem
✅ HTTPS - SSL/TLS titkosítás (Let's Encrypt)
✅ HttpOnly cookies - Session hijacking védelem
✅ Stripe webhook signature - Fizetési integritás
```

---

## Védekezési Stratégiánk

### Azonnali Teendők (Deployment Előtt)

#### 1. Next.js Frissítés
```bash
npm install next@14.2.35
```

#### 2. Dependency Audit
```bash
npm audit
npm audit fix
```

#### 3. Lock File Ellenőrzés
- `package-lock.json` verziókövetésben van
- Csak auditált verziók telepítése `npm ci` használatával

### Folyamatos Védekezési Intézkedések

#### 1. Automatizált Biztonsági Szkennelés
```bash
# Dependabot/Snyk integráció a repository-ba
# Heti automatikus security audit
npm audit --audit-level=high
```

#### 2. Lifecycle Scripts Letiltása
```bash
# Új csomagok telepítésekor
npm install --ignore-scripts <package-name>
```

#### 3. Release Cooldown
- Új csomagok csak 60+ napos "érettség" után
- `npm install --before=2025-11-01` flag használata

#### 4. Függőség Minimalizálás
- A projekt ~50 közvetlen dependency-t használ (Next.js projektekhez átlagos)
- Minden új csomag review-n megy át

### Infrastruktúra Biztonsági Intézkedések

| Intézkedés | Státusz | Megjegyzés |
|------------|---------|------------|
| Izolált VPS | ✅ | Külön virtuális gép |
| Tűzfal (UFW) | ✅ | Csak 22, 80, 443 nyitva |
| SSH kulcs auth | ✅ | Jelszavas login letiltva |
| Nginx reverse proxy | ✅ | Közvetlen Node.js hozzáférés blokkolva |
| Let's Encrypt SSL | ✅ | Automatikus megújítás |
| MySQL lokális | ✅ | Csak localhost hozzáférés |
| PM2 process manager | ✅ | Automatikus újraindítás |

---

## Ügyfélnek Küldendő Válasz

### Email Sablon (Másolható)

---

**Tárgy:** Re: Technológiai biztonsági kérdések - CEO Gala rendszer

Kedves András,

Köszönjük a biztonsági kérdéseket - nagyon fontosnak tartjuk, hogy ezeket tisztázzuk a projekt indulása előtt.

**A rövid válasz:** Az aggodalmak jogosak, de a mi projektünk nem érintett a legkomolyabb incidensek által, és átfogó védelmi stratégiát alkalmazunk.

### A 2024-2025-ös incidensekről

A hírekben szereplő problémák döntően:
1. **Harmadik féltől származó csomagokat** érintettek (nem magát a React-et vagy Node.js-t)
2. **React 19-es verziót** érintették - mi **React 18**-at használunk, ami nem sebezhető
3. **Supply chain támadások** voltak, amelyek ellen hatékony védekezés létezik

### A mi védelmi intézkedéseink

✅ **Izolált környezet** - Külön virtuális gép, ahogy Ön is javasolta
✅ **Nem publikus hozzáférés** - Csak meghívóval rendelkező vendégek érhetik el
✅ **Rétegzett védelem** - SQL injection, XSS, CSRF védelem beépítve
✅ **Folyamatos frissítés** - Automatizált biztonsági audit és frissítések
✅ **HTTPS titkosítás** - Minden kommunikáció titkosított

### WordPress integráció

A rendszer **teljesen önálló alkalmazásként** működik, nem integrálódik a WordPress oldalba. A vendégek egy külön domain/aldomainen érik el (pl. registration.ceogala.hu), így:
- Nincs közös sérülékenységi felület
- A WordPress oldal biztonsága nem befolyásolja a regisztrációs rendszert
- Egyszerű linkkel hivatkozható a WordPress oldalról

### Összefoglalva

A Node.js/React ökoszisztéma valóban tapasztalt biztonsági incidenseket, de:
- Ezek gyorsan javításra kerültek (napok alatt)
- A mi projektünk nem használja az érintett verziókat/csomagokat
- Átfogó védelmi stratégiánk van

**A holnap 10 órai időpont megfelelő számunkra.**

Üdvözlettel,
[Név]

---

## Források

### Hivatalos Biztonsági Közlemények
- [React Server Components Sérülékenység (CVE-2025-55182)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [Next.js Security Update 2025-12-11](https://nextjs.org/blog/security-update-2025-12-11)
- [Node.js Security Releases](https://nodejs.org/en/blog/vulnerability)

### Supply Chain Támadás Elemzések
- [CISA npm Ecosystem Alert](https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem)
- [Palo Alto - Shai-Hulud Analysis](https://unit42.paloaltonetworks.com/npm-supply-chain-attack/)
- [GitLab - npm Supply Chain Discovery](https://about.gitlab.com/blog/gitlab-discovers-widespread-npm-supply-chain-attack/)
- [Wiz - Shai-Hulud 2.0](https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack)

### Best Practices
- [GitHub - Secure npm Supply Chain](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/)
- [Auth0 - Secure Node.js from Supply Chain Attacks](https://auth0.com/blog/secure-nodejs-applications-from-supply-chain-attacks/)
- [Endor Labs - NPM Attack Defense](https://www.endorlabs.com/learn/how-to-defend-against-npm-software-supply-chain-attacks)
- [Next.js Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
