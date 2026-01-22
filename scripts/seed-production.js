#!/usr/bin/env node
/**
 * Production Seed Script
 *
 * Creates test admin/staff users for a fresh deployment.
 * Run after deployment: node scripts/seed-production.js
 *
 * This is a simplified version that works without ts-node.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n===========================================');
  console.log('  CEO Gala - Production Seed');
  console.log('===========================================\n');

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Database already has ${existingUsers} user(s).`);
    console.log('Skipping seed to avoid duplicates.');
    console.log('Use "node scripts/create-admin.js" to add more users.\n');
    return;
  }

  console.log('Creating default users...\n');

  // Hash passwords
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const staffHash = await bcrypt.hash('Staff123!', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ceogala.test',
      password_hash: adminHash,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    }
  });
  console.log(`✅ Admin created: ${admin.email} / Admin123!`);

  // Create staff user
  const staff = await prisma.user.create({
    data: {
      email: 'staff@ceogala.test',
      password_hash: staffHash,
      first_name: 'Staff',
      last_name: 'User',
      role: 'staff'
    }
  });
  console.log(`✅ Staff created: ${staff.email} / Staff123!`);

  // Create sample tables
  console.log('\nCreating sample tables...');
  await prisma.table.createMany({
    data: [
      { name: 'VIP Table 1', capacity: 8, type: 'vip', pos_x: 2, pos_y: 2, status: 'available' },
      { name: 'VIP Table 2', capacity: 6, type: 'vip', pos_x: 6, pos_y: 2, status: 'available' },
      { name: 'Standard 1', capacity: 10, type: 'standard', pos_x: 2, pos_y: 6, status: 'available' },
      { name: 'Standard 2', capacity: 10, type: 'standard', pos_x: 6, pos_y: 6, status: 'available' },
    ]
  });
  console.log('✅ Created 4 tables');

  console.log('\n===========================================');
  console.log('  Seed completed successfully!');
  console.log('===========================================');
  console.log('\nTest credentials:');
  console.log('  Admin: admin@ceogala.test / Admin123!');
  console.log('  Staff: staff@ceogala.test / Staff123!');
  console.log('\nLogin at: /admin/login');
  console.log('===========================================\n');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
