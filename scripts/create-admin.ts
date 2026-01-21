// CEO Gala - Create Admin User Script
// Usage: npx tsx scripts/create-admin.ts <email> <password> [name]
// Example: npx tsx scripts/create-admin.ts admin@ceogala.hu MySecurePass123! "Admin User"

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('');
    console.log('🔐 CEO Gala - Create Admin User');
    console.log('================================');
    console.log('');
    console.log('Usage:');
    console.log('  npx tsx scripts/create-admin.ts <email> <password> [name]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx scripts/create-admin.ts admin@ceogala.hu MySecurePass123!');
    console.log('  npx tsx scripts/create-admin.ts admin@ceogala.hu MySecurePass123! "Kovács János"');
    console.log('');
    console.log('Password requirements:');
    console.log('  - Minimum 8 characters');
    console.log('  - At least one uppercase letter');
    console.log('  - At least one lowercase letter');
    console.log('  - At least one number');
    console.log('');
    process.exit(1);
  }

  const email = args[0];
  const password = args[1];
  const name = args[2] || 'Admin';

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
  }

  // Validate password
  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  if (!/[A-Z]/.test(password)) {
    console.error('❌ Password must contain at least one uppercase letter');
    process.exit(1);
  }

  if (!/[a-z]/.test(password)) {
    console.error('❌ Password must contain at least one lowercase letter');
    process.exit(1);
  }

  if (!/[0-9]/.test(password)) {
    console.error('❌ Password must contain at least one number');
    process.exit(1);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error(`❌ User with email "${email}" already exists`);
    console.log('');
    console.log('To update password, use: npx tsx scripts/reset-password.ts <email> <new-password>');
    process.exit(1);
  }

  // Create admin user
  console.log('');
  console.log('🔐 Creating admin user...');

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
      name,
      role: 'admin',
    },
  });

  console.log('');
  console.log('✅ Admin user created successfully!');
  console.log('');
  console.log('📋 Details:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name:  ${user.name}`);
  console.log(`   Role:  ${user.role}`);
  console.log('');
  console.log('🌐 Login at: /admin/login');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
