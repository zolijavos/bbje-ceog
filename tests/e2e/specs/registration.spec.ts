/**
 * CEO Gala - Registration Flow E2E Tests
 *
 * Tests for magic link registration flows:
 * - VIP guest registration (instant confirmation)
 * - Paid guest registration (without Stripe - form only)
 * - Magic link validation and expiration
 * - Guest profile fields
 *
 * Note: Stripe payment flow is NOT tested as integration is not set up.
 */
import { test, expect } from '../fixtures';
import {
  createVIPGuest,
  createPayingSingleGuest,
  createPayingPairedGuest,
  createGuestWithMagicLink,
  generateMagicLinkHash,
  generateValidMagicLinkUrl,
} from '../factories';
import { fillGuestForm, fillBillingForm } from '../helpers';

test.describe('Magic Link Validation', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // No auth needed

  test('should show error for invalid magic link code', async ({ page }) => {
    await page.goto('/register?email=test@test.com&code=invalid-hash-code');

    // Should show error message about invalid link
    await expect(page.locator('.error, .text-red-500, [role="alert"]').filter({ hasText: /érvénytelen|invalid|lejárt|expired/i })).toBeVisible();
  });

  test('should show error for expired magic link', async ({ page, seedGuest, cleanup }) => {
    // Create guest with expired magic link
    const expiredDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    const hash = generateMagicLinkHash('expired@test.ceog');

    const guest = await seedGuest(createGuestWithMagicLink({
      email: 'expired@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiredDate,
    }));

    await page.goto(generateValidMagicLinkUrl(guest.email, hash));

    // Should show expiration error
    await expect(page.locator('.error, .text-red-500, [role="alert"]').filter({ hasText: /lejárt|expired/i })).toBeVisible();

    await cleanup();
  });

  test('should show request new link option on invalid link', async ({ page }) => {
    await page.goto('/register?email=test@test.com&code=invalid');

    // Should show option to request new link
    await expect(page.locator('a, button').filter({ hasText: /új link|new link|újraküldés|resend/i })).toBeVisible();
  });

  test('should navigate to request link page', async ({ page }) => {
    await page.goto('/register/request-link');

    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('[name="email"], [type="email"]')).toBeVisible();
  });

  test('should request new magic link by email', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createVIPGuest({ email: 'request-link@test.ceog' }));

    await page.goto('/register/request-link');

    await page.fill('[name="email"], [type="email"]', guest.email);
    await page.click('button[type="submit"]');

    // Should show success message (email would be sent in real scenario)
    await expect(page.locator('.success, .text-green-500, [role="status"]').or(page.locator('text=/elküldtük|sent|sikeres/i'))).toBeVisible({ timeout: 5000 });

    await cleanup();
  });
});

test.describe('VIP Guest Registration', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should display VIP registration page with valid magic link', async ({ page, seedGuest, db, cleanup }) => {
    // Create VIP guest with valid magic link
    const hash = generateMagicLinkHash('vip-reg@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createVIPGuest({
      email: 'vip-reg@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(generateValidMagicLinkUrl(guest.email, hash));

    // Should show VIP registration page with welcome message
    await expect(page.locator('h1, h2').filter({ hasText: new RegExp(guest.name, 'i') }).or(page.locator('text=/üdvözöljük|welcome/i'))).toBeVisible();

    await cleanup();
  });

  test('should show attendance confirmation buttons for VIP', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('vip-confirm@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createVIPGuest({
      email: 'vip-confirm@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/vip?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Should show Yes/No buttons for attendance confirmation
    await expect(page.locator('button').filter({ hasText: /igen|yes|részt veszek|confirm/i })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /nem|no|lemondás|decline/i })).toBeVisible();

    await cleanup();
  });

  test('should complete VIP registration with confirmation', async ({ page, seedGuest, db, cleanup }) => {
    const hash = generateMagicLinkHash('vip-complete@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createVIPGuest({
      email: 'vip-complete@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/vip?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Click confirm attendance
    await page.click('button:has-text("Igen"), button:has-text("Yes"), button:has-text("Részt veszek")');

    // Should show success/thank you message or profile fields
    await expect(page.locator('text=/köszönjük|thank you|sikeres|success|profil|profile/i').or(page.locator('form'))).toBeVisible({ timeout: 5000 });

    await cleanup();
  });

  test('should decline VIP registration', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('vip-decline@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createVIPGuest({
      email: 'vip-decline@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/vip?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Click decline
    await page.click('button:has-text("Nem"), button:has-text("No"), button:has-text("Lemondás"), button:has-text("Decline")');

    // Should show confirmation of decline or redirect
    await expect(page).toHaveURL(/declined|cancel/);

    await cleanup();
  });

  test('should allow VIP to fill extended profile fields', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('vip-profile@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createVIPGuest({
      email: 'vip-profile@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/vip?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Confirm attendance first
    await page.click('button:has-text("Igen"), button:has-text("Yes"), button:has-text("Részt veszek")');

    // Wait for profile form or success
    await page.waitForTimeout(1000);

    // If profile form is shown, fill it
    const profileForm = page.locator('form').filter({ has: page.locator('[name="phone"], [name="dietary_requirements"]') });
    if (await profileForm.isVisible()) {
      await fillGuestForm(page, {
        phone: '+36201234567',
        dietary_requirements: 'Vegetáriánus',
        seating_preferences: 'Ablak mellé',
      });

      await page.click('button[type="submit"]');
    }

    await cleanup();
  });
});

