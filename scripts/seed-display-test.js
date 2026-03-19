/**
 * Seed script for Live Seating Display testing
 *
 * Creates 240 guests assigned to 24 tables (10/table).
 * - 120 guests: zolijavos+seat001..120@gmail.com
 * - 120 guests: agnes.tordai+seat001..120@gmail.com
 * - ~half are paired tickets (60 pairs)
 * - ~30% pre-checked-in for visual testing
 *
 * Run: node scripts/seed-display-test.js
 * Undo: node scripts/seed-display-test.js --clean
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hungarian name pools
const FIRST_NAMES_MALE = [
  'János', 'Péter', 'László', 'István', 'Gábor', 'Zoltán', 'Attila', 'Ferenc',
  'Tamás', 'András', 'Balázs', 'Csaba', 'Dávid', 'Endre', 'Gergő', 'Henrik',
  'Imre', 'József', 'Károly', 'Levente', 'Márton', 'Norbert', 'Olivér', 'Richárd',
  'Sándor', 'Viktor', 'Ádám', 'Bence', 'Dénes', 'Ernő', 'Győző', 'Kristóf',
  'Miklós', 'Pál', 'Róbert', 'Szabolcs', 'Tibor', 'Vilmos', 'Zsolt', 'Dominik',
  'Máté', 'Benedek', 'Nándor', 'Patrik', 'Roland', 'Soma', 'Botond', 'Marcell',
  'Ákos', 'Barnabás', 'Csongor', 'Donát', 'Elemér', 'Félix', 'Hunor', 'Iván',
  'Jenő', 'Kornél', 'Lóránt', 'Milán',
];

const FIRST_NAMES_FEMALE = [
  'Éva', 'Anna', 'Mária', 'Katalin', 'Erzsébet', 'Judit', 'Ilona', 'Zsuzsa',
  'Réka', 'Krisztina', 'Nóra', 'Eszter', 'Lilla', 'Boglárka', 'Dóra', 'Fanni',
  'Gabriella', 'Hajnalka', 'Ildikó', 'Julianna', 'Kinga', 'Laura', 'Mónika', 'Nikolett',
  'Orsolya', 'Petra', 'Rebeka', 'Sarolta', 'Tímea', 'Vera', 'Vivien', 'Adél',
  'Beáta', 'Csilla', 'Diána', 'Emese', 'Flóra', 'Gréta', 'Hanna', 'Izabella',
  'Johanna', 'Klára', 'Luca', 'Melinda', 'Natália', 'Olívia', 'Piroska', 'Renáta',
  'Szilvia', 'Tekla', 'Valéria', 'Zsófia', 'Anett', 'Bianka', 'Cecília', 'Dorina',
  'Enikő', 'Fruzsina', 'Gitta', 'Hedvig',
];

const LAST_NAMES = [
  'Kovács', 'Nagy', 'Szabó', 'Tóth', 'Horváth', 'Kiss', 'Molnár', 'Varga',
  'Németh', 'Farkas', 'Balogh', 'Papp', 'Takács', 'Juhász', 'Lakatos', 'Mészáros',
  'Oláh', 'Simon', 'Rácz', 'Fekete', 'Szilágyi', 'Török', 'Fehér', 'Balázs',
  'Gál', 'Pintér', 'Szűcs', 'Budai', 'Bíró', 'Vincze', 'Hegedűs', 'Kocsis',
  'Kozma', 'Székely', 'Antal', 'Fülöp', 'Kelemen', 'Orbán', 'Szalai', 'Pálfi',
  'Barta', 'Deák', 'Fodor', 'Katona', 'Lőrincz', 'Márkus', 'Nemes', 'Pásztor',
  'Sárközi', 'Tamás', 'Veres', 'Barna', 'Csonka', 'Deli', 'Erős', 'Faragó',
  'Gulyás', 'Hajdu', 'Iván', 'Jakab',
];

const TITLES = [null, null, null, null, null, 'Dr.', 'Dr.', 'Prof.', 'Prof. Dr.', 'ifj.'];
const COMPANIES = [
  'OTP Bank', 'MOL Group', 'Magyar Telekom', 'Richter Gedeon', 'Wizz Air',
  'MVM Group', 'CIG Pannónia', 'Masterplast', 'AutoWallis', 'Opus Global',
  'Duna House', '4iG', 'Graphisoft', 'Prezi', 'LogMeIn',
  'NNG', 'Bitrise', 'EPAM Systems', 'Morgan Stanley', 'BlackRock',
  null, null, null, null, null,
];
const DIETARY = [null, null, null, null, null, null, null, 'gluténmentes', 'laktózmentes', 'vegetáriánus', 'vegán', 'halal'];

function pad3(n) {
  return String(n).padStart(3, '0');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateGuests() {
  const guests = [];
  // Decide which seats are paired: seats 1-30 for each prefix are paired main guests
  // Their partner is seat+60 (so seat 1's partner is seat 61, etc.)
  // This gives us 60 pairs = 120 paired guests + 120 single = 240 total

  const prefixes = [
    { email: 'zolijavos', count: 120 },
    { email: 'agnes.tordai', count: 120 },
  ];

  let guestIndex = 0;

  for (const prefix of prefixes) {
    // Seats 1-30: paired main (paying_paired)
    // Seats 31-60: single (paying_single)
    // Seats 61-90: paired partner (paying_paired, linked to 1-30)
    // Seats 91-120: single invited (vip_free)
    for (let i = 1; i <= prefix.count; i++) {
      const seatNum = pad3(i);
      const isMale = guestIndex % 2 === 0;
      const firstName = isMale ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE);
      const lastName = pick(LAST_NAMES);

      let guestType, ticketType;
      if (i <= 30 || (i >= 61 && i <= 90)) {
        guestType = 'paying_paired';
        ticketType = 'paid_paired';
      } else if (i >= 91) {
        guestType = 'invited';
        ticketType = 'vip_free';
      } else {
        guestType = 'paying_single';
        ticketType = 'paid_single';
      }

      // ~30% already checked in for visual testing
      const isCheckedIn = Math.random() < 0.3;
      const regStatus = isCheckedIn ? 'checked_in' : 'approved';

      guests.push({
        email: `${prefix.email}+seat${seatNum}@gmail.com`,
        firstName,
        lastName,
        title: pick(TITLES),
        company: pick(COMPANIES),
        guestType,
        ticketType,
        regStatus,
        isCheckedIn,
        dietary: pick(DIETARY),
        // For pairing: main guests (1-30) link to partners (61-90)
        isPairedMain: i >= 1 && i <= 30,
        isPairedPartner: i >= 61 && i <= 90,
        pairedMainIndex: i >= 61 && i <= 90 ? i - 60 : null,
        seatNum: i,
        prefixKey: prefix.email,
      });

      guestIndex++;
    }
  }

  return guests;
}

async function clean() {
  console.log('🧹 Cleaning display test data...');

  // Find all test guests by email pattern
  const testGuests = await prisma.guest.findMany({
    where: {
      OR: [
        { email: { startsWith: 'zolijavos+seat' } },
        { email: { startsWith: 'agnes.tordai+seat' } },
      ],
    },
    select: { id: true },
  });

  const guestIds = testGuests.map((g) => g.id);

  if (guestIds.length > 0) {
    // Delete in FK order
    await prisma.checkin.deleteMany({ where: { guest_id: { in: guestIds } } });
    await prisma.tableAssignment.deleteMany({ where: { guest_id: { in: guestIds } } });

    const regs = await prisma.registration.findMany({
      where: { guest_id: { in: guestIds } },
      select: { id: true },
    });
    const regIds = regs.map((r) => r.id);

    if (regIds.length > 0) {
      await prisma.payment.deleteMany({ where: { registration_id: { in: regIds } } });
      await prisma.billingInfo.deleteMany({ where: { registration_id: { in: regIds } } });
      await prisma.registration.deleteMany({ where: { id: { in: regIds } } });
    }

    // Clear paired_with_id references before deleting guests
    await prisma.guest.updateMany({
      where: { id: { in: guestIds }, paired_with_id: { not: null } },
      data: { paired_with_id: null },
    });

    await prisma.guest.deleteMany({ where: { id: { in: guestIds } } });
    console.log(`  Deleted ${guestIds.length} test guests`);
  }

  // Delete test tables (Table 1-24)
  const tableNames = Array.from({ length: 24 }, (_, i) => `Table ${i + 1}`);
  const deleted = await prisma.table.deleteMany({
    where: { name: { in: tableNames } },
  });
  console.log(`  Deleted ${deleted.count} test tables`);

  console.log('✅ Clean complete');
}

async function seed() {
  console.log('🌱 Seeding display test data (240 guests, 24 tables)...\n');

  // Get admin user for assigned_by
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.error('❌ No admin user found. Run seed-production.js first.');
    process.exit(1);
  }

  // 1. Clean existing test data
  await clean();

  // 2. Create 24 tables (Table 1 - Table 24)
  console.log('\n📋 Creating 24 tables...');
  const tables = [];
  for (let i = 1; i <= 24; i++) {
    const table = await prisma.table.create({
      data: {
        name: `Table ${i}`,
        capacity: 10,
        type: i <= 4 ? 'vip' : 'standard',
        pos_x: ((i - 1) % 8) * 2 + 1,
        pos_y: Math.floor((i - 1) / 8) * 3 + 1,
        status: 'available',
      },
    });
    tables.push(table);
  }
  console.log(`  Created ${tables.length} tables`);

  // 3. Generate guest data
  const guestData = generateGuests();

  // 4. Create guests, registrations, payments, checkins
  console.log('\n👥 Creating 240 guests with registrations...');
  const createdGuests = []; // { guest, data }
  const guestsByKey = new Map(); // 'prefix:seatNum' -> guest record

  for (const g of guestData) {
    const guest = await prisma.guest.create({
      data: {
        email: g.email,
        first_name: g.firstName,
        last_name: g.lastName,
        title: g.title,
        company: g.company,
        guest_type: g.guestType,
        registration_status: g.regStatus,
        dietary_requirements: g.dietary,
        magic_link_hash: `display_test_${g.email}`,
        magic_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        pwa_auth_code: `CEOG-D${pad3(createdGuests.length + 1).slice(0, 2)}${String.fromCharCode(65 + (createdGuests.length % 26))}${pad3(createdGuests.length + 1).slice(1)}`,
      },
    });

    // Registration
    const reg = await prisma.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: g.ticketType,
        payment_method: g.guestType === 'invited' ? null : 'card',
        qr_code_hash: `qr_display_${guest.id}`,
        qr_code_generated_at: new Date(),
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
      },
    });

    // Payment for paying guests
    if (g.guestType !== 'invited') {
      await prisma.payment.create({
        data: {
          registration_id: reg.id,
          stripe_session_id: `cs_display_test_${guest.id}`,
          amount: g.guestType === 'paying_paired' ? 45000 : 25000,
          currency: 'HUF',
          payment_status: 'paid',
          payment_method: 'card',
          paid_at: new Date(),
        },
      });
    }

    // Check-in for ~30%
    if (g.isCheckedIn) {
      await prisma.checkin.create({
        data: {
          registration_id: reg.id,
          guest_id: guest.id,
          staff_user_id: admin.id,
          method: 'qr_scan',
        },
      });
    }

    createdGuests.push({ guest, data: g });
    guestsByKey.set(`${g.prefixKey}:${g.seatNum}`, guest);
  }

  const checkedInCount = guestData.filter((g) => g.isCheckedIn).length;
  console.log(`  Created ${createdGuests.length} guests (${checkedInCount} pre-checked-in)`);

  // 5. Link paired guests
  console.log('\n🔗 Linking paired guests...');
  let pairedCount = 0;
  for (const g of guestData) {
    if (g.isPairedMain) {
      const mainGuest = guestsByKey.get(`${g.prefixKey}:${g.seatNum}`);
      const partnerGuest = guestsByKey.get(`${g.prefixKey}:${g.seatNum + 60}`);
      if (mainGuest && partnerGuest) {
        await prisma.guest.update({
          where: { id: partnerGuest.id },
          data: { paired_with_id: mainGuest.id },
        });
        pairedCount++;
      }
    }
  }
  console.log(`  Linked ${pairedCount} pairs`);

  // 6. Assign guests to tables (10 per table, paired guests sit together)
  console.log('\n🪑 Assigning guests to tables...');
  let assignmentCount = 0;

  // Sort: put paired mains and their partners adjacent, then singles
  const assignmentOrder = [];

  // First: paired mains + partners (they sit together)
  for (const prefix of ['zolijavos', 'agnes.tordai']) {
    for (let i = 1; i <= 30; i++) {
      const main = guestsByKey.get(`${prefix}:${i}`);
      const partner = guestsByKey.get(`${prefix}:${i + 60}`);
      if (main) assignmentOrder.push(main);
      if (partner) assignmentOrder.push(partner);
    }
  }

  // Then: singles
  for (const prefix of ['zolijavos', 'agnes.tordai']) {
    for (let i = 31; i <= 60; i++) {
      const guest = guestsByKey.get(`${prefix}:${i}`);
      if (guest) assignmentOrder.push(guest);
    }
    for (let i = 91; i <= 120; i++) {
      const guest = guestsByKey.get(`${prefix}:${i}`);
      if (guest) assignmentOrder.push(guest);
    }
  }

  for (let i = 0; i < assignmentOrder.length; i++) {
    const tableIndex = Math.floor(i / 10);
    const seatNumber = (i % 10) + 1;

    if (tableIndex >= tables.length) break;

    await prisma.tableAssignment.create({
      data: {
        table_id: tables[tableIndex].id,
        guest_id: assignmentOrder[i].id,
        seat_number: seatNumber,
        assigned_by: admin.id,
      },
    });
    assignmentCount++;
  }
  console.log(`  Assigned ${assignmentCount} guests to tables`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✅ Display test data seeded successfully!');
  console.log(`   Tables: 24 (4 VIP + 20 Standard)`);
  console.log(`   Guests: ${createdGuests.length}`);
  console.log(`   Paired: ${pairedCount * 2} (${pairedCount} pairs)`);
  console.log(`   Single: ${createdGuests.length - pairedCount * 2}`);
  console.log(`   Checked-in: ${checkedInCount} (~30%)`);
  console.log(`   Table assignments: ${assignmentCount}`);
  console.log('='.repeat(50));
  console.log('\n🖥️  Open /display/seating to test the live display');
  console.log('📱 Use /checkin to scan and see real-time updates\n');
}

async function main() {
  try {
    if (process.argv.includes('--clean')) {
      await clean();
    } else {
      await seed();
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
