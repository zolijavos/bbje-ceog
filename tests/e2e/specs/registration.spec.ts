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

  test('should show error for invalid magic link code', async ({ page, seedGuest, cleanup }) => {
    // Create a guest with a valid hash so we can test with wrong code
    const hash = generateMagicLinkHash('invalid-test@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createGuestWithMagicLink({
      email: 'invalid-test@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    // Go with correct email but wrong code
    await page.goto(`/register?email=${encodeURIComponent(guest.email)}&code=wrong-invalid-code`);

    // RegisterError shows "Invalid Link" in h2 title (English from component)
    await expect(page.getByText('Invalid Link')).toBeVisible();

    await cleanup();
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

    // RegisterError shows "Link Expired" in h2 title
    await expect(page.getByText('Link Expired')).toBeVisible();

    await cleanup();
  });

  test('should show request new link option on invalid link', async ({ page, seedGuest, cleanup }) => {
    // Create guest to test with
    const hash = generateMagicLinkHash('resend-test@test.ceog');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const guest = await seedGuest(createGuestWithMagicLink({
      email: 'resend-test@test.ceog',
      magic_link_hash: hash,
      magic_link_expires_at: expiresAt,
    }));

    // Go with correct email but wrong code to trigger error page
    await page.goto(`/register?email=${encodeURIComponent(guest.email)}&code=invalid`);

    // RegisterError shows "Request New Link" button
    await expect(page.getByRole('link', { name: 'Request New Link' })).toBeVisible();

    await cleanup();
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

    // Navigate to VIP registration page with guest_id (correct URL format)
    await page.goto(`/register/vip?guest_id=${guest.id}`);

    // Should show Yes/No buttons for attendance confirmation (using specific data-testid)
    await expect(page.locator('[data-testid="confirm-attendance-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="decline-attendance-button"]')).toBeVisible();

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

    await page.goto(`/register/vip?guest_id=${guest.id}`);

    // Click confirm attendance using data-testid
    await page.click('[data-testid="confirm-attendance-button"]');

    // Should show registration form with profile fields
    await expect(page.locator('form').or(page.locator('text=/Personal Information|Személyes adatok/i'))).toBeVisible({ timeout: 5000 });

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

    await page.goto(`/register/vip?guest_id=${guest.id}`);

    // Click decline using data-testid
    await page.click('[data-testid="decline-attendance-button"]');

    // Should show confirmation of decline or redirect
    await expect(page).toHaveURL(/declined/, { timeout: 5000 });

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

    await page.goto(`/register/vip?guest_id=${guest.id}`);

    // Confirm attendance first using data-testid
    await page.click('[data-testid="confirm-attendance-button"]');

    // Wait for profile form to appear - VIPConfirmation shows "Personal Information" heading
    await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 5000 });

    // Profile form should be visible with phone field using data-testid
    await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();

    await cleanup();
  });
});

