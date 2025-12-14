// CEO Gala - Database Seed Script
// Creates test data for development

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - comment out if you want to keep data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.emailLog.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.tableAssignment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billingInfo.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.table.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================
  // ADMIN USERS
  // ==========================================
  console.log('👤 Creating admin users...');

  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const staffPasswordHash = await bcrypt.hash('Staff123!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ceogala.test',
      password_hash: adminPasswordHash,
      name: 'Admin Test User',
      role: 'admin',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@ceogala.test',
      password_hash: staffPasswordHash,
      name: 'Staff Test User',
      role: 'staff',
    },
  });

  console.log(`✅ Created users: ${adminUser.email}, ${staffUser.email}`);

  // ==========================================
  // TABLES
  // ==========================================
  console.log('🪑 Creating tables...');

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

  console.log(`✅ Created ${tables.count} tables`);

  // ==========================================
  // VIP GUESTS (Free tickets)
  // ==========================================
  console.log('🎫 Creating VIP guests...');

  const vipGuests = [
    { email: 'vip1@ceogala.test', name: 'Dr. Kovács János', status: 'invited' as const },
    { email: 'vip2@ceogala.test', name: 'Nagy Éva', status: 'registered' as const },
    { email: 'vip3@ceogala.test', name: 'Szabó Péter', status: 'approved' as const },
  ];

  for (const vipData of vipGuests) {
    const guest = await prisma.guest.create({
      data: {
        email: vipData.email,
        name: vipData.name,
        guest_type: 'vip',
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

    console.log(`✅ Created VIP guest: ${guest.name} (${vipData.status})`);
  }

  // ==========================================
  // PAYING GUESTS (Single tickets)
  // ==========================================
  console.log('💳 Creating paying single guests...');

  const payingSingleGuests = [
    { email: 'paying1@ceogala.test', name: 'Kiss Anna', paymentStatus: 'paid' as const },
    { email: 'paying2@ceogala.test', name: 'Tóth Gábor', paymentStatus: 'pending' as const },
  ];

  for (const guestData of payingSingleGuests) {
    const guest = await prisma.guest.create({
      data: {
        email: guestData.email,
        name: guestData.name,
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
        billing_name: guest.name,
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

    console.log(`✅ Created paying single guest: ${guest.name} (payment: ${guestData.paymentStatus})`);
  }

  // ==========================================
  // PAYING GUESTS (Paired tickets) - Multiple test cases
  // ==========================================
  console.log('👫 Creating paying paired guests...');

  const pairedGuestsData = [
    {
      email: 'paired1@ceogala.test',
      name: 'Molnár László',
      partnerName: 'Molnár Réka',
      partnerEmail: 'partner1@ceogala.test',
      paymentStatus: 'paid' as const,
      paymentMethod: 'bank_transfer' as const,
      billingAddress: 'Páros utca 2.',
      mainDiet: 'Gluténmentes',
      partnerDiet: 'Laktózmentes',
      mainSeating: 'Ablak mellé',
      partnerSeating: null,
    },
    {
      email: 'paired2@ceogala.test',
      name: 'Horváth Attila',
      partnerName: 'Horváth Krisztina',
      partnerEmail: 'partner2@ceogala.test',
      paymentStatus: 'paid' as const,
      paymentMethod: 'card' as const,
      billingAddress: 'Kettős köz 15.',
      mainDiet: null,
      partnerDiet: 'Vegetáriánus',
      mainSeating: 'VIP asztalhoz közel',
      partnerSeating: 'VIP asztalhoz közel',
    },
    {
      email: 'paired3@ceogala.test',
      name: 'Szilágyi Márton',
      partnerName: 'Szilágyi Nóra',
      partnerEmail: 'partner3@ceogala.test',
      paymentStatus: 'pending' as const,
      paymentMethod: 'card' as const,
      billingAddress: 'Duett utca 8.',
      mainDiet: 'Vegán',
      partnerDiet: 'Vegán',
      mainSeating: null,
      partnerSeating: null,
    },
    {
      email: 'paired4@ceogala.test',
      name: 'Bíró Tamás',
      partnerName: 'Bíró Eszter',
      partnerEmail: 'partner4@ceogala.test',
      paymentStatus: 'paid' as const,
      paymentMethod: 'bank_transfer' as const,
      billingAddress: 'Harmónia sétány 3.',
      mainDiet: 'Mogyoróallergia',
      partnerDiet: null,
      mainSeating: 'Színpadtól távol',
      partnerSeating: 'Színpadtól távol',
    },
    {
      email: 'paired5@ceogala.test',
      name: 'Vincze Gergő',
      partnerName: 'Vincze Lilla',
      partnerEmail: 'partner5@ceogala.test',
      paymentStatus: 'pending' as const,
      paymentMethod: 'bank_transfer' as const,
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
        name: pairedData.name,
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
        name: pairedData.partnerName,
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
        partner_name: pairedData.partnerName,
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
        partner_name: mainGuest.name, // Reverse reference to main guest
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
        billing_name: pairedData.name,
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

    console.log(`✅ Created paying paired guests: ${mainGuest.name} ↔ ${partnerGuest.name} (${pairedData.paymentStatus})`);
  }

  // ==========================================
  // ADDITIONAL UNASSIGNED GUESTS (for DnD testing)
  // ==========================================
  console.log('🎭 Creating additional unassigned guests for seating tests...');

  const unassignedGuests = [
    { email: 'unassigned1@ceogala.test', name: 'Horváth Béla', type: 'vip' as const },
    { email: 'unassigned2@ceogala.test', name: 'Fekete Klára', type: 'paying_single' as const },
    { email: 'unassigned3@ceogala.test', name: 'Fehér Tamás', type: 'paying_single' as const },
    { email: 'unassigned4@ceogala.test', name: 'Balogh Zsófia', type: 'vip' as const },
    { email: 'unassigned5@ceogala.test', name: 'Varga Imre', type: 'paying_single' as const },
  ];

  for (const guestData of unassignedGuests) {
    const unassignedGuest = await prisma.guest.create({
      data: {
        email: guestData.email,
        name: guestData.name,
        guest_type: guestData.type,
        registration_status: 'approved',
        magic_link_hash: `test_hash_${guestData.email}`,
      },
    });

    const unassignedReg = await prisma.registration.create({
      data: {
        guest_id: unassignedGuest.id,
        ticket_type: guestData.type === 'vip' ? 'vip_free' : 'paid_single',
        payment_method: guestData.type !== 'vip' ? 'card' : undefined,
        gdpr_consent: true,
        gdpr_consent_at: new Date(),
        cancellation_accepted: true,
        cancellation_accepted_at: new Date(),
        qr_code_hash: `qr_unassigned_${unassignedGuest.id}`,
        qr_code_generated_at: new Date(),
      },
    });

    // Create billing info for paying unassigned guests
    if (guestData.type !== 'vip') {
      await prisma.billingInfo.create({
        data: {
          registration_id: unassignedReg.id,
          billing_name: unassignedGuest.name,
          address_line1: 'Teszt utca 1.',
          city: 'Budapest',
          postal_code: '1000',
          country: 'HU',
        },
      });
    }

    if (guestData.type !== 'vip') {
      const reg = await prisma.registration.findFirst({
        where: { guest_id: unassignedGuest.id },
      });
      if (reg) {
        await prisma.payment.create({
          data: {
            registration_id: reg.id,
            stripe_session_id: `cs_unassigned_${unassignedGuest.id}`,
            amount: 100000, // 100,000 HUF
            currency: 'HUF',
            payment_status: 'paid',
            payment_method: 'card',
            paid_at: new Date(),
          },
        });
      }
    }

    console.log(`✅ Created unassigned guest: ${unassignedGuest.name}`);
  }

  // Additional paired guest for DnD testing (takes 2 seats)
  // Main guest
  const pairedUnassignedMain = await prisma.guest.create({
    data: {
      email: 'paired-unassigned@ceogala.test',
      name: 'Papp Zoltán',
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
      name: 'Papp Judit',
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
      partner_name: 'Papp Judit',
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
      partner_name: 'Papp Zoltán',
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
      billing_name: 'Papp Zoltán',
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

  console.log(`✅ Created unassigned paired guests: ${pairedUnassignedMain.name} ↔ ${pairedUnassignedPartner.name}`);

  // ==========================================
  // TABLE ASSIGNMENTS (only assign some guests)
  // ==========================================
  console.log('🎯 Creating table assignments...');

  const allTables = await prisma.table.findMany();
  // Only assign original 3 approved guests, leave new ones unassigned
  const approvedGuests = await prisma.guest.findMany({
    where: {
      registration_status: 'approved',
      email: {
        in: ['vip3@ceogala.test', 'paying1@ceogala.test', 'paired@ceogala.test'],
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

  console.log(`✅ Assigned ${approvedGuests.length} guests to tables (${6} left unassigned for DnD testing)`);

  // ==========================================
  // CHECK-INS
  // ==========================================
  console.log('✅ Creating check-in records...');

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

    console.log(`✅ Checked in: ${reg.guest.name}`);
  }

  // ==========================================
  // EMAIL LOGS
  // ==========================================
  console.log('📧 Creating email logs...');

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

  console.log(`✅ Created ${allGuests.length} email logs`);

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: 2 (admin, staff)`);
  console.log(`   - Tables: 5 (2 VIP, 3 Standard)`);
  console.log(`   - Guests: 16 (5 VIP, 4 Single, 7 Paired)`);
  console.log(`   - Registrations: 15`);
  console.log(`   - Payments: 11`);
  console.log(`   - Table Assignments: 3 (+ many unassigned for DnD testing)`);
  console.log(`   - Check-ins: 2`);
  console.log(`   - Email Logs: 3`);
  console.log('');
  console.log('👫 Paired Guests Test Data:');
  console.log('   - paired1@ceogala.test: Molnár László + Molnár Réka (paid, bank_transfer)');
  console.log('   - paired2@ceogala.test: Horváth Attila + Horváth Krisztina (paid, card)');
  console.log('   - paired3@ceogala.test: Szilágyi Márton + Szilágyi Nóra (pending, card)');
  console.log('   - paired4@ceogala.test: Bíró Tamás + Bíró Eszter (paid, bank_transfer)');
  console.log('   - paired5@ceogala.test: Vincze Gergő + Vincze Lilla (pending, bank_transfer)');
  console.log('   - paired-unassigned@ceogala.test: Papp Zoltán + Papp Judit (unassigned)');
  console.log('');
  console.log('🪑 Seating DnD Test Data:');
  console.log('   - 5 unassigned single guests');
  console.log('   - 1 unassigned paired guest (takes 2 seats)');
  console.log('');
  console.log('🔑 Test Credentials:');
  console.log('   Admin: admin@ceogala.test / Admin123!');
  console.log('   Staff: staff@ceogala.test / Staff123!');
  console.log('');
  console.log('🌐 Prisma Studio: http://localhost:5555');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
