import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3003';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();

// Helper to take screenshot
async function screenshot(name) {
  await page.screenshot({
    path: `./screenshots/${name}.png`,
    fullPage: true
  });
  console.log(`Screenshot saved: ${name}.png`);
}

// 1. Login first
console.log('Logging in...');
await page.goto(`${baseUrl}/admin/login`);
await page.waitForLoadState('networkidle');
await page.fill('input[name="email"]', 'admin@ceogala.test');
await page.fill('input[name="password"]', 'Admin123!');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

// 2. Get a paying guest's magic link hash from database
// We'll use the test data - find a paying guest
console.log('Going to guest list to get magic link...');
await page.goto(`${baseUrl}/admin/guests`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Find paying guest in the list
const payingGuestRow = page.locator('tr:has-text("paying")').first();
if (await payingGuestRow.isVisible()) {
  // Click to get details - but we need the guest ID
  console.log('Found paying guest row');
}

// 3. Simulate a paying guest registration flow
// First, let's create a test scenario - go to register page with a test paying guest
// We need to use an existing magic link - let's check the database
console.log('\n--- REGISTRATION FLOW SCREENSHOTS ---\n');

// Since we can't easily get magic link, let's screenshot what we can:

// Screenshot: Payment Success page (after Stripe redirect)
console.log('Taking payment success page screenshot...');
await page.goto(`${baseUrl}/payment/success`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
await screenshot('payment-success');

// Screenshot: Payment Cancel page
console.log('Taking payment cancel page screenshot...');
await page.goto(`${baseUrl}/payment/cancel`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
await screenshot('payment-cancel');

// Screenshot: Guest Status page (shows payment status)
console.log('Taking guest status page screenshot...');
await page.goto(`${baseUrl}/status`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000);
await screenshot('guest-status-page');

// Screenshot: Admin Guest List (shows payment statuses)
console.log('Taking admin guest list screenshot...');
await page.goto(`${baseUrl}/admin/guests`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('admin-guest-list-payments');

// Now let's try to access a registration page directly with real test data
console.log('\n--- REGISTRATION FORM SCREENSHOTS ---\n');

// Use real magic link from database (manual-test-paid@example.com, guest ID 202)
const realHash = 'eb1cbda0f3753d8e1d15cb5e48c1b5897cc592f9142dd8b2c1bda0d4d3f8adcb';
const realEmail = 'manual-test-paid@example.com';

await page.goto(`${baseUrl}/register?code=${realHash}&email=${encodeURIComponent(realEmail)}`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('register-landing-page-real');

// Check if we got redirected to the paid form
const currentUrl = page.url();
console.log('Current URL after magic link:', currentUrl);

if (currentUrl.includes('/register/paid')) {
  await screenshot('paid-registration-form-step1');

  // Click "Tovább" to go to step 2 (profile)
  const nextButton = page.getByTestId('next-button');
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForTimeout(1000);
    await screenshot('paid-registration-form-step2-profile');

    // Click "Tovább" to go to step 3 (billing)
    await nextButton.click();
    await page.waitForTimeout(1000);
    await screenshot('paid-registration-form-step3-billing');
  }
}

// Also try a registered paying guest for success page with payment button
// First find one
await page.goto(`${baseUrl}/admin/guests`);
await page.waitForLoadState('networkidle');

// Use paying guest who is already registered (Kiss Anna, ID 102, has registration)
await page.goto(`${baseUrl}/register/success?guest_id=102&type=paid`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('register-success-with-payment-button');

// Also try paired guest (Molnár László, ID 104)
await page.goto(`${baseUrl}/register/success?guest_id=104&type=paid`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('register-success-paired-ticket');

console.log('\n✅ All screenshots completed!');
console.log('Check the screenshots/ folder for the images.');

await browser.close();
