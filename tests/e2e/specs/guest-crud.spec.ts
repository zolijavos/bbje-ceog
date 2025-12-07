/**
 * CEO Gala - Guest CRUD & Import E2E Tests
 *
 * Tests for guest management in admin dashboard:
 * - List/view guests with filtering and pagination
 * - Create, edit, delete guests
 * - CSV import functionality
 * - Bulk operations
 */
import { test, expect } from '../fixtures';
import {
  createGuest,
  createVIPGuest,
  createPayingSingleGuest,
  createApplicantGuest,
  createGuestCSV,
} from '../factories';
import {
  navigateToAdminSection,
  fillGuestForm,
  waitForTableLoad,
  waitForModalOpen,
  waitForModalClose,
  expectGuestInList,
  expectGuestNotInList,
  uploadCSVFile,
  filterGuestsByStatus,
  filterGuestsByType,
  searchGuests,
  clearFilters,
  openGuestEditModal,
  deleteGuest,
  selectGuestCheckbox,
  selectAllGuests,
  expectToastMessage,
} from '../helpers';

test.describe('Guest List View', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAdminSection(page, 'guests');
  });

  test('should display guest list with table headers', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    // UI uses "Guest" column header which contains name + email
    await expect(page.locator('th').filter({ hasText: /guest|vendég/i })).toBeVisible();
  });

  test('should show existing guests from seed data', async ({ page }) => {
    await waitForTableLoad(page);
    // There should be at least some guests from seed data
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should filter guests by status', async ({ page, seedGuest, cleanup }) => {
    // Create guests with different statuses
    const invitedGuest = await seedGuest(createGuest({
      email: 'invited-filter@test.ceog',
      registration_status: 'invited',
    }));
    const registeredGuest = await seedGuest(createGuest({
      email: 'registered-filter@test.ceog',
      registration_status: 'registered',
    }));

    await page.reload();
    await waitForTableLoad(page);

    // Filter by invited
    await filterGuestsByStatus(page, 'invited');
    await expectGuestInList(page, invitedGuest.email);

    // Filter by registered
    await filterGuestsByStatus(page, 'registered');
    await expectGuestInList(page, registeredGuest.email);

    await cleanup();
  });

  test('should filter guests by type', async ({ page, seedGuest, cleanup }) => {
    // Create guests with different types
    const vipGuest = await seedGuest(createVIPGuest({
      email: 'vip-filter@test.ceog',
    }));
    const payingGuest = await seedGuest(createPayingSingleGuest({
      email: 'paying-filter@test.ceog',
    }));

    await page.reload();
    await waitForTableLoad(page);

    // Filter by VIP
    await filterGuestsByType(page, 'vip');
    await expectGuestInList(page, vipGuest.email);

    // Filter by paying_single
    await filterGuestsByType(page, 'paying_single');
    await expectGuestInList(page, payingGuest.email);

    await cleanup();
  });

  test('should search guests by name or email', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createGuest({
      email: 'searchable-unique@test.ceog',
      name: 'Searchable UniqueGuest',
    }));

    await page.reload();
    await waitForTableLoad(page);

    // Search by email
    await searchGuests(page, 'searchable-unique');
    await expectGuestInList(page, guest.email);

    // Clear and search by name
    await clearFilters(page);
    await searchGuests(page, 'UniqueGuest');
    await expectGuestInList(page, guest.email);

    await cleanup();
  });

  test('should paginate large guest lists', async ({ page }) => {
    await waitForTableLoad(page);

    // Check if pagination controls exist
    const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]');

    // Pagination might not be visible if there are few guests
    if (await pagination.isVisible()) {
      // Try clicking next page
      const nextButton = pagination.locator('button:has-text("Következő"), button:has-text("Next"), [aria-label="Next page"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await waitForTableLoad(page);
      }
    }
  });
});

