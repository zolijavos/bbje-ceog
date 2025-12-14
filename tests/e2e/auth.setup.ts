/**
 * CEO Gala - Authentication Setup
 *
 * This setup project runs before all tests to authenticate the admin user
 * and save the session state for reuse in subsequent tests.
 */
import { test as setup, expect } from '@playwright/test';

const adminAuthFile = 'tests/e2e/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Navigate to admin login page
  await page.goto('/admin/login');

  // Wait for React hydration - the form is inside a Suspense boundary
  // The spinner disappears when useSearchParams() is resolved
  await page.waitForSelector('.spinner', { state: 'hidden', timeout: 20000 }).catch(() => {
    // Spinner might already be hidden
  });

  // Wait for the email input to be visible and enabled (confirms hydration complete)
  const emailInput = page.locator('[name="email"], #email');
  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await expect(emailInput).toBeEnabled({ timeout: 5000 });

  // Fill in credentials (from seed data)
  await emailInput.fill('admin@ceogala.test');
  await page.fill('[name="password"], #password', 'Admin123!');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for successful redirect to admin dashboard
  await page.waitForURL('/admin**', { timeout: 30000 });

  // Verify we're logged in
  await expect(page.locator('[data-testid="admin-header"], header, nav').first()).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: adminAuthFile });
});
