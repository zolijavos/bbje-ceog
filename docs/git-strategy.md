# Git Stratégia és Útmutató

**Projekt:** CEO Gala Registration System
**Frissítve:** 2025-12-03

---

## Tartalomjegyzék

1. [Branch Stratégia](#1-branch-stratégia)
2. [Commit Konvenció](#2-commit-konvenció)
3. [Napi Workflow](#3-napi-workflow)
4. [Merge és Pull](#4-merge-és-pull)
5. [Visszaállítás (Revert/Reset)](#5-visszaállítás-revertreset)
6. [Vészhelyzet Kezelés](#6-vészhelyzet-kezelés)
7. [Hasznos Parancsok](#7-hasznos-parancsok)

---

## 1. Branch Stratégia

### GitHub Flow (Egyszerűsített)

```
main ─────●─────●─────●─────●─────●─────●─────► (stabil, deployolható)
          │           │           │
          │      feat/pwa    feat/applicant
          │           │           │
          └───────────┴───────────┘
               merge után törlés
```

### Branch Típusok

| Branch | Minta | Cél | Élettartam |
|--------|-------|-----|------------|
| `main` | - | Stabil, production-ready | Örök |
| `feat/xxx` | `feat/pwa-core` | Új funkció | 1-5 nap |
| `fix/xxx` | `fix/payment-duplicate` | Bug javítás | < 1 nap |
| `hotfix/xxx` | `hotfix/stripe-webhook` | Sürgős prod fix | Órák |
| `refactor/xxx` | `refactor/seating-logic` | Kód átszervezés | 1-2 nap |

### Branch Létrehozás

```bash
# Új feature branch
git checkout main
git pull origin main
git checkout -b feat/pwa-core

# Bug fix branch
git checkout -b fix/payment-duplicate
```

---

## 2. Commit Konvenció

### Conventional Commits Formátum

```
<típus>(<scope>): <rövid leírás>

[opcionális hosszabb leírás]

[opcionális footer]
```

### Típusok

| Típus | Mikor | Példa |
|-------|-------|-------|
| `feat` | Új funkció | `feat(pwa): add QR-based login` |
| `fix` | Bug javítás | `fix(payment): handle webhook retry` |
| `docs` | Dokumentáció | `docs: update API endpoints` |
| `style` | Formázás | `style: fix eslint warnings` |
| `refactor` | Átszervezés | `refactor(auth): extract token logic` |
| `test` | Tesztek | `test(checkin): add e2e tests` |
| `chore` | Build, config | `chore: update dependencies` |
| `perf` | Teljesítmény | `perf(api): add database indexes` |

### Scope-ok

```
pwa, auth, payment, checkin, seating, admin, api, db,
applicant, email, guest, table, registration
```

### Példák

```bash
# Egyszerű feature
git commit -m "feat(pwa): implement service worker for offline support"

# Bug fix kontextussal
git commit -m "fix(payment): prevent duplicate Stripe sessions

When user clicks pay button multiple times, only create one session.
Added loading state and disabled button during API call."

# Breaking change
git commit -m "feat(db)!: add mandatory phone field to Guest model

BREAKING CHANGE: Requires database migration.
All existing guests will have phone set to NULL until updated."

# Több változás egy commitban (ha összetartoznak)
git commit -m "feat(applicant): implement approval flow

- Add POST /api/admin/applicants/[id]/approve endpoint
- Add POST /api/admin/applicants/[id]/reject endpoint
- Send automated emails on status change
- Update admin dashboard with approval buttons"
```

---

## 3. Napi Workflow

### Reggel - Szinkronizálás

```bash
# 1. Frissítsd a main-t
git checkout main
git pull origin main

# 2. Ha van folyamatban lévő branch, rebase-eld
git checkout feat/my-feature
git rebase main
```

### Fejlesztés Közben

```bash
# Gyakori, kis commitok (2-4 óránként)
git add app/pwa/
git commit -m "feat(pwa): add manifest.json"

git add lib/services/push.ts
git commit -m "feat(pwa): implement Firebase push service"

git add tests/
git commit -m "test(pwa): add push notification tests"
```

### Nap Végén

```bash
# Push a remote-ra (backup + collaboration)
git push origin feat/my-feature

# VAGY ha WIP és nem működő állapot:
git stash save "WIP: pwa login halfway done"
```

### Feature Kész - Merge

```bash
# 1. Utolsó szinkron
git checkout main
git pull origin main
git checkout feat/my-feature
git rebase main

# 2. Push
git push origin feat/my-feature

# 3. Merge (direct vagy PR)
git checkout main
git merge feat/my-feature
git push origin main

# 4. Branch törlés
git branch -d feat/my-feature
git push origin --delete feat/my-feature
```

---

## 4. Merge és Pull

### Pull (Távoli Változások Letöltése)

```bash
# Alap pull (fetch + merge)
git pull origin main

# Pull rebase-zel (tisztább history)
git pull --rebase origin main

# Csak fetch (megnézni mi változott)
git fetch origin
git log main..origin/main  # Mi jött be?
git diff main origin/main  # Részletek
```

### Merge Típusok

#### A) Fast-Forward Merge (Egyszerű)
```bash
# Ha nincs eltérés, egyszerűen előre lép
git checkout main
git merge feat/simple-fix
```

```
main:    A → B → C
                  ↘
feature:          D → E
                      ↓
main:    A → B → C → D → E  (fast-forward)
```

#### B) Merge Commit (Külön Commit)
```bash
# Explicit merge commit létrehozása
git checkout main
git merge --no-ff feat/pwa-core -m "Merge feat/pwa-core: PWA alapok"
```

```
main:    A → B → C ─────→ M (merge commit)
                  ↘     ↗
feature:          D → E
```

#### C) Squash Merge (Egy Commitba Tömörít)
```bash
# Sok apró commit → 1 tiszta commit
git checkout main
git merge --squash feat/pwa-core
git commit -m "feat(pwa): complete PWA core implementation"
```

### Merge Konfliktus Kezelése

```bash
# 1. Merge indítása
git merge feat/other-branch

# 2. Ha konfliktus van:
# Auto-merging app/page.tsx
# CONFLICT (content): Merge conflict in app/page.tsx

# 3. Nézd meg a konfliktusokat
git status

# 4. Szerkeszd a fájlokat (keress <<<<<<< jeleket)
code app/page.tsx

# 5. Konfliktus feloldva
git add app/page.tsx
git commit -m "merge: resolve conflict in page.tsx"
```

---

## 5. Visszaállítás (Revert/Reset)

### 🟢 BIZTONSÁGOS: Utolsó Commit Visszavonása (még nem pusholtad)

```bash
# Commit visszavonása, változások MEGMARADNAK staged-ként
git reset --soft HEAD~1

# Commit visszavonása, változások MEGMARADNAK unstaged-ként
git reset HEAD~1
# vagy
git reset --mixed HEAD~1

# Commit visszavonása, változások TÖRLŐDNEK (⚠️ óvatosan!)
git reset --hard HEAD~1
```

### 🟢 BIZTONSÁGOS: Már Pusholt Commit Visszavonása

```bash
# Revert = új commit ami visszacsinálja a régit (biztonságos!)
git revert HEAD                    # Utolsó commit
git revert abc1234                 # Specifikus commit
git revert HEAD~3..HEAD            # Utolsó 3 commit

# Példa:
git revert abc1234 -m "revert: remove broken payment feature"
git push origin main
```

### 🟡 Fájl Visszaállítása Előző Állapotra

```bash
# Egy fájl visszaállítása az utolsó COMMITÁLT állapotra
git checkout -- app/page.tsx

# Egy fájl visszaállítása egy RÉGEBBI commitról
git checkout abc1234 -- app/page.tsx

# Egy fájl visszaállítása X committal ezelőttről
git checkout HEAD~3 -- app/page.tsx
```

### 🟡 Staged Változások Visszavonása

```bash
# Unstage (git add visszavonása)
git reset HEAD app/page.tsx

# VAGY újabb git verzióknál:
git restore --staged app/page.tsx
```

### 🔴 VESZÉLYES: Hard Reset (Adatvesztés!)

```bash
# ⚠️ MINDEN LOKÁLIS VÁLTOZÁS ELVESZIK!
git reset --hard HEAD           # Utolsó COMMITÁLT állapot
git reset --hard HEAD~3         # 3 committal ezelőtti állapot
git reset --hard origin/main    # Távoli main állapot
```

### Branch Visszaállítása Távoli Állapotra

```bash
# Ha elrontottad a lokális branch-et
git fetch origin
git reset --hard origin/main
```

---

## 6. Vészhelyzet Kezelés

### "Rossz Branch-re Commitoltam!"

```bash
# 1. Jegyezd fel a commit hash-t
git log -1  # pl. abc1234

# 2. Vond vissza a commitot (változások megmaradnak)
git reset --soft HEAD~1

# 3. Válts a helyes branch-re
git checkout correct-branch
# VAGY git stash → checkout → stash pop

# 4. Commitolj újra
git commit -m "feat: my feature"
```

### "Véletlenül Töröltem Valamit!"

```bash
# Git MINDENT megőriz 30 napig!
git reflog                    # Minden művelet listája
git checkout abc1234          # Visszatérés bármelyik állapotra
git branch recovery abc1234   # Mentés új branch-be
```

### "Merge Konfliktus Katasztrófa!"

```bash
# Merge megszakítása, visszaállás merge előttre
git merge --abort
```

### "Rebase Elromlott!"

```bash
# Rebase megszakítása
git rebase --abort
```

### "MINDEN Elromlott, Adjátok Vissza Tegnapi Állapotot!"

```bash
# 1. Nézd meg a reflog-ot
git reflog

# 2. Keresd meg a jó állapotot (pl. "HEAD@{5}: commit: feat...")
# 3. Reset arra az állapotra
git reset --hard HEAD@{5}
```

---

## 7. Hasznos Parancsok

### Státusz és Log

```bash
git status                      # Mi változott?
git status -s                   # Rövid verzió
git log --oneline -10           # Utolsó 10 commit
git log --oneline --graph       # Vizuális branch history
git diff                        # Unstaged változások
git diff --staged               # Staged változások
git diff HEAD~3                 # Utolsó 3 commit változásai
```

### Branch Kezelés

```bash
git branch                      # Lokális branch-ek
git branch -a                   # Összes (remote is)
git branch -d feat/old          # Branch törlés (csak ha MERGELT)
git branch -D feat/old          # Branch KÉNYSZERÍTETT törlés
git checkout -                  # Előző branch-re ugrás
```

### Stash (Ideiglenes Mentés)

```bash
git stash                       # Változások elmentése
git stash save "WIP: message"   # Névvel
git stash list                  # Stash lista
git stash pop                   # Visszaállítás + törlés
git stash apply                 # Visszaállítás (megmarad)
git stash drop                  # Stash törlése
```

### Takarítás

```bash
git clean -fd                   # Untracked fájlok törlése
git gc                          # Garbage collection
git prune                       # Elavult objektumok törlése
```

---

## 8. Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│  CEO GALA - GIT CHEAT SHEET                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BRANCH                                                         │
│    git checkout -b feat/xxx      Új branch                      │
│    git checkout main             Váltás main-re                 │
│    git branch -d feat/xxx        Branch törlés                  │
│                                                                 │
│  COMMIT                                                         │
│    git add .                     Minden staged-be               │
│    git commit -m "type: msg"     Commit                         │
│    git commit --amend            Utolsó commit módosítás        │
│                                                                 │
│  SZINKRON                                                       │
│    git pull origin main          Pull (fetch+merge)             │
│    git push origin branch        Push                           │
│    git fetch origin              Csak fetch                     │
│                                                                 │
│  MERGE                                                          │
│    git merge feat/xxx            Merge branch                   │
│    git merge --abort             Merge megszakítás              │
│                                                                 │
│  VISSZAÁLLÍTÁS                                                  │
│    git reset --soft HEAD~1       Commit vissza (staged marad)   │
│    git reset HEAD~1              Commit vissza (unstaged)       │
│    git reset --hard HEAD~1       ⚠️ Commit+változás TÖRLÉS      │
│    git revert abc1234            Biztonságos visszavonás        │
│    git checkout -- file.tsx      Fájl visszaállítás             │
│                                                                 │
│  VÉSZHELYZET                                                    │
│    git reflog                    Minden művelet listája         │
│    git reset --hard HEAD@{n}     Visszaállás reflog ponthoz     │
│    git stash                     Változások elmentése           │
│                                                                 │
│  COMMIT TÍPUSOK                                                 │
│    feat | fix | docs | test | refactor | chore | perf          │
│                                                                 │
│  SCOPE-OK                                                       │
│    pwa | auth | payment | checkin | seating | admin | api | db │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. CEO Gala Specifikus Branch-ek

### Epic 6-10 Ajánlott Branch-ek

| Branch | Epic | Commit típusok |
|--------|------|----------------|
| `feat/phone-field` | 10 | feat(db), feat(guest) |
| `feat/applicant-flow` | 7 | feat(applicant), feat(admin) |
| `feat/payment-split` | 8 | feat(payment) |
| `feat/pwa-core` | 6 | feat(pwa) |
| `feat/pwa-push` | 6 | feat(pwa), feat(push) |
| `feat/email-reminders` | 9 | feat(email) |
| `feat/pair-separation` | 10 | feat(seating) |

---

*Dokumentum vége*