test.describe('Paid Guest Registration - Form Only', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should display paid registration page', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-display@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // For paying_single, starts at Step 2 (Profile) - look for profile fields or registration header
    await expect(page.getByText('Registration').first()).toBeVisible();
    // Should show step progress indicator
    await expect(page.getByText(/Personal Information|Billing/)).toBeVisible();

    await cleanup();
  });

  test('should show profile form fields on step 2', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-billing@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // paying_single starts at Step 2: Profile - check profile fields first
    await expect(page.locator('[data-testid="phone-input"]')).toBeVisible();

    await cleanup();
  });

  test('should navigate to billing form step', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-validate@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // First, fill profile step (Step 2) required fields using data-testid
    await page.locator('[data-testid="phone-input"]').fill('+36201234567');
    await page.locator('[data-testid="company-input"]').fill('Test Company');
    await page.locator('[data-testid="position-input"]').fill('CEO');

    // Click Next to go to Step 3 (Billing)
    await page.click('[data-testid="next-button"]');

    // Now billing form should be visible - use getByRole for heading
    await expect(page.getByRole('heading', { name: 'Billing Information' })).toBeVisible();
    await expect(page.locator('[data-testid="billing-name-input"]')).toBeVisible();

    await cleanup();
  });

  test('should show consent checkboxes on last step', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-methods@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // Step 2: Profile - fill required fields using data-testid
    await page.locator('[data-testid="phone-input"]').fill('+36201234567');
    await page.locator('[data-testid="company-input"]').fill('Test Company');
    await page.locator('[data-testid="position-input"]').fill('CEO');
    await page.click('[data-testid="next-button"]');

    // Step 3: Billing
    await page.locator('[data-testid="billing-name-input"]').fill('Test Billing Name');
    await page.locator('[data-testid="address-line1-input"]').fill('Test Street 123');
    await page.locator('[data-testid="city-input"]').fill('Budapest');
    await page.locator('[data-testid="postal-code-input"]').fill('1111');
    await page.click('[data-testid="next-button"]');

    // Step 4: Consent - should show GDPR and cancellation checkboxes - use getByRole for heading
    await expect(page.getByRole('heading', { name: 'Consents' })).toBeVisible();
    await expect(page.locator('[data-testid="gdpr-checkbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancellation-checkbox"]')).toBeVisible();

    await cleanup();
  });

  test('should display paired ticket option for paying_paired guest', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingPairedGuest({
      email: 'paid-paired@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // Should show partner fields for paired ticket guest
    await expect(page.locator('[name="partnerName"], [name="partner_name"]').or(page.locator('text=/partner/i').first())).toBeVisible();

    await cleanup();
  });

  test('should fill partner details for paired ticket', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingPairedGuest({
      email: 'paid-partner@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // Fill partner fields if visible
    const partnerNameField = page.locator('[name="partnerName"], [name="partner_name"]').first();
    const partnerEmailField = page.locator('[name="partnerEmail"], [name="partner_email"]').first();

    if (await partnerNameField.isVisible()) {
      await partnerNameField.fill('Partner Name');
    }
    if (await partnerEmailField.isVisible()) {
      await partnerEmailField.fill('partner@test.ceog');
    }

    await cleanup();
  });

  test('should validate required profile fields', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'paid-required@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // Try to click Next without filling required profile fields (Step 2)
    await page.click('[data-testid="next-button"]');

    // Should show validation errors for required profile fields - use specific text
    await expect(page.getByText('Phone number is required')).toBeVisible();

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
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'gdpr-test@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // Navigate through multi-step form to consent step
    // Step 2: Profile - use data-testid selectors
    await page.locator('[data-testid="phone-input"]').fill('+36201234567');
    await page.locator('[data-testid="company-input"]').fill('Test Company');
    await page.locator('[data-testid="position-input"]').fill('CEO');
    await page.click('[data-testid="next-button"]');

    // Step 3: Billing
    await page.locator('[data-testid="billing-name-input"]').fill('Test Name');
    await page.locator('[data-testid="address-line1-input"]').fill('Test Street 123');
    await page.locator('[data-testid="city-input"]').fill('Budapest');
    await page.locator('[data-testid="postal-code-input"]').fill('1111');
    await page.click('[data-testid="next-button"]');

    // Step 4: Consent - Now we can test GDPR requirement
    // Try submit without GDPR consent
    await page.click('[data-testid="submit-button"]');

    // Should show GDPR validation error - use .first() to avoid strict mode
    await expect(page.getByText('GDPR consent is required')).toBeVisible();

    await cleanup();
  });

  test('should show cancellation policy terms', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'cancel-terms@test.ceog',
    }));

    await page.goto(`/register/paid?guest_id=${guest.id}`);

    // Navigate to consent step
    // Step 2: Profile - use data-testid selectors
    await page.locator('[data-testid="phone-input"]').fill('+36201234567');
    await page.locator('[data-testid="company-input"]').fill('Test Company');
    await page.locator('[data-testid="position-input"]').fill('CEO');
    await page.click('[data-testid="next-button"]');

    // Step 3: Billing
    await page.locator('[data-testid="billing-name-input"]').fill('Test Name');
    await page.locator('[data-testid="address-line1-input"]').fill('Test Street 123');
    await page.locator('[data-testid="city-input"]').fill('Budapest');
    await page.locator('[data-testid="postal-code-input"]').fill('1111');
    await page.click('[data-testid="next-button"]');

    // Should have cancellation policy checkbox
    await expect(page.locator('[data-testid="cancellation-checkbox"]')).toBeVisible();

    await cleanup();
  });
});
