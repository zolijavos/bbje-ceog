# Epic 5: Vendég Profil Bővítés

> **Státusz:** IN_PROGRESS
> **Tech Spec:** [tech-spec-guest-profile-extension.md](../tech-spec-guest-profile-extension.md)

---

## Epic Összefoglaló

Vendég adatmodell bővítése a következő funkciókkal:
- Megszólítás/előtag mező (opcionális)
- Diétás igények és ültetési preferenciák
- Strukturált számlázási információk fizetős vendégeknél
- Partner adatok kötelezővé tétele páros jegyeknél
- GDPR és lemondási feltételek rögzítése

## Üzleti Érték

- **Professzionális megjelenés**: Hivatalos megszólítás használata kommunikációban
- **Jobb vendégélmény**: Diétás igények figyelembe vétele az étkezésnél
- **Hatékonyabb ültetés**: Preferenciák alapján optimalizált asztalrend
- **Szabályos számlázás**: Strukturált adatok a számlakiállításhoz
- **GDPR megfelelés**: Dokumentált hozzájárulás az adatkezeléshez

## Story-k

| # | Story | Leírás | Státusz |
|---|-------|--------|---------|
| 5.1 | Adatmodell Bővítés | Prisma séma és migráció | DONE |
| 5.2 | Validációs Réteg | Zod sémák létrehozása | DONE |
| 5.3 | VIP Regisztráció Frissítés | Profil mezők és consent | TODO |
| 5.4 | Fizetős Regisztráció Frissítés | Számlázási űrlap + profil | TODO |

## Elfogadási Kritériumok (Epic szint)

- [ ] Guest táblában title, dietary_requirements, seating_preferences mezők
- [ ] Registration táblában GDPR és cancellation consent mezők + timestamp
- [ ] BillingInfo tábla strukturált számlázási adatokkal
- [ ] VIP regisztrációs űrlap az új mezőkkel
- [ ] Fizetős regisztrációs űrlap számlázási adatokkal
- [ ] Páros jegynél kötelező partner_name és partner_email
- [ ] Minden consent checkbox timestamp-elve

## Technikai Kontextus

- **Prisma séma**: `prisma/schema.prisma` - módosítva
- **Validáció**: `lib/validations/guest-profile.ts` - létrehozva
- **DB migráció**: `npx prisma migrate dev --name guest_profile_extension`

## Függőségek

- Epic 1 (Alap regisztráció) - KÉSZ
- Zod telepítve a projektben - KÉSZ
