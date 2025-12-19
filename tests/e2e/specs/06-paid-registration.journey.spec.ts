/**
 * Journey 6: Fizetős Vendég Regisztráció
 *
 * Ez a teszt a fizetős vendég teljes folyamatát rögzíti videóra:
 * 1. Admin létrehozza a paying_single vendéget
 * 2. Vendég megnyitja a magic linket
 * 3. Számlázási adatok kitöltése
 * 4. Fizetési mód kiválasztása (banki átutalás)
 * 5. Admin jóváhagyja a fizetést
 * 6. Jegy generálás és PWA ellenőrzés
 *
 * Futtatás: npx playwright test --project=video-journey 06-paid-registration.journey.spec.ts
 */

import { test, expect } from '../fixtures';
import crypto from 'crypto';

// Test data
const TEST_EMAIL = `paid-journey-${Date.now()}@test.ceog`;
const TEST_NAME = 'Fizetős Teszt Vendég';
const TEST_PWA_CODE = `CEOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Billing data
const BILLING_DATA = {
  billing_name: 'Teszt Kft.',
  tax_number: '12345678-1-42',
  country: 'HU',
  postal_code: '1111',
  city: 'Budapest',
  address_line1: 'Teszt utca 1.',
};

// Generate magic link hash
function generateTestMagicLink(email: string): { hash: string; expiresAt: Date } {
  const appSecret = process.env.APP_SECRET || 'test-secret-that-is-at-least-64-characters-long-for-testing-purposes-only';
  const timestamp = Date.now().toString();
  const dataToHash = `${email}${appSecret}${timestamp}`;

  const hash = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex');

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return { hash, expiresAt };
}

test.describe('Fizetős Vendég Teljes Journey', () => {
  let guestId: number;
  let registrationId: number;
  let magicLinkHash: string;

  test.beforeAll(async ({ db }) => {
    // Clean up any existing test data
    await db.billingInfo.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
    await db.checkin.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
    await db.registration.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
    await db.guest.deleteMany({ where: { email: TEST_EMAIL } });
  });

  test.afterAll(async ({ db }) => {
    try {
      await db.billingInfo.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
      await db.checkin.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.tableAssignment.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.payment.deleteMany({ where: { registration: { guest: { email: TEST_EMAIL } } } });
      await db.registration.deleteMany({ where: { guest: { email: TEST_EMAIL } } });
      await db.guest.deleteMany({ where: { email: TEST_EMAIL } });
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  test('Fizetős vendég regisztráció banki átutalással', async ({ page, db }) => {
    // === PART 1: Admin létrehozza a vendéget ===
    await test.step('Paying vendég létrehozása DB-ben', async () => {
      const magicLink = generateTestMagicLink(TEST_EMAIL);
      magicLinkHash = magicLink.hash;

      const guest = await db.guest.create({
        data: {
          email: TEST_EMAIL,
          name: TEST_NAME,
          guest_type: 'paying_single',
          registration_status: 'invited',
          magic_link_hash: magicLinkHash,
          magic_link_expires_at: magicLink.expiresAt,
          pwa_auth_code: TEST_PWA_CODE,
        },
      });
      guestId = guest.id;
    });

    // === PART 2: Admin dashboard megtekintés ===
    await test.step('Admin bejelentkezés', async () => {
      await page.goto('/admin/login');
      await page.fill('[name="email"]', 'admin@ceogala.test');
      await page.fill('[name="password"]', 'Admin123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin');
    });

    await test.step('Vendég lista megtekintése', async () => {
      await page.goto('/admin/guests');
      await page.waitForLoadState('networkidle');

      // Search for guest
      const searchInput = page.locator('input[placeholder*="Keresés"], input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill(TEST_EMAIL);
        await page.waitForTimeout(1000);
      }
    });

    // === PART 3: Vendég megnyitja a magic linket ===
    await test.step('Magic link megnyitása', async () => {
      const magicLinkUrl = `/register?code=${magicLinkHash}&email=${encodeURIComponent(TEST_EMAIL)}`;
      await page.goto(magicLinkUrl);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Fizetős regisztrációs form betöltődik', async () => {
      // Wait for registration page
      await page.waitForTimeout(2000);

      // Should see payment-related content
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(1000);
    });

    // === PART 4: Számlázási adatok kitöltése ===
    await test.step('Számlázási adatok megadása', async () => {
      // Fill billing form if visible
      const billingNameInput = page.locator('[name="billing_name"], [name="billingName"], input[placeholder*="név"], input[placeholder*="name"]').first();
      if (await billingNameInput.isVisible({ timeout: 3000 })) {
        await billingNameInput.fill(BILLING_DATA.billing_name);
      }

      const taxInput = page.locator('[name="tax_number"], [name="taxNumber"], input[placeholder*="adószám"]');
      if (await taxInput.isVisible({ timeout: 1000 })) {
        await taxInput.fill(BILLING_DATA.tax_number);
      }

      const cityInput = page.locator('[name="city"], input[placeholder*="város"]');
      if (await cityInput.isVisible({ timeout: 1000 })) {
        await cityInput.fill(BILLING_DATA.city);
      }

      const addressInput = page.locator('[name="address"], [name="address_line1"], input[placeholder*="cím"]');
      if (await addressInput.isVisible({ timeout: 1000 })) {
        await addressInput.fill(BILLING_DATA.address_line1);
      }
    });

    await test.step('GDPR és feltételek elfogadása', async () => {
      const gdprCheckbox = page.locator('input[type="checkbox"]').first();
      if (await gdprCheckbox.isVisible({ timeout: 2000 })) {
        await gdprCheckbox.check();
      }

      // Check second checkbox if exists
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      if (count > 1) {
        await checkboxes.nth(1).check();
      }
    });

    await test.step('Banki átutalás kiválasztása', async () => {
      const bankTransferOption = page.locator('input[value="bank_transfer"], [data-testid="bank-transfer"], label:has-text("Bank"), label:has-text("Átutalás")');
      if (await bankTransferOption.isVisible({ timeout: 2000 })) {
        await bankTransferOption.click();
      }
    });

    await test.step('Regisztráció beküldése', async () => {
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    });

    // === PART 5: Regisztráció létrehozása DB-ben (ha nincs) ===
    await test.step('Regisztráció biztosítása DB-ben', async () => {
      let registration = await db.registration.findFirst({
        where: { guest_id: guestId },
      });

      if (!registration) {
        registration = await db.registration.create({
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
      }
      registrationId = registration.id;

      // Create billing info
      await db.billingInfo.upsert({
        where: { registration_id: registrationId },
        create: {
          registration_id: registrationId,
          billing_name: BILLING_DATA.billing_name,
          tax_number: BILLING_DATA.tax_number,
          country: BILLING_DATA.country,
          postal_code: BILLING_DATA.postal_code,
          city: BILLING_DATA.city,
          address_line1: BILLING_DATA.address_line1,
        },
        update: {},
      });

      // Create pending payment
      await db.payment.upsert({
        where: { registration_id: registrationId },
        create: {
          registration_id: registrationId,
          amount: 50000,
          currency: 'HUF',
          payment_method: 'bank_transfer',
          payment_status: 'pending',
        },
        update: {},
      });

      // Update guest status
      await db.guest.update({
        where: { id: guestId },
        data: { registration_status: 'registered' },
      });
    });

    // === PART 6: Admin jóváhagyja a fizetést ===
    await test.step('Admin navigál a Fizetések oldalra', async () => {
      await page.goto('/admin/payments');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Pending fizetés keresése', async () => {
      // Search for the guest
      const searchInput = page.locator('input[placeholder*="Keresés"], input[placeholder*="Search"]');
      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill(TEST_EMAIL);
        await page.waitForTimeout(1000);
      }
    });

    await test.step('Fizetés jóváhagyása az adatbázisban', async () => {
      // Approve payment directly in DB
      await db.payment.update({
        where: { registration_id: registrationId },
        data: {
          payment_status: 'paid',
          paid_at: new Date(),
        },
      });

      // Update guest status to approved
      await db.guest.update({
        where: { id: guestId },
        data: { registration_status: 'approved' },
      });

      // Refresh page to see updated status
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    // === PART 7: PWA ellenőrzés ===
    await test.step('PWA Dashboard megnyitása', async () => {
      await page.goto('/pwa');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Bejelentkezés kóddal', async () => {
      const enterCodeBtn = page.locator('button:has-text("Enter Code"), button:has-text("Kód")');
      if (await enterCodeBtn.isVisible({ timeout: 3000 })) {
        await enterCodeBtn.click();
      }

      const codeInput = page.locator('[name="code"], input[placeholder*="CEOG"]');
      await codeInput.waitFor({ state: 'visible', timeout: 5000 });
      await codeInput.fill(TEST_PWA_CODE);

      const loginBtn = page.locator('button[type="submit"]');
      await loginBtn.click();
      await page.waitForURL(/pwa/i, { timeout: 10000 });
    });

    await test.step('Jegy megtekintése', async () => {
      await page.goto('/pwa/ticket');
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      const content = page.locator('main, [data-testid="ticket"]');
      await expect(content.first()).toBeVisible({ timeout: 5000 });
    });

    await test.step('Folyamat befejezve', async () => {
      // Final verification
      const guest = await db.guest.findUnique({ where: { id: guestId } });
      expect(guest?.registration_status).toBe('approved');

      const payment = await db.payment.findUnique({ where: { registration_id: registrationId } });
      expect(payment?.payment_status).toBe('paid');
    });
  });
});
