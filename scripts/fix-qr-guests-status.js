#!/usr/bin/env node
/**
 * Fix QR test guests status: approved -> registered
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAILS = [
  'zolijavos+qr01@gmail.com', 'zolijavos+qr02@gmail.com', 'zolijavos+qr03@gmail.com',
  'zolijavos+qr04@gmail.com', 'zolijavos+qr05@gmail.com',
  'agnes.tordai+qr01@gmail.com', 'agnes.tordai+qr02@gmail.com', 'agnes.tordai+qr03@gmail.com',
  'agnes.tordai+qr04@gmail.com', 'agnes.tordai+qr05@gmail.com',
  'zolijavos+vip01@gmail.com', 'zolijavos+vip02@gmail.com', 'zolijavos+vip03@gmail.com',
  'zolijavos+vip04@gmail.com', 'zolijavos+vip05@gmail.com', 'zolijavos+vip06@gmail.com',
  'zolijavos+vip07@gmail.com', 'zolijavos+vip08@gmail.com', 'zolijavos+vip09@gmail.com',
  'zolijavos+vip10@gmail.com',
];

async function main() {
  const result = await prisma.guest.updateMany({
    where: { email: { in: EMAILS } },
    data: { registration_status: 'registered' },
  });
  console.log(`Updated ${result.count} guests to 'registered' status.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
