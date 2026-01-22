#!/usr/bin/env node
/**
 * CEO Gala - Production Database Seed Script
 *
 * Creates comprehensive test data for development and staging environments.
 * Run after deployment: node scripts/seed-production.js
 *
 * Test Credentials:
 *   Admin: admin@ceogala.test / Admin123!
 *   Staff: staff@ceogala.test / Staff123!
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n===========================================');
  console.log('  CEO Gala - Production Database Seed');
  console.log('===========================================\n');
  console.log('Starting database seed...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.emailLog.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.tableAssignment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billingInfo.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();
  console.log('  Existing data cleaned\n');

  // ==========================================
  // ADMIN USERS
  // ==========================================
  console.log('Creating admin users...');

  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const staffPasswordHash = await bcrypt.hash('Staff123!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ceogala.test',
      password_hash: adminPasswordHash,
      first_name: 'Admin',
      last_name: 'Test User',
      role: 'admin',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@ceogala.test',
      password_hash: staffPasswordHash,
      first_name: 'Staff',
      last_name: 'Test User',
      role: 'staff',
    },
  });

  console.log(`  Created: ${adminUser.email} (admin)`);
  console.log(`  Created: ${staffUser.email} (staff)\n`);

  // ==========================================
  // TABLES
  // ==========================================
  console.log('Creating tables...');

  // Table positions are in METERS (FloorPlanCanvas multiplies by PIXELS_PER_METER=50)
  // Room is 20m x 15m, so keep tables within (0-20, 0-15) range
  const tables = await prisma.table.createMany({
    data: [
      { name: 'VIP Table 1', capacity: 8, type: 'vip', pos_x: 2, pos_y: 2, status: 'available' },
      { name: 'VIP Table 2', capacity: 6, type: 'vip', pos_x: 6, pos_y: 2, status: 'available' },
      { name: 'Standard Table 1', capacity: 10, type: 'standard', pos_x: 2, pos_y: 6, status: 'available' },
      { name: 'Standard Table 2', capacity: 10, type: 'standard', pos_x: 6, pos_y: 6, status: 'available' },
      { name: 'Standard Table 3', capacity: 8, type: 'standard', pos_x: 10, pos_y: 6, status: 'available' },
    ],
  });

  console.log(`  Created ${tables.count} tables (2 VIP, 3 Standard)\n`);

  // ==========================================
  // VIP GUESTS (Free tickets)
  // ==========================================
  console.log('Creating VIP guests...');

  const vipGuests = [
    { email: 'vip1@ceogala.test', firstName: 'János', lastName: 'Kovács', title: 'Dr.', status: 'invited' },
    { email: 'vip2@ceogala.test', firstName: 'Éva', lastName: 'Nagy', status: 'registered' },
    { email: 'vip3@ceogala.test', firstName: 'Péter', lastName: 'Szabó', status: 'approved' },
  ];

  for (const vipData of vipGuests) {
    const guest = await prisma.guest.create({
      data: {
        email: vipData.email,
        first_name: vipData.firstName,
        last_name: vipData.lastName,
        title: vipData.title || null,
        guest_type: 'invited',
        registration_status: vipData.status,
        magic_link_hash: `test_hash_${vipData.email}`,
        magic_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // Create registration for registered/approved VIPs
    if (vipData.status !== 'invited') {
      await prisma.registration.create({
        data: {
          guest_id: guest.id,
          ticket_type: 'vip_free',
          qr_code_hash: `qr_test_${guest.id}`,
          qr_code_generated_at: new Date(),
        },
      });
    }

    console.log(`  Created VIP: ${guest.first_name} ${guest.last_name} (${vipData.status})`);
  }

  // ==========================================
  // PAYING GUESTS (Single tickets)
  // ==========================================
  console.log('\nCreating paying single guests...');

  const payingSingleGuests = [
    { email: 'paying1@ceogala.test', firstName: 'Anna', lastName: 'Kiss', paymentStatus: 'paid' },
    { email: 'paying2@ceogala.test', firstName: 'Gábor', lastName: 'Tóth', paymentStatus: 'pending' },
  ];

  for (const guestData of payingSingleGuests) {
    const guest = await prisma.guest.create({
      data: {
        email: guestData.email,
        first_name: guestData.firstName,
        last_name: guestData.lastName,
        guest_type: 'paying_single',
        registration_status: guestData.paymentStatus === 'paid' ? 'approved' : 'registered',
        magic_link_hash: `test_hash_${guestData.email}`,
      },
    });

    const registration = await prisma.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'paid_single',
        payment_method: 'card',
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: guestData.paymentStatus === 'paid' ? `qr_test_${guest.id}` : null,
        qr_code_generated_at: guestData.paymentStatus === 'paid' ? new Date() : null,
      },
    });

    // Create billing info for paying guest
    await prisma.billingInfo.create({
      data: {
        registration_id: registration.id,
        billing_first_name: guest.first_name,
        billing_last_name: guest.last_name,
        address_line1: 'Teszt utca 1.',
        city: 'Budapest',
        postal_code: '1111',
        country: 'HU',
      },
    });

    await prisma.payment.create({
      data: {
        registration_id: registration.id,
        stripe_session_id: `cs_test_${guest.id}`,
        amount: 100000, // 100,000 HUF
        currency: 'HUF',
        payment_status: guestData.paymentStatus,
        payment_method: 'card',
        paid_at: guestData.paymentStatus === 'paid' ? new Date() : null,
      },
    });

    console.log(`  Created Single: ${guest.first_name} ${guest.last_name} (payment: ${guestData.paymentStatus})`);
  }

  // ==========================================
  // PAYING GUESTS (Paired tickets)
  // ==========================================
  console.log('\nCreating paying paired guests...');

  const pairedGuestsData = [
    {
      email: 'paired1@ceogala.test',
      firstName: 'László',
      lastName: 'Molnár',
      partnerFirstName: 'Réka',
      partnerLastName: 'Molnár',
      partnerEmail: 'partner1@ceogala.test',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      billingAddress: 'Páros utca 2.',
      mainDiet: 'Gluténmentes',
      partnerDiet: 'Laktózmentes',
      mainSeating: 'Ablak mellé',
      partnerSeating: null,
    },
    {
      email: 'paired2@ceogala.test',
      firstName: 'Attila',
      lastName: 'Horváth',
      partnerFirstName: 'Krisztina',
      partnerLastName: 'Horváth',
      partnerEmail: 'partner2@ceogala.test',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      billingAddress: 'Kettős köz 15.',
      mainDiet: null,
      partnerDiet: 'Vegetáriánus',
      mainSeating: 'VIP asztalhoz közel',
      partnerSeating: 'VIP asztalhoz közel',
    },
    {
      email: 'paired3@ceogala.test',
      firstName: 'Márton',
      lastName: 'Szilágyi',
      partnerFirstName: 'Nóra',
      partnerLastName: 'Szilágyi',
      partnerEmail: 'partner3@ceogala.test',
      paymentStatus: 'pending',
      paymentMethod: 'card',
      billingAddress: 'Duett utca 8.',
      mainDiet: 'Vegán',
      partnerDiet: 'Vegán',
      mainSeating: null,
      partnerSeating: null,
    },
    {
      email: 'paired4@ceogala.test',
      firstName: 'Tamás',
      lastName: 'Bíró',
      partnerFirstName: 'Eszter',
      partnerLastName: 'Bíró',
      partnerEmail: 'partner4@ceogala.test',
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      billingAddress: 'Harmónia sétány 3.',
      mainDiet: 'Mogyoróallergia',
      partnerDiet: null,
      mainSeating: 'Színpadtól távol',
      partnerSeating: 'Színpadtól távol',
    },
    {
      email: 'paired5@ceogala.test',
      firstName: 'Gergő',
      lastName: 'Vincze',
      partnerFirstName: 'Lilla',
      partnerLastName: 'Vincze',
      partnerEmail: 'partner5@ceogala.test',
      paymentStatus: 'pending',
      paymentMethod: 'bank_transfer',
      billingAddress: 'Pár utca 22.',
      mainDiet: null,
      partnerDiet: 'Halat nem eszik',
      mainSeating: 'Barátokkal: Kovács család',
      partnerSeating: 'Barátokkal: Kovács család',
    },
  ];

  for (const pairedData of pairedGuestsData) {
    // Create main guest first
    const mainGuest = await prisma.guest.create({
      data: {
        email: pairedData.email,
        first_name: pairedData.firstName,
        last_name: pairedData.lastName,
        guest_type: 'paying_paired',
        registration_status: pairedData.paymentStatus === 'paid' ? 'approved' : 'registered',
        magic_link_hash: `test_hash_${pairedData.email}`,
        dietary_requirements: pairedData.mainDiet || null,
        seating_preferences: pairedData.mainSeating || null,
      },
    });

    // Create partner as separate Guest record with paired_with_id relation
    const partnerGuest = await prisma.guest.create({
      data: {
        email: pairedData.partnerEmail,
        first_name: pairedData.partnerFirstName,
        last_name: pairedData.partnerLastName,
        guest_type: 'paying_paired',
        registration_status: pairedData.paymentStatus === 'paid' ? 'approved' : 'registered',
        magic_link_hash: `test_hash_${pairedData.partnerEmail}`,
        paired_with_id: mainGuest.id, // Link partner to main guest
        dietary_requirements: pairedData.partnerDiet || null,
        seating_preferences: pairedData.partnerSeating || null,
      },
    });

    // Main guest registration (with payment info)
    const mainRegistration = await prisma.registration.create({
      data: {
        guest_id: mainGuest.id,
        ticket_type: 'paid_paired',
        partner_first_name: pairedData.partnerFirstName,
        partner_last_name: pairedData.partnerLastName,
        partner_email: pairedData.partnerEmail,
        payment_method: pairedData.paymentMethod,
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: pairedData.paymentStatus === 'paid' ? `qr_test_${mainGuest.id}` : null,
        qr_code_generated_at: pairedData.paymentStatus === 'paid' ? new Date() : null,
      },
    });

    // Partner registration (no separate payment - shared with main guest)
    await prisma.registration.create({
      data: {
        guest_id: partnerGuest.id,
        ticket_type: 'paid_paired',
        partner_first_name: mainGuest.first_name, // Reverse reference to main guest
        partner_last_name: mainGuest.last_name,
        partner_email: mainGuest.email,
        payment_method: pairedData.paymentMethod,
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: pairedData.paymentStatus === 'paid' ? `qr_test_partner_${partnerGuest.id}` : null,
        qr_code_generated_at: pairedData.paymentStatus === 'paid' ? new Date() : null,
      },
    });

    // Create billing info for main guest (billing is on main guest only)
    await prisma.billingInfo.create({
      data: {
        registration_id: mainRegistration.id,
        billing_first_name: pairedData.firstName,
        billing_last_name: pairedData.lastName,
        address_line1: pairedData.billingAddress,
        city: 'Budapest',
        postal_code: '1' + String(Math.floor(Math.random() * 900) + 100),
        country: 'HU',
      },
    });

    // Payment attached to main guest's registration
    await prisma.payment.create({
      data: {
        registration_id: mainRegistration.id,
        stripe_session_id: pairedData.paymentMethod === 'card' ? `cs_paired_${mainGuest.id}` : undefined,
        amount: 150000, // 150,000 HUF (paired ticket)
        currency: 'HUF',
        payment_status: pairedData.paymentStatus,
        payment_method: pairedData.paymentMethod,
        paid_at: pairedData.paymentStatus === 'paid' ? new Date() : null,
      },
    });

    console.log(`  Created Pair: ${mainGuest.first_name} ${mainGuest.last_name} + ${partnerGuest.first_name} ${partnerGuest.last_name} (${pairedData.paymentStatus})`);
  }

  // ==========================================
  // ADDITIONAL UNASSIGNED GUESTS (for DnD testing)
  // ==========================================
  console.log('\nCreating unassigned guests for seating tests...');

  const unassignedGuests = [
    { email: 'unassigned1@ceogala.test', firstName: 'Béla', lastName: 'Horváth', type: 'invited' },
    { email: 'unassigned2@ceogala.test', firstName: 'Klára', lastName: 'Fekete', type: 'paying_single' },
    { email: 'unassigned3@ceogala.test', firstName: 'Tamás', lastName: 'Fehér', type: 'paying_single' },
    { email: 'unassigned4@ceogala.test', firstName: 'Zsófia', lastName: 'Balogh', type: 'invited' },
    { email: 'unassigned5@ceogala.test', firstName: 'Imre', lastName: 'Varga', type: 'paying_single' },
  ];

  for (const guestData of unassignedGuests) {
    const unassignedGuest = await prisma.guest.create({
      data: {
        email: guestData.email,
        first_name: guestData.firstName,
        last_name: guestData.lastName,
        guest_type: guestData.type,
        registration_status: 'approved',
        magic_link_hash: `test_hash_${guestData.email}`,
      },
    });

    const unassignedReg = await prisma.registration.create({
      data: {
        guest_id: unassignedGuest.id,
        ticket_type: guestData.type === 'invited' ? 'vip_free' : 'paid_single',
        payment_method: guestData.type !== 'invited' ? 'card' : undefined,
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: `qr_unassigned_${unassignedGuest.id}`,
        qr_code_generated_at: new Date(),
      },
    });

    // Create billing info for paying unassigned guests
    if (guestData.type !== 'invited') {
      await prisma.billingInfo.create({
        data: {
          registration_id: unassignedReg.id,
          billing_first_name: unassignedGuest.first_name,
          billing_last_name: unassignedGuest.last_name,
          address_line1: 'Teszt utca 1.',
          city: 'Budapest',
          postal_code: '1000',
          country: 'HU',
        },
      });

      await prisma.payment.create({
        data: {
          registration_id: unassignedReg.id,
          stripe_session_id: `cs_unassigned_${unassignedGuest.id}`,
          amount: 100000, // 100,000 HUF
          currency: 'HUF',
          payment_status: 'paid',
          payment_method: 'card',
          paid_at: new Date(),
        },
      });
    }

    console.log(`  Created Unassigned: ${unassignedGuest.first_name} ${unassignedGuest.last_name} (${guestData.type})`);
  }

  // Additional paired guest for DnD testing (takes 2 seats)
  // Main guest
  const pairedUnassignedMain = await prisma.guest.create({
    data: {
      email: 'paired-unassigned@ceogala.test',
      first_name: 'Zoltán',
      last_name: 'Papp',
      guest_type: 'paying_paired',
      registration_status: 'approved',
      magic_link_hash: 'test_hash_paired-unassigned@ceogala.test',
      dietary_requirements: 'Diabetikus',
      seating_preferences: 'Pincér közelében',
    },
  });

  // Partner as separate Guest
  const pairedUnassignedPartner = await prisma.guest.create({
    data: {
      email: 'partner-unassigned@ceogala.test',
      first_name: 'Judit',
      last_name: 'Papp',
      guest_type: 'paying_paired',
      registration_status: 'approved',
      magic_link_hash: 'test_hash_partner-unassigned@ceogala.test',
      paired_with_id: pairedUnassignedMain.id,
      dietary_requirements: null,
      seating_preferences: 'Pincér közelében',
    },
  });

  // Main guest registration
  const pairedMainReg = await prisma.registration.create({
    data: {
      guest_id: pairedUnassignedMain.id,
      ticket_type: 'paid_paired',
      partner_first_name: 'Judit',
      partner_last_name: 'Papp',
      partner_email: 'partner-unassigned@ceogala.test',
      payment_method: 'card',
      gdpr_consent: true,
      gdpr_consent_at: new Date(),
      cancellation_accepted: true,
      cancellation_accepted_at: new Date(),
      qr_code_hash: `qr_paired_unassigned_${pairedUnassignedMain.id}`,
      qr_code_generated_at: new Date(),
    },
  });

  // Partner registration
  await prisma.registration.create({
    data: {
      guest_id: pairedUnassignedPartner.id,
      ticket_type: 'paid_paired',
      partner_first_name: 'Zoltán',
      partner_last_name: 'Papp',
      partner_email: 'paired-unassigned@ceogala.test',
      payment_method: 'card',
      gdpr_consent: true,
      gdpr_consent_at: new Date(),
      cancellation_accepted: true,
      cancellation_accepted_at: new Date(),
      qr_code_hash: `qr_paired_unassigned_partner_${pairedUnassignedPartner.id}`,
      qr_code_generated_at: new Date(),
    },
  });

  // Create billing info for paired unassigned guest (main only)
  await prisma.billingInfo.create({
    data: {
      registration_id: pairedMainReg.id,
      billing_first_name: 'Zoltán',
      billing_last_name: 'Papp',
      address_line1: 'Páros sétány 5.',
      city: 'Budapest',
      postal_code: '1234',
      country: 'HU',
    },
  });

  await prisma.payment.create({
    data: {
      registration_id: pairedMainReg.id,
      stripe_session_id: `cs_paired_unassigned_${pairedUnassignedMain.id}`,
      amount: 180000, // 180,000 HUF (paired ticket)
      currency: 'HUF',
      payment_status: 'paid',
      payment_method: 'card',
      paid_at: new Date(),
    },
  });

  console.log(`  Created Unassigned Pair: ${pairedUnassignedMain.first_name} ${pairedUnassignedMain.last_name} + ${pairedUnassignedPartner.first_name} ${pairedUnassignedPartner.last_name}`);

  // ==========================================
  // TABLE ASSIGNMENTS (only assign some guests)
  // ==========================================
  console.log('\nCreating table assignments...');

  const allTables = await prisma.table.findMany();
  // Only assign original approved guests, leave new ones unassigned
  const approvedGuests = await prisma.guest.findMany({
    where: {
      registration_status: 'approved',
      email: {
        in: ['vip3@ceogala.test', 'paying1@ceogala.test'],
      },
    },
  });

  for (let i = 0; i < approvedGuests.length; i++) {
    await prisma.tableAssignment.create({
      data: {
        table_id: allTables[i % allTables.length].id,
        guest_id: approvedGuests[i].id,
        seat_number: i + 1,
        assigned_by: adminUser.id,
      },
    });
  }

  console.log(`  Assigned ${approvedGuests.length} guests to tables`);
  console.log('  (7+ guests left unassigned for DnD testing)');

  // ==========================================
  // CHECK-INS
  // ==========================================
  console.log('\nCreating check-in records...');

  const paidRegistrations = await prisma.registration.findMany({
    where: {
      guest: {
        registration_status: 'approved',
      },
    },
    include: { guest: true },
    take: 2, // First 2 paid guests
  });

  for (const reg of paidRegistrations) {
    await prisma.checkin.create({
      data: {
        registration_id: reg.id,
        guest_id: reg.guest_id,
        staff_user_id: staffUser.id,
        method: 'qr',
        is_override: false,
      },
    });

    console.log(`  Checked in: ${reg.guest.first_name} ${reg.guest.last_name}`);
  }

  // ==========================================
  // EMAIL LOGS
  // ==========================================
  console.log('\nCreating email logs...');

  const allGuests = await prisma.guest.findMany({ take: 3 });

  for (const guest of allGuests) {
    await prisma.emailLog.create({
      data: {
        guest_id: guest.id,
        email_type: 'magic_link',
        recipient: guest.email,
        subject: 'CEO Gala - Magic Link meghívó',
        status: 'sent',
        sent_at: new Date(),
      },
    });
  }

  console.log(`  Created ${allGuests.length} email logs`);

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n===========================================');
  console.log('  Database seed completed successfully!');
  console.log('===========================================\n');

  console.log('Summary:');
  console.log('  - Users: 2 (admin, staff)');
  console.log('  - Tables: 5 (2 VIP, 3 Standard)');
  console.log('  - VIP Guests: 3 (invited, registered, approved)');
  console.log('  - Paying Single: 2 (paid, pending)');
  console.log('  - Paying Paired: 5 pairs (10 guests)');
  console.log('  - Unassigned: 5 single + 1 pair (7 guests)');
  console.log('  - Total Guests: 22');
  console.log('  - Table Assignments: 2 (rest unassigned for DnD)');
  console.log('  - Check-ins: 2');
  console.log('  - Email Logs: 3\n');

  console.log('Test Credentials:');
  console.log('  Admin: admin@ceogala.test / Admin123!');
  console.log('  Staff: staff@ceogala.test / Staff123!\n');

  console.log('Paired Guests Test Data:');
  console.log('  - paired1@ceogala.test: Molnár László + Réka (paid, bank_transfer)');
  console.log('  - paired2@ceogala.test: Horváth Attila + Krisztina (paid, card)');
  console.log('  - paired3@ceogala.test: Szilágyi Márton + Nóra (pending, card)');
  console.log('  - paired4@ceogala.test: Bíró Tamás + Eszter (paid, bank_transfer)');
  console.log('  - paired5@ceogala.test: Vincze Gergő + Lilla (pending, bank_transfer)');
  console.log('  - paired-unassigned@ceogala.test: Papp Zoltán + Judit (unassigned)\n');

  console.log('Seating DnD Test Data:');
  console.log('  - 5 unassigned single guests');
  console.log('  - 1 unassigned paired guest (takes 2 seats)\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
