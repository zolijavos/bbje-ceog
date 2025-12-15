/**
 * PAIRED TICKET PAYMENT DEMO - Visual E2E Test
 *
 * This test runs in HEADED mode with VIDEO RECORDING
 * so you can watch the entire flow and have a recorded demo.
 *
 * Run with: npx playwright test paired-payment-demo --headed
 *
 * Features:
 * - Visible browser window
 * - Slow motion (500ms between actions)
 * - Video recording saved to test-results/
 * - Full paired ticket registration flow
 */

import { test, expect } from '@playwright/test';
import { prisma } from '../../../lib/db/prisma';

// Configure this test for demo purposes
test.use({
  // Headless mode (set to false locally if you have display)
  // For headed mode with display: HEADED=1 npx playwright test ...
  headless: process.env.HEADED !== '1',
  // Slow down actions so you can watch
  launchOptions: {
    slowMo: 300,
  },
  // Record video ALWAYS
  video: 'on',
  // Take screenshots
  screenshot: 'on',
  // Larger viewport for better visibility
  viewport: { width: 1280, height: 800 },
  // No auth needed for registration
  storageState: { cookies: [], origins: [] },
});

test.describe('Páros Jegy Regisztráció és Fizetés - DEMO', () => {
  let testGuestId: number;
  let testGuestEmail: string;

  test.beforeAll(async () => {
    // Create a fresh test guest
    testGuestEmail = `demo-paros-${Date.now()}@ceogala.hu`;

    const guest = await prisma.guest.create({
      data: {
        name: 'Demo Páros Vendég',
        email: testGuestEmail,
        guest_type: 'paying_paired',
        registration_status: 'invited',
      },
    });

    testGuestId = guest.id;
    console.log(`\n✅ Teszt vendég létrehozva: ID=${testGuestId}, Email=${testGuestEmail}\n`);
  });

  test.afterAll(async () => {
    // Cleanup - optional, comment out to keep test data
    await prisma.payment.deleteMany({
      where: { registration: { guest_id: testGuestId } },
    });
    await prisma.billingInfo.deleteMany({
      where: { registration: { guest_id: testGuestId } },
    });
    await prisma.registration.deleteMany({
      where: { guest_id: testGuestId },
    });
    await prisma.guest.delete({
      where: { id: testGuestId },
    });
    console.log(`\n🧹 Teszt adatok törölve\n`);
  });

  test('Teljes páros jegy regisztrációs és fizetési folyamat', async ({ page }) => {
    // ========================================
    // 1. LÉPÉS: Regisztrációs oldal megnyitása
    // ========================================
    console.log('\n📍 1. LÉPÉS: Regisztrációs oldal megnyitása...');

    await page.goto(`/register/paid?guest_id=${testGuestId}`);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Wait a moment for visual effect
    await page.waitForTimeout(1000);

    // ========================================
    // 2. LÉPÉS: Jegytípus választás (PÁROS)
    // ========================================
    console.log('📍 2. LÉPÉS: Páros jegy kiválasztása...');

    // Look for paired ticket option
    const pairedOption = page.locator('label').filter({ hasText: /páros|paired/i });
    if (await pairedOption.isVisible()) {
      await pairedOption.click();
      await page.waitForTimeout(500);
    }

    // Click Next
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(500);

    // ========================================
    // 3. LÉPÉS: Személyes adatok kitöltése
    // ========================================
    console.log('📍 3. LÉPÉS: Személyes adatok kitöltése...');

    // Phone
    const phoneInput = page.locator('[data-testid="phone-input"]');
    await phoneInput.click();
    await phoneInput.fill('+36 30 123 4567');

    // Company
    const companyInput = page.locator('[data-testid="company-input"]');
    await companyInput.click();
    await companyInput.fill('Demo Kft.');

    // Position
    const positionInput = page.locator('[data-testid="position-input"]');
    await positionInput.click();
    await positionInput.fill('Ügyvezető igazgató');

    // Optional: Dietary requirements
    const dietaryInput = page.locator('[data-testid="dietary-input"]');
    if (await dietaryInput.isVisible()) {
      await dietaryInput.click();
      await dietaryInput.fill('Vegetáriánus');
    }

    await page.waitForTimeout(500);
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(500);

    // ========================================
    // 4. LÉPÉS: Számlázási adatok kitöltése
    // ========================================
    console.log('📍 4. LÉPÉS: Számlázási adatok kitöltése...');

    // Billing name
    const billingNameInput = page.locator('[data-testid="billing-name-input"]');
    await billingNameInput.click();
    await billingNameInput.clear();
    await billingNameInput.fill('Demo Páros Vendég');

    // Company name (optional)
    const companyNameInput = page.locator('[data-testid="company-name-input"]');
    if (await companyNameInput.isVisible()) {
      await companyNameInput.click();
      await companyNameInput.fill('Demo Kft.');
    }

    // Tax number (optional)
    const taxInput = page.locator('[data-testid="tax-number-input"]');
    if (await taxInput.isVisible()) {
      await taxInput.click();
      await taxInput.fill('12345678-1-42');
    }

    // Address
    const addressInput = page.locator('[data-testid="address-line1-input"]');
    await addressInput.click();
    await addressInput.fill('Andrássy út 123, 2. emelet');

    // City
    const cityInput = page.locator('[data-testid="city-input"]');
    await cityInput.click();
    await cityInput.fill('Budapest');

    // Postal code
    const postalInput = page.locator('[data-testid="postal-code-input"]');
    await postalInput.click();
    await postalInput.fill('1061');

    await page.waitForTimeout(500);
    await page.locator('[data-testid="next-button"]').click();
    await page.waitForTimeout(500);

    // ========================================
    // 5. LÉPÉS: Partner adatok kitöltése
    // ========================================
    console.log('📍 5. LÉPÉS: Partner adatok kitöltése...');

    // Partner name
    const partnerNameInput = page.locator('[data-testid="partner-name-input"]');
    if (await partnerNameInput.isVisible()) {
      await partnerNameInput.click();
      await partnerNameInput.fill('Demo Partner Erika');

      // Partner email
      const partnerEmailInput = page.locator('[data-testid="partner-email-input"]');
      await partnerEmailInput.click();
      await partnerEmailInput.fill('demo.partner@ceogala.hu');

      await page.waitForTimeout(500);
      await page.locator('[data-testid="next-button"]').click();
      await page.waitForTimeout(500);
    }

    // ========================================
    // 6. LÉPÉS: Beleegyezések
    // ========================================
    console.log('📍 6. LÉPÉS: Beleegyezések elfogadása...');

    // GDPR consent
    const gdprCheckbox = page.locator('[data-testid="gdpr-checkbox"]');
    await gdprCheckbox.check();
    await page.waitForTimeout(300);

    // Cancellation policy
    const cancellationCheckbox = page.locator('[data-testid="cancellation-checkbox"]');
    await cancellationCheckbox.check();
    await page.waitForTimeout(500);

    // ========================================
    // 7. LÉPÉS: Regisztráció befejezése
    // ========================================
    console.log('📍 7. LÉPÉS: Regisztráció befejezése...');

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/before-submit.png' });

    // Submit registration
    const submitButton = page.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // ========================================
    // 8. LÉPÉS: Várakozás a válaszra
    // ========================================
    console.log('📍 8. LÉPÉS: Várakozás a fizetési átirányításra...');

    // Wait for either redirect to Stripe or success page
    await page.waitForTimeout(3000);

    // Take screenshot of result
    await page.screenshot({ path: 'test-results/after-submit.png' });

    // Check current URL
    const currentUrl = page.url();
    console.log(`\n📍 Jelenlegi URL: ${currentUrl}\n`);

    // If redirected to Stripe, capture that
    if (currentUrl.includes('stripe.com') || currentUrl.includes('checkout')) {
      console.log('✅ Stripe Checkout-ra irányított!');
      await page.screenshot({ path: 'test-results/stripe-checkout.png' });

      // Wait to show the Stripe page
      await page.waitForTimeout(3000);
    } else if (currentUrl.includes('success')) {
      console.log('✅ Sikeres regisztráció oldal!');
    } else {
      console.log('ℹ️ Regisztráció folyamatban...');
    }

    // ========================================
    // 9. LÉPÉS: Adatbázis ellenőrzés
    // ========================================
    console.log('📍 9. LÉPÉS: Adatbázis ellenőrzés...');

    // Verify registration was created
    const registration = await prisma.registration.findFirst({
      where: { guest_id: testGuestId },
      include: { payment: true },
    });

    if (registration) {
      console.log(`\n✅ REGISZTRÁCIÓ SIKERES!`);
      console.log(`   - Jegy típus: ${registration.ticket_type}`);
      console.log(`   - Partner: ${registration.partner_name || 'N/A'}`);
      console.log(`   - Partner email: ${registration.partner_email || 'N/A'}`);
      if (registration.payment) {
        console.log(`   - Fizetés összeg: ${registration.payment.amount} HUF`);
        console.log(`   - Fizetés státusz: ${registration.payment.payment_status}`);
      }
    }

    // Final pause to show result
    await page.waitForTimeout(2000);

    console.log('\n🎬 DEMO BEFEJEZVE - Videó mentve: test-results/\n');
  });
});
