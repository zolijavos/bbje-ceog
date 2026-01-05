/**
 * CEO Gala - Authentication Setup
 *
 * This setup project runs before all tests to authenticate the admin user
 * and save the session state for reuse in subsequent tests.
 */
import { test as setup, expect } from '@playwright/test';

const adminAuthFile = 'tests/e2e/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Navigate to admin login page with wait for network idle
  await page.goto('/admin/login', { waitUntil: 'networkidle' });

  // Wait for React hydration - wait for the form element which appears after hydration
  // The login form is a client component inside Suspense, so we need to wait for JS execution
  await page.waitForLoadState('domcontentloaded');

  // Wait for any spinners to disappear
  const spinner = page.locator('.spinner');
  if (await spinner.count() > 0) {
    await spinner.first().waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {});
  }

  // Wait for the form to be present (confirms client-side rendering completed)
  await page.waitForSelector('form', { timeout: 20000 });

  // Use role-based locators for better reliability
  const emailInput = page.locator('input[type="email"], input[name="email"], #email').first();
  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await expect(emailInput).toBeEnabled({ timeout: 5000 });

  // Fill in credentials (from seed data)
  await emailInput.fill('admin@ceogala.test');
  await page.locator('input[type="password"], input[name="password"], #password').first().fill('Admin123!');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for successful redirect to admin dashboard
  await page.waitForURL('/admin**', { timeout: 30000 });

  // Verify we're logged in
  await expect(page.locator('[data-testid="admin-header"], header, nav').first()).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: adminAuthFile });
});
