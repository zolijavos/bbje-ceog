// CEO Gala - 100 Test Guests Seed Script
// Distribution: 60% paying single, 15% VIP, 20% paired, 5% applicant
// 30 guests with table assignment, 70 without
// Run with: npx tsx prisma/seed-100-guests.ts

import { PrismaClient, RegistrationStatus, PaymentStatus, PaymentMethod, GuestType, TicketType, TableStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Hungarian names for realistic test data
const firstNames = [
  'László', 'István', 'József', 'János', 'Zoltán', 'Sándor', 'Gábor', 'Ferenc', 'Attila', 'Péter',
  'Tamás', 'Zsolt', 'Tibor', 'András', 'Csaba', 'Imre', 'Lajos', 'György', 'Balázs', 'Róbert',
  'Mária', 'Erzsébet', 'Katalin', 'Ilona', 'Éva', 'Anna', 'Zsuzsanna', 'Margit', 'Judit', 'Ágnes',
  'Andrea', 'Krisztina', 'Erika', 'Mónika', 'Edit', 'Gabriella', 'Szilvia', 'Anita', 'Henrietta', 'Vivien',
  'Bence', 'Dávid', 'Máté', 'Levente', 'Ádám', 'Márk', 'Dominik', 'Patrik', 'Kevin', 'Richárd',
];

const lastNames = [
  'Nagy', 'Kovács', 'Tóth', 'Szabó', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Németh', 'Farkas',
  'Balogh', 'Papp', 'Takács', 'Juhász', 'Lakatos', 'Mészáros', 'Oláh', 'Simon', 'Rácz', 'Fekete',
  'Szilágyi', 'Török', 'Fehér', 'Balázs', 'Gál', 'Kis', 'Szűcs', 'Kocsis', 'Orsós', 'Pintér',
  'Fodor', 'Szalai', 'Sipos', 'Magyar', 'Lukács', 'Gulyás', 'Bíró', 'Király', 'Katona', 'Jakab',
];

const companies = [
  'Tech Solutions Kft.', 'Digital Services Zrt.', 'Innovation Labs Bt.', 'Smart Systems Kft.', 'Future Tech Zrt.',
  'Business Partners Kft.', 'Global Trade Zrt.', 'Premium Services Bt.', 'Elite Consulting Kft.', 'Pro Management Zrt.',
  'Creative Agency Kft.', 'Media Group Zrt.', 'Marketing Plus Bt.', 'Brand Studio Kft.', 'Design Works Zrt.',
  'Finance Corp Kft.', 'Investment Group Zrt.', 'Capital Partners Bt.', 'Wealth Management Kft.', 'Trust Bank Zrt.',
];

const positions = [
  'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'Ügyvezető', 'Igazgató', 'Vezérigazgató',
  'Marketing igazgató', 'Értékesítési vezető', 'HR igazgató', 'Pénzügyi igazgató',
  'Tulajdonos', 'Alapító', 'Partner', 'Senior Manager', 'Régió vezető', 'Divízió vezető',
];

const dietaryOptions = [
  null, null, null, null, null, // 50% no dietary requirement
  'Vegetáriánus', 'Vegán', 'Gluténmentes', 'Laktózmentes', 'Halat nem eszik',
  'Mogyoróallergia', 'Tojásallergia', 'Diabetikus', 'Kóser', 'Halal',
];

const seatingPrefs = [
  null, null, null, null, // 40% no preference
  'Ablak mellé', 'Színpadhoz közel', 'Színpadtól távol', 'VIP közelében',
  'Csendes sarokban', 'Bejárathoz közel', 'Tánctértől távol', 'Barátokkal együtt',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(): { first: string; last: string; full: string } {
  const first = randomElement(firstNames);
  const last = randomElement(lastNames);
  return { first, last, full: `${last} ${first}` };
}

async function main() {
  console.log('🧪 Starting 100 test guests seed...');
  console.log('');

  // Get admin user for assignments
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminUser) {
    console.error('❌ No admin user found. Run main seed first.');
    process.exit(1);
  }

  // Get existing tables
  let tables = await prisma.table.findMany();

  // Create additional tables if needed (need at least 10 for 30 guests at 10/table)
  if (tables.length < 10) {
    console.log('🪑 Creating additional tables...');
    const tablesToCreate = 10 - tables.length;
    for (let i = 0; i < tablesToCreate; i++) {
      const tableNum = tables.length + i + 1;
      await prisma.table.create({
        data: {
          name: tableNum <= 3 ? `VIP Table ${tableNum}` : `Standard Table ${tableNum - 3}`,
          capacity: 10,
          type: tableNum <= 3 ? 'vip' : 'standard',
          pos_x: 2 + (tableNum % 5) * 4,
          pos_y: 2 + Math.floor(tableNum / 5) * 4,
          status: TableStatus.available,
        },
      });
    }
    tables = await prisma.table.findMany();
    console.log(`✅ Created ${tablesToCreate} additional tables`);
  }

  const createdGuests: { id: number; name: string; type: string }[] = [];
  let guestIndex = 0;

  // ==========================================
  // PAYING SINGLE GUESTS (60 total)
  // ==========================================
  console.log('💳 Creating 60 paying single guests...');

  const payingSingleStatuses: { regStatus: RegistrationStatus; paymentStatus: PaymentStatus | null; paymentMethod?: PaymentMethod; hasQR: boolean }[] = [
    // 15 invited (magic link pending)
    ...Array(15).fill({ regStatus: RegistrationStatus.invited, paymentStatus: null, hasQR: false }),
    // 15 registered (pending payment)
    ...Array(15).fill({ regStatus: RegistrationStatus.registered, paymentStatus: PaymentStatus.pending, hasQR: false }),
    // 20 approved (paid - card)
    ...Array(20).fill({ regStatus: RegistrationStatus.approved, paymentStatus: PaymentStatus.paid, paymentMethod: PaymentMethod.card, hasQR: true }),
    // 7 approved (paid - bank transfer)
    ...Array(7).fill({ regStatus: RegistrationStatus.approved, paymentStatus: PaymentStatus.paid, paymentMethod: PaymentMethod.bank_transfer, hasQR: true }),
    // 3 failed payment
    ...Array(3).fill({ regStatus: RegistrationStatus.registered, paymentStatus: PaymentStatus.failed, hasQR: false }),
  ];

  for (let i = 0; i < 60; i++) {
    guestIndex++;
    const name = generateName();
    const status = payingSingleStatuses[i];
    const email = `single${guestIndex}@ceogala.test`;

    const guest = await prisma.guest.create({
      data: {
        email,
        name: name.full,
        guest_type: GuestType.paying_single,
        registration_status: status.regStatus,
        magic_link_hash: `hash_${email}`,
        magic_link_expires_at: status.regStatus === RegistrationStatus.invited
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
        company: randomElement(companies),
        position: randomElement(positions),
        dietary_requirements: randomElement(dietaryOptions),
        seating_preferences: randomElement(seatingPrefs),
      },
    });

    // Create registration for non-invited
    if (status.regStatus !== RegistrationStatus.invited) {
      const registration = await prisma.registration.create({
        data: {
          guest_id: guest.id,
          ticket_type: TicketType.paid_single,
          payment_method: status.paymentMethod || PaymentMethod.card,
          gdpr_consent: true,
          gdpr_consent_at: new Date(),
          cancellation_accepted: true,
          cancellation_accepted_at: new Date(),
          qr_code_hash: status.hasQR ? `qr_single_${guest.id}` : null,
          qr_code_generated_at: status.hasQR ? new Date() : null,
        },
      });

      // Create billing info
      await prisma.billingInfo.create({
        data: {
          registration_id: registration.id,
          billing_name: name.full,
          address_line1: `Teszt utca ${guestIndex}.`,
          city: 'Budapest',
          postal_code: `1${String(Math.floor(Math.random() * 900) + 100)}`,
          country: 'HU',
        },
      });

      // Create payment
      if (status.paymentStatus) {
        await prisma.payment.create({
          data: {
            registration_id: registration.id,
            stripe_session_id: status.paymentMethod === 'card' ? `cs_single_${guest.id}` : undefined,
            amount: 100000,
            currency: 'HUF',
            payment_status: status.paymentStatus,
            payment_method: status.paymentMethod || PaymentMethod.card,
            paid_at: status.paymentStatus === 'paid' ? new Date() : null,
          },
        });
      }
    }

    createdGuests.push({ id: guest.id, name: name.full, type: 'paying_single' });
  }

  console.log('✅ Created 60 paying single guests');

  // ==========================================
  // VIP GUESTS (15 total)
  // ==========================================
  console.log('🎫 Creating 15 VIP guests...');

  const vipStatuses: { regStatus: RegistrationStatus; hasQR: boolean }[] = [
    ...Array(5).fill({ regStatus: RegistrationStatus.invited, hasQR: false }),
    ...Array(3).fill({ regStatus: RegistrationStatus.registered, hasQR: false }),
    ...Array(7).fill({ regStatus: RegistrationStatus.approved, hasQR: true }),
  ];

  for (let i = 0; i < 15; i++) {
    guestIndex++;
    const name = generateName();
    const status = vipStatuses[i];
    const email = `viptest${guestIndex}@ceogala.test`;

    const guest = await prisma.guest.create({
      data: {
        email,
        name: `Dr. ${name.full}`, // VIPs get Dr. title
        title: 'Dr.',
        guest_type: GuestType.vip,
        registration_status: status.regStatus,
        magic_link_hash: `hash_${email}`,
        magic_link_expires_at: status.regStatus === RegistrationStatus.invited
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
        company: randomElement(companies),
        position: randomElement(['CEO', 'Elnök', 'Alapító', 'Vezérigazgató']),
        dietary_requirements: randomElement(dietaryOptions),
        seating_preferences: randomElement(seatingPrefs),
      },
    });

    // Create registration for registered/approved VIPs
    if (status.regStatus !== RegistrationStatus.invited) {
      await prisma.registration.create({
        data: {
          guest_id: guest.id,
          ticket_type: TicketType.vip_free,
          gdpr_consent: true,
          gdpr_consent_at: new Date(),
          cancellation_accepted: true,
          cancellation_accepted_at: new Date(),
          qr_code_hash: status.hasQR ? `qr_vip_${guest.id}` : null,
          qr_code_generated_at: status.hasQR ? new Date() : null,
        },
      });
    }

    createdGuests.push({ id: guest.id, name: `Dr. ${name.full}`, type: 'vip' });
  }

  console.log('✅ Created 15 VIP guests');

  // ==========================================
  // PAIRED GUESTS (10 pairs = 20 guests)
  // ==========================================
  console.log('👫 Creating 10 paired guest couples (20 guests)...');

  const pairedStatuses: { regStatus: RegistrationStatus; paymentStatus: PaymentStatus | null; paymentMethod?: PaymentMethod; hasQR: boolean }[] = [
    ...Array(3).fill({ regStatus: RegistrationStatus.invited, paymentStatus: null, hasQR: false }),
    ...Array(2).fill({ regStatus: RegistrationStatus.registered, paymentStatus: PaymentStatus.pending, hasQR: false }),
    ...Array(4).fill({ regStatus: RegistrationStatus.approved, paymentStatus: PaymentStatus.paid, paymentMethod: PaymentMethod.card, hasQR: true }),
    ...Array(1).fill({ regStatus: RegistrationStatus.approved, paymentStatus: PaymentStatus.paid, paymentMethod: PaymentMethod.bank_transfer, hasQR: true }),
  ];

  for (let i = 0; i < 10; i++) {
    guestIndex++;
    const mainName = generateName();
    const partnerName = generateName();
    const status = pairedStatuses[i];
    const mainEmail = `paired${guestIndex}@ceogala.test`;
    const partnerEmail = `partner${guestIndex}@ceogala.test`;

    // Main guest
    const mainGuest = await prisma.guest.create({
      data: {
        email: mainEmail,
        name: mainName.full,
        guest_type: GuestType.paying_paired,
        registration_status: status.regStatus,
        magic_link_hash: `hash_${mainEmail}`,
        magic_link_expires_at: status.regStatus === RegistrationStatus.invited
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
        company: randomElement(companies),
        position: randomElement(positions),
        dietary_requirements: randomElement(dietaryOptions),
        seating_preferences: randomElement(seatingPrefs),
      },
    });

    // Partner guest
    const partnerGuest = await prisma.guest.create({
      data: {
        email: partnerEmail,
        name: partnerName.full,
        guest_type: GuestType.paying_paired,
        registration_status: status.regStatus,
        magic_link_hash: `hash_${partnerEmail}`,
        paired_with_id: mainGuest.id,
        dietary_requirements: randomElement(dietaryOptions),
        seating_preferences: randomElement(seatingPrefs),
      },
    });

    // Create registrations for non-invited
    if (status.regStatus !== RegistrationStatus.invited) {
      const mainReg = await prisma.registration.create({
        data: {
          guest_id: mainGuest.id,
          ticket_type: TicketType.paid_paired,
          partner_name: partnerName.full,
          partner_email: partnerEmail,
          payment_method: status.paymentMethod || PaymentMethod.card,
          gdpr_consent: true,
          gdpr_consent_at: new Date(),
          cancellation_accepted: true,
          cancellation_accepted_at: new Date(),
          qr_code_hash: status.hasQR ? `qr_paired_${mainGuest.id}` : null,
          qr_code_generated_at: status.hasQR ? new Date() : null,
        },
      });

      await prisma.registration.create({
        data: {
          guest_id: partnerGuest.id,
          ticket_type: TicketType.paid_paired,
          partner_name: mainName.full,
          partner_email: mainEmail,
          payment_method: status.paymentMethod || PaymentMethod.card,
          gdpr_consent: true,
          gdpr_consent_at: new Date(),
          cancellation_accepted: true,
          cancellation_accepted_at: new Date(),
          qr_code_hash: status.hasQR ? `qr_partner_${partnerGuest.id}` : null,
          qr_code_generated_at: status.hasQR ? new Date() : null,
        },
      });

      // Billing info (main guest only)
      await prisma.billingInfo.create({
        data: {
          registration_id: mainReg.id,
          billing_name: mainName.full,
          address_line1: `Páros utca ${guestIndex}.`,
          city: 'Budapest',
          postal_code: `1${String(Math.floor(Math.random() * 900) + 100)}`,
          country: 'HU',
        },
      });

      // Payment (main guest only)
      if (status.paymentStatus) {
        await prisma.payment.create({
          data: {
            registration_id: mainReg.id,
            stripe_session_id: status.paymentMethod === 'card' ? `cs_paired_${mainGuest.id}` : undefined,
            amount: 180000,
            currency: 'HUF',
            payment_status: status.paymentStatus,
            payment_method: status.paymentMethod || PaymentMethod.card,
            paid_at: status.paymentStatus === 'paid' ? new Date() : null,
          },
        });
      }
    }

    createdGuests.push({ id: mainGuest.id, name: mainName.full, type: 'paying_paired' });
    createdGuests.push({ id: partnerGuest.id, name: partnerName.full, type: 'paying_paired_partner' });
  }

  console.log('✅ Created 10 paired guest couples (20 guests)');

  // ==========================================
  // APPLICANTS (5 total)
  // ==========================================
  console.log('📝 Creating 5 applicant guests...');

  const applicantStatuses: { regStatus: RegistrationStatus }[] = [
    { regStatus: RegistrationStatus.pending_approval },
    { regStatus: RegistrationStatus.pending_approval },
    { regStatus: RegistrationStatus.pending_approval },
    { regStatus: RegistrationStatus.rejected },
    { regStatus: RegistrationStatus.rejected },
  ];

  for (let i = 0; i < 5; i++) {
    guestIndex++;
    const name = generateName();
    const status = applicantStatuses[i];
    const email = `applicant${guestIndex}@ceogala.test`;

    const guest = await prisma.guest.create({
      data: {
        email,
        name: name.full,
        guest_type: GuestType.applicant,
        registration_status: status.regStatus,
        company: randomElement(companies),
        position: randomElement(positions),
        seating_preferences: `Motiváció: Szeretnék részt venni a CEO Gala eseményen, mert ${randomElement([
          'a networking lehetőségek miatt',
          'az iparági kapcsolatok építése céljából',
          'a szakmai fejlődés érdekében',
          'korábbi évben is részt vettem és nagyon tetszett',
          'az üzleti partnereimmel szeretnék találkozni',
        ])}.`,
      },
    });

    createdGuests.push({ id: guest.id, name: name.full, type: 'applicant' });
  }

  console.log('✅ Created 5 applicant guests');

  // ==========================================
  // TABLE ASSIGNMENTS (30 guests)
  // ==========================================
  console.log('🎯 Assigning 30 guests to tables...');

  // Get approved guests with QR codes for table assignment
  const approvedGuests = await prisma.guest.findMany({
    where: {
      registration_status: RegistrationStatus.approved,
      registration: {
        qr_code_hash: { not: null },
      },
    },
    take: 30,
  });

  let assignedCount = 0;
  for (const guest of approvedGuests) {
    if (assignedCount >= 30) break;

    const tableIndex = Math.floor(assignedCount / 10);
    if (tableIndex < tables.length) {
      try {
        await prisma.tableAssignment.create({
          data: {
            table_id: tables[tableIndex].id,
            guest_id: guest.id,
            seat_number: (assignedCount % 10) + 1,
            assigned_by: adminUser.id,
          },
        });
        assignedCount++;
      } catch (e) {
        // Skip if already assigned
      }
    }
  }

  console.log(`✅ Assigned ${assignedCount} guests to tables`);

  // ==========================================
  // SUMMARY
  // ==========================================
  const totalGuests = await prisma.guest.count();
  const totalAssignments = await prisma.tableAssignment.count();

  console.log('');
  console.log('🎉 100 test guests seed completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log('');
  console.log('👥 GUEST DISTRIBUTION:');
  console.log('   Paying Single: 60 (60%)');
  console.log('     - 15 invited (magic link pending)');
  console.log('     - 15 registered (pending payment)');
  console.log('     - 20 paid (card)');
  console.log('     - 7 paid (bank transfer)');
  console.log('     - 3 failed payment');
  console.log('   VIP: 15 (15%)');
  console.log('     - 5 invited');
  console.log('     - 3 registered');
  console.log('     - 7 approved (has QR)');
  console.log('   Paired: 20 (10 couples) (20%)');
  console.log('     - 3 pairs invited');
  console.log('     - 2 pairs pending payment');
  console.log('     - 5 pairs paid');
  console.log('   Applicants: 5 (5%)');
  console.log('     - 3 pending approval');
  console.log('     - 2 rejected');
  console.log('');
  console.log('🪑 TABLE ASSIGNMENTS:');
  console.log(`   Assigned: ${assignedCount} guests`);
  console.log(`   Unassigned: ${100 - assignedCount} guests (for drag & drop testing)`);
  console.log('');
  console.log(`📈 TOTAL IN DATABASE: ${totalGuests} guests, ${totalAssignments} assignments`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
