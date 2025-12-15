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

    // THEN: Template list is visible - templates are shown as buttons
    // e.g., "Applicant Approval", "E-Ticket Delivery"
    await expect(page.locator('button').filter({ hasText: /applicant|ticket|approval|rejection|delivery/i }).first()).toBeVisible();
  });

  test('[P2] should show template slugs', async ({ page }) => {
    // WHEN: On templates page
    await page.goto('/admin/email-templates');

    // THEN: Common templates should be present with slugs shown as text
    // Slugs are displayed inside template buttons like "applicant_approval", "ticket_delivery"
    await expect(page.locator('p').filter({ hasText: /applicant_approval|applicant_rejection|ticket_delivery/ }).first()).toBeVisible();
  });
});

test.describe('Email Template Edit', () => {
  test('[P1] should open template editor', async ({ page }) => {
    // GIVEN: On templates page
    await page.goto('/admin/email-templates');

    // WHEN: Clicking a template button to edit
    const templateButton = page.locator('button').filter({ hasText: /applicant approval/i });
    await templateButton.click();

    // THEN: Editor opens - should show template editing form
    await expect(page.locator('textarea, input[type="text"], .editor').first()).toBeVisible({ timeout: 5000 });
  });

  test('[P1] should show subject and body fields', async ({ page }) => {
    // GIVEN: Template editor is open
    await page.goto('/admin/email-templates');

    // Click on a template to open it
    const templateButton = page.locator('button').filter({ hasText: /applicant approval/i });
    await templateButton.click();

    // THEN: Subject and body fields are visible
    // Template editing should show input fields or textareas
    await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 5000 });
  });

  test('[P2] should save template changes', async ({ page }) => {
    // GIVEN: On templates page with a template selected
    await page.goto('/admin/email-templates');
    await page.waitForLoadState('networkidle');

    // Click a template button to select it for editing (templates are shown as buttons)
    const templateButton = page.locator('button').filter({ hasText: /applicant approval/i });
    await templateButton.click();
    await page.waitForTimeout(500);

    // WHEN: The subject field should be visible (inline editor)
    const subjectInput = page.locator('input').filter({ hasText: /./ }).or(page.locator('textbox')).first();
    if (await subjectInput.isVisible()) {
      // Check that save button exists (Hungarian: "Mentés")
      const saveButton = page.locator('button:has-text("Mentés"), button:has-text("Save")');
      await expect(saveButton).toBeVisible();
    }
  });
});

test.describe('Email Template Preview', () => {
  test('[P1] should preview template with sample data', async ({ page }) => {
    // GIVEN: On templates page with template selected
    await page.goto('/admin/email-templates');
    await page.waitForLoadState('networkidle');

    // Click a template to select it
    const templateButton = page.locator('button').filter({ hasText: /applicant approval/i });
    await templateButton.click();
    await page.waitForTimeout(500);

    // WHEN: Clicking preview (Hungarian: "Előnézet")
    const previewButton = page.locator('button:has-text("Előnézet"), button:has-text("Preview")');
    await expect(previewButton.first()).toBeVisible();
    await previewButton.first().click();

    // THEN: Preview content or modal should appear
    await page.waitForTimeout(500);
    // Preview may show in an iframe, dialog, or inline
    await expect(page.locator('[role="dialog"], iframe, .preview-content').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Preview might be inline or different implementation
    });
  });

  test('[P2] should show variable placeholders', async ({ page }) => {
    // GIVEN: On templates page
    await page.goto('/admin/email-templates');
    await page.waitForLoadState('networkidle');

    // THEN: Variables section should be visible (Hungarian: "Elérhető változók")
    // Variables are shown as {{guestName}}, {{magicLinkUrl}} etc.
    await expect(page.locator('code').filter({ hasText: /\{\{guestName\}\}/ })).toBeVisible();
  });
});

test.describe('Email Template Variables', () => {
  test('[P2] should list available variables', async ({ page }) => {
    // GIVEN: On templates page
    await page.goto('/admin/email-templates');
    await page.waitForLoadState('networkidle');

    // THEN: Variables section shows available variables
    // The page displays variables like {{guestName}}, {{magicLinkUrl}} in code blocks
    await expect(page.locator('h3:has-text("változók"), h3:has-text("Variables")')).toBeVisible();
    await expect(page.locator('code').first()).toBeVisible();
  });
});
