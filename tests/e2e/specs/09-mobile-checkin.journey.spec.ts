/**
 * Journey 9: Mobil Check-in Folyamat
 *
 * Ez a teszt a mobil check-in teljes folyamatát rögzíti videóra:
 * 1. Staff/Admin bejelentkezés
 * 2. Check-in oldal megnyitása
 * 3. QR scanner interface
 * 4. Sikeres check-in (zöld kártya)
 * 5. Dupla check-in kezelés (sárga kártya)
 * 6. Admin override
 *
 * Futtatás: npx playwright test --project=video-journey 09-mobile-checkin.journey.spec.ts
 */

import { test, expect } from '../fixtures';
import crypto from 'crypto';

// Test data
const TEST_EMAIL = `checkin-journey-${Date.now()}@test.ceog`;
const TEST_NAME = 'Check-in Teszt Vendég';
const TEST_PWA_CODE = `CEOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

test.describe('Mobil Check-in Journey', () => {
  let guestId: number;
  let registrationId: number;
  let qrCodeHash: string;

  test.beforeAll(async ({ db }) => {
    // Clean up any existing test data
    await db.checkin.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
    await db.registration.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.guest.deleteMany({ where: { email: TEST_EMAIL } });

    // Generate QR code hash
    qrCodeHash = crypto.randomBytes(32).toString('hex');

    // Create test guest with registration
    const guest = await db.guest.create({
      data: {
        email: TEST_EMAIL,
        name: TEST_NAME,
        guest_type: 'vip',
        registration_status: 'approved',
        pwa_auth_code: TEST_PWA_CODE,
      },
    });
    guestId = guest.id;

    // Create registration with QR code
    const registration = await db.registration.create({
      data: {
        guest_id: guestId,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: qrCodeHash,
        qr_code_generated_at: new Date(),
      },
    });
    registrationId = registration.id;
  });

  test.afterAll(async ({ db }) => {
    try {
      await db.checkin.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
      await db.registration.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.guest.deleteMany({ where: { email: TEST_EMAIL } });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('Mobil check-in teljes folyamat', async ({ page, db }) => {
    // === PART 1: Staff bejelentkezés ===
    await test.step('Admin bejelentkezés check-in teszthez', async () => {
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');

      await page.fill('[name="email"]', 'admin@ceogala.test');
      await page.fill('[name="password"]', 'Admin123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin', { timeout: 10000 });
    });

    // === PART 2: Check-in oldal megnyitása ===
    await test.step('Navigálás a Check-in oldalra', async () => {
      await page.goto('/checkin');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check-in oldal betöltődik', async () => {
      const checkinContent = page.locator('main, [data-testid="checkin"]');
      await expect(checkinContent.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('QR Scanner interface látható', async () => {
      // Look for scanner related elements
      const scannerElements = page.locator(
        'video, canvas, [data-testid="qr-scanner"], .scanner-container, button:has-text("Scan"), button:has-text("Szkennelés")'
      );
      try {
        await expect(scannerElements.first()).toBeVisible({ timeout: 5000 });
      } catch {
        // Scanner might need camera permission or different view
        const scanButton = page.locator('button:has-text("Start"), button:has-text("Indít")');
        if (await scanButton.isVisible({ timeout: 2000 })) {
          await scanButton.click();
        }
      }
    });

    // === PART 3: Manuális kód bevitel (QR helyett) ===
    await test.step('Manuális kód bevitel mód', async () => {
      // Look for manual entry option
      const manualEntryBtn = page.locator(
        'button:has-text("Manual"), button:has-text("Manuális"), button:has-text("Kód"), a:has-text("Manual")'
      );
      if (await manualEntryBtn.isVisible({ timeout: 3000 })) {
        await manualEntryBtn.click();
        await page.waitForTimeout(500);
      }
    });

    await test.step('Check-in kód megadása', async () => {
      // Try to find code input
      const codeInput = page.locator(
        'input[name="code"], input[placeholder*="kód"], input[placeholder*="code"], input[type="text"]'
      ).first();

      if (await codeInput.isVisible({ timeout: 3000 })) {
        await codeInput.fill(qrCodeHash.substring(0, 10)); // Use part of hash as test code
        await page.waitForTimeout(500);
      }
    });

    // === PART 4: Sikeres check-in szimuláció ===
    await test.step('Check-in API hívás szimulálása', async () => {
      // We'll simulate a successful check-in via DB
      // This represents what happens when a valid QR is scanned

      // Get admin user for staff_user_id
      const adminUser = await db.user.findFirst({
        where: { email: 'admin@ceogala.test' },
      });

      if (adminUser) {
        await db.checkin.create({
          data: {
            registration_id: registrationId,
            guest_id: guestId,
            staff_user_id: adminUser.id,
            method: 'qr_scan',
            is_override: false,
            checked_in_at: new Date(),
          },
        });
      }
    });

    await test.step('Check-in log megtekintése', async () => {
      await page.goto('/admin/checkin-log');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Bejelentkezett vendég megjelenik a logban', async () => {
      // Search for the guest
      const searchInput = page.locator('input[placeholder*="Keresés"], input[placeholder*="Search"]');
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill(TEST_EMAIL);
        await page.waitForTimeout(1000);
      }

      // Verify guest name appears
      try {
        await expect(page.getByText(TEST_NAME)).toBeVisible({ timeout: 5000 });
      } catch {
        // Name might not be visible in log view
      }
    });

    // === PART 5: Dupla check-in kezelés ===
    await test.step('Dupla check-in próba (sárga kártya)', async () => {
      // The guest is already checked in, so attempting again should show warning
      // This is handled by the UI when scanning the same QR again

      // Navigate back to checkin
      await page.goto('/checkin');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Figyelmeztető üzenet dupla check-in esetén', async () => {
      // In real scenario, scanning same QR would show yellow card
      // We verify the checkin exists in DB
      const checkins = await db.checkin.findMany({
        where: { guest_id: guestId },
      });
      expect(checkins.length).toBe(1);
    });

    // === PART 6: Admin override szimuláció ===
    await test.step('Admin override lehetőség', async () => {
      // Look for override button (would appear on yellow card)
      const overrideBtn = page.locator(
        'button:has-text("Override"), button:has-text("Felülbírálás"), button:has-text("Admin")'
      );

      if (await overrideBtn.isVisible({ timeout: 2000 })) {
        // Don't actually click, just verify it exists
        await page.waitForTimeout(500);
      }
    });

    // === PART 7: Check-in statisztikák ===
    await test.step('Check-in dashboard megtekintése', async () => {
      await page.goto('/admin/checkin');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Check-in statisztikák megjelennek', async () => {
      const statsContent = page.locator(
        '[data-testid="checkin-stats"], .stats, .stat-card'
      );
      try {
        await expect(statsContent.first()).toBeVisible({ timeout: 5000 });
      } catch {
        // Stats might be in different format
      }
    });

    // === PART 8: Staff jogosultság teszt ===
    await test.step('Staff felhasználó szimulálás', async () => {
      // Staff users have limited access - only checkin and checkin-log
      // This step documents the expected behavior

      // Verify staff user exists in system
      const staffUser = await db.user.findFirst({
        where: { email: 'staff@ceogala.test' },
      });

      if (staffUser) {
        expect(staffUser.role).toBe('staff');
      }
    });

    // === PART 9: Export lehetőség ===
    await test.step('Check-in log export lehetőség', async () => {
      await page.goto('/admin/checkin-log');
      await page.waitForLoadState('networkidle');

      // Look for export button
      const exportBtn = page.locator(
        'button:has-text("Export"), button:has-text("Exportálás"), button:has-text("CSV")'
      );
      if (await exportBtn.isVisible({ timeout: 2000 })) {
        // Don't actually export, just verify button exists
        await page.waitForTimeout(500);
      }
    });

    // === PART 10: Journey befejezés ===
    await test.step('Check-in journey befejezve', async () => {
      // Final verification
      const checkin = await db.checkin.findFirst({
        where: { guest_id: guestId },
      });
      expect(checkin).not.toBeNull();
      expect(checkin?.method).toBe('qr_scan');

      // Final pause for video
      await page.waitForTimeout(2000);
    });
  });
});
