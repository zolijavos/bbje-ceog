/**
 * Clear non-meaningful dietary_requirements values from Guest records.
 *
 * Run: node scripts/clear-dietary-noise.js
 * Dry run: node scripts/clear-dietary-noise.js --dry
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CLEAR_VALUES = new Set([
  'n.a.', 'n/a', 'N/A',
  'No', 'no',
  'no allergies', 'No allergies', 'No allergies.',
  'No mushroom',
  'No Pork + No Alcohol', 'No pork, no alcohol',
  'No pork, no alcohol', 'Pork free',
  'non', 'none', 'None',
  '-',
]);

async function main() {
  const dry = process.argv.includes('--dry');

  const guests = await prisma.guest.findMany({
    where: { dietary_requirements: { not: null } },
    select: { id: true, first_name: true, last_name: true, dietary_requirements: true },
  });

  const toClear = guests.filter(g => CLEAR_VALUES.has(g.dietary_requirements?.trim()));

  console.log(`Found ${toClear.length} guests with noise dietary values:`);
  for (const g of toClear) {
    console.log(`  ID:${g.id} ${g.first_name} ${g.last_name} — "${g.dietary_requirements}"`);
  }

  if (dry) {
    console.log('\n--dry mode, no changes made.');
    return;
  }

  if (toClear.length === 0) {
    console.log('Nothing to clear.');
    return;
  }

  const ids = toClear.map(g => g.id);
  const result = await prisma.guest.updateMany({
    where: { id: { in: ids } },
    data: { dietary_requirements: null },
  });

  console.log(`\nCleared dietary_requirements for ${result.count} guests.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
