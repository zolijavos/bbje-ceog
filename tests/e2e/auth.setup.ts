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

  // Wait for the login form to be visible
  await expect(page.locator('form')).toBeVisible();

  // Fill in credentials (from seed data)
  await page.fill('[name="email"]', 'admin@ceogala.test');
  await page.fill('[name="password"]', 'Admin123!');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for successful redirect to admin dashboard
  await page.waitForURL('/admin**');

  // Verify we're logged in
  await expect(page.locator('[data-testid="admin-header"], header, nav').first()).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: adminAuthFile });
});