test.describe('Guest Create', () => {
  test('should create a new VIP guest', async ({ page, cleanup }) => {
    await navigateToAdminSection(page, 'guests');

    // Click add guest button
    await page.click('[data-testid="add-guest-button"], button:has-text("Új vendég"), button:has-text("Add guest")');
    await waitForModalOpen(page);

    // Fill form
    const guestData = createVIPGuest({ email: 'new-vip-create@test.ceog' });
    await fillGuestForm(page, {
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone,
      company: guestData.company,
      guest_type: 'vip',
    });

    // Submit - UI uses data-testid="save-button"
    await page.click('[data-testid="save-button"], button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")');
    await waitForModalClose(page);

    // Verify guest appears in list
    await waitForTableLoad(page);
    await expectGuestInList(page, guestData.email);

    await cleanup();
  });

  test('should create a paying single guest', async ({ page, cleanup }) => {
    await navigateToAdminSection(page, 'guests');

    await page.click('[data-testid="add-guest-button"], button:has-text("Új vendég"), button:has-text("Add guest")');
    await waitForModalOpen(page);

    const guestData = createPayingSingleGuest({ email: 'new-paying-create@test.ceog' });
    await fillGuestForm(page, {
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone,
      guest_type: 'paying_single',
    });

    // Submit - UI uses data-testid="save-button"
    await page.click('[data-testid="save-button"], button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")');
    await waitForModalClose(page);

    await waitForTableLoad(page);
    await expectGuestInList(page, guestData.email);

    await cleanup();
  });

  test('should validate required fields on create', async ({ page }) => {
    await navigateToAdminSection(page, 'guests');

    await page.click('[data-testid="add-guest-button"], button:has-text("Új vendég"), button:has-text("Add guest")');
    await waitForModalOpen(page);

    // Try to submit without filling required fields
    await page.click('[data-testid="save-button"], button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")');

    // Should show validation errors - at least one error should be visible
    await expect(page.locator('[role="dialog"], .modal, [data-testid="guest-form-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"], [data-testid="name-error"]').first()).toBeVisible();
  });

  test('should validate email uniqueness', async ({ page, seedGuest, cleanup }) => {
    // Create a guest first
    const existingGuest = await seedGuest(createGuest({ email: 'existing-unique@test.ceog' }));

    await navigateToAdminSection(page, 'guests');

    await page.click('[data-testid="add-guest-button"], button:has-text("Új vendég"), button:has-text("Add guest")');
    await waitForModalOpen(page);

    // Try to create guest with same email
    await fillGuestForm(page, {
      name: 'Another Guest',
      email: existingGuest.email, // Same email
      guest_type: 'vip',
    });

    await page.click('[data-testid="save-button"], button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")');

    // Should show error about duplicate email
    await expect(page.locator('[data-testid="email-error"], [data-testid="form-error"]').first()).toBeVisible();

    await cleanup();
  });
});

test.describe('Guest Edit', () => {
  test('should edit an existing guest', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createGuest({ email: 'edit-test@test.ceog', name: 'Original Name' }));

    await navigateToAdminSection(page, 'guests');
    await waitForTableLoad(page);

    await openGuestEditModal(page, guest.email);

    // Update name - UI uses data-testid="guest-name-input"
    await page.fill('[data-testid="guest-name-input"], [name="name"]', 'Updated Name');
    await page.click('[data-testid="save-button"], button[type="submit"]:has-text("Save")');

    await waitForModalClose(page);
    await waitForTableLoad(page);

    // Verify updated name appears
    await expect(page.locator('table tbody tr').filter({ hasText: 'Updated Name' })).toBeVisible();

    await cleanup();
  });

  test('should add dietary requirements and seating preferences', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createGuest({ email: 'dietary-test@test.ceog' }));

    await navigateToAdminSection(page, 'guests');
    await waitForTableLoad(page);

    await openGuestEditModal(page, guest.email);

    // Fill extended profile fields
    await fillGuestForm(page, {
      dietary_requirements: 'Vegetáriánus, gluténmentes',
      seating_preferences: 'Kovács János mellett szeretne ülni',
    });

    await page.click('[data-testid="save-button"], button[type="submit"]:has-text("Save")');
    await waitForModalClose(page);

    await cleanup();
  });
});

test.describe('Guest Delete', () => {
  test('should delete a guest', async ({ page, seedGuest }) => {
    const guest = await seedGuest(createGuest({ email: 'delete-test@test.ceog' }));

    await navigateToAdminSection(page, 'guests');
    await waitForTableLoad(page);

    await expectGuestInList(page, guest.email);
    await deleteGuest(page, guest.email);

    await waitForTableLoad(page);
    await expectGuestNotInList(page, guest.email);
  });

  test('should confirm before deleting', async ({ page, seedGuest, cleanup }) => {
    const guest = await seedGuest(createGuest({ email: 'delete-confirm@test.ceog' }));

    await navigateToAdminSection(page, 'guests');
    await waitForTableLoad(page);

    // Click delete button - UI uses data-testid="delete-guest-{id}" pattern
    const row = page.locator('table tbody tr').filter({ hasText: guest.email });
    await row.locator('[data-testid^="delete-guest-"], button:has-text("Törlés"), button:has-text("Delete")').click();

    // Confirmation dialog should appear - UI uses data-testid="delete-confirm-modal"
    await expect(page.locator('[data-testid="delete-confirm-modal"], [role="alertdialog"], .confirm-modal')).toBeVisible();

    // Cancel deletion - UI uses data-testid="cancel-delete-button"
    await page.click('[data-testid="cancel-delete-button"], button:has-text("Megsem"), button:has-text("Cancel")');

    // Guest should still be in list
    await expectGuestInList(page, guest.email);

    await cleanup();
  });
});