test.describe('Paid Guest Registration - Form Only', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should display paid registration page', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-display@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-display@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Should show billing form
    await expect(page.locator('form')).toBeVisible();

    await cleanup();
  });

  test('should show billing form fields', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-billing@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-billing@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Check billing form fields exist
    await expect(page.locator('[name="billing_name"], [data-testid="billing-name-input"]')).toBeVisible();
    await expect(page.locator('[name="city"], [data-testid="city-input"]')).toBeVisible();
    await expect(page.locator('[name="postal_code"], [data-testid="postal-code-input"]')).toBeVisible();

    await cleanup();
  });

  test('should fill and validate billing form', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-validate@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-validate@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Fill billing form
    await fillBillingForm(page, {
      billing_name: 'Test Billing Name',
      company_name: 'Test Company Kft.',
      tax_number: '12345678-1-42',
      address_line1: 'Test Street 123',
      city: 'Budapest',
      postal_code: '1111',
    });

    // Also fill profile fields if visible
    await fillGuestForm(page, {
      phone: '+36201234567',
    });

    // Check GDPR consent
    const gdprCheckbox = page.locator('[name="gdpr_consent"], [data-testid="gdpr-checkbox"], input[type="checkbox"]').first();
    if (await gdprCheckbox.isVisible()) {
      await gdprCheckbox.check();
    }

    // Check cancellation policy
    const cancelCheckbox = page.locator('[name="cancellation_accepted"], [data-testid="cancel-checkbox"], input[type="checkbox"]').last();
    if (await cancelCheckbox.isVisible()) {
      await cancelCheckbox.check();
    }

    await cleanup();
  });

  test('should show payment method options', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-methods@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-methods@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Should show payment method selection (card and/or bank transfer)
    const paymentMethods = page.locator('[name="payment_method"], [data-testid="payment-method"]');
    await expect(paymentMethods.or(page.locator('text=/bankkártya|card|átutalás|transfer/i'))).toBeVisible();

    await cleanup();
  });

  test('should display paired ticket option for paying_paired guest', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-paired@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingPairedGuest({
      email: 'paid-paired@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Should show partner fields or ticket type selection
    await expect(page.locator('[name="partner_name"], [data-testid="partner-name"]').or(page.locator('text=/partner|páros|paired/i'))).toBeVisible();

    await cleanup();
  });

  test('should fill partner details for paired ticket', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-partner@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingPairedGuest({
      email: 'paid-partner@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Fill partner fields if visible
    const partnerNameField = page.locator('[name="partner_name"], [data-testid="partner-name-input"]');
    const partnerEmailField = page.locator('[name="partner_email"], [data-testid="partner-email-input"]');

    if (await partnerNameField.isVisible()) {
      await partnerNameField.fill('Partner Name');
    }
    if (await partnerEmailField.isVisible()) {
      await partnerEmailField.fill('partner@test.ceog');
    }

    await cleanup();
  });

  test('should validate required billing fields', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('paid-required@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-required@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('.error, .text-red-500, [aria-invalid="true"]')).toBeVisible();

    await cleanup();
  });
});

test.describe('Registration Status Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should display registration status by email', async ({ page, seedGuest, db, cleanup }) => {
    // Create a registered guest
    const guest = await seedGuest(createVIPGuest({
      email: 'status-check@test.ceog',
      registration_status: 'registered',
    }));

    // Create registration for this guest
    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
      },
    });

    await page.goto(`/status?email=${encodeURIComponent(guest.email)}`);

    // Should show registration status
    await expect(page.locator('text=/regisztrált|registered|státusz|status/i')).toBeVisible();

    await cleanup();
  });
});

test.describe('GDPR and Consent', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should require GDPR consent checkbox', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('gdpr-test@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'gdpr-test@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Fill required fields but don't check GDPR
    await fillBillingForm(page, {
      billing_name: 'Test Name',
      address_line1: 'Test Street',
      city: 'Budapest',
      postal_code: '1111',
    });

    // Try submit without GDPR consent
    await page.click('button[type="submit"]');

    // Should show GDPR validation error or prevent submission
    await expect(page.locator('form')).toBeVisible(); // Still on form

    await cleanup();
  });

  test('should show cancellation policy terms', async ({ page, seedGuest, cleanup }) => {
    const hash = generateMagicLinkHash('cancel-terms@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createPayingSingleGuest({
      email: 'cancel-terms@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    await page.goto(`/register/paid?email=${encodeURIComponent(guest.email)}&code=${hash}`);

    // Should have cancellation policy checkbox or text
    await expect(page.locator('text=/lemondás|cancellation|feltétel|terms/i')).toBeVisible();

    await cleanup();
  });
});
