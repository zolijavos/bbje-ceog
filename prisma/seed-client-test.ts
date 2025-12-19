// CEO Gala - Client Testing Seed Script
// Creates additional test users for client UAT testing
// Run with: npx ts-node prisma/seed-client-test.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Starting client test data seed...');
  console.log('');

  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const staffPasswordHash = await bcrypt.hash('Staff123!', 12);

  // ==========================================
  // ADDITIONAL ADMIN USERS
  // ==========================================
  console.log('👤 Creating additional admin users...');

  const adminUsers = [
    { email: 'admin2@ceogala.test', name: 'Admin Teszt 2' },
    { email: 'admin3@ceogala.test', name: 'Admin Teszt 3' },
  ];

  for (const admin of adminUsers) {
    const existing = await prisma.user.findUnique({ where: { email: admin.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: admin.email,
          password_hash: adminPasswordHash,
          name: admin.name,
          role: 'admin',
        },
      });
      console.log(`✅ Created admin: ${admin.email}`);
    } else {
      console.log(`⏭️  Admin already exists: ${admin.email}`);
    }
  }

  // ==========================================
  // ADDITIONAL STAFF USERS
  // ==========================================
  console.log('👷 Creating additional staff users...');

  const staffUsers = [
    { email: 'staff2@ceogala.test', name: 'Staff Teszt 2' },
    { email: 'staff3@ceogala.test', name: 'Staff Teszt 3' },
  ];

  for (const staff of staffUsers) {
    const existing = await prisma.user.findUnique({ where: { email: staff.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: staff.email,
          password_hash: staffPasswordHash,
          name: staff.name,
          role: 'staff',
        },
      });
      console.log(`✅ Created staff: ${staff.email}`);
    } else {
      console.log(`⏭️  Staff already exists: ${staff.email}`);
    }
  }

  // ==========================================
  // ADDITIONAL VIP GUEST
  // ==========================================
  console.log('🎫 Creating additional VIP guest...');

  const vip4 = await prisma.guest.findFirst({ where: { email: 'vip4@ceogala.test' } });
  if (!vip4) {
    await prisma.guest.create({
      data: {
        email: 'vip4@ceogala.test',
        name: 'Dr. Teszt VIP 4',
        guest_type: 'vip',
        registration_status: 'invited',
        magic_link_hash: `test_hash_vip4@ceogala.test`,
        magic_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Created VIP guest: vip4@ceogala.test');
  }

  // ==========================================
  // ADDITIONAL PAYING SINGLE GUEST
  // ==========================================
  console.log('💳 Creating additional paying single guest...');

  const paying3 = await prisma.guest.findFirst({ where: { email: 'paying3@ceogala.test' } });
  if (!paying3) {
    await prisma.guest.create({
      data: {
        email: 'paying3@ceogala.test',
        name: 'Barna Kata',
        guest_type: 'paying_single',
        registration_status: 'invited',
        magic_link_hash: `test_hash_paying3@ceogala.test`,
        magic_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log('✅ Created paying single guest: paying3@ceogala.test');
  }

  // ==========================================
  // APPLICANTS (NEW!)
  // ==========================================
  console.log('📝 Creating applicant guests...');

  const applicants = [
    {
      email: 'applicant1@ceogala.test',
      name: 'Teszt Jelentkező 1',
      company: 'Teszt Cég Kft.',
      position: 'Ügyvezető',
      motivation: 'Szeretnék részt venni a CEO Gala rendezvényen, mert...',
    },
    {
      email: 'applicant2@ceogala.test',
      name: 'Teszt Jelentkező 2',
      company: 'Példa Zrt.',
      position: 'Marketing igazgató',
      motivation: 'A networking lehetőségek miatt szeretnék jelentkezni.',
    },
    {
      email: 'applicant3@ceogala.test',
      name: 'Teszt Jelentkező 3',
      company: 'Demo Bt.',
      position: 'Tulajdonos',
      motivation: 'Korábbi évben is részt vettem és nagyon tetszett.',
    },
  ];

  for (const applicant of applicants) {
    const existing = await prisma.guest.findFirst({ where: { email: applicant.email } });
    if (!existing) {
      await prisma.guest.create({
        data: {
          email: applicant.email,
          name: applicant.name,
          guest_type: 'applicant',
          registration_status: 'pending_approval',
          company: applicant.company,
          position: applicant.position,
          // Note: motivation stored in seating_preferences for now (or add custom field)
          seating_preferences: `Motiváció: ${applicant.motivation}`,
        },
      });
      console.log(`✅ Created applicant: ${applicant.email}`);
    } else {
      console.log(`⏭️  Applicant already exists: ${applicant.email}`);
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('');
  console.log('🎉 Client test data seed completed!');
  console.log('');
  console.log('📊 Test Accounts Summary:');
  console.log('');
  console.log('👤 ADMIN USERS:');
  console.log('   admin@ceogala.test  / Admin123!');
  console.log('   admin2@ceogala.test / Admin123!');
  console.log('   admin3@ceogala.test / Admin123!');
  console.log('');
  console.log('👷 STAFF USERS:');
  console.log('   staff@ceogala.test  / Staff123!');
  console.log('   staff2@ceogala.test / Staff123!');
  console.log('   staff3@ceogala.test / Staff123!');
  console.log('');
  console.log('🎫 VIP GUESTS:');
  console.log('   vip1@ceogala.test - Invited (send magic link to test)');
  console.log('   vip2@ceogala.test - Registered');
  console.log('   vip3@ceogala.test - Approved (has QR ticket)');
  console.log('   vip4@ceogala.test - Invited (fresh)');
  console.log('');
  console.log('💳 PAYING SINGLE GUESTS:');
  console.log('   paying1@ceogala.test - Paid (has QR ticket)');
  console.log('   paying2@ceogala.test - Pending payment');
  console.log('   paying3@ceogala.test - Invited (fresh)');
  console.log('');
  console.log('👫 PAYING PAIRED GUESTS:');
  console.log('   paired1@ceogala.test + partner1@ceogala.test - Paid (bank)');
  console.log('   paired2@ceogala.test + partner2@ceogala.test - Paid (card)');
  console.log('   paired3@ceogala.test + partner3@ceogala.test - Pending');
  console.log('');
  console.log('📝 APPLICANTS:');
  console.log('   applicant1@ceogala.test - Pending approval');
  console.log('   applicant2@ceogala.test - Pending approval');
  console.log('   applicant3@ceogala.test - Pending approval');
  console.log('');
  console.log('💳 STRIPE TEST CARDS:');
  console.log('   Success: 4242 4242 4242 4242');
  console.log('   Decline: 4000 0000 0000 0002');
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
