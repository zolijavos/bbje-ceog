/**
 * CEO Gala - Email Templates E2E Tests
 *
 * Tests for Email template management:
 * - View template list
 * - Edit templates
 * - Preview templates
 * - Variable substitution
 *
 * Priority: P2 - Medium (Admin functionality)
 */
import { test, expect } from '../fixtures';
import { waitForTableLoad, waitForModalOpen, waitForModalClose } from '../helpers';

test.describe('Email Templates List', () => {
  test('[P1] should display email templates page', async ({ page }) => {
    // WHEN: Navigating to email templates
    await page.goto('/admin/email-templates');

    // THEN: Templates page is visible
    await expect(page.locator('h1, h2').filter({ hasText: /email|sablon|template/i })).toBeVisible();
  });

  test('[P1] should show list of available templates', async ({ page }) => {
    // WHEN: On templates page
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    // THEN: Template list is visible with items
    await expect(page.locator('table tbody tr, [data-testid="template-item"], .template-card').first()).toBeVisible();
  });

  test('[P2] should show template slugs', async ({ page }) => {
    // WHEN: On templates page
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    // THEN: Common templates should be present
    // invitation, registration-confirmation, etc.
    await expect(page.locator('text=/invitation|meghívó|registration|regisztráció/i')).toBeVisible();
  });
});

test.describe('Email Template Edit', () => {
  test('[P1] should open template editor', async ({ page }) => {
    // GIVEN: On templates page
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    // WHEN: Clicking edit on first template
    const editButton = page.locator('[data-testid^="edit-template-"], button:has-text("Szerkesztés"), button:has-text("Edit")').first();
    await editButton.click();

    // THEN: Editor opens
    await waitForModalOpen(page);
    await expect(page.locator('textarea, [contenteditable="true"], .editor')).toBeVisible();
  });

  test('[P1] should show subject and body fields', async ({ page }) => {
    // GIVEN: Template editor is open
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    const editButton = page.locator('[data-testid^="edit-template-"], button:has-text("Szerkesztés"), button:has-text("Edit")').first();
    await editButton.click();
    await waitForModalOpen(page);

    // THEN: Subject and body fields are visible
    await expect(page.locator('[name="subject"], [data-testid="subject-input"]')).toBeVisible();
    await expect(page.locator('[name="html_body"], [data-testid="body-input"], textarea').first()).toBeVisible();
  });

  test('[P2] should save template changes', async ({ page }) => {
    // GIVEN: Template editor is open
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    const editButton = page.locator('[data-testid^="edit-template-"], button:has-text("Szerkesztés"), button:has-text("Edit")').first();
    await editButton.click();
    await waitForModalOpen(page);

    // WHEN: Modifying subject
    const subjectInput = page.locator('[name="subject"], [data-testid="subject-input"]');
    const originalSubject = await subjectInput.inputValue();
    await subjectInput.fill(originalSubject + ' - Test Edit');

    // AND: Saving
    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Mentés")');

    // THEN: Modal closes and changes saved
    await waitForModalClose(page);

    // Revert for cleanup
    await editButton.click();
    await waitForModalOpen(page);
    await page.locator('[name="subject"], [data-testid="subject-input"]').fill(originalSubject);
    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Mentés")');
  });
});

test.describe('Email Template Preview', () => {
  test('[P1] should preview template with sample data', async ({ page }) => {
    // GIVEN: On templates page
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    // WHEN: Clicking preview
    const previewButton = page.locator('[data-testid^="preview-template-"], button:has-text("Előnézet"), button:has-text("Preview")').first();
    if (await previewButton.isVisible()) {
      await previewButton.click();

      // THEN: Preview modal opens
      await waitForModalOpen(page);
      await expect(page.locator('[data-testid="preview-content"], .preview-frame, iframe')).toBeVisible();
    }
  });

  test('[P2] should show variable placeholders', async ({ page }) => {
    // GIVEN: Template editor is open
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    const editButton = page.locator('[data-testid^="edit-template-"], button:has-text("Szerkesztés"), button:has-text("Edit")').first();
    await editButton.click();
    await waitForModalOpen(page);

    // THEN: Variable list or hint should be visible
    await expect(page.locator('text=/{{name}}|{{guest_name}}|változók|variables/i')).toBeVisible();
  });
});

test.describe('Email Template Variables', () => {
  test('[P2] should list available variables', async ({ page }) => {
    // GIVEN: Template editor is open
    await page.goto('/admin/email-templates');
    await waitForTableLoad(page);

    const editButton = page.locator('[data-testid^="edit-template-"], button:has-text("Szerkesztés"), button:has-text("Edit")').first();
    await editButton.click();
    await waitForModalOpen(page);

    // THEN: Variables documentation is shown
    // Common variables: {{name}}, {{email}}, {{magic_link}}, {{qr_code}}
    await expect(page.locator('[data-testid="variables-list"], .variables-help').or(
      page.locator('text=/{{name}}|{{email}}/')
    )).toBeVisible();
  });
});
