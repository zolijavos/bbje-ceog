/**
 * CEO Gala - Test Helpers
 *
 * Pure functions for common test operations.
 * These are framework-agnostic and can be unit tested independently.
 */
import { Page, expect } from '@playwright/test';

// ============================================
// NAVIGATION HELPERS
// ============================================

export async function navigateToAdminSection(page: Page, section: string) {
  const sectionUrls: Record<string, string> = {
    guests: '/admin/guests',
    tables: '/admin/tables',
    seating: '/admin/seating',
    checkin: '/admin/checkin-log',
    applicants: '/admin/applicants',
    statistics: '/admin/statistics',
    'email-templates': '/admin/email-templates',
  };

  const url = sectionUrls[section];
  if (!url) {
    throw new Error(`Unknown admin section: ${section}`);
  }

  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

// ============================================
// FORM HELPERS
// ============================================

export async function fillGuestForm(page: Page, data: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  title?: string;
  guest_type?: string;
  dietary_requirements?: string;
  seating_preferences?: string;
}) {
  // UI uses data-testid="guest-{field}-input" pattern for GuestFormModal
  if (data.name) {
    await page.fill('[data-testid="guest-name-input"], [name="name"]', data.name);
  }
  if (data.email) {
    await page.fill('[data-testid="guest-email-input"], [name="email"]', data.email);
  }
  if (data.phone) {
    // Phone field might not exist in current GuestFormModal
    const phoneInput = page.locator('[name="phone"], [data-testid="phone-input"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(data.phone);
    }
  }
  if (data.company) {
    // Company field might not exist in current GuestFormModal
    const companyInput = page.locator('[name="company"], [data-testid="company-input"]');
    if (await companyInput.isVisible()) {
      await companyInput.fill(data.company);
    }
  }
  if (data.position) {
    // Position field might not exist in current GuestFormModal
    const positionInput = page.locator('[name="position"], [data-testid="position-input"]');
    if (await positionInput.isVisible()) {
      await positionInput.fill(data.position);
    }
  }
  if (data.title) {
    await page.fill('[data-testid="guest-title-input"], [name="title"]', data.title);
  }
  if (data.guest_type) {
    await page.selectOption('[data-testid="guest-type-select"], [name="guest_type"]', data.guest_type);
  }
  if (data.dietary_requirements) {
    await page.fill('[data-testid="dietary-input"], [name="dietary_requirements"]', data.dietary_requirements);
  }
  if (data.seating_preferences) {
    await page.fill('[data-testid="seating-input"], [name="seating_preferences"]', data.seating_preferences);
  }
}

export async function fillBillingForm(page: Page, data: {
  billing_name?: string;
  company_name?: string;
  tax_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}) {
  if (data.billing_name) {
    await page.fill('[name="billing_name"], [data-testid="billing-name-input"]', data.billing_name);
  }
  if (data.company_name) {
    await page.fill('[name="company_name"], [data-testid="company-name-input"]', data.company_name);
  }
  if (data.tax_number) {
    await page.fill('[name="tax_number"], [data-testid="tax-number-input"]', data.tax_number);
  }
  if (data.address_line1) {
    await page.fill('[name="address_line1"], [data-testid="address-line1-input"]', data.address_line1);
  }
  if (data.address_line2) {
    await page.fill('[name="address_line2"], [data-testid="address-line2-input"]', data.address_line2);
  }
  if (data.city) {
    await page.fill('[name="city"], [data-testid="city-input"]', data.city);
  }
  if (data.postal_code) {
    await page.fill('[name="postal_code"], [data-testid="postal-code-input"]', data.postal_code);
  }
  if (data.country) {
    await page.selectOption('[name="country"], [data-testid="country-select"]', data.country);
  }
}

export async function fillTableForm(page: Page, data: {
  name?: string;
  capacity?: number;
  type?: string;
}) {
  if (data.name) {
    await page.fill('[name="name"], [data-testid="table-name-input"]', data.name);
  }
  if (data.capacity) {
    await page.fill('[name="capacity"], [data-testid="capacity-input"]', data.capacity.toString());
  }
  if (data.type) {
    await page.selectOption('[name="type"], [data-testid="table-type-select"]', data.type);
  }
}

// ============================================
// ASSERTION HELPERS
// ============================================

export async function expectToastMessage(page: Page, message: string, type: 'success' | 'error' = 'success') {
  const toastSelector = type === 'success'
    ? '[data-testid="toast-success"], .toast-success, [role="status"]'
    : '[data-testid="toast-error"], .toast-error, [role="alert"]';

  await expect(page.locator(toastSelector).filter({ hasText: message })).toBeVisible({ timeout: 5000 });
}

export async function expectTableRowWithText(page: Page, text: string) {
  await expect(page.locator('table tbody tr').filter({ hasText: text })).toBeVisible();
}

export async function expectTableRowCount(page: Page, count: number) {
  await expect(page.locator('table tbody tr')).toHaveCount(count);
}

export async function expectGuestInList(page: Page, email: string) {
  await expect(page.locator('table tbody tr').filter({ hasText: email })).toBeVisible();
}

export async function expectGuestNotInList(page: Page, email: string) {
  await expect(page.locator('table tbody tr').filter({ hasText: email })).not.toBeVisible();
}

// ============================================
// WAIT HELPERS
// ============================================

