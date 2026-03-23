#!/usr/bin/env node
/**
 * Seed QR test guests with registrations and QR codes
 * 5x zolijavos+qr01..05@gmail.com + 5x agnes.tordai+qr01..05@gmail.com
 *
 * Run: node scripts/seed-qr-test-guests.js
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const QR_SECRET = process.env.QR_SECRET;
if (!QR_SECRET || QR_SECRET.length < 64) {
  console.error('QR_SECRET environment variable is required and must be at least 64 characters');
  process.exit(1);
}

const EVENT_DATE = process.env.EVENT_DATE || '2026-03-27';

function calculateExpiry() {
  const eventDate = new Date(EVENT_DATE);
  eventDate.setHours(23, 59, 59, 999);
  eventDate.setDate(eventDate.getDate() + 1);
  return Math.floor(eventDate.getTime() / 1000);
}

function generatePwaCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CEOG-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const GUESTS = [
  { email: 'zolijavos+qr01@gmail.com', first: 'Oliver', last: 'Hartmann', title: 'Mr.' },
  { email: 'zolijavos+qr02@gmail.com', first: 'Victoria', last: 'Engström', title: 'Ms.' },
  { email: 'zolijavos+qr03@gmail.com', first: 'Sebastian', last: 'Moretti', title: 'Mr.' },
  { email: 'zolijavos+qr04@gmail.com', first: 'Natalia', last: 'Petrova', title: 'Dr.' },
  { email: 'zolijavos+qr05@gmail.com', first: 'William', last: 'Chen', title: 'Mr.' },
  { email: 'agnes.tordai+qr01@gmail.com', first: 'Charlotte', last: 'Dubois', title: 'Ms.' },
  { email: 'agnes.tordai+qr02@gmail.com', first: 'Marcus', last: 'Svensson', title: 'Mr.' },
  { email: 'agnes.tordai+qr03@gmail.com', first: 'Emilia', last: 'Weber', title: 'Dr.' },
  { email: 'agnes.tordai+qr04@gmail.com', first: 'Daniel', last: 'O\'Brien', title: 'Mr.' },
  { email: 'agnes.tordai+qr05@gmail.com', first: 'Laura', last: 'Tanaka', title: 'Ms.' },
];

async function main() {
  console.log('\n===========================================');
  console.log('  Seeding 10 QR Test Guests');
  console.log('===========================================\n');

  const created = [];

  for (let i = 0; i < GUESTS.length; i++) {
    const g = GUESTS[i];
    console.log(`[${String(i + 1).padStart(2, '0')}/10] ${g.title} ${g.first} ${g.last} (${g.email})...`);

    const existing = await prisma.guest.findUnique({ where: { email: g.email } });
    if (existing) {
      console.log(`  ⚠ Already exists (id: ${existing.id}), skipping...`);
      continue;
    }

    const guest = await prisma.guest.create({
      data: {
        email: g.email,
        first_name: g.first,
        last_name: g.last,
        title: g.title,
        guest_type: 'invited',
        registration_status: 'approved',
        company: 'QR Test Company',
        position: 'Executive',
        pwa_auth_code: generatePwaCode(),
      },
    });

    const registration = await prisma.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    const payload = {
      registration_id: registration.id,
      guest_id: guest.id,
      ticket_type: 'vip_free',
      guest_name: `${g.first} ${g.last}`,
    };
    const exp = calculateExpiry();
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(payload, QR_SECRET, { expiresIn: exp - now, algorithm: 'HS256' });

    await prisma.registration.update({
      where: { id: registration.id },
      data: { qr_code_hash: token, qr_code_generated_at: new Date() },
    });

    console.log(`  ✅ Guest #${guest.id}, Reg #${registration.id}, QR generated`);
    created.push({ email: g.email, name: `${g.title} ${g.first} ${g.last}`, guestId: guest.id, regId: registration.id });
  }

  console.log('\n===========================================');
  console.log('  Summary');
  console.log('===========================================\n');
  console.log(`Created ${created.length} QR test guests:\n`);
  created.forEach(c => {
    console.log(`  ${c.name} | ${c.email} | Guest #${c.guestId} | Reg #${c.regId}`);
  });
  console.log('\nAll guests: approved, vip_free, QR generated.\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
