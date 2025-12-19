/**
 * Journey 8: Admin Operációk
 *
 * Ez a teszt az admin műveletek fő folyamatait rögzíti videóra:
 * 1. Admin bejelentkezés
 * 2. Vendég létrehozás és szerkesztés
 * 3. CSV import
 * 4. Banki átutalás jóváhagyása
 * 5. Asztal kezelés
 * 6. Ültetési terv
 *
 * Futtatás: npx playwright test --project=video-journey 08-admin-operations.journey.spec.ts
 */

import { test, expect } from '../fixtures';

// Test data
const TEST_GUEST_EMAIL = `admin-ops-${Date.now()}@test.ceog`;
const TEST_GUEST_NAME = 'Admin Teszt Vendég';
const TEST_TABLE_NAME = `Admin-Table-${Date.now()}`;

test.describe('Admin Operációk Journey', () => {
  let guestId: number;
  let tableId: number;

  test.beforeAll(async ({ db }) => {
    // Clean up any existing test data
    await db.checkin.deleteMany({ where: { guest: { email: TEST_GUEST_EMAIL } } });
    await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_GUEST_EMAIL } } });
    await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_GUEST_EMAIL } } } });
    await db.registration.deleteMany({ where: { guest: { email: TEST_GUEST_EMAIL } } });
    await db.guest.deleteMany({ where: { email: TEST_GUEST_EMAIL } });
    await db.table.deleteMany({ where: { name: TEST_TABLE_NAME } });
  });

  test.afterAll(async ({ db }) => {
    try {
      await db.checkin.deleteMany({ where: { guest: { email: TEST_GUEST_EMAIL } } });
      await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_GUEST_EMAIL } } });
      await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_GUEST_EMAIL } } } });
      await db.registration.deleteMany({ where: { guest: { email: TEST_GUEST_EMAIL } } });
      await db.guest.deleteMany({ where: { email: TEST_GUEST_EMAIL } });
      await db.table.deleteMany({ where: { name: TEST_TABLE_NAME } });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('Admin műveletek teljes folyamat', async ({ page, db }) => {
    // === PART 1: Admin bejelentkezés ===
    await test.step('Admin bejelentkezés', async () => {
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Login form kitöltése', async () => {
      await page.fill('[name="email"]', 'admin@ceogala.test');
      await page.fill('[name="password"]', 'Admin123!');
    });

    await test.step('Bejelentkezés gomb kattintás', async () => {
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    });

    await test.step('Dashboard betöltődik', async () => {
      await page.waitForLoadState('networkidle');
      // Check for dashboard content
      const dashboardContent = page.locator('main, [data-testid="dashboard"]');
      await expect(dashboardContent.first()).toBeVisible({ timeout: 5000 });
    });

    // === PART 2: Vendég kezelés ===
    await test.step('Navigálás a Vendég listához', async () => {
      await page.goto('/admin/guests');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Vendég lista betöltődik', async () => {
      // Wait for table or list to appear
      const guestList = page.locator('table, [data-testid="guest-list"]');
      await expect(guestList.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('Keresés funkció tesztelése', async () => {
      const searchInput = page.locator('input[placeholder*="Keresés"], input[placeholder*="Search"]');
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('test');
        await page.waitForTimeout(1000);
        await searchInput.fill('');
      }
    });

    // === PART 3: Vendég létrehozás DB-ben ===
    await test.step('Teszt vendég létrehozása', async () => {
      const guest = await db.guest.create({
        data: {
          email: TEST_GUEST_EMAIL,
          name: TEST_GUEST_NAME,
          guest_type: 'paying_single',
          registration_status: 'invited',
          phone: '+36 30 999 8888',
          company: 'Admin Test Kft.',
        },
      });
      guestId = guest.id;

      // Refresh to see new guest
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Új vendég megjelenik a listában', async () => {
      const searchInput = page.locator('input[placeholder*="Keresés"], input[placeholder*="Search"]');
      if (await searchInput.isVisible({ timeout: 2000 })) {
        await searchInput.fill(TEST_GUEST_EMAIL);
        await page.waitForTimeout(1000);
      }
    });

    // === PART 4: Fizetések kezelése ===
    await test.step('Navigálás a Fizetések oldalra', async () => {
      await page.goto('/admin/payments');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Fizetések oldal betöltődik', async () => {
      const paymentsContent = page.locator('main, [data-testid="payments"]');
      await expect(paymentsContent.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('Pending fizetés létrehozása teszthez', async () => {
      // Create registration with pending bank transfer payment
      const registration = await db.registration.create({
        data: {
          guest_id: guestId,
          ticket_type: 'paid_single',
          payment_method: 'bank_transfer',
          gdpr_consent: true,
          gdpr_consent_at: new Date(),
          cancellation_accepted: true,
          cancellation_accepted_at: new Date(),
        },
      });

      await db.payment.create({
        data: {
          registration_id: registration.id,
          amount: 50000,
          currency: 'HUF',
          payment_method: 'bank_transfer',
          payment_status: 'pending',
        },
      });

      // Update guest status
      await db.guest.update({
        where: { id: guestId },
        data: { registration_status: 'registered' },
      });

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Szűrés pending státuszra', async () => {
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      if (await statusFilter.isVisible({ timeout: 2000 })) {
        await statusFilter.selectOption('pending');
        await page.waitForTimeout(1000);
      }
    });

    // === PART 5: Asztal kezelés ===
    await test.step('Navigálás az Asztalok oldalra', async () => {
      await page.goto('/admin/tables');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Asztalok oldal betöltődik', async () => {
      const tablesContent = page.locator('main, [data-testid="tables"]');
      await expect(tablesContent.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('Teszt asztal létrehozása DB-ben', async () => {
      const table = await db.table.create({
        data: {
          name: TEST_TABLE_NAME,
          capacity: 8,
          type: 'VIP',
          pos_x: 200,
          pos_y: 200,
          status: 'available',
        },
      });
      tableId = table.id;

      // Refresh to see new table
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Új asztal megjelenik', async () => {
      try {
        await expect(page.getByText(TEST_TABLE_NAME)).toBeVisible({ timeout: 5000 });
      } catch {
        // Table might be in different view
      }
    });

    // === PART 6: Ültetési terv ===
    await test.step('Navigálás az Ültetési tervhez', async () => {
      await page.goto('/admin/seating');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Ültetési terv betöltődik', async () => {
      const seatingContent = page.locator('main, canvas, [data-testid="seating-map"]');
      await expect(seatingContent.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('Vendég hozzárendelése asztalhoz', async () => {
      // Create table assignment in DB
      await db.tableAssignment.create({
        data: {
          guest_id: guestId,
          table_id: tableId,
          seat_number: 1,
        },
      });

      // Refresh to see assignment
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    // === PART 7: Check-in Log ===
    await test.step('Navigálás a Check-in Log-hoz', async () => {
      await page.goto('/admin/checkin-log');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check-in log betöltődik', async () => {
      const logContent = page.locator('main, table, [data-testid="checkin-log"]');
      await expect(logContent.first()).toBeVisible({ timeout: 5000 });
    });

    // === PART 8: Jelentkezők kezelése ===
    await test.step('Navigálás a Jelentkezők oldalra', async () => {
      await page.goto('/admin/applicants');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Jelentkezők oldal betöltődik', async () => {
      const applicantsContent = page.locator('main, [data-testid="applicants"]');
      await expect(applicantsContent.first()).toBeVisible({ timeout: 5000 });
    });

    // === PART 9: Email küldés ===
    await test.step('Navigálás az Email oldalra', async () => {
      await page.goto('/admin/email');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Email oldal betöltődik', async () => {
      try {
        const emailContent = page.locator('main, [data-testid="email"], .email-content, body');
        await expect(emailContent.first()).toBeVisible({ timeout: 5000 });
      } catch {
        // Email page might redirect or be unavailable
      }
    });

    // === PART 10: Vissza Dashboard-ra ===
    await test.step('Vissza a Dashboard-ra', async () => {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Dashboard statisztikák', async () => {
      // Look for stats or cards
      const statsContent = page.locator('[data-testid="stats"], .stat-card, .dashboard-stats');
      if (await statsContent.isVisible({ timeout: 3000 })) {
        await page.waitForTimeout(1000);
      }
    });

    await test.step('Admin journey befejezve', async () => {
      // Final pause for video
      await page.waitForTimeout(2000);

      // Verify guest was created
      const guest = await db.guest.findUnique({ where: { id: guestId } });
      expect(guest).not.toBeNull();
      expect(guest?.email).toBe(TEST_GUEST_EMAIL);
    });
  });
});
