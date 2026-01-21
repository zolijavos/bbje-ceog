// CEO Gala - Reset User Password Script
// Usage: npx tsx scripts/reset-password.ts <email> <new-password>
// Example: npx tsx scripts/reset-password.ts admin@ceogala.hu NewSecurePass456!

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('');
    console.log('🔑 CEO Gala - Reset User Password');
    console.log('==================================');
    console.log('');
    console.log('Usage:');
    console.log('  npx tsx scripts/reset-password.ts <email> <new-password>');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx scripts/reset-password.ts admin@ceogala.hu NewSecurePass456!');
    console.log('');
    process.exit(1);
  }

  const email = args[0];
  const newPassword = args[1];

  // Validate password
  if (newPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  if (!/[A-Z]/.test(newPassword)) {
    console.error('❌ Password must contain at least one uppercase letter');
    process.exit(1);
  }

  if (!/[a-z]/.test(newPassword)) {
    console.error('❌ Password must contain at least one lowercase letter');
    process.exit(1);
  }

  if (!/[0-9]/.test(newPassword)) {
    console.error('❌ Password must contain at least one number');
    process.exit(1);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found`);
    process.exit(1);
  }

  // Update password
  console.log('');
  console.log('🔑 Resetting password...');

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password_hash: passwordHash },
  });

  console.log('');
  console.log('✅ Password reset successfully!');
  console.log('');
  console.log(`📋 User: ${user.email} (${user.name})`);
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
