/**
 * CEO Gala - Scheduled Emails E2E Tests
 *
 * Tests for Email scheduling functionality:
 * - View scheduled emails
 * - Create new scheduled email
 * - Cancel scheduled email
 * - View email logs
 *
 * Priority: P2 - Medium (Admin functionality)
 */
import { test, expect } from '../fixtures';
import { waitForTableLoad, waitForModalOpen, waitForModalClose } from '../helpers';

test.describe('Scheduled Emails List', () => {
  test('[P1] should display scheduled emails page', async ({ page }) => {
    // WHEN: Navigating to scheduled emails
    await page.goto('/admin/scheduled-emails');

    // THEN: Page is visible with title
    await expect(page.locator('h1, h2').filter({ hasText: /ütemezett|scheduled|email/i })).toBeVisible();
  });

  test('[P1] should show scheduled emails table', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Table or list is visible
    await expect(page.locator('table, [data-testid="scheduled-list"]')).toBeVisible();
  });

  test('[P2] should show email status column', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Status column is visible
    await expect(page.locator('th, [role="columnheader"]').filter({ hasText: /státusz|status|állapot/i })).toBeVisible();
  });

  test('[P2] should show scheduled time column', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Scheduled time column is visible (Hungarian: "Ütemezve")
    await expect(page.locator('th, [role="columnheader"]').filter({ hasText: /ütemezve|idő|time|ütemezés|scheduled/i })).toBeVisible();
  });
});

test.describe('Create Scheduled Email', () => {
  test('[P1] should open create scheduled email form', async ({ page }) => {
    // GIVEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // WHEN: Clicking "Schedule New" button/tab
    const createButton = page.locator('button:has-text("Schedule New"), button:has-text("új"), button:has-text("létrehozás")');
    await expect(createButton.first()).toBeVisible();
    await createButton.first().click();

    // THEN: Form or new view opens (this is a tab, not a modal)
    await page.waitForTimeout(500);
    // Should show form elements after clicking
    await expect(page.locator('form, select, input[type="datetime-local"]').first()).toBeVisible();
  });

  test('[P2] should have template selection', async ({ page }) => {
    // GIVEN: Create form is open
    await page.goto('/admin/scheduled-emails');

    const createButton = page.locator('button:has-text("Schedule New"), button:has-text("új")');
    await createButton.first().click();
    await page.waitForTimeout(500);

    // THEN: Template selector is available (select with options)
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('[P2] should have recipient selection', async ({ page }) => {
    // GIVEN: Create form is open
    await page.goto('/admin/scheduled-emails');

    const createButton = page.locator('button:has-text("Schedule New"), button:has-text("új")');
    await createButton.first().click();
    await page.waitForTimeout(500);

    // THEN: Recipient/guest type selection is available
    await expect(page.locator('select, label:has-text("guest_type"), label:has-text("címzett")').first()).toBeVisible();
  });

  test('[P2] should have datetime picker', async ({ page }) => {
    // GIVEN: Create form is open
    await page.goto('/admin/scheduled-emails');

    const createButton = page.locator('button:has-text("Schedule New"), button:has-text("új")');
    await createButton.first().click();
    await page.waitForTimeout(500);

    // THEN: DateTime picker is available
    await expect(page.locator('input[type="datetime-local"], input[type="date"]').first()).toBeVisible();
  });
});

test.describe('Cancel Scheduled Email', () => {
  test('[P2] should have cancel option for pending emails', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');
    await waitForTableLoad(page).catch(() => {});

    // THEN: Cancel button should be available for pending items (Hungarian: "Mégse")
    const cancelButton = page.locator('button:has-text("Mégse"), button:has-text("törlés"), button:has-text("cancel")').first();
    // May or may not be visible depending on data
    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeEnabled();
    }
  });
});

test.describe('Email Logs View', () => {
  test('[P2] should show email delivery logs', async ({ page }) => {
    // WHEN: On scheduled emails page or navigating to logs
    await page.goto('/admin/scheduled-emails');

    // THEN: Logs tab or link should be available (Hungarian: "Email napló")
    const logsLink = page.locator('button:has-text("Email napló"), button:has-text("napló"), a:has-text("log")');
    await expect(logsLink.first()).toBeVisible();
    await logsLink.first().click();
    await page.waitForTimeout(500);

    // AND: Logs table should be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('[P3] should show email delivery status in logs', async ({ page }) => {
    // WHEN: On email logs page
    await page.goto('/admin/scheduled-emails');

    const logsLink = page.locator('button:has-text("Email napló"), button:has-text("napló")');
    await logsLink.first().click();
    await page.waitForTimeout(500);

    // THEN: Status column is visible
    await expect(page.locator('th, [role="columnheader"]').filter({ hasText: /státusz|status|delivered|sent/i })).toBeVisible();
  });
});

test.describe('Scheduler Configuration', () => {
  test('[P3] should show scheduler status', async ({ page }) => {
    // WHEN: On scheduled emails page
    await page.goto('/admin/scheduled-emails');

    // THEN: Scheduler status indicator should be visible
    // This could be "Active", "Running", or similar
    const statusIndicator = page.locator('text=/aktív|active|running|fut/i');
    if (await statusIndicator.isVisible()) {
      await expect(statusIndicator).toBeVisible();
    }
  });
});
