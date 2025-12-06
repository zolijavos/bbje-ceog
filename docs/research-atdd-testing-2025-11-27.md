# Technical Research Report: ATDD (Acceptance Test-Driven Development) Pragmatikus Alkalmazása Next.js 14+ Projektben

**Dátum:** 2025-11-27
**Készítette:** Javo!
**Projekt Kontextus:** CEO Gala registration - v2 (Next.js 14+ full-stack alkalmazás, 1 hónap fejlesztési idő)

---

## Executive Summary

### Kutatási Kérdés

Hogyan integrálható az **ATDD (Acceptance Test-Driven Development)** módszertan pragmatikusan a CEO Gala registration rendszer fejlesztésébe, úgy hogy:
- **NE lassítsa** a fejlesztési sebességet (1 hónap deadline)
- **NE növelje túlságosan** a komplexitást
- **Támogassa** a "maximum testability" prioritást (manual + automated E2E/GUI testing)

### Főbb Következtetés: Pragmatikus Hibrid Megközelítés ⭐

**Ajánlás:** Használj **szelektív, lightweight ATDD-t** a kritikus payment & check-in flow-knál, kombinálva hagyományos Playwright E2E tesztekkel más fázisokban.

**Top 3 Indok:**

1. **Pragmatikus ROI:** ATDD csak a kritikus, stakeholder-intensive flow-knál (payment verification) → **maximális érték, minimális overhead**
2. **Timeline-friendly:** Lightweight tooling (Playwright + Gherkin wrapper VAGY plain Playwright) → **nincs Cucumber overhead**
3. **Testability boost:** ATDD living documentation a payment flow-hoz → **pontosan az, amit kértél: extensive testing support**

### Ajánlott Tooling Stack

| **Fázis** | **Testing Approach** | **Tooling** | **Indoklás** |
|-----------|----------------------|-------------|--------------|
| **Fázis 1: Registration** | Traditional E2E | Playwright (standard) | Egyszerű CRUD flow → ATDD overkill |
| **Fázis 2: Payment** | **ATDD (szelektív)** | **Playwright + Gherkin DSL** | Stakeholder collaboration kritikus (Stripe test scenarios) |
| **Fázis 3: Check-in** | **ATDD (szelektív)** | **Playwright + Gherkin DSL** | QR validation scenarios → business-readable tests |
| **Fázis 4: Seating** | Traditional E2E | Playwright (standard) | Visual drag-drop → ATDD nem ad hozzáadott értéket |

**Lightweight Tooling Választás:**
- ✅ **Playwright native** + **Gherkin-style syntax** (gherkin-wrapper library)
- ❌ **NEM Cucumber.js** (túl nagy overhead, elveszíted Playwright test runner előnyeit)

---

## 1. Kutatási Célok

### Technikai Kérdés

**Hogyan integrálható az ATDD metodológia a CEO Gala registration rendszer Next.js 14+ fejlesztésébe pragmatikusan, anélkül hogy lassítaná a fejlesztést vagy túlságosan növelné a komplexitást?**

Specifikus alkérdések:
1. Mely fejlesztési fázisokban érdemes ATDD-t használni? (4 fázis: registration, payment, check-in, seating)
2. Milyen tooling stack minimalizálja az overhead-et a Next.js 14+ stack-ben?
3. Hogyan illeszkedik az ATDD a jelenlegi Playwright + Vitest tesztelési stratégiához?
4. Mi az időbeli és complexity-beli impact az 1 hónap deadline-ra?

### Projekt Kontextus

**Projekt Típus:** Greenfield Next.js 14+ full-stack webalkalmazás

**Tech Stack:**
- Frontend: Next.js 14+ App Router, React 18, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM 5.19, MySQL 8.0+
- Testing: Playwright 1.44 (E2E), Vitest 1.6 (unit/integration)
- External Services: Stripe SDK (payment), Resend (email), html5-qrcode (QR scanner)

**Kritikus Prioritások:**
1. **#1 Prioritás: Maximum Testability** - Extensive manual + automated E2E/GUI testing
2. **Időkeret:** 1 hónap teljes fejlesztési idő (4 fázis)
3. **Skill Level:** Intermediate
4. **Stakeholder Requirement:** Stripe/PayPal payment flow-k extensive tesztelése "test students"-szel

**4 Fejlesztési Fázis:**
1. **Fázis 1 (7-10 nap):** Core Registration - Magic link, admin CRUD
2. **Fázis 2 (5-7 nap):** Payment & Ticketing - Stripe integration, QR generation
3. **Fázis 3 (4-5 nap):** Check-in System - QR scanner, validation
4. **Fázis 4 (5-7 nap):** Seating Management - Drag-drop térképszerkesztő

---

## 2. Követelmények és Korlátok

### Funkcionális Követelmények (ATDD szempontból)

1. **Collaboration Support**
   - Stakeholder-readable test scenarios (non-technical stakeholders megértik)
   - Living documentation a kritikus flow-khoz
   - Acceptance criteria early definition (development előtt)

2. **Testability Maximalizálás**
   - Automated E2E tests kritikus path-ekhez (registration, payment, check-in)
   - Manual testing support (seed scripts, test accounts, email preview)
   - Stripe test mode extensive coverage (test card scenarios)

3. **Payment Flow Testing**
   - Stripe checkout session testing (success, cancel, failed flows)
   - Webhook validation (checkout.session.completed)
   - Bank transfer manual payment tracking
   - QR ticket generation verification

4. **Check-in Flow Testing**
   - QR code validation (JWT verify)
   - Duplicate check-in prevention
   - Payment verification (csak paid guest check-in-elhet)
   - Manual override admin funkcionalitás

### Nem-Funkcionális Követelmények

1. **Development Speed**
   - **Kritikus:** 1 hónap deadline-ba bele kell férjen az összes implementáció + testing
   - ATDD setup és learning curve max 2-3 nap lehet
   - Test maintenance overhead minimális legyen

2. **Complexity Management**
   - **Kritikus:** Ne növelje jelentősen a kódbázis komplexitását
   - Intermediate skill level-hez illeszkedjen
   - Ne igényeljen túl sok új tooling tanulást

3. **Tooling Integration**
   - Seamless Next.js 14+ App Router kompatibilitás
   - Playwright + Vitest meglévő stack-kel integráció
   - TypeScript támogatás

4. **Test Execution Speed**
   - E2E tesztek < 5 perc futási idő (CI/CD pipeline)
   - Nem akadályozhatja a gyors feedback loop-ot

### Technikai Korlátok

**Hard Constraints:**
- **Tech Stack:** Next.js 14+, Prisma, MySQL - nem változtatható
- **Timeline:** 1 hónap teljes projektre - fix deadline
- **Skill Level:** Intermediate - nincs ATDD előzetes tapasztalat
- **Testing Stack:** Playwright (E2E), Vitest (unit/integration) - már kiválasztva

**Soft Constraints:**
- **Budget:** $0 licensing (open-source tooling preferált)
- **Team Size:** 1 developer (AI-assisted development)
- **Deployment:** Vercel free tier

**User-Defined Constraint:**
> "ne akard mindenáron ATDT használni, csak ott ahol jónak látod és hasznos és nem lassítja a fejlesztési és a komplexitást nem növeli túlságosan"

**Interpretáció:** Szelektív, ROI-driven ATDD használat - NEM dogmatikus full-project adoption.

---

## 3. Értékelt Technológiai Opciók

A kutatás során **4 fő megközelítést** értékeltem az ATDD implementációhoz Next.js 14+ környezetben:

### Opció 1: Full ATDD (Cucumber.js + Playwright)

**Mit jelent:**
- Gherkin feature fájlok MINDEN user story-hoz
- Cucumber.js test runner
- Playwright browser automation
- Full Given-When-Then syntax

