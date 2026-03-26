/**
 * Import finalized seating plan to production.
 *
 * Source: scripts/prod-seating-data.json (exported from demo4 DB)
 * Matches guests by EMAIL in the target DB, not by ID.
 *
 * Run:   node scripts/import-seating-prod.js --dry    # preview, no changes
 * Run:   node scripts/import-seating-prod.js           # execute (asks confirmation)
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const prisma = new PrismaClient();

const seatingData = require('./prod-seating-data.json');

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

  console.log('=== Seating Import ===\n');
  console.log(`Source: ${seatingData.length} assignments across tables`);
  console.log(`Mode: ${dry ? 'DRY RUN (no changes)' : 'LIVE'}\n`);

  // 1. Check current state
  const currentTables = await prisma.table.count();
  const currentAssignments = await prisma.tableAssignment.count();
  console.log(`Current DB state: ${currentTables} tables, ${currentAssignments} assignments\n`);

  // 2. Build table list from data
  const tableNames = [...new Set(seatingData.map(d => d.table_name))].sort((a, b) => {
    return parseInt(a.replace('Asztal ', '')) - parseInt(b.replace('Asztal ', ''));
  });
  console.log(`Tables to create: ${tableNames.length} (${tableNames[0]} — ${tableNames[tableNames.length - 1]})`);

  // 3. Lookup all needed guests by email
  const emails = [...new Set(seatingData.map(d => d.guest_email))];
  const dbGuests = await prisma.guest.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true, first_name: true, last_name: true },
  });
  const emailToGuest = {};
  for (const g of dbGuests) {
    emailToGuest[g.email.toLowerCase()] = g;
  }

  // 4. Check for missing guests
  const missing = [];
  const found = [];
  for (const d of seatingData) {
    const guest = emailToGuest[d.guest_email.toLowerCase()];
    if (guest) {
      found.push({ ...d, dbGuestId: guest.id });
    } else {
      missing.push(d);
    }
  }

  console.log(`Guests found in DB: ${found.length}/${seatingData.length}`);
  if (missing.length > 0) {
    console.log(`\n⚠️  MISSING guests (${missing.length}) — not in DB, will be skipped:`);
    for (const m of missing) {
      console.log(`  ${m.guest_email} — ${m.first_name} ${m.last_name} (${m.table_name})`);
    }
  }

  // 5. Build pair relationships
  const pairs = seatingData.filter(d => d.paired_with_email);
  console.log(`\nPair relationships to set: ${pairs.length}`);

  if (dry) {
    console.log('\n--- Table breakdown ---');
    for (const tn of tableNames) {
      const tableGuests = found.filter(d => d.table_name === tn);
      console.log(`  ${tn}: ${tableGuests.length} guests`);
    }
    console.log('\n--dry mode, no changes made.');
    return;
  }

  // 6. Confirm
  console.log('');
  const ok = await confirm(
    `This will DELETE ${currentAssignments} assignments + ${currentTables} tables, ` +
    `then CREATE ${tableNames.length} tables + ${found.length} assignments + ${pairs.length} pairs.\n` +
    `Continue? (y/N): `
  );
  if (!ok) {
    console.log('Cancelled.');
    return;
  }

  // 7. Execute in transaction
  console.log('\nExecuting...');

  // 7a. Delete existing assignments and tables
  const delAssignments = await prisma.tableAssignment.deleteMany({});
  console.log(`  Deleted ${delAssignments.count} assignments`);

  // Clear paired_with references that might block table deletion
  await prisma.guest.updateMany({
    where: { paired_with_id: { not: null } },
    data: { paired_with_id: null },
  });

  const delTables = await prisma.table.deleteMany({});
  console.log(`  Deleted ${delTables.count} tables`);

  // 7b. Create tables
  const tableMap = {}; // name -> id
  for (const tn of tableNames) {
    const table = await prisma.table.create({
      data: {
        name: tn,
        capacity: 10,
        type: 'standard',
        pos_x: 0,
        pos_y: 0,
        status: 'available',
      },
    });
    tableMap[tn] = table.id;
  }
  console.log(`  Created ${Object.keys(tableMap).length} tables`);

  // 7c. Create assignments
  let assignCount = 0;
  let skipCount = 0;
  for (const d of found) {
    const tableId = tableMap[d.table_name];
    if (!tableId) { skipCount++; continue; }

    try {
      await prisma.tableAssignment.create({
        data: {
          table_id: tableId,
          guest_id: d.dbGuestId,
          seat_number: null,
        },
      });
      assignCount++;
    } catch (e) {
      if (e.code === 'P2002') {
        console.log(`  SKIP duplicate: ${d.guest_email}`);
        skipCount++;
      } else {
        console.error(`  ERROR: ${d.guest_email} — ${e.message}`);
      }
    }
  }
  console.log(`  Assigned ${assignCount} guests (skipped ${skipCount})`);

  // 7d. Set pair relationships
  let pairCount = 0;
  for (const d of pairs) {
    const mainGuest = emailToGuest[d.paired_with_email?.toLowerCase()];
    const partnerGuest = emailToGuest[d.guest_email.toLowerCase()];
    if (mainGuest && partnerGuest) {
      try {
        await prisma.guest.update({
          where: { id: partnerGuest.id },
          data: { paired_with_id: mainGuest.id },
        });
        pairCount++;
      } catch (e) {
        console.log(`  PAIR SKIP: ${d.guest_email} → ${d.paired_with_email} — ${e.message}`);
      }
    }
  }
  console.log(`  Paired ${pairCount} guests`);

  // 7e. Update table statuses
  for (const [name, tableId] of Object.entries(tableMap)) {
    const count = await prisma.tableAssignment.count({ where: { table_id: tableId } });
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (table && count >= table.capacity) {
      await prisma.table.update({ where: { id: tableId }, data: { status: 'full' } });
    }
  }

  console.log('\n=== Done ===');
  console.log(`Tables: ${Object.keys(tableMap).length}`);
  console.log(`Assignments: ${assignCount}`);
  console.log(`Pairs: ${pairCount}`);
  console.log(`Missing guests: ${missing.length}`);
}

main()
  .catch(e => { console.error('Fatal:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
