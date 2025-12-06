import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'http://localhost:3003';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// Login first
await page.goto(`${baseUrl}/admin/login`);
await page.waitForLoadState('networkidle');
await page.fill('input[name="email"]', 'admin@ceogala.test');
await page.fill('input[name="password"]', 'Admin123!');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

// Go to dashboard
await page.goto(`${baseUrl}/admin`);
await page.waitForLoadState('networkidle');

// Fetch tables API
const response = await page.evaluate(async () => {
  const res = await fetch('/api/admin/tables');
  return res.json();
});

// Analyze Standard Table 3 and VIP Table 2
for (const table of response.tables || []) {
  if (table.name === 'Standard Table 3' || table.name === 'VIP Table 2') {
    console.log('\n=== ' + table.name + ' ===');
    console.log('Assignments count: ' + table.assignments.length);
    for (const a of table.assignments) {
      console.log('  Guest: ' + a.guest.name);
      console.log('    - id: ' + a.guest.id);
      console.log('    - guest_type: ' + a.guest.guest_type);
      console.log('    - paired_with_id: ' + a.guest.paired_with_id);
      console.log('    - partner_of: ' + (a.guest.partner_of ? a.guest.partner_of.name : 'null'));
      console.log('    - registration partner_name: ' + (a.guest.registration ? a.guest.registration.partner_name : 'null'));
    }
  }
}

await browser.close();