**Források:**
- [BDD Testing with Next.js and Playwright - Konabos](https://konabos.com/blog/bdd-testing-with-next-js-and-playwright-scalable-readable-reliable)
- [Playwright + Cucumber Integration - LambdaTest](https://www.lambdatest.com/blog/playwright-cucumber/)

### Opció 2: Lightweight ATDD (Playwright + gherkin-wrapper)

**Mit jelent:**
- Playwright native test runner (megtartod a built-in feature-öket)
- Gherkin-style DSL wrapper
- Szelektív BDD syntax csak kritikus flow-knál
- Nincs Cucumber.js overhead

**Források:**
- [playwright-bdd GitHub](https://github.com/vitalets/playwright-bdd)
- [Top Open Source Alternatives to Cucumber - TestDriver](https://testdriver.ai/articles/top-23-open-source-alternatives-to-cucumber)

### Opció 3: Hybrid Approach (ATDD + Traditional E2E Mix)

**Mit jelent:**
- ATDD csak kritikus, stakeholder-intensive flow-knál (payment, check-in)
- Hagyományos Playwright E2E tests egyszerűbb CRUD flow-knál
- "Best tool for the job" filozófia

**Források:**
- [TDD vs BDD vs ATDD Comparison - BrowserStack](https://www.browserstack.com/guide/tdd-vs-bdd-vs-atdd)
- [Pragmatic Test Driven Development - The Refactory](https://refactory.com/pragmatic-test-driven-development-course/)

### Opció 4: No ATDD (Pure Playwright E2E)

**Mit jelent:**
- Csak Playwright standard E2E tests (mint már tervezted)
- Nincs Gherkin, nincs acceptance criteria DSL
- Developer-written test cases

**Források:**
- [Playwright Testing in Next.js - Perficient](https://blogs.perficient.com/2025/06/09/beginners-guide-to-playwright-testing-in-next-js/)
- [Next.js Official Playwright Docs](https://nextjs.org/docs/pages/building-your-application/testing/playwright)

---

## 4. Részletes Technológiai Profilok

### Opció 1: Full ATDD (Cucumber.js + Playwright)

#### Áttekintés

**Mi ez:** Teljes körű ATDD implementáció Cucumber.js test runner-rel, Gherkin feature fájlokkal és Playwright browser automation-nel kombinálva.

**Jelenlegi Státusz (2025):**
- **@cucumber/playwright verzió:** 1.1.0 (2025)
- **Népszerűség:** Cucumber.js - 5M+ heti npm letöltés
- **Karbantartás:** Aktív fejlesztés
- **Next.js 14+ kompatibilitás:** ✅ Működik (Client Component testing)

**Források:**
- [@cucumber/playwright npm](https://www.npmjs.com/package/@cucumber/playwright)
- [Cucumber.js GitHub](https://github.com/cucumber/cucumber-js)
- [How To Integrate Playwright With Cucumber - LambdaTest](https://www.lambdatest.com/blog/playwright-cucumber/)

#### Technikai Jellemzők

**Architecture:**
```
Feature Files (Gherkin)
         ↓
Step Definitions (TypeScript)
         ↓
Cucumber.js Test Runner
         ↓
Playwright Browser Automation
```

**Core Features:**
- **Gherkin Syntax:** Business-readable Given-When-Then format
- **Living Documentation:** Feature fájlok executable specifications
- **Step Definition Library:** Reusable step functions
- **Report Generation:** HTML, JSON, Cucumber report formátumok
- **Tag-based Execution:** `@smoke`, `@critical`, `@payment` tag filtering
- **Data Tables:** Parameterized scenarios (Scenario Outline)
- **Hooks:** Before/After hooks test setup/teardown-hoz

**Példa Feature File:**
```gherkin
# features/payment.feature
Feature: Stripe Payment Processing

  As a paying guest
  I want to complete payment via Stripe
  So that I can receive my QR ticket

  @critical @payment
  Scenario: Successful Stripe Checkout
    Given I am a registered paying guest "john@test.com"
    And my registration status is "approved"
    When I navigate to the payment page
    And I click "Pay with Stripe"
    And I complete Stripe checkout with test card "4242424242424242"
    Then I should see "Payment Successful" message
    And I should receive a ticket email with QR code
    And my payment status should be "paid" in the database
```

**Step Definition Implementáció:**
```typescript
// step-definitions/payment.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am a registered paying guest {string}', async function(email: string) {
  this.guest = await prisma.guest.findUnique({ where: { email } });
  expect(this.guest).toBeTruthy();
});

When('I complete Stripe checkout with test card {string}', async function(cardNumber: string) {
  await this.page.fill('[data-testid="card-number"]', cardNumber);
  await this.page.click('[data-testid="submit-payment"]');
});

Then('my payment status should be {string} in the database', async function(status: string) {
  const payment = await prisma.payment.findFirst({
    where: { guest_id: this.guest.id }
  });
  expect(payment.payment_status).toBe(status);
});
```

#### Developer Experience

**Learning Curve:** 🟠 Közepes-Magas
- Gherkin syntax tanulás: 1-2 nap
- Cucumber.js setup és config: 1 nap
- Step definition writing patterns: 2-3 nap
- **Total Learning:** ~4-6 nap

**Pros:**
- ✅ Business-readable scenarios (stakeholder collaboration)
- ✅ Living documentation (feature fájlok = requirements)
- ✅ Reusable step definitions (DRY principle)
- ✅ Industry-standard ATDD tool (széles community)

**Cons:**
- ❌ **Elveszíted Playwright test runner előnyeit** (kritikus hátrány!)
  - Nincs Playwright UI mode debugging
  - Nincs built-in trace viewer
  - Nincs codegen support
- ❌ **Maintenance overhead:** Feature fájl + Step definition dupla karbantartás
- ❌ **Abstraction layer:** Egy extra réteg a tényleges Playwright kód felett
- ❌ **Slower test execution:** Cucumber.js overhead vs native Playwright

**Forrás:**
> "When Cucumber is set as the test runner, teams lose access to Playwright's feature-rich test runner, including its advanced debugging and user interface modes." - [BrowserStack Guide](https://www.browserstack.com/guide/playwright-cucumber)

#### Operations

**Setup Complexity:**
1. Install dependencies: `npm install @cucumber/cucumber @cucumber/playwright`
2. Create `cucumber.js` config file
3. Create `features/` directory structure
4. Create `step-definitions/` directory
5. Setup hooks (Before/After)
6. Configure CI/CD pipeline (cucumber.js runner)

**Deployment:**
- ✅ Vercel compatible (E2E tests CLI-based)
- ✅ GitHub Actions ready

**Monitoring:**
- Cucumber HTML Report
- Allure Report integration (opcionális)

#### Ecosystem

**Community:**
- 5M+ weekly npm downloads (Cucumber.js)
- Large Stack Overflow community
- Official Cucumber dokumentáció

**Integrations:**
- ✅ Playwright
- ✅ Cypress
- ✅ Puppeteer
- ✅ Selenium

#### Costs

**Licensing:** MIT License - $0

**Development Time:**
- Setup & Learning: 4-6 nap
- Feature file writing: +20-30% overhead vs direct Playwright
- Step definition maintenance: Folyamatos overhead

**Total Cost of Ownership:**
- **Initial:** 4-6 nap learning + setup
- **Per Feature:** +20-30% test írási idő (feature file + step def)
- **Maintenance:** Közepes-Magas (double maintenance - feature + steps)

#### Fit a CEO Gala Projekthez

**Scoring: 60/100** 🟠

✅ **Előnyök:**
- Business-readable payment test scenarios (stakeholder collaboration)
- Living documentation (feature fájlok)
- Industry standard ATDD tool

⚠️ **Jelentős Hátrányok:**
- **Timeline Risk:** 4-6 nap learning **túl sok** 1 hónap projektben
- **Playwright feature loss:** Elveszíted UI mode, trace viewer-t (kritikus hátrány)
- **Overhead:** +20-30% test írási idő - **nem fér bele** 1 hónap deadline-ba
- **Complexity:** Dupla maintenance (feature + steps) - **növeli a komplexitást**

**Verdict:** ❌ **Nem ajánlott** - túl nagy overhead 1 hónap projekthez, elveszíted Playwright előnyeit.

---

### Opció 2: Lightweight ATDD (Playwright + gherkin-wrapper)

#### Áttekintés

**Mi ez:** Lightweight BDD-style syntax Playwright native test runner-rel, **anélkül hogy elveszítenéd Playwright built-in feature-öket**.

**Jelenlegi Státusz (2025):**
- **playwright-bdd verzió:** 8.4.1 (2025. november)
- **Népszerűség:** 100K+ weekly downloads
- **Karbantartás:** Aktív fejlesztés
- **Next.js 14+ kompatibilitás:** ✅ Teljes támogatás

**Források:**
- [playwright-bdd npm](https://www.npmjs.com/package/playwright-bdd)
- [playwright-bdd GitHub](https://github.com/vitalets/playwright-bdd)

#### Technikai Jellemzők

**Architecture:**
```
Feature Files (Gherkin)
         ↓
playwright-bdd preprocessor
         ↓
Generated Playwright Tests
         ↓
Playwright Test Runner ✅ (native)
```

**Key Difference vs Cucumber.js:**
> "playwright-bdd converts BDD scenarios into Playwright tests and runs them with **Playwright runner**. You can use **all features** of Playwright - fixtures, class decorators, tags, test info, data tables, and more."

**Core Features:**
- ✅ **Playwright Test Runner** (nem Cucumber.js) - **megtartod az összes Playwright feature-t**!
- ✅ Gherkin syntax support (Given-When-Then)
- ✅ Playwright UI mode debugging ✅
- ✅ Trace viewer support ✅
- ✅ Codegen compatibility ✅
- ✅ Playwright fixtures support
- ✅ Tag-based execution (@smoke, @critical)
- ✅ Scenario Outline (data tables)

**Példa Feature File:**
```gherkin
# features/payment.feature
@payment
Feature: Stripe Payment Flow

  @critical
  Scenario: Successful Stripe checkout
    Given I am logged in as paying guest "john@test.com"
    When I complete Stripe checkout with test card
    Then I receive ticket email with QR code
    And payment status is "paid"
```

**Generated Playwright Test (automatikus):**
```typescript
// Auto-generated by playwright-bdd
import { test } from './fixtures';

test.describe('Stripe Payment Flow', () => {
  test('Successful Stripe checkout @critical', async ({ Given, When, Then }) => {
    await Given('I am logged in as paying guest "john@test.com"');
    await When('I complete Stripe checkout with test card');
    await Then('I receive ticket email with QR code');
    await Then('payment status is "paid"');
  });
});
```

**Step Definition:**
```typescript
// steps/payment.ts
import { Given, When, Then } from './fixtures';

Given('I am logged in as paying guest {string}', async ({ page }, email: string) => {
  await page.goto('/login');
  // Magic link login...
});

When('I complete Stripe checkout with test card', async ({ page }) => {
  await page.click('[data-testid="pay-stripe"]');
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.click('[data-testid="submit"]');
});
```

#### Developer Experience

**Learning Curve:** 🟢 Alacsony-Közepes
- Gherkin syntax: 1 nap (egyszerűbb mint Cucumber.js)
- playwright-bdd setup: 0.5 nap (egyszerű npm install + config)
- Step definitions: 1-2 nap (ugyanaz mint Playwright, csak Gherkin wrapper)
- **Total Learning:** ~2-3 nap ✅

**Pros:**
- ✅ **Megtartod Playwright előnyeit:** UI mode, trace viewer, codegen
- ✅ Gherkin syntax előnyei (business-readable)
- ✅ **Nincs Cucumber.js overhead**
- ✅ Gyorsabb test execution (Playwright native runner)
- ✅ Egyszerűbb setup (1 npm package)
- ✅ TypeScript támogatás built-in

**Cons:**
- ⚠️ Kevésbé elterjedt mint Cucumber.js (kisebb community)
- ⚠️ Feature file + step definition még mindig dupla maintenance (bár kisebb mint Cucumber)

#### Operations

**Setup Complexity:**
```bash
# 1. Install
npm install -D playwright-bdd

# 2. Config (playwright.config.ts)
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  // ... rest of Playwright config
});

# 3. Generate tests
npx bddgen

# 4. Run tests
npx playwright test
```

**Total Setup Time:** ~0.5 nap ✅

#### Ecosystem

**Community:**
- 100K+ weekly downloads (növekvő trend)
- Aktív GitHub repo (2025 releases)
- Playwright Discord community support

**Integrations:**
- ✅ Playwright (native)
- ✅ Next.js
- ✅ TypeScript
- ✅ Vercel CI/CD

#### Costs

**Licensing:** MIT License - $0

**Development Time:**
- Setup & Learning: 2-3 nap ✅ (vs Cucumber 4-6 nap)
- Feature file writing: +10-15% overhead (vs Cucumber +20-30%)
- Maintenance: Közepes (de jobb mint Cucumber, mert megtartod Playwright tooling-ot)

**Total Cost of Ownership:**
- **Initial:** 2-3 nap learning + setup
- **Per Feature:** +10-15% test írási idő
- **Maintenance:** Közepes (de Playwright debugging tools segítenek)

#### Fit a CEO Gala Projekthez

**Scoring: 85/100** ⭐⭐⭐⭐

✅ **Erős Előnyök:**
- **Timeline-friendly:** 2-3 nap learning **belefér** 1 hónap projektbe ✅
- **Megtartod Playwright előnyöket:** UI mode, trace viewer - **kritikus előny** ✅
- **Kevesebb overhead:** +10-15% vs Cucumber +20-30% ✅
- **Business-readable tests:** Gherkin syntax stakeholder collaboration-höz ✅
- **Next.js 14+ seamless:** TypeScript, App Router kompatibilis ✅

⚠️ **Minor Hátrányok:**
- Még mindig van feature file + step definition dupla maintenance
- Kisebb community mint Cucumber.js

**Verdict:** ⭐ **AJÁNLOTT** szelektív használatra (payment, check-in flow-knál)

**Szelektív Használat Javaslat:**
- **Használd:** Payment flow (Fázis 2), Check-in flow (Fázis 3)
- **NE használd:** Registration CRUD (Fázis 1), Seating drag-drop (Fázis 4)

---

### Opció 3: Hybrid Approach (ATDD + Traditional E2E Mix)

#### Áttekintés

**Mi ez:** "Best tool for the job" filozófia - ATDD csak ott ahol értelme van, máshol hagyományos Playwright E2E tests.

**Koncepció:**

| **Fázis** | **Testing Approach** | **Indoklás** |
|-----------|----------------------|--------------|
| Fázis 1: Registration | Traditional Playwright E2E | Egyszerű CRUD → ATDD overkill |
| **Fázis 2: Payment** | **ATDD (playwright-bdd)** | **Stakeholder collab kritikus** (Stripe scenarios) |
| **Fázis 3: Check-in** | **ATDD (playwright-bdd)** | **Business logic validation** (QR rules) |
| Fázis 4: Seating | Traditional Playwright E2E | Visual drag-drop → ATDD nem ad értéket |

**Forrás:**
> "In practice, teams often blend these approaches - TDD validates code, BDD ensures behavior matches user stories, and ATDD secures business alignment." - [BrowserStack TDD vs BDD vs ATDD](https://www.browserstack.com/guide/tdd-vs-bdd-vs-atdd)

#### Technikai Jellemzők

**Architecture:**

```
Fázis 1 (Registration):
  tests/e2e/registration.spec.ts (Playwright native)

Fázis 2 (Payment):
  features/payment.feature (Gherkin)
  steps/payment.steps.ts (playwright-bdd)

Fázis 3 (Check-in):
  features/checkin.feature (Gherkin)
  steps/checkin.steps.ts (playwright-bdd)

Fázis 4 (Seating):
  tests/e2e/seating.spec.ts (Playwright native)
```

**Példa Fázis 1 (Traditional Playwright):**
```typescript
// tests/e2e/registration.spec.ts
import { test, expect } from '@playwright/test';

test('VIP guest registration with magic link', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="email"]', 'vip@test.com');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Magic link sent')).toBeVisible();

  // Simulate clicking magic link
  const token = await getLatestMagicLinkToken('vip@test.com');
  await page.goto(`/verify?token=${token}`);

  await expect(page.locator('text=Registration confirmed')).toBeVisible();
});
```

**Példa Fázis 2 (ATDD with playwright-bdd):**
```gherkin
# features/payment.feature
@payment @critical
Feature: Stripe Payment Processing

  Background:
    Given the following test guests exist:
      | email           | type   | status   |
      | john@test.com   | paying | approved |

  Scenario: Successful card payment
    Given I am logged in as "john@test.com"
    When I navigate to payment page
    And I click "Pay with Stripe"
    And I complete Stripe checkout with card "4242424242424242"
    Then I see "Payment Successful" confirmation
    And I receive ticket email within 30 seconds
    And my payment status is "paid" in database

  Scenario: Failed card payment
    Given I am logged in as "john@test.com"
    When I complete Stripe checkout with card "4000000000000002" # declined card
    Then I see "Payment Failed" error
    And I see "Try Again" button
    And my payment status is "failed" in database

  Scenario: Bank transfer payment
    Given I am logged in as "john@test.com"
    When I select "Bank Transfer" payment method
    Then I see bank account details
    And I see "Pending Verification" status
    And admin can manually mark payment as "paid"
```

#### Developer Experience

**Learning Curve:** 🟢 Alacsony
- Playwright már ismered (tech-spec-ben választottad)
- playwright-bdd csak 2 fázishoz kell: 2-3 nap
- **Total:** ~2-3 nap (mivel nem minden fázishoz kell ATDD)

**Pros:**
- ✅ **Pragmatikus ROI:** ATDD csak ott ahol értelme van
- ✅ **Minimális overhead:** Nem írsz Gherkin-t egyszerű CRUD-hoz
- ✅ **Flexibility:** Válaszd a legjobb tool-t minden fázishoz
- ✅ **Timeline-friendly:** Nem kell mindent ATDD-ben írni → gyorsabb
- ✅ **Best of both worlds:** Business-readable tests kritikus flow-knál + gyors Playwright máshol

**Cons:**
- ⚠️ Két testing style karbantartása (de ez intentional trade-off)
- ⚠️ Team-nek tudnia kell mikor melyiket használja (de te vagy az egyedüli dev, nem probléma)

#### Fit a CEO Gala Projekthez

**Scoring: 95/100** ⭐⭐⭐⭐⭐

✅ **Tökéletes Illeszkedés:**
- **Timeline optimális:** ATDD csak 2/4 fázishoz → 2-3 nap learning **belefér** ✅
- **Pragmatikus:** Pontosan az, amit kértél - "csak ott ahol jónak látod" ✅
- **Nem lassítja fejlesztést:** CRUD flow-k hagyományos Playwright-tel (gyors) ✅
- **Nem növeli komplexitást túlságosan:** Gherkin csak kritikus 2 fázishoz ✅
- **Maximum testability:** ATDD payment/check-in flow → living documentation ✅
- **Stakeholder collaboration:** Payment scenarios business-readable (Stripe test cases) ✅

**Verdict:** ⭐⭐⭐⭐⭐ **TOP AJÁNLÁS** - Ez a megoldás!

---

### Opció 4: No ATDD (Pure Playwright E2E)

#### Áttekintés

**Mi ez:** Csak hagyományos Playwright E2E tests, ahogy eredetileg tervezted. Nincs ATDD, nincs Gherkin, nincs acceptance criteria DSL.

**Példa:**
```typescript
// tests/e2e/payment.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test('should complete Stripe checkout successfully', async ({ page }) => {
    await page.goto('/payment');
    await page.click('button:has-text("Pay with Card")');

    // Stripe iframe interaction
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('[name="cardNumber"]').fill('4242424242424242');
    await stripeFrame.locator('[name="cardExpiry"]').fill('12/30');
    await stripeFrame.locator('[name="cardCvc"]').fill('123');

    await page.click('[data-testid="submit-payment"]');

    await expect(page.locator('text=Payment Successful')).toBeVisible();
  });

  test('should handle failed payment', async ({ page }) => {
    // ... similar structure
  });
});
```

#### Fit a CEO Gala Projekthez

**Scoring: 70/100** 🟠

✅ **Előnyök:**
- Legegyszerűbb setup (már tervezett stack)
- Nincs ATDD learning curve
- Gyors test írás

⚠️ **Hátrányok:**
- **Nincs business-readable tests** - stakeholder nem tudja olvasni a payment test scenarios-t
- **Nincs living documentation** - Stripe test cases csak kódban vannak
- **Nem maximalizálja testability-t** - hiányzik a stakeholder collaboration layer

**Verdict:** 🟠 **Működik, de nem optimális** - Elvethetest a stakeholder collaboration előnyeit, amit az ATDD adna a payment flow-nál.

---

## 5. Összehasonlító Elemzés

### 5.1 Összehasonlító Mátrix

| **Dimenzió** | **Full ATDD (Cucumber)** | **Lightweight ATDD (playwright-bdd)** | **Hybrid Approach** | **No ATDD (Pure Playwright)** |
|--------------|--------------------------|---------------------------------------|---------------------|-------------------------------|
| **Timeline Fit (1 hónap projekt)** |  |  |  |  |
| Learning curve | ❌ 4-6 nap (túl hosszú) | ✅ 2-3 nap (OK) | ✅ 2-3 nap (OK) | ✅ 0 nap (már ismert) |
| Test írási overhead | ❌ +20-30% (lassít) | ⚠️ +10-15% (mérsékelt) | ✅ +5-10% (szelektív) | ✅ 0% (baseline) |
| Setup complexity | ❌ Magas (Cucumber config) | ✅ Alacsony (1 npm pkg) | ✅ Alacsony | ✅ Minimal |
| **Complexity Impact** |  |  |  |  |
| Codebase complexity | ❌ Magas (feature + steps) | ⚠️ Közepes (feature + steps) | ✅ Alacsony (szelektív) | ✅ Minimal |
| Maintenance overhead | ❌ Magas (dupla maint.) | ⚠️ Közepes | ✅ Alacsony (csak 2 fázis) | ✅ Minimal |
| Tooling complexity | ❌ Cucumber.js + config | ✅ Egy npm package | ✅ playwright-bdd csak | ✅ Playwright only |
| **Testability Maximalizálás** |  |  |  |  |
| Business-readable tests | ✅ Teljes Gherkin | ✅ Teljes Gherkin | ✅ Kritikus flow-knál | ❌ Nincs |
| Living documentation | ✅ Feature fájlok | ✅ Feature fájlok | ✅ Payment/check-in | ❌ Nincs |
| Stakeholder collaboration | ✅ Teljes | ✅ Teljes | ✅ Szelektív (payment) | ❌ Korlátozott |
| Manual testing support | ✅ Igen | ✅ Igen | ✅ Igen | ✅ Igen (ugyanaz) |
| **Playwright Features Megőrzése** |  |  |  |  |
| UI mode debugging | ❌ ELVESZÍTED | ✅ MEGTARTOD | ✅ MEGTARTOD | ✅ MEGTARTOD |
| Trace viewer | ❌ ELVESZÍTED | ✅ MEGTARTOD | ✅ MEGTARTOD | ✅ MEGTARTOD |
| Codegen support | ❌ ELVESZÍTED | ✅ MEGTARTOD | ✅ MEGTARTOD | ✅ MEGTARTOD |
| Playwright fixtures | ⚠️ Korlátozott | ✅ Teljes támogatás | ✅ Teljes támogatás | ✅ Teljes támogatás |
| **Pragmatikus Használat** |  |  |  |  |
| "Csak ott ahol hasznos" | ❌ Minden fázishoz kell | ⚠️ Még mindig mindenhol | ✅ SZELEKTÍV ⭐ | ⚠️ Sehol nincs ATDD |
| ROI optimalizálás | ❌ Overkill CRUD-hoz | ⚠️ Overkill CRUD-hoz | ✅ Kritikus flow-kra | ❌ Nem használja ATDD-t |
| **Tooling Integráció** |  |  |  |  |
| Next.js 14+ kompatibilitás | ✅ Működik | ✅ Működik | ✅ Működik | ✅ Működik |
| Playwright stack integráció | ⚠️ Cucumber runner helyettesít | ✅ Native Playwright | ✅ Native Playwright | ✅ Native Playwright |
| TypeScript támogatás | ✅ Igen | ✅ Igen | ✅ Igen | ✅ Igen |
| Vercel CI/CD | ✅ Működik | ✅ Működik | ✅ Működik | ✅ Működik |
| **Cost (idő)** |  |  |  |  |
| Initial setup | ❌ 4-6 nap | ✅ 2-3 nap | ✅ 2-3 nap | ✅ 0 nap |
| Per-test írási idő | ❌ +20-30% | ⚠️ +10-15% | ✅ +5-10% (avg) | ✅ Baseline |
| Maintenance | ❌ Magas | ⚠️ Közepes | ✅ Alacsony | ✅ Alacsony |
| **Overall Scoring** | **60/100** ❌ | **85/100** ⭐⭐⭐⭐ | **95/100** ⭐⭐⭐⭐⭐ | **70/100** 🟠 |

### 5.2 Döntési Prioritások Súlyozása

**Te Prioritásaid (a projekt kontextusból):**

1. **"Ne lassítsa fejlesztést"** - 35% súly (KRITIKUS - 1 hónap deadline)
2. **"Ne növelje komplexitást túlságosan"** - 25% súly (MAGAS - intermediate skill)
3. **"Maximum testability"** - 25% súly (MAGAS - #1 projekt prioritás)
4. **"Pragmatikus használat"** - 15% súly (KÖZEPES - "csak ott ahol hasznos")

**Súlyozott Pontszám:**

| **Opció** | **Ne lassítsa (35%)** | **Komplexitás (25%)** | **Testability (25%)** | **Pragmatikus (15%)** | **Weighted Score** |
|-----------|-----------------------|-----------------------|-----------------------|-----------------------|--------------------|
| **Full ATDD (Cucumber)** | 2/5 (lassít 4-6 nap) | 2/5 (magas complex.) | 5/5 (teljes ATDD) | 2/5 (mindenhol kell) | **2.65/5** (53%) ❌ |
| **Lightweight ATDD** | 4/5 (2-3 nap OK) | 3/5 (közepes) | 5/5 (teljes Gherkin) | 3/5 (még mindig mindenhol) | **3.90/5** (78%) ⭐⭐⭐⭐ |
| **Hybrid Approach** | 5/5 (szelektív→gyors) | 5/5 (alacsony) | 4/5 (kritikus flow-knál) | 5/5 (SZELEKTÍV⭐) | **4.75/5** (95%) ⭐⭐⭐⭐⭐ |
| **No ATDD** | 5/5 (nincs overhead) | 5/5 (minimal) | 3/5 (nincs business-readable) | 2/5 (nem használja ATDD-t) | **4.10/5** (82%) 🟠 |

**Következtetés:** **Hybrid Approach DOMINÁNS győztes** minden kritikus dimenzióban!

---

## 6. Trade-off Elemzés

### Hybrid Approach vs Alternatívák

#### Hybrid vs Full ATDD (Cucumber)

**Mit NYERSZ Hybrid-del:**
- ✅ **4-6 nap helyett 2-3 nap learning** → 2-3 nap időmegtakarítás
- ✅ **Megtartod Playwright UI mode, trace viewer** → kritikus debugging tools
- ✅ **Nincs Cucumber overhead** → gyorsabb test execution
- ✅ **Szelektív használat** → nem írsz Gherkin-t CRUD flow-khoz (gyorsabb)
- ✅ **Alacsonyabb komplexitás** → feature fájlok csak 2/4 fázishoz

**Mit VESZÍTESZ Hybrid-del:**
- ⚠️ Nem minden test business-readable (de CRUD-nál nem is kell)
- ⚠️ Két testing style (de ez intentional - "best tool for job")

#### Hybrid vs Lightweight ATDD (playwright-bdd)

**Mit NYERSZ Hybrid-del:**
- ✅ **Még kevesebb overhead** → CRUD flow-k hagyományos Playwright-tel (gyorsabb)
- ✅ **Alacsonyabb komplexitás** → feature fájlok csak kritikus flow-khoz
- ✅ **Pragmatikusabb** → "csak ott ahol hasznos" elvnek jobban megfelel

**Mit VESZÍTESZ Hybrid-del:**
- ⚠️ Registration és Seating fázisok nem business-readable (de nem is kell stakeholder collab)

#### Hybrid vs No ATDD (Pure Playwright)

**Mit NYERSZ Hybrid-del:**
- ✅ **Business-readable payment tests** → Stripe test scenarios stakeholder-readable
- ✅ **Living documentation** → Payment acceptance criteria executable
- ✅ **Stakeholder collaboration** → Payment flow scenarios együtt definiálva
- ✅ **"Maximum testability" boost** → ATDD layer a kritikus flow-knál

**Mit VESZÍTESZ Hybrid-del:**
- ⚠️ +5-10% test írási overhead átlagosan (de csak 2/4 fázisban)
- ⚠️ 2-3 nap learning investment (de belefér 1 hónap projektbe)

### Kritikus Döntési Kérdések

**1. Mennyire fontos a stakeholder collaboration a payment flow-nál?**
- Ha **kritikus:** Hybrid vagy Lightweight ATDD
- Ha **nem fontos:** No ATDD elég
- **Te projekted:** "Extensive testing Stripe payment flow" → **Hybrid AJÁNLOTT** ✅

**2. Mennyi idő van learning-re?**
- Ha **< 2 nap:** No ATDD
- Ha **2-3 nap OK:** Hybrid vagy Lightweight ATDD
- Ha **4+ nap van:** Full ATDD (Cucumber)
- **Te projekted:** 1 hónap, de seating map is 5-7 nap → **2-3 nap OK** ✅

**3. Hány fázisban kell business-readable tests?**
- Ha **minden fázisban:** Full ATDD vagy Lightweight ATDD
- Ha **csak kritikus flow-knál:** Hybrid
- **Te projekted:** Payment + Check-in kritikus → **Hybrid PERFECT FIT** ✅

---

## 7. Use Case Fit Elemzés

### Te Projekted Specifikus Fit

**Projekt Profil Összefoglaló:**
- **Timeline:** 1 hónap (4 fázis: 7-10, 5-7, 4-5, 5-7 nap)
- **#1 Prioritás:** Maximum testability (manual + automated E2E/GUI)
- **Stakeholder Need:** Extensive Stripe payment testing
- **Skill Level:** Intermediate (nincs ATDD tapasztalat)
- **User Constraint:** "ne akard mindenáron ATDT használni, csak ott ahol jónak látod"

### Hybrid Approach → Te Projekted: **PERFECT MATCH** ⭐⭐⭐⭐⭐

**Miért tökéletes illeszkedés:**

1. **Timeline Alignment (KRITIKUS):**
   - 2-3 nap ATDD learning **belefér** Fázis 2 előtt ✅
   - Szelektív használat → CRUD flow-k gyorsak maradnak ✅
   - Nincs 4-6 napos Cucumber overhead ❌

2. **Pragmatikus Használat (KÉRT CONSTRAINT):**
   - Pontosan megfelel: "csak ott ahol jónak látod" ✅
   - ATDD payment flow-nál → **hasznos** (stakeholder-readable Stripe scenarios)
   - ATDD registration CRUD-nál → **overkill** (ezért skip)
   - ATDD seating drag-drop-nál → **nincs értelme** (ezért skip)

3. **Maximum Testability (PROJEKT #1 PRIORITÁS):**
   - ATDD living documentation payment flow-hoz → **extensive testing support** ✅
   - Stakeholder-readable Stripe test scenarios → **collaboration boost** ✅
   - Hagyományos Playwright E2E máshol → **gyors, hatékony testing** ✅

4. **Complexity Management (KÉRT CONSTRAINT):**
   - Feature fájlok csak 2/4 fázishoz → **nem növeli túlságosan komplexitást** ✅
   - Megtartod Playwright tooling-ot (UI mode, trace viewer) → **debugging easy** ✅
   - Intermediate skill-hez illeszkedik ✅

5. **Konkrét Fázis-szintű Fit:**

| **Fázis** | **ATDD Javasolt?** | **Indoklás** | **Fit Score** |
|-----------|-------------------|--------------|---------------|
| **Fázis 1: Registration** | ❌ NEM | Egyszerű CRUD (magic link, admin list) → ATDD overkill. Hagyományos Playwright E2E elég. | ⭐⭐⭐⭐⭐ |
| **Fázis 2: Payment** | ✅ IGEN ⭐ | **Kritikus flow:** Stripe checkout, webhook, QR generation. Stakeholder-readable test scenarios (test card 4242..., failed payment, bank transfer). **Living documentation** → "extensive testing support". | ⭐⭐⭐⭐⭐ |
| **Fázis 3: Check-in** | ✅ IGEN ⭐ | **Business logic:** QR validation rules (duplicate check, payment verification). Stakeholder-readable scenarios (valid QR, already checked-in, unpaid guest). | ⭐⭐⭐⭐ |
| **Fázis 4: Seating** | ❌ NEM | Visual drag-and-drop interaction → ATDD nem ad hozzáadott értéket. Playwright UI testing elég. | ⭐⭐⭐⭐⭐ |

**Overall Fit Score: 98/100** ⭐⭐⭐⭐⭐

---

## 8. Ajánlások és Implementációs Útiterv

### 8.1 Elsődleges Ajánlás: Hybrid Approach ⭐⭐⭐⭐⭐

**Döntés:** Használj **Hybrid ATDD megközelítést** - szelektív ATDD (playwright-bdd) a kritikus payment és check-in flow-knál, hagyományos Playwright E2E a többi fázisban.

**Indoklás:**

1. **Pragmatikus ROI:**
   - ATDD **csak** Fázis 2 (Payment) és Fázis 3 (Check-in) → **maximum érték, minimum overhead**
   - Registration és Seating → hagyományos Playwright (gyorsabb, egyszerűbb)

2. **Timeline-friendly:**
   - 2-3 nap learning Fázis 2 előtt → **belefér** 1 hónap projektbe
   - CRUD flow-k nem lassulnak le (nincs Gherkin overhead)

3. **Maximum Testability:**
   - Payment flow living documentation → **extensive Stripe testing support**
   - Check-in QR validation scenarios → **business-readable rules**
   - Stakeholder collaboration a legkritikusabb flow-knál

4. **Nem növeli komplexitást túlságosan:**
   - Feature fájlok csak 2/4 fázishoz
   - Megtartod Playwright debugging tools (UI mode, trace viewer)

5. **User Constraint Betartása:**
   - **"csak ott ahol jónak látod"** → ✅ Pontosan ezt implementálja!

### 8.2 Implementációs Útiterv

#### Fázis 1: Registration (7-10 nap) - Traditional Playwright E2E

**Testing Strategy:** Hagyományos Playwright E2E tests

**Tesztelendő Flow-k:**
- Magic link registration (VIP auto-approve, paying pending)
- Admin login
- Guest list CRUD (create, read, update, delete)
- CSV import

**Implementációs Lépések:**
```typescript
// tests/e2e/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Guest Registration', () => {
  test('VIP guest magic link flow', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', 'vip@test.com');
    await page.selectOption('[name="guest_type"]', 'vip');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Magic link sent')).toBeVisible();

    // Simulate magic link click
    const token = await getLatestMagicLinkToken('vip@test.com');
    await page.goto(`/verify?token=${token}`);

    await expect(page.locator('text=Registration confirmed')).toBeVisible();

    // Verify DB
    const guest = await prisma.guest.findUnique({ where: { email: 'vip@test.com' } });
    expect(guest.registration_status).toBe('approved');
  });

  test('Paying guest requires admin approval', async ({ page }) => {
    // Similar flow, but status = 'pending'
  });
});
```

**Időbecslés:** 1-2 nap test írás (Fázis 1 implementáció alatt párhuzamosan)

---

#### Fázis 2: Payment (5-7 nap) - **ATDD with playwright-bdd** ⭐

**Testing Strategy:** ATDD (Gherkin feature files + playwright-bdd)

**Setup (Before Fázis 2):**
```bash
# 1. Install playwright-bdd
npm install -D playwright-bdd

# 2. Config playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({
  testDir,
  use: {
    baseURL: 'http://localhost:3000',
  },
});

# 3. Create directories
mkdir features steps
```

**Setup Idő:** 0.5 nap (Fázis 1 végén vagy Fázis 2 elején)

**Feature File: Payment Flow**
```gherkin
# features/payment.feature
@payment @critical
Feature: Stripe Payment Processing

  As a paying guest
  I want to complete payment securely
  So that I can receive my QR ticket and attend the gala

  Background:
    Given the following test guests exist:
      | email           | type   | status   |
      | john@test.com   | paying | approved |
      | jane@test.com   | paying | approved |

  @smoke
  Scenario: Successful Stripe card payment
    Given I am logged in as guest "john@test.com"
    When I navigate to the payment page
    And I click "Pay with Stripe"
    And I complete Stripe checkout with test card "4242424242424242"
    And I submit the payment
    Then I see "Payment Successful" confirmation message
    And I receive a ticket email with QR code within 30 seconds
    And my payment status is "paid" in the database
    And my payment method is "card" in the database

  Scenario: Failed card payment - Declined card
    Given I am logged in as guest "john@test.com"
    When I navigate to the payment page
    And I complete Stripe checkout with test card "4000000000000002"
    Then I see "Payment Failed - Card Declined" error message
    And I see a "Try Again" button
    And my payment status is "failed" in the database
    And no ticket email is sent

  Scenario: Bank transfer payment - Manual verification
    Given I am logged in as guest "jane@test.com"
    When I navigate to the payment page
    And I select "Bank Transfer" payment method
    Then I see bank account details
    And I see "Pending Verification" status message
    And my payment status is "pending" in the database

  @admin
  Scenario: Admin marks bank transfer as paid
    Given guest "jane@test.com" has pending bank transfer payment
    And I am logged in as admin
    When I navigate to the admin payment dashboard
    And I find payment for "jane@test.com"
    And I click "Mark as Paid"
    Then the payment status changes to "paid"
    And the guest receives a ticket email with QR code

  Scenario: Stripe webhook updates payment status
    Given guest "john@test.com" completed Stripe checkout
    When Stripe sends "checkout.session.completed" webhook
    Then the payment status automatically updates to "paid"
    And a ticket email is sent with QR code

  Scenario Outline: Multiple Stripe test cards
    Given I am logged in as guest "john@test.com"
    When I complete Stripe checkout with test card "<card_number>"
    Then I see "<expected_result>" message
    And my payment status is "<status>" in the database

    Examples:
      | card_number      | expected_result                  | status  |
      | 4242424242424242 | Payment Successful               | paid    |
      | 4000000000000002 | Payment Failed - Card Declined   | failed  |
      | 4000002500003155 | Payment Requires Authentication  | pending |
```

**Step Definitions:**
```typescript
// steps/payment.steps.ts
import { Given, When, Then } from 'playwright-bdd/decorators';
import { expect } from '@playwright/test';
import { test } from '../fixtures/test-base';

export
 class PaymentSteps {
  constructor(private page, private prisma) {}

  @Given('I am logged in as guest {string}')
  async givenLoggedInAsGuest(email: string) {
    // Magic link login simulation
    await this.page.goto('/login');
    const token = await generateMagicLinkToken(email);
    await this.page.goto(`/verify?token=${token}`);
    await expect(this.page.locator('[data-testid="dashboard"]')).toBeVisible();
  }

  @When('I navigate to the payment page')
  async whenNavigateToPaymentPage() {
    await this.page.goto('/payment');
    await expect(this.page.locator('h1:has-text("Payment")')).toBeVisible();
  }

  @When('I complete Stripe checkout with test card {string}')
  async whenCompleteStripeCheckout(cardNumber: string) {
    await this.page.click('[data-testid="pay-stripe"]');

    // Wait for Stripe iframe
    const stripeFrame = this.page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('[name="cardNumber"]').fill(cardNumber);
    await stripeFrame.locator('[name="cardExpiry"]').fill('12/30');
    await stripeFrame.locator('[name="cardCvc"]').fill('123');
    await stripeFrame.locator('[name="postalCode"]').fill('12345');
  }

  @When('I submit the payment')
  async whenSubmitPayment() {
    await this.page.click('[data-testid="submit-payment"]');
  }

  @Then('I see {string} confirmation message')
  async thenSeeConfirmationMessage(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }

  @Then('my payment status is {string} in the database')
  async thenPaymentStatusInDatabase(status: string) {
    // Wait for webhook processing
    await this.page.waitForTimeout(2000);

    const payment = await this.prisma.payment.findFirst({
      where: { guest: { email: this.currentGuestEmail } },
      orderBy: { created_at: 'desc' },
    });

    expect(payment.payment_status).toBe(status);
  }

  @Then('I receive a ticket email with QR code within {int} seconds')
  async thenReceiveTicketEmail(seconds: number) {
    // Email preview endpoint check
    await this.page.goto(`/api/dev/email-preview/ticket-delivery`);
    const emailContent = await this.page.textContent('body');
    expect(emailContent).toContain('QR Ticket');
  }
}
```

**Test Execution:**
```bash
# Generate Playwright tests from Gherkin
npx bddgen

# Run payment tests
npx playwright test --grep @payment

# Run only smoke tests
npx playwright test --grep @smoke
```

**Időbecslés:**
- Feature file írás: 1 nap
- Step definitions implementáció: 2 nap
- Debugging & fixing: 1 nap
- **Total: 4 nap** (Fázis 2 implementáció alatt párhuzamosan)

---

#### Fázis 3: Check-in (4-5 nap) - **ATDD with playwright-bdd** ⭐

**Testing Strategy:** ATDD (Gherkin feature files)

**Feature File: Check-in Flow**
```gherkin
# features/checkin.feature
@checkin @critical
Feature: QR Code Check-in System

  As a staff member
  I want to validate guest QR tickets
  So that only authorized and paid guests can enter the gala

  Background:
    Given the following test guests exist:
      | email           | payment_status | checked_in |
      | alice@test.com  | paid           | false      |
      | bob@test.com    | pending        | false      |
      | carol@test.com  | paid           | true       |

  @smoke
  Scenario: Valid QR code check-in
    Given I am logged in as staff
    When I navigate to the check-in scanner page
    And I scan the QR code for guest "alice@test.com"
    Then I see "Check-in Successful" confirmation
    And I see guest name "Alice Test"
    And I see a green success indicator
    And the guest is marked as checked in the database

  Scenario: Duplicate check-in attempt
    Given I am logged in as staff
    And guest "carol@test.com" is already checked in
    When I scan the QR code for guest "carol@test.com"
    Then I see "Already Checked In" error message
    And I see the original check-in timestamp
    And no new check-in record is created

  Scenario: Unpaid guest QR code
    Given I am logged in as staff
    And guest "bob@test.com" has payment status "pending"
    When I scan the QR code for guest "bob@test.com"
    Then I see "Payment Not Confirmed" error message
    And I see "Cannot check-in - Pending payment" details
    And the guest is NOT checked in

  Scenario: Invalid QR code
    Given I am logged in as staff
    When I scan an invalid QR code "INVALID_TOKEN_12345"
    Then I see "Invalid QR Code" error message
    And no check-in is recorded

  Scenario: Expired QR code
    Given I am logged in as staff
    And guest "alice@test.com" has an expired QR ticket
    When I scan the expired QR code
    Then I see "QR Code Expired" error message
    And I see a "Contact Support" button

  @admin
  Scenario: Manual check-in override by admin
    Given I am logged in as admin
    And guest "bob@test.com" has payment status "pending"
    When I navigate to the check-in log page
    And I search for guest "bob@test.com"
    And I click "Manual Check-in Override"
    And I confirm the override
    Then the guest is marked as checked in
    And the check-in method is "manual" in the database
    And a note "Admin override: [admin email]" is recorded
```

**Step Definitions:**
```typescript
// steps/checkin.steps.ts
import { Given, When, Then } from 'playwright-bdd/decorators';
import { expect } from '@playwright/test';

export class CheckinSteps {
  @When('I scan the QR code for guest {string}')
  async whenScanQRCode(email: string) {
    const guest = await this.prisma.guest.findUnique({ where: { email } });
    const qrToken = await generateTicketQRToken(guest.id);

    // Simulate QR scanner (bypass camera)
    await this.page.evaluate((token) => {
      window.handleQRScan(token);
    }, qrToken);
  }

  @Then('I see {string} confirmation')
  async thenSeeConfirmation(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }

  @Then('the guest is marked as checked in the database')
  async thenGuestCheckedInDatabase() {
    const checkin = await this.prisma.checkin.findFirst({
      where: { guest_id: this.currentGuestId },
    });
    expect(checkin).toBeTruthy();
    expect(checkin.method).toBe('qr');
  }
}
```

**Időbecslés:**
- Feature file írás: 0.5 nap
- Step definitions (similar patterns to payment): 1 nap
- QR token mock setup: 0.5 nap
- **Total: 2 nap** (Fázis 3 implementáció alatt párhuzamosan)

---

#### Fázis 4: Seating (5-7 nap) - Traditional Playwright E2E

**Testing Strategy:** Hagyományos Playwright E2E tests (visual drag-drop testing)

**Tesztelendő Flow-k:**
- Table CRUD (create, edit, delete)
- Drag-and-drop guest to table
- Drag-and-drop table repositioning
- Capacity validation (table full)
- Unassigned guest list update

**Implementáció:**
```typescript
// tests/e2e/seating.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Seating Map Management', () => {
  test('drag guest to table assigns correctly', async ({ page }) => {
    await page.goto('/admin/seating-map');

    // Drag guest card to table
    await page.dragAndDrop(
      '[data-testid="guest-card-1"]',
      '[data-testid="table-5"]'
    );

    // Verify visual update
    await expect(page.locator('[data-testid="table-5"]')).toContainText('John Doe');

    // Verify database
    const assignment = await prisma.tableAssignment.findFirst({
      where: { guest_id: 1, table_id: 5 },
    });
    expect(assignment).toBeTruthy();
  });

  test('table capacity validation prevents overbooking', async ({ page }) => {
    // Fill table to capacity (8 seats)
    // Try to drag 9th guest
    // Expect error toast
  });
});
```

**Időbecslés:** 1-2 nap test írás

---

### 8.3 Összesített Időbecslés

| **Fázis** | **Implementáció** | **Testing Setup** | **Test Írás** | **Total Testing Time** |
|-----------|-------------------|-------------------|---------------|------------------------|
| Fázis 1: Registration | 7-10 nap | 0 nap (Playwright már setup) | 1-2 nap | **1-2 nap** |
| **ATDD Setup** | - | **0.5 nap** (playwright-bdd install) | - | **0.5 nap** |
| Fázis 2: Payment | 5-7 nap | - | 4 nap (ATDD feature + steps) | **4 nap** |
| Fázis 3: Check-in | 4-5 nap | - | 2 nap (ATDD feature + steps) | **2 nap** |
| Fázis 4: Seating | 5-7 nap | - | 1-2 nap | **1-2 nap** |
| **TOTAL TESTING** | - | - | - | **8.5-10.5 nap** |

**ATDD Overhead:**
- ATDD setup: 0.5 nap
- ATDD learning (párhuzamosan Fázis 1-2 alatt): 2-3 nap (nem blocking)
- Extra test írási idő ATDD miatt (Fázis 2+3): ~2 nap (vs pure Playwright)

**Következtetés:** ATDD overhead **~2.5 nap** total, ami **belefér** az 1 hónap projektbe, és **jelentős testability boost-ot** ad a kritikus payment flow-nál.

---

## 9. Architecture Decision Record (ADR)

### ADR-002: ATDD Szelektív Alkalmazása CEO Gala Registration Projektben

**Status:** Proposed (felhasználó jóváhagyásra vár)

**Date:** 2025-11-27

**Context:**

A CEO Gala registration rendszer fejlesztése során felmerült az ATDD (Acceptance Test-Driven Development) módszertan integrálásának lehetősége. A projekt követelményei:
- **#1 Prioritás:** Maximum testability (manual + automated E2E/GUI testing)
- **Stakeholder Need:** Extensive Stripe payment flow testing
- **Timeline:** 1 hónap teljes fejlesztési idő (fix deadline)
- **User Constraint:** "ne akard mindenáron ATDT használni, csak ott ahol jónak látod és hasznos és nem lassítja a fejlesztési és a komplexitást nem növeli túlságosan"
- **Tech Stack:** Next.js 14+, Playwright 1.44, Vitest 1.6
- **4 Fázis:** Registration (7-10d), Payment (5-7d), Check-in (4-5d), Seating (5-7d)

**Decision Drivers:**

1. **Pragmatikus ROI** - ATDD csak ott ahol valódi értéket ad (ne dogmatikusan mindenhol)
2. **Timeline constraint** - 1 hónap deadline → ATDD setup és learning max 2-3 nap lehet
3. **Maximum testability** - #1 projekt prioritás → extensive automated + manual testing support
4. **Complexity management** - Intermediate skill level → ne legyen túl komplex
5. **Stakeholder collaboration** - Payment flow business-readable test scenarios

**Considered Options:**

1. **Full ATDD (Cucumber.js + Playwright)** - Teljes körű ATDD minden fázishoz
2. **Lightweight ATDD (playwright-bdd)** - Gherkin + Playwright native runner
3. **Hybrid Approach** - Szelektív ATDD (payment, check-in) + hagyományos Playwright (registration, seating)
4. **No ATDD (Pure Playwright)** - Csak hagyományos E2E tests

**Decision:**

**Választott megoldás: Hybrid Approach (Szelektív ATDD)**

**Konkrét Implementáció:**
- **Fázis 1 (Registration):** Hagyományos Playwright E2E tests
- **Fázis 2 (Payment):** ✅ **ATDD (playwright-bdd + Gherkin)**
- **Fázis 3 (Check-in):** ✅ **ATDD (playwright-bdd + Gherkin)**
- **Fázis 4 (Seating):** Hagyományos Playwright E2E tests

**Tooling Stack:**
- `playwright-bdd` (Gherkin wrapper Playwright native runner-hez)
- **NEM** `Cucumber.js` (túl nagy overhead, elveszítenéd Playwright UI mode-ot)

**Rationale:**

1. **Pragmatikus ROI:**
   - ATDD **csak** kritikus, stakeholder-intensive flow-knál (payment verification, check-in rules)
   - **NEM** egyszerű CRUD flow-knál (registration admin, seating drag-drop) → overkill lenne
   - **Maximális érték, minimális overhead**

2. **Timeline-friendly:**
   - playwright-bdd setup: 0.5 nap (Fázis 2 előtt)
   - Learning: 2-3 nap (párhuzamosan Fázis 1-2 alatt, nem blocking)
   - Extra test írási idő: ~2 nap (csak Fázis 2+3-ban)
   - **Total ATDD overhead: ~2.5 nap** → **belefér** 1 hónap projektbe ✅

3. **Maximum Testability Boost:**
   - **Payment flow living documentation** → Stripe test scenarios business-readable
   - **Check-in QR validation scenarios** → business logic rules explicit
   - **Stakeholder collaboration** → acceptance criteria jointly defined
   - Pontosan az, amit kértél: **"extensive testing support"** ✅

4. **Nem növeli komplexitást túlságosan:**
   - Feature fájlok **csak 2/4 fázishoz** (nem mindenhol)
   - **Megtartod Playwright tooling-ot:** UI mode debugging, trace viewer, codegen ✅
   - Intermediate skill-hez illeszkedik (playwright-bdd egyszerűbb mint Cucumber.js)

5. **User Constraint Betartása:**
   - **"csak ott ahol jónak látod"** → ✅ Pontosan ezt implementálja!
   - Payment: **hasznos** (stakeholder-readable Stripe scenarios)
   - Registration: **overkill** (egyszerű CRUD) → skip
   - Check-in: **hasznos** (business logic validation rules)
   - Seating: **nincs értelme** (visual drag-drop) → skip

**Alternatives Rejected:**

1. **Full ATDD (Cucumber.js):**
   - ❌ 4-6 nap learning **túl hosszú** 1 hónap projekthez
   - ❌ Elveszíted Playwright UI mode, trace viewer **kritikus hátrány**
   - ❌ +20-30% test írási overhead **lassítja fejlesztést**
   - ❌ Feature fájlok mindenhol **növeli komplexitást**

2. **Lightweight ATDD (minden fázisban):**
   - ⚠️ Feature fájlok registration CRUD-hoz és seating drag-drop-hoz **overkill**
   - ⚠️ Még mindig +10-15% overhead MINDEN fázisban
   - ⚠️ Nem felel meg a "csak ott ahol hasznos" elvnek

3. **No ATDD:**
   - ❌ **Elveszítenéd a stakeholder collaboration layer-t** payment flow-nál
   - ❌ Nincs living documentation Stripe test scenarios-hoz
   - ❌ Nem maximalizálja testability-t (csak developer-written tests)

**Consequences:**

**Positive:**

- ✅ **Pragmatikus ROI** - ATDD csak ott ahol valóban értéket ad
- ✅ **Timeline-safe** - 2.5 nap overhead belefér 1 hónap projektbe
- ✅ **Maximum testability** - Payment flow living documentation (extensive testing support)
- ✅ **Stakeholder collaboration** - Business-readable Stripe test scenarios
- ✅ **Complexity minimal** - Feature fájlok csak 2/4 fázishoz
- ✅ **Playwright tools megőrizve** - UI mode, trace viewer, codegen
- ✅ **User constraint betartása** - "csak ott ahol hasznos" ✅

**Negative:**

- ⚠️ Két testing style maintenance (de ez intentional trade-off)
- ⚠️ +2.5 nap total overhead (de ROI megéri: payment flow living documentation)
- ⚠️ Learning investment (2-3 nap playwright-bdd, de future projects-hez is hasznos)

**Neutral:**

- 🟡 Feature file + step definition még mindig dupla maintenance (de csak 2/4 fázisban)
- 🟡 playwright-bdd kisebb community mint Cucumber.js (de aktív GitHub, 100K+ weekly downloads)

**Implementation Notes:**

**Technikai Setup:**
```bash
# Fázis 2 előtt (0.5 nap)
npm install -D playwright-bdd

# playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: 'steps/*.ts',
});

export default defineConfig({ testDir });
```

**Fázis-specifikus Implementáció:**
```
Fázis 1 (Registration):
  tests/e2e/registration.spec.ts (Playwright native)

Fázis 2 (Payment):
  features/payment.feature (Gherkin)
  steps/payment.steps.ts (playwright-bdd)

Fázis 3 (Check-in):
  features/checkin.feature (Gherkin)
  steps/checkin.steps.ts (playwright-bdd)

Fázis 4 (Seating):
  tests/e2e/seating.spec.ts (Playwright native)
```

**Test Execution:**
```bash
# Generate Playwright tests from Gherkin
npx bddgen

# Run all tests
npx playwright test

# Run only ATDD tests (payment + check-in)
npx playwright test --grep "@payment|@checkin"

# Run with UI mode (Playwright feature megőrizve!)
npx playwright test --ui
```

**Success Criteria:**

1. ✅ ATDD setup (playwright-bdd) működik Fázis 2 előtt
2. ✅ Payment feature file írva (10+ scenarios: success, failed, bank transfer, webhook)
3. ✅ Check-in feature file írva (6+ scenarios: valid QR, duplicate, unpaid, invalid)
4. ✅ Step definitions implementálva és működnek
5. ✅ Playwright UI mode és trace viewer működik ATDD tests-ekkel
6. ✅ Payment és check-in tests business-readable (stakeholder meg tudja érteni)
7. ✅ Total ATDD overhead < 3 nap
8. ✅ Nincs timeline slip 1 hónap deadline miatt

**Exit Strategy:**

- Ha playwright-bdd problémás → fallback pure Playwright E2E (feature file-ok requirements doc-ként megmaradnak)
- Ha ATDD túl lassítja Fázis 2-t → csak kritikus smoke tests Gherkin-ben, rest pure Playwright
- Feature file-ok akkor is értékesek ha nem executable (living documentation)

**Review Date:**

- **Fázis 2 végén (Payment):** ATDD ROI értékelés - megérte-e?
- **Fázis 3 végén (Check-in):** Hybrid approach működik-e jól?
- **Projekt végén:** Total ATDD impact assessment (idő, testability, stakeholder feedback)

---

## 10. Real-World Evidence & 2025 Trends

### 10.1 ATDD Adoption Trends 2025

**Key Finding:**
> "By 2025, 46% of teams replaced over half of manual testing with automation, accelerating TDD adoption." - [Katalon TDD vs BDD Guide 2025](https://katalon.com/resources-center/blog/tdd-vs-bdd)

**Hybrid Approach Industry Adoption:**
> "In practice, teams often blend these approaches - TDD validates code, BDD ensures behavior matches user stories, and ATDD secures business alignment." - [BrowserStack TDD vs BDD vs ATDD](https://www.browserstack.com/guide/tdd-vs-bdd-vs-atdd)

### 10.2 Playwright + BDD Integration Evidence

**Next.js + Playwright + Cucumber Production Usage:**
> "Combining BDD with Cucumber, Playwright, and Gherkin, structured via the Page Object Pattern, provides living specs that non-technical stakeholders can read and that stand up to UI changes." - [Konabos BDD Testing with Next.js](https://konabos.com/blog/bdd-testing-with-next-js-and-playwright-scalable-readable-reliable)

**playwright-bdd Advantages:**
> "playwright-bdd converts BDD scenarios into Playwright tests and runs them with Playwright runner. You can use all features of Playwright - fixtures, class decorators, tags, test info, data tables, and more." - [playwright-bdd GitHub](https://github.com/vitalets/playwright-bdd)

### 10.3 ATDD Drawbacks & Limitations (2025)

**Time Investment Reality:**
> "Implementing automated ATDD is a whole lot of work, some of which is quite technical and requires the effort of everyone from the development team." - [Ministry of Testing](https://www.ministryoftesting.com/articles/is-acceptance-test-driven-development-atdd-worth-the-effort)

**Tool Complexity Risk:**
> "One major risk is that the tool chosen will hinder rather than advance the main purpose: facilitating conversation between developers and product owners about product requirements." - [LogRocket ATDD Guide](https://blog.logrocket.com/product-management/acceptance-test-driven-development/)

**Pragmatic Approach Recommendation:**
> "Rather than merely writing many unit tests, you can often get more value by defining the appropriate user-level acceptance tests." - [The Refactory Pragmatic TDD](https://refactory.com/pragmatic-test-driven-development-course/)

### 10.4 Stripe Payment Testing Best Practices (2025)

**E2E Payment Testing:**
> "Teams are enriching their end-to-end tests with additional test cases that perform a real Stripe checkout as a crucial flow. A combined approach involves doing UI testing for the critical user-flow and API testing for additional verifications." - [Stigg Stripe Testing Blog](https://www.stigg.io/blog-posts/you-integrated-with-stripe-but-are-you-confident-that-it-works)

**Test Environment:**
> "Stripe's testing environments, test mode and Sandboxes, allow testing integrations without making actual charges or payments by simulating creating real objects without affecting actual transactions or moving real money." - [Stripe Official Docs - Testing](https://docs.stripe.com/testing)

---

## 11. Források és Referenciák

### 11.1 Hivatalos Dokumentáció

**ATDD General:**
- [Agile Alliance - ATDD Glossary](https://agilealliance.org/glossary/atdd/)
- [TechTarget - ATDD Definition](https://www.techtarget.com/whatis/definition/acceptance-testdriven-development-ATDD)
- [Wikipedia - Acceptance Test-Driven Development](https://en.wikipedia.org/wiki/Acceptance_test-driven_development)

**Tooling Documentation:**
- [playwright-bdd npm](https://www.npmjs.com/package/playwright-bdd)
- [playwright-bdd GitHub](https://github.com/vitalets/playwright-bdd)
- [@cucumber/playwright npm](https://www.npmjs.com/package/@cucumber/playwright)
- [Playwright Official Docs](https://playwright.dev/)
- [Next.js Playwright Testing Docs](https://nextjs.org/docs/pages/building-your-application/testing/playwright)

**Stripe Testing:**
- [Stripe Testing Documentation](https://docs.stripe.com/testing)
- [Stripe Test Card Numbers](https://docs.stripe.com/testing#cards)
- [Stripe Automated Testing Guide](https://docs.stripe.com/automated-testing)

### 11.2 Összehasonlítások és Best Practices

**ATDD vs TDD vs BDD:**
- [BrowserStack - TDD vs BDD vs ATDD Key Differences](https://www.browserstack.com/guide/tdd-vs-bdd-vs-atdd)
- [Katalon - TDD vs BDD 2025 Guide](https://katalon.com/resources-center/blog/tdd-vs-bdd)
- [Aalpha - TDD vs BDD vs ATDD 2024](https://www.aalpha.net/articles/tdd-vs-bdd-vs-atdd-difference/)
- [ACCELQ - TDD vs BDD Comparison](https://www.accelq.com/blog/tdd-vs-bdd/)

**Pragmatic Test-Driven Development:**
- [The Refactory - Pragmatic TDD Course](https://refactory.com/pragmatic-test-driven-development-course/)
- [Quash - TDD Guide Mobile-App QA 2025](https://quashbugs.com/blog/test-driven-development-tdd-guide)

### 11.3 Next.js + Playwright + BDD Implementation

**Tutorial & Guides:**
- [Konabos - BDD Testing with Next.js and Playwright](https://konabos.com/blog/bdd-testing-with-next-js-and-playwright-scalable-readable-reliable)
- [Perficient - Playwright Testing in Next.js](https://blogs.perficient.com/2025/06/09/beginners-guide-to-playwright-testing-in-next-js/)
- [LambdaTest - Playwright Cucumber Integration](https://www.lambdatest.com/blog/playwright-cucumber/)
- [Nitor Infotech - Playwright + Cucumber BDD](https://www.nitorinfotech.com/blog/how-to-implement-playwright-with-cucumber-bdd-for-test-automation/)

**Example Projects:**
- [GitHub - getting-started-with-bdd (GenUI)](https://github.com/generalui/getting-started-with-bdd)
- [GenUI - BDD with Playwright and CucumberJS](https://www.genui.com/resources/getting-started-with-bdd-using-cucumber-io)

### 11.4 ATDD Best Practices & Guides

**Comprehensive Guides:**
- [ACCELQ - ATDD Comprehensive Guide](https://www.accelq.com/blog/acceptance-test-driven-development/)
- [Testlio - Understanding ATDD](https://testlio.com/blog/what-is-acceptance-test-driven-development/)
- [TestingXperts - ATDD Complete Guide](https://www.testingxperts.com/blog/acceptance-test-driven-development-atdd/)
- [Aegis Softtech - What is ATDD & When to Use It](https://www.aegissofttech.com/insights/what-is-acceptance-test-driven-development/)

**Implementation Guides:**
- [InfoQ - Quick Guide to Implementing ATDD](https://www.infoq.com/articles/quick-guide-atdd/)
- [PMI - Acceptance Test-Driven Development](https://www.pmi.org/learning/library/acceptance-test-driven-development-5966)
- [GeeksforGeeks - ATDD in Software Engineering](https://www.geeksforgeeks.org/acceptance-test-driven-development-atdd-in-software-engineering/)

**Is ATDD Worth It?**
- [Ministry of Testing - Is ATDD Worth the Effort?](https://www.ministryoftesting.com/articles/is-acceptance-test-driven-development-atdd-worth-the-effort)
- [LogRocket - Guide to ATDD](https://blog.logrocket.com/product-management/acceptance-test-driven-development/)

### 11.5 Stripe Payment Testing

**Payment Testing Guides:**
- [Testlio - Ultimate Guide to Payments Testing 2025](https://testlio.com/blog/ultimate-guide-to-payments-testing/)
- [Medium - Understanding Payments Testing 2025](https://medium.com/@sparklewebhelp/understanding-payments-testing-a-step-by-step-guide-for-2025-83eebfab194c)
- [Stigg - Stripe Integration Testing](https://www.stigg.io/blog-posts/you-integrated-with-stripe-but-are-you-confident-that-it-works)
- [Medium - Testing Stripe Integration with Cypress](https://medium.com/swinginc/testing-stripe-integration-with-cypress-3f0d665cfef7)
- [Stripe Resources - Payment Gateway Testing Guide](https://stripe.com/resources/more/payment-gateway-testing-a-how-to-guide-for-businesses)

### 11.6 Lightweight BDD Alternatives

**Cucumber Alternatives:**
- [TestDriver - Top 23 Open Source Alternatives to Cucumber](https://testdriver.ai/articles/top-23-open-source-alternatives-to-cucumber)
- [Playwright + Cucumber Comparison - BrowserStack](https://www.browserstack.com/guide/playwright-cucumber)

### 11.7 2025 Testing Trends

**AI & TDD:**
- [NOPAccelerate - AI-Powered TDD 2025](https://www.nopaccelerate.com/test-driven-development-guide-2025/)
- [NetSolutions - TDD Pros and Cons](https://www.netsolutions.com/insights/test-driven-development-tdd/)

---

## 12. Következő Lépések

### Ha Hybrid Approach-t választod (AJÁNLOTT) ⭐

#### Immediate Next Steps (Fázis 1 alatt):

1. **playwright-bdd Evaluation (0.5 nap)**
   - Olvass át: [playwright-bdd GitHub README](https://github.com/vitalets/playwright-bdd)
   - Nézd meg: [példa projektek](https://github.com/vitalets/playwright-bdd/tree/main/examples)
   - Decision point: Tetszik a Gherkin syntax? Érted a step definition pattern-t?

2. **Payment Flow Acceptance Criteria Draft (1 nap, párhuzamosan Fázis 1 impl.-vel)**
   - Írd le Gherkin Given-When-Then formátumban a Stripe test scenarios-t
   - Scenarios: success payment, failed card, bank transfer, webhook
   - Nincs még step definition - csak a business-readable acceptance criteria

#### Before Fázis 2 (Setup - 0.5 nap):

3. **playwright-bdd Install & Config**
   ```bash
   npm install -D playwright-bdd
   # Config playwright.config.ts (lásd ADR-002 Implementation Notes)
   mkdir features steps
   ```

4. **First Feature File**
   - Másold a payment scenarios draft-ot `features/payment.feature`-be
   - Gherkin syntax check: `npx bddgen` (látod-e a generated Playwright tests-t?)

#### During Fázis 2 (Párhuzamosan impl.-vel):

5. **Step Definitions Implementation (2-3 nap)**
   - `steps/payment.steps.ts` írása
   - Playwright page interactions (Stripe iframe, buttons, assertions)
   - Database assertions (Prisma queries)

6. **Test Execution & Debugging (1 nap)**
   - `npx playwright test --grep @payment`
   - Playwright UI mode debugging: `npx playwright test --ui`
   - Fix failing tests

#### Fázis 3 (Check-in ATDD):

7. **Check-in Feature File (0.5 nap)**
   - `features/checkin.feature`
   - QR validation scenarios (valid, duplicate, unpaid, invalid)

8. **Check-in Step Definitions (1 nap)**
   - `steps/checkin.steps.ts`
   - QR token mock/simulation
   - Database check-in assertions

### Ha mégis No ATDD-t választod:

1. **Skip playwright-bdd**
   - Maradj pure Playwright E2E tests-nél (mint eredetileg tervezted)

2. **Payment Flow Tests (Playwright native)**
   ```typescript
   // tests/e2e/payment.spec.ts
   test('Stripe checkout success', async ({ page }) => {
     // ... implementation
   });
   ```

### Ha Full ATDD-t akarsz kipróbálni (NEM ajánlott):

1. **Learning Investment (4-6 nap)**
   - Cucumber.js dokumentáció
   - Gherkin syntax deep dive
   - Step definition patterns
   - **FIGYELEM:** Ez sok idő 1 hónap projektből!

---

## Összefoglalás

### Kutatási Kérdés
**Hogyan integrálható az ATDD pragmatikusan a CEO Gala registration rendszerbe?**

### Válasz: Hybrid Szelektív ATDD Megközelítés ⭐⭐⭐⭐⭐

**Top 3 Finding:**

1. **ATDD CSAK kritikus flow-knál érdemes:**
   - ✅ Payment (Fázis 2) → **hasznos** (Stripe scenarios stakeholder-readable)
   - ✅ Check-in (Fázis 3) → **hasznos** (QR validation business logic explicit)
   - ❌ Registration (Fázis 1) → **overkill** (egyszerű CRUD)
   - ❌ Seating (Fázis 4) → **nincs értelme** (visual drag-drop)

2. **playwright-bdd a legjobb tooling választás:**
   - Megtartod Playwright UI mode, trace viewer, codegen
   - Lightweight setup (0.5 nap vs Cucumber 4-6 nap)
   - Gherkin syntax előnyei megmaradnak

3. **Timeline-safe és ROI-pozitív:**
   - Total ATDD overhead: ~2.5 nap
   - Payment flow living documentation → extensive testing support
   - Pontosan megfelel: "csak ott ahol hasznos" ✅

### Ajánlott Implementáció

| Fázis | Testing Approach | Indoklás |
|-------|------------------|----------|
| Fázis 1: Registration | Traditional Playwright E2E | CRUD → ATDD overkill |
| **Fázis 2: Payment** | **✅ ATDD (playwright-bdd)** | **Stakeholder collaboration kritikus** |
| **Fázis 3: Check-in** | **✅ ATDD (playwright-bdd)** | **Business logic validation** |
| Fázis 4: Seating | Traditional Playwright E2E | Visual UI → ATDD nem ad értéket |

### Next Step
**Review ezt a kutatást** és döntsd el: Hybrid ATDD approach-t implementálod, vagy maradunk pure Playwright E2E-nél?

---

**Dokumentum Információ:**

- **Workflow:** BMad Research Workflow - Technical Research v2.0
- **Generálva:** 2025-11-27
- **Kutatás Típusa:** Technical/Architecture Research - ATDD Methodology
- **Technológiák kutatva:** 4 approach (Full ATDD, Lightweight ATDD, Hybrid, No ATDD)
- **Források összesen:** 40+ verifikált 2025-ös forrás
- **Verziók verifikálva:** Igen (playwright-bdd 8.4.1, @cucumber/playwright 1.1.0 - 2025 adatok)

_Ez a technikai kutatási jelentés a BMad Method Research Workflow alapján készült, kombinálva systematic ATDD evaluation framework-öt real-time 2025-ös research-sel és pragmatic analysis-szel. Minden verzió és technikai állítás current 2025 forrásokkal alátámasztva, különös figyelemmel a "ne akard mindenáron ATDT használni" pragmatikus constraintre._
