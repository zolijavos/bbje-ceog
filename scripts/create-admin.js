#!/usr/bin/env node
/**
 * Create Admin User Script
 *
 * Creates the first admin user for the CEO Gala system.
 * Run after deployment: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n===========================================');
  console.log('  CEO Gala - Admin User Creation');
  console.log('===========================================\n');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (existingAdmin) {
    console.log(`An admin user already exists: ${existingAdmin.email}`);
    const proceed = await question('Create another admin? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      process.exit(0);
    }
  }

  // Get admin details
  const email = await question('Admin email: ');
  if (!email || !email.includes('@')) {
    console.error('Invalid email address.');
    process.exit(1);
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.error(`User with email ${email} already exists.`);
    process.exit(1);
  }

  const password = await question('Password (min 8 chars): ');
  if (!password || password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const firstName = await question('First name: ');
  if (!firstName || firstName.trim().length === 0) {
    console.error('First name is required.');
    process.exit(1);
  }

  const lastName = await question('Last name: ');
  if (!lastName || lastName.trim().length === 0) {
    console.error('Last name is required.');
    process.exit(1);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'admin'
    }
  });

  console.log('\n===========================================');
  console.log('  Admin user created successfully!');
  console.log('===========================================');
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);
  console.log('\n  Login at: /admin/login');
  console.log('===========================================\n');

  rl.close();
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