export async function waitForTableLoad(page: Page) {
  // Wait for loading state to disappear and table to be visible
  await page.waitForSelector('table tbody', { state: 'visible' });
  await page.waitForLoadState('networkidle');
}

export async function waitForModalOpen(page: Page) {
  // Wait for any modal-like element (fixed overlay, dialog role, or modal class)
  // Includes GuestFormModal (data-testid="guest-form-modal"), DeleteConfirmModal (data-testid="delete-confirm-modal")
  // and TablesDashboard inline modal (fixed.inset-0 with bg-black)
  await page.waitForSelector('[role="dialog"], .modal, [data-testid="modal"], [data-testid="guest-form-modal"], [data-testid="delete-confirm-modal"], .fixed.inset-0.bg-black, div.fixed.bg-black\\/50', { state: 'visible' });
}

export async function waitForModalClose(page: Page) {
  // Wait for any modal to close
  await page.waitForSelector('[role="dialog"], .modal, [data-testid="modal"], [data-testid="guest-form-modal"], [data-testid="delete-confirm-modal"], div.fixed.bg-black\\/50', { state: 'hidden' });
}

// ============================================
// FILE UPLOAD HELPERS
// ============================================

export async function uploadCSVFile(page: Page, content: string, filename: string = 'test.csv') {
  const fileInput = page.locator('input[type="file"]');

  // Create a buffer from the CSV content
  const buffer = Buffer.from(content);

  await fileInput.setInputFiles({
    name: filename,
    mimeType: 'text/csv',
    buffer,
  });
}

// ============================================
// ADMIN DASHBOARD HELPERS
// ============================================

export async function openGuestEditModal(page: Page, email: string) {
  const row = page.locator('table tbody tr').filter({ hasText: email });
  // UI uses data-testid="edit-guest-{id}" pattern
  await row.locator('[data-testid^="edit-guest-"], button:has-text("Szerkesztés"), button:has-text("Edit")').click();
  await waitForModalOpen(page);
}

export async function deleteGuest(page: Page, email: string) {
  const row = page.locator('table tbody tr').filter({ hasText: email });
  // UI uses data-testid="delete-guest-{id}" pattern
  await row.locator('[data-testid^="delete-guest-"], button:has-text("Törlés"), button:has-text("Delete")').click();

  // Confirm deletion - UI uses data-testid="confirm-delete-button"
  await page.locator('[data-testid="confirm-delete-button"], button:has-text("Torles"), button:has-text("Confirm")').click();
}

export async function selectGuestCheckbox(page: Page, email: string) {
  const row = page.locator('table tbody tr').filter({ hasText: email });
  await row.locator('input[type="checkbox"]').check();
}

export async function selectAllGuests(page: Page) {
  await page.locator('table thead input[type="checkbox"]').check();
}

// ============================================
// CHECK-IN HELPERS
// ============================================

export async function simulateQRScan(page: Page, qrData: string) {
  // This simulates the result of a QR scan by calling the validation API
  // In real tests, we'd mock the QR scanner or use the MCP browser to interact with it
  await page.evaluate((data) => {
    // Dispatch a custom event that the scanner component listens for
    const event = new CustomEvent('qr-scan-result', { detail: { data } });
    document.dispatchEvent(event);
  }, qrData);
}

// ============================================
// SEATING MAP HELPERS
// ============================================

export async function dragGuestToTable(page: Page, guestName: string, tableName: string) {
  const guest = page.locator('[data-testid="guest-chip"], .guest-chip').filter({ hasText: guestName });
  const table = page.locator('[data-testid="table-drop-zone"], .table-drop-zone').filter({ hasText: tableName });

  await guest.dragTo(table);
}

export async function removeGuestFromTable(page: Page, guestName: string) {
  const guest = page.locator('[data-testid="seated-guest"], .seated-guest').filter({ hasText: guestName });
  await guest.locator('[data-testid="remove-button"], button:has-text("×")').click();
}

// ============================================
// PWA HELPERS
// ============================================

export async function loginToPWA(page: Page, authCode: string) {
  await page.goto('/pwa');
  await page.fill('[name="code"], [data-testid="auth-code-input"]', authCode);
  await page.click('button[type="submit"]');
  await page.waitForURL('/pwa/dashboard');
}

export async function expectPWATicketVisible(page: Page) {
  await page.goto('/pwa/ticket');
  await expect(page.locator('[data-testid="qr-code"], .qr-code, canvas')).toBeVisible();
}

// ============================================
// FILTER HELPERS
// ============================================

export async function filterGuestsByStatus(page: Page, status: string) {
  await page.selectOption('[data-testid="status-filter"], [name="status"]', status);
  await waitForTableLoad(page);
}

export async function filterGuestsByType(page: Page, type: string) {
  await page.selectOption('[data-testid="type-filter"], [name="guest_type"]', type);
  await waitForTableLoad(page);
}

export async function searchGuests(page: Page, query: string) {
  await page.fill('[data-testid="search-input"], [name="search"]', query);
  // Wait for debounced search
  await page.waitForTimeout(500);
  await waitForTableLoad(page);
}

export async function clearFilters(page: Page) {
  const clearButton = page.locator('[data-testid="clear-filters"], button:has-text("Szűrők törlése"), button:has-text("Clear")');
  if (await clearButton.isVisible()) {
    await clearButton.click();
    await waitForTableLoad(page);
  }
}
