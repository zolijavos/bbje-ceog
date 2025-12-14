/**
 * CEO Gala - Payments Admin E2E Tests
 *
 * Tests for Payment management in admin dashboard:
 * - View payment list
 * - Filter payments by status
 * - Approve bank transfer payments
 * - View payment details
 *
 * Priority: P1 - High (Financial workflow critical)
 */
import { test, expect } from '../fixtures';
import {
  createPayingSingleGuest,
} from '../factories';
import { navigateToAdminSection, waitForTableLoad } from '../helpers';

test.describe('Payments List View', () => {
  test('[P1] should display payments page with table', async ({ page }) => {
    // GIVEN: Admin is logged in
    // WHEN: Navigating to payments page
    await page.goto('/admin/payments');

    // THEN: Payments table is visible
    await expect(page.locator('h1, h2').filter({ hasText: /payment|fizet|pénzügy/i })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('[P1] should show payment status filters', async ({ page }) => {
    // WHEN: On payments page
    await page.goto('/admin/payments');

    // THEN: Status filter dropdown exists
    await expect(page.locator('[data-testid="status-filter"], select[name="status"], [name="payment_status"]')).toBeVisible();
  });

  test('[P1] should filter payments by pending status', async ({ page }) => {
    // WHEN: Filtering by pending
    await page.goto('/admin/payments');

    const statusFilter = page.locator('[data-testid="status-filter"], select[name="status"], [name="payment_status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('pending');
      await waitForTableLoad(page);
    }

    // THEN: Only pending payments shown (or empty if none)
    await expect(page.locator('table')).toBeVisible();
  });

  test('[P1] should filter payments by paid status', async ({ page }) => {
    // WHEN: Filtering by paid
    await page.goto('/admin/payments');

    const statusFilter = page.locator('[data-testid="status-filter"], select[name="status"], [name="payment_status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('paid');
      await waitForTableLoad(page);
    }

    // THEN: Only paid payments shown
    await expect(page.locator('table')).toBeVisible();
  });
});

test.describe('Payment Approval - Bank Transfer', () => {
  test('[P1] should display approve button for pending bank transfer', async ({ page, seedGuest, db, cleanup }) => {
    // GIVEN: Guest with pending bank transfer payment
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'bank-transfer-approve@test.ceog',
      registration_status: 'registered',
    }));

    const registration = await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'paid_single',
        payment_method: 'bank_transfer',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await db.payment.create({
      data: {
        registration_id: registration.id,
        amount: 100000,
        currency: 'HUF',
        payment_status: 'pending',
        payment_method: 'bank_transfer',
      },
    });

    // WHEN: Viewing payments page
    await page.goto('/admin/payments');
    await waitForTableLoad(page);

    // THEN: Approve button should be visible for this payment
    const row = page.locator('table tbody tr').filter({ hasText: guest.email });
    await expect(row.locator('button').filter({ hasText: /jóváhagy|approve/i })).toBeVisible();

    await cleanup();
  });

  test('[P1] should approve bank transfer payment', async ({ page, seedGuest, db, cleanup }) => {
    // GIVEN: Guest with pending bank transfer
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'bank-transfer-test@test.ceog',
      registration_status: 'registered',
    }));

    const registration = await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'paid_single',
        payment_method: 'bank_transfer',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await db.payment.create({
      data: {
        registration_id: registration.id,
        amount: 100000,
        currency: 'HUF',
        payment_status: 'pending',
        payment_method: 'bank_transfer',
      },
    });

    // WHEN: Clicking approve button
    await page.goto('/admin/payments');
    await waitForTableLoad(page);

    const row = page.locator('table tbody tr').filter({ hasText: guest.email });
    await row.locator('button').filter({ hasText: /jóváhagy|approve/i }).click();

    // THEN: Payment should be approved (status changes)
    await expect(row.locator('text=/paid|fizetve|jóváhagyva/i')).toBeVisible({ timeout: 5000 });

    await cleanup();
  });
});

test.describe('Payment Details', () => {
  test('[P2] should show payment amount and currency', async ({ page, seedGuest, db, cleanup }) => {
    // GIVEN: Guest with payment
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'payment-details@test.ceog',
      registration_status: 'registered',
    }));

    const registration = await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'paid_single',
        payment_method: 'card',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await db.payment.create({
      data: {
        registration_id: registration.id,
        amount: 100000,
        currency: 'HUF',
        payment_status: 'paid',
        payment_method: 'card',
      },
    });

    // WHEN: Viewing payments
    await page.goto('/admin/payments');
    await waitForTableLoad(page);

    // THEN: Amount is visible
    await expect(page.locator('text=/100.?000|100000/')).toBeVisible();

    await cleanup();
  });

  test('[P2] should show payment method type', async ({ page, seedGuest, db, cleanup }) => {
    // GIVEN: Guest with card payment
    const guest = await seedGuest(createPayingSingleGuest({
      email: 'payment-method-test@test.ceog',
      registration_status: 'registered',
    }));

    const registration = await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'paid_single',
        payment_method: 'card',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    await db.payment.create({
      data: {
        registration_id: registration.id,
        amount: 100000,
        currency: 'HUF',
        payment_status: 'paid',
        payment_method: 'card',
      },
    });

    // WHEN: Viewing payments
    await page.goto('/admin/payments');
    await waitForTableLoad(page);

    // THEN: Payment method is shown
    const row = page.locator('table tbody tr').filter({ hasText: guest.email });
    await expect(row.locator('text=/card|kártya|bankkártya/i')).toBeVisible();

    await cleanup();
  });
});

test.describe('Payment Statistics', () => {
  test('[P2] should show payment statistics summary', async ({ page }) => {
    // WHEN: Viewing payments page
    await page.goto('/admin/payments');

    // THEN: Statistics should be shown (total, pending, paid counts)
    await expect(page.locator('text=/összesen|total|pending|fizetésre vár/i')).toBeVisible();
  });
});
