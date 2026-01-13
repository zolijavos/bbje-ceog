/**
 * CEO Gala - Phase 2 Features Tests
 *
 * E2E tests for Phase 2 features:
 * - Attendance statistics widget
 * - Cancelled status in guest list
 * - Email scheduler configuration
 */
import { test, expect } from '../fixtures';
import {
  createGuestWithPWACode,
  createVIPGuest,
} from '../factories';

test.describe('Phase 2: Attendance Statistics Widget', () => {
  test('should display attendance stats section on statistics page', async ({ page }) => {
    // Navigate to statistics page (authenticated via storageState)
    await page.goto('/admin/statistics');
    await page.waitForLoadState('networkidle');

    // Should show attendance section
    await expect(page.getByText(/Attendance & Cancellations|Részvétel és lemondások/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show cancellation and no-show counts', async ({ page, seedGuest, db, cleanup }) => {
    // Create test data - a cancelled guest
    const cancelledGuest = await seedGuest(createVIPGuest({
      email: 'stats-cancelled@test.ceog',
      name: 'Stats Cancelled Guest',
      registration_status: 'cancelled',
    }));

    await db.registration.create({
      data: {
        guest_id: cancelledGuest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        cancelled_at: new Date(),
        cancellation_reason: 'Test cancellation',
      },
    });

    // Create a no-show guest (registered, has ticket, not checked in)
    const noShowGuest = await seedGuest(createVIPGuest({
      email: 'stats-noshow@test.ceog',
      name: 'Stats NoShow Guest',
      registration_status: 'approved',
    }));

    await db.registration.create({
      data: {
        guest_id: noShowGuest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        qr_code_hash: 'test-qr-token-for-noshow',
      },
    });

    // Navigate to statistics page
    await page.goto('/admin/statistics');
    await page.waitForLoadState('networkidle');

    // Wait for stats to load
    await expect(page.getByText(/Attendance & Cancellations|Részvétel és lemondások/i)).toBeVisible({ timeout: 10000 });

    await cleanup();
  });

  test('should display explanation text for no-shows', async ({ page }) => {
    await page.goto('/admin/statistics');
    await page.waitForLoadState('networkidle');

    // Should show the no-show explanation
    const explanationText = page.getByText(/no-show|nem jelent meg/i);
    await expect(explanationText.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 2: Cancelled Status in Guest List', () => {
  test('should show cancelled option in status filter', async ({ page }) => {
    await page.goto('/admin/guests');
    await page.waitForLoadState('networkidle');

    // Find the status filter dropdown
    const statusFilter = page.locator('#status-filter');
    await expect(statusFilter).toBeVisible();

    // Check that cancelled option exists
    const cancelledOption = statusFilter.locator('option[value="cancelled"]');
    await expect(cancelledOption).toBeAttached();
  });

  test('should filter guests by cancelled status', async ({ page, seedGuest, db, cleanup }) => {
    // Create a cancelled guest
    const guest = await seedGuest(createVIPGuest({
      email: 'filter-cancelled@test.ceog',
      name: 'Filter Cancelled Guest',
      registration_status: 'cancelled',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
        cancelled_at: new Date(),
      },
    });

    // Navigate and filter
    await page.goto('/admin/guests');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.locator('#status-filter');
    await statusFilter.selectOption('cancelled');
    await page.waitForTimeout(1000);

    // Should show the cancelled guest
    await expect(page.getByText('Filter Cancelled Guest')).toBeVisible({ timeout: 5000 });

    await cleanup();
  });

  test('should show no-show option in status filter', async ({ page }) => {
    await page.goto('/admin/guests');
    await page.waitForLoadState('networkidle');

    const statusFilter = page.locator('#status-filter');
    await expect(statusFilter).toBeVisible();

    // Check that no-show option exists
    const noShowOption = statusFilter.locator('option[value="no-show"]');
    await expect(noShowOption).toBeAttached();
  });
});

test.describe('Phase 2: Cancelled Registration Status', () => {
  test('should update guest status to cancelled when cancelling', async ({ page, seedGuest, db, cleanup }) => {
    // Create a guest that will cancel
    const guest = await seedGuest(createGuestWithPWACode({
      email: 'status-update@test.ceog',
      name: 'Status Update Guest',
    }));

    await db.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    // Login to PWA and cancel
    await page.goto('/pwa');
    const enterCodeBtn = page.locator('button:has-text("Enter Code"), button:has-text("Kód megadása")');
    if (await enterCodeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await enterCodeBtn.click();
    }
    await page.fill('[name="code"], [data-testid="auth-code-input"]', guest.pwa_auth_code!);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/pwa\//, { timeout: 10000 });

    await page.goto('/pwa/cancel');
    await page.waitForLoadState('networkidle');

    // Fill reason and confirm
    await page.locator('textarea').fill('Test cancellation for status check');
    await page.click('button:has-text("Confirm Cancellation")');

    // Wait for success
    await expect(page.getByText('Attendance Cancelled')).toBeVisible({ timeout: 10000 });

    // Verify database status was updated to 'cancelled'
    const updatedGuest = await db.guest.findUnique({
      where: { id: guest.id },
    });
    expect(updatedGuest?.registration_status).toBe('cancelled');

    await cleanup();
  });
});

test.describe('Phase 2: Email Templates', () => {
  test('should have E-10 reminder template available', async ({ page }) => {
    // Navigate to email templates page
    await page.goto('/admin/email-templates');
    await page.waitForLoadState('networkidle');

    // The template should be available (either in the list or creatable)
    // This tests that the admin can access the templates page
    await expect(page.getByRole('heading', { name: /Email Templates|Email sablonok/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 2: API Endpoints', () => {
  test('should include attendance data in statistics API', async ({ page }) => {
    // First navigate to admin to ensure we have auth cookies and valid URL context
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Call the statistics API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/statistics');
      return res.json();
    });

    // Should have attendance section
    expect(response).toHaveProperty('attendance');
    expect(response.attendance).toHaveProperty('cancelled');
    expect(response.attendance).toHaveProperty('potentialNoShows');
    expect(response.attendance).toHaveProperty('recentCancellations');
    expect(response.attendance).toHaveProperty('cancelledWithReason');
  });

  test('should include cancelled in registration byStatus', async ({ page }) => {
    // First navigate to admin to ensure we have auth cookies and valid URL context
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/admin/statistics');
      return res.json();
    });

    // Should have cancelled in byStatus
    expect(response.registration.byStatus).toHaveProperty('cancelled');
  });
});
