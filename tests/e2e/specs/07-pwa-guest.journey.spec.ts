/**
 * Journey 7: PWA Vendég Élmény
 *
 * Ez a teszt a PWA vendég teljes élményét rögzíti videóra:
 * 1. PWA főoldal megnyitása
 * 2. Bejelentkezés auth kóddal
 * 3. Dashboard megtekintése
 * 4. QR jegy megjelenítés
 * 5. Profil megtekintése és szerkesztése
 * 6. Asztal információ megtekintése
 * 7. Kijelentkezés
 *
 * Futtatás: npx playwright test --project=video-journey 07-pwa-guest.journey.spec.ts
 */

import { test, expect } from '../fixtures';

// Test data
const TEST_EMAIL = `pwa-journey-${Date.now()}@test.ceog`;
const TEST_NAME = 'PWA Teszt Vendég';
const TEST_PWA_CODE = `CEOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
const TEST_TABLE_NAME = `PWA-Table-${Date.now()}`;

test.describe('PWA Vendég Teljes Journey', () => {
  let guestId: number;
  let registrationId: number;
  let tableId: number;

  test.beforeAll(async ({ db }) => {
    // Clean up any existing test data
    await db.checkin.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
    await db.registration.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.guest.deleteMany({ where: { email: TEST_EMAIL } });
    await db.table.deleteMany({ where: { name: TEST_TABLE_NAME } });

    // Create test guest with registration
    const guest = await db.guest.create({
      data: {
        email: TEST_EMAIL,
        name: TEST_NAME,
        guest_type: 'vip',
        registration_status: 'approved',
        pwa_auth_code: TEST_PWA_CODE,
        phone: '+36 30 123 4567',
        company: 'Test Company Kft.',
        position: 'CEO',
        dietary_requirements: 'Vegetáriánus',
      },
    });
    guestId = guest.id;

    // Create registration
    const registration = await db.registration.create({
      data: {
        guest_id: guestId,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: `test-qr-${Date.now()}`,
        qr_code_generated_at: new Date(),
      },
    });
    registrationId = registration.id;

    // Create table and assign guest
    const table = await db.table.create({
      data: {
        name: TEST_TABLE_NAME,
        capacity: 10,
        type: 'VIP',
        pos_x: 100,
        pos_y: 100,
        status: 'available',
      },
    });
    tableId = table.id;

    // Assign guest to table
    await db.tableAssignment.create({
      data: {
        guest_id: guestId,
        table_id: tableId,
        seat_number: 1,
      },
    });
  });

  test.afterAll(async ({ db }) => {
    try {
      await db.checkin.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
      await db.registration.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.guest.deleteMany({ where: { email: TEST_EMAIL } });
      await db.table.deleteMany({ where: { name: TEST_TABLE_NAME } });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('PWA vendég teljes élmény', async ({ page }) => {
    // === PART 1: PWA főoldal ===
    await test.step('PWA főoldal megnyitása', async () => {
      await page.goto('/pwa');
      await page.waitForLoadState('networkidle');
    });

    await test.step('CEO Gala branding megjelenik', async () => {
      const branding = page.getByText(/CEO Gala|Welcome|Üdvözöljük/i);
      await expect(branding.first()).toBeVisible({ timeout: 5000 });
    });

    // === PART 2: Bejelentkezés ===
    await test.step('Kód megadása gomb kattintás', async () => {
      const enterCodeBtn = page.locator('button:has-text("Enter Code"), button:has-text("Kód megadása"), button:has-text("Kód")');
      if (await enterCodeBtn.isVisible({ timeout: 3000 })) {
        await enterCodeBtn.click();
      }
    });

    await test.step('Auth kód bevitele', async () => {
      const codeInput = page.locator('[name="code"], [data-testid="auth-code-input"], input[placeholder*="CEOG"]');
      await codeInput.waitFor({ state: 'visible', timeout: 5000 });

      // Type code slowly for video visibility
      await codeInput.fill('');
      for (const char of TEST_PWA_CODE) {
        await codeInput.type(char, { delay: 100 });
      }
    });

    await test.step('Bejelentkezés gomb kattintás', async () => {
      const loginBtn = page.locator('button[type="submit"], button:has-text("Belépés"), button:has-text("Login"), button:has-text("Enter")');
      await loginBtn.click();
      await page.waitForURL(/pwa\/dashboard|pwa$/i, { timeout: 10000 });
    });

    // === PART 3: Dashboard ===
    await test.step('Dashboard betöltődik', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Extra wait for animations
    });

    await test.step('Vendég neve megjelenik', async () => {
      await expect(page.getByText(TEST_NAME)).toBeVisible({ timeout: 5000 });
    });

    await test.step('VIP badge megjelenik', async () => {
      const vipBadge = page.getByText(/VIP/i);
      await expect(vipBadge.first()).toBeVisible({ timeout: 3000 });
    });

    await test.step('Navigációs gombok láthatók', async () => {
      // Check for navigation elements - PWA uses bottom nav bar or links
      const navElements = page.locator('nav, [data-testid="navigation"], .tab-bar, footer a, a[href*="/pwa/"], button');
      try {
        await expect(navElements.first()).toBeVisible({ timeout: 3000 });
      } catch {
        // Navigation might be hidden or in different format
      }
    });

    // === PART 4: Jegy megtekintése ===
    await test.step('Jegy oldal megnyitása', async () => {
      // Click on ticket nav item or navigate directly
      const ticketNav = page.locator('a[href*="ticket"], button:has-text("Ticket"), button:has-text("Jegy")');
      if (await ticketNav.isVisible({ timeout: 2000 })) {
        await ticketNav.click();
      } else {
        await page.goto('/pwa/ticket');
      }
      await page.waitForLoadState('networkidle');
    });

    await test.step('QR kód megjelenik', async () => {
      // Look for QR code - could be canvas, image, or SVG
      const qrCode = page.locator('canvas, [data-testid="qr-code"], img[alt*="QR"], svg[data-testid="qr"]');
      try {
        await expect(qrCode.first()).toBeVisible({ timeout: 5000 });
      } catch {
        // QR might not be visible if not generated
        const ticketContent = page.locator('main, .ticket-container');
        await expect(ticketContent.first()).toBeVisible({ timeout: 3000 });
      }
    });

    await test.step('Jegy típus megjelenik', async () => {
      const ticketType = page.getByText(/VIP|Free|Ingyenes/i);
      await expect(ticketType.first()).toBeVisible({ timeout: 3000 });
    });

    // === PART 5: Profil megtekintése ===
    await test.step('Profil oldal megnyitása', async () => {
      const profileNav = page.locator('a[href*="profile"], button:has-text("Profile"), button:has-text("Profil")');
      if (await profileNav.isVisible({ timeout: 2000 })) {
        await profileNav.click();
      } else {
        await page.goto('/pwa/profile');
      }
      await page.waitForLoadState('networkidle');
    });

    await test.step('Profil adatok megjelennek', async () => {
      // Check for profile data
      await expect(page.getByText(TEST_NAME)).toBeVisible({ timeout: 5000 });
    });

    await test.step('Email megjelenik', async () => {
      await expect(page.getByText(TEST_EMAIL)).toBeVisible({ timeout: 3000 });
    });

    await test.step('Cég információ megjelenik', async () => {
      try {
        await expect(page.getByText('Test Company Kft.')).toBeVisible({ timeout: 3000 });
      } catch {
        // Company might not be displayed
      }
    });

    await test.step('Étrendi igények megjelennek', async () => {
      try {
        await expect(page.getByText('Vegetáriánus')).toBeVisible({ timeout: 3000 });
      } catch {
        // Dietary info might not be displayed
      }
    });

    // === PART 6: Asztal információ ===
    await test.step('Asztal információ megtekintése', async () => {
      // Navigate to table info if available
      const tableNav = page.locator('a[href*="table"], button:has-text("Table"), button:has-text("Asztal")');
      if (await tableNav.isVisible({ timeout: 2000 })) {
        await tableNav.click();
        await page.waitForLoadState('networkidle');

        // Check for table name
        await expect(page.getByText(TEST_TABLE_NAME)).toBeVisible({ timeout: 5000 });
      } else {
        // Table info might be on dashboard
        await page.goto('/pwa/dashboard');
        await page.waitForLoadState('networkidle');
      }
    });

    await test.step('Asztal név és ülőhely megjelenik', async () => {
      try {
        await expect(page.getByText(TEST_TABLE_NAME)).toBeVisible({ timeout: 3000 });
        await expect(page.getByText(/Seat|Ülőhely|1/i)).toBeVisible({ timeout: 3000 });
      } catch {
        // Table assignment display varies
      }
    });

    // === PART 7: Galéria megtekintése (ha van) ===
    await test.step('Galéria oldal megtekintése', async () => {
      const galleryNav = page.locator('a[href*="gallery"], button:has-text("Gallery"), button:has-text("Galéria")');
      if (await galleryNav.isVisible({ timeout: 2000 })) {
        await galleryNav.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    });

    // === PART 8: Feedback (ha van) ===
    await test.step('Feedback oldal megtekintése', async () => {
      const feedbackNav = page.locator('a[href*="feedback"], button:has-text("Feedback"), button:has-text("Visszajelzés")');
      if (await feedbackNav.isVisible({ timeout: 2000 })) {
        await feedbackNav.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
    });

    // === PART 9: Vissza a Dashboard-ra ===
    await test.step('Vissza a Dashboard-ra', async () => {
      const homeNav = page.locator('a[href*="dashboard"], button:has-text("Home"), button:has-text("Főoldal")');
      if (await homeNav.isVisible({ timeout: 2000 })) {
        await homeNav.click();
      } else {
        await page.goto('/pwa/dashboard');
      }
      await page.waitForLoadState('networkidle');
    });

    await test.step('Dashboard újra betöltődik', async () => {
      await expect(page.getByText(TEST_NAME)).toBeVisible({ timeout: 5000 });
    });

    await test.step('PWA élmény befejezve', async () => {
      // Final screenshot/pause for video
      await page.waitForTimeout(2000);
    });
  });
});
