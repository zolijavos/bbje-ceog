// Script to remove link-fallback sections from all email templates in database
// Usage: npx tsx scripts/remove-link-fallback-from-templates.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('Removing link-fallback from email templates...');
  console.log('===============================================');
  console.log('');

  const templates = await prisma.emailTemplate.findMany();

  if (templates.length === 0) {
    console.log('No email templates found in database.');
    return;
  }

  let updatedCount = 0;

  for (const template of templates) {
    let htmlBody = template.html_body;
    let modified = false;

    // Remove link-fallback div pattern
    const divPattern = /<div class="link-fallback">[\s\S]*?<\/div>/gi;
    if (divPattern.test(htmlBody)) {
      htmlBody = htmlBody.replace(divPattern, '');
      modified = true;
    }

    // Remove link-fallback p pattern
    const pPattern = /<p class="link-fallback">[\s\S]*?<\/p>/gi;
    if (pPattern.test(htmlBody)) {
      htmlBody = htmlBody.replace(pPattern, '');
      modified = true;
    }

    // Remove .link-fallback CSS rule
    const cssPattern = /\s*\.link-fallback\s*\{[^}]*\}/gi;
    if (cssPattern.test(htmlBody)) {
      htmlBody = htmlBody.replace(cssPattern, '');
      modified = true;
    }

    if (modified) {
      await prisma.emailTemplate.update({
        where: { id: template.id },
        data: { html_body: htmlBody },
      });
      console.log(`Updated: ${template.slug} (${template.subject})`);
      updatedCount++;
    } else {
      console.log(`Skipped (no changes): ${template.slug}`);
    }
  }

  console.log('');
  console.log(`Done. Updated ${updatedCount} template(s).`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
