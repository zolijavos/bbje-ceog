/**
 * Clear non-meaningful dietary_requirements values from Guest records.
 *
 * Run: node scripts/clear-dietary-noise.js
 * Dry run: node scripts/clear-dietary-noise.js --dry
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const prisma = new PrismaClient();

// Canonical lowercase values to clear (includes non-dietary restrictions per client request)
const CLEAR_VALUES = new Set([
  'n.a.', 'n/a',
  'no',
  'no allergies', 'no allergies.',
  'no mushroom',
  'no pork + no alcohol', 'no pork, no alcohol',
  'pork free',
  'non', 'none',
  '-',
]);

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

async function main() {
  const dry = process.argv.includes('--dry');

  const guests = await prisma.guest.findMany({
    where: { dietary_requirements: { not: null } },
    select: { id: true, first_name: true, last_name: true, dietary_requirements: true },
  });

  const toClear = guests.filter(g => {
    const val = g.dietary_requirements?.trim().toLowerCase();
    return val && CLEAR_VALUES.has(val);
  });

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

  const confirmed = await confirm(`\nClear dietary_requirements for ${toClear.length} guests? (y/N): `);
  if (!confirmed) {
    console.log('Cancelled.');
    return;
  }

  // Use original values in where clause to avoid race condition
  const clearValuesArray = [...CLEAR_VALUES];
  const result = await prisma.guest.updateMany({
    where: {
      id: { in: toClear.map(g => g.id) },
      dietary_requirements: { in: guests.filter(g => {
        const val = g.dietary_requirements?.trim().toLowerCase();
        return val && CLEAR_VALUES.has(val);
      }).map(g => g.dietary_requirements) },
    },
    data: { dietary_requirements: null },
  });

  console.log(`\nCleared dietary_requirements for ${result.count} guests.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
