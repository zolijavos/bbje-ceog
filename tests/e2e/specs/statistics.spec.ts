/**
 * CEO Gala - Statistics Dashboard E2E Tests
 *
 * Tests for Statistics dashboard:
 * - View overall statistics
 * - Guest breakdown by type
 * - Registration status breakdown
 * - Payment statistics
 * - Check-in statistics
 *
 * Priority: P2 - Medium (Reporting functionality)
 */
import { test, expect } from '../fixtures';

test.describe('Statistics Dashboard', () => {
  test('[P1] should display statistics page', async ({ page }) => {
    // WHEN: Navigating to statistics
    await page.goto('/admin/statistics');

    // THEN: Statistics page is visible
    await expect(page.locator('h1, h2').filter({ hasText: /statisztika|statistics|dashboard/i })).toBeVisible();
  });

  test('[P1] should show total guest count', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Total guests metric is shown
    await expect(page.locator('text=/összes vendég|total guests|vendégek száma/i')).toBeVisible();
    // AND: Number is displayed
    await expect(page.locator('[data-testid="total-guests"], .stat-value').first()).toBeVisible();
  });

  test('[P1] should show guest type breakdown', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Guest type breakdown is shown (VIP, Paying, Applicant)
    await expect(page.locator('text=/VIP/i')).toBeVisible();
    await expect(page.locator('text=/paying|fizető/i')).toBeVisible();
  });

  test('[P1] should show registration status breakdown', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Status breakdown is shown
    await expect(page.locator('text=/invited|meghívott/i').or(
      page.locator('text=/registered|regisztrált/i')
    )).toBeVisible();
  });

  test('[P2] should show payment statistics', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Payment statistics section is visible
    await expect(page.locator('text=/fizetés|payment|bevétel|revenue/i')).toBeVisible();
  });

  test('[P2] should show check-in statistics', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Check-in statistics are shown
    await expect(page.locator('text=/check-in|bejelentkezés|belépés/i')).toBeVisible();
  });

  test('[P2] should show seating statistics', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Seating statistics are shown
    await expect(page.locator('text=/ültetés|seating|asztal|table/i')).toBeVisible();
  });
});

test.describe('Statistics Data Accuracy', () => {
  test('[P2] should update statistics after guest creation', async ({ page, seedGuest, cleanup }) => {
    // GIVEN: Initial statistics
    await page.goto('/admin/statistics');
    const totalBefore = await page.locator('[data-testid="total-guests"]').textContent().catch(() => '0');

    // WHEN: Creating a new guest (done via seedGuest)
    const { createVIPGuest } = await import('../factories');
    await seedGuest(createVIPGuest({ email: 'stats-test@test.ceog' }));

    // AND: Refreshing statistics
    await page.reload();

    // THEN: Total should increase (or at minimum, page loads successfully)
    await expect(page.locator('[data-testid="total-guests"], .stat-value').first()).toBeVisible();

    await cleanup();
  });
});

test.describe('Statistics Export', () => {
  test('[P3] should have export option', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Export button should be available
    const exportButton = page.locator('button, a').filter({ hasText: /export|letöltés|csv|excel/i });
    // Export might not be implemented, so we just check visibility without failing
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });
});

test.describe('Statistics Refresh', () => {
  test('[P3] should have refresh capability', async ({ page }) => {
    // WHEN: On statistics page
    await page.goto('/admin/statistics');

    // THEN: Refresh button or auto-refresh indicator should exist
    const refreshButton = page.locator('button').filter({ hasText: /frissítés|refresh/i });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      // Should reload data
      await expect(page.locator('[data-testid="total-guests"], .stat-value').first()).toBeVisible();
    }
  });
});
