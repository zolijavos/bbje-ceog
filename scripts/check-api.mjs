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

// Go to dashboard to have proper session
await page.goto(`${baseUrl}/admin`);
await page.waitForLoadState('networkidle');

// Now fetch API
const response = await page.evaluate(async () => {
  const res = await fetch('/api/admin/tables');
  return res.json();
});

// Log assignments with paired_with_id info
console.log('Tables with assignments:');
for (const table of response.tables || []) {
  if (table.assignments && table.assignments.length > 0) {
    console.log(`\nTable: ${table.name} (${table.assignments.length} assignments)`);
    for (const a of table.assignments) {
      console.log(`  - ${a.guest.name} | type: ${a.guest.guest_type} | paired_with_id: ${a.guest.paired_with_id}`);
    }
  }
}

await browser.close();