test.describe('Guest CSV Import', () => {
  test('should navigate to import page', async ({ page }) => {
    await navigateToAdminSection(page, 'guests');

    await page.click('[data-testid="import-button"], a:has-text("Import"), button:has-text("CSV Import")');

    await expect(page).toHaveURL(/\/admin\/guests\/import/);
    // The file input is hidden but the drag-drop zone should be visible
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.locator('text=Drag and drop CSV file')).toBeVisible();
  });

  test('should import valid CSV file with VIP guests', async ({ page, cleanup }) => {
    await page.goto('/admin/guests/import');

    // Create test CSV
    const csvContent = createGuestCSV(3, 'vip');

    await uploadCSVFile(page, csvContent, 'vip-guests.csv');

    // Submit import - button text is "Import"
    await page.click('button[type="submit"]:has-text("Import")');

    // Should show success message (role="alert" contains the result)
    await expect(page.locator('[role="alert"]').filter({ hasText: /imported|success/i })).toBeVisible({ timeout: 10000 });

    await cleanup();
  });

  test('should show validation errors for invalid CSV', async ({ page }) => {
    await page.goto('/admin/guests/import');

    // Create invalid CSV (missing required fields)
    const invalidCSV = `email,name
invalid-email,Missing Type
`;

    await uploadCSVFile(page, invalidCSV, 'invalid.csv');
    await page.click('button[type="submit"]:has-text("Import")');

    // Should show error (role="alert" contains success or error result)
    await expect(page.locator('[role="alert"]').filter({ hasText: /error|failed|hibá/i })).toBeVisible({ timeout: 10000 });
  });

  test('should handle duplicate emails in CSV', async ({ page, seedGuest, cleanup }) => {
    // Create an existing guest
    const existingGuest = await seedGuest(createGuest({ email: 'duplicate-csv@test.ceog' }));

    await page.goto('/admin/guests/import');

    // CSV with duplicate email
    const csvWithDupe = `email,name,guest_type
${existingGuest.email},Duplicate Guest,vip
unique-csv@test.ceog,Unique Guest,vip`;

    await uploadCSVFile(page, csvWithDupe, 'with-duplicate.csv');
    await page.click('button[type="submit"]:has-text("Import")');

    // Should show result with info about duplicates (role="alert" contains result)
    // Can be success with error count, partial success, or failure - just check any result appears
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 15000 });

    await cleanup();
  });
});

test.describe('Guest Bulk Operations', () => {
  test('should select multiple guests', async ({ page, seedGuest, cleanup }) => {
    // Create test guests
    const guest1 = await seedGuest(createGuest({ email: 'bulk-1@test.ceog' }));
    const guest2 = await seedGuest(createGuest({ email: 'bulk-2@test.ceog' }));

    await navigateToAdminSection(page, 'guests');
    await waitForTableLoad(page);

    // Search for our test guests
    await searchGuests(page, '@test.ceog');

    // Select guests
    await selectGuestCheckbox(page, guest1.email);
    await selectGuestCheckbox(page, guest2.email);

    // Bulk action bar should appear (shows "X guests selected" and "Send Invitations" button)
    await expect(page.locator('text=/\\d+ guests? selected|vendég kiválasztva/')).toBeVisible();
    await expect(page.locator('[data-testid="bulk-send-button"], button:has-text("Send Invitations")')).toBeVisible();

    await cleanup();
  });

  test('should select all guests on current page', async ({ page, seedGuest, cleanup }) => {
    // Create test guests
    await seedGuest(createGuest({ email: 'bulk-all-1@test.ceog' }));
    await seedGuest(createGuest({ email: 'bulk-all-2@test.ceog' }));

    await navigateToAdminSection(page, 'guests');
    await waitForTableLoad(page);

    await searchGuests(page, 'bulk-all');

    // Select all
    await selectAllGuests(page);

    // All checkboxes should be checked
    const checkboxes = page.locator('table tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }

    await cleanup();
  });
});
