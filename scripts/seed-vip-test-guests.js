#!/usr/bin/env node
/**
 * Seed 10 VIP test guests with registrations and QR codes
 * Email format: zolijavos+vip01...10@gmail.com
 *
 * Run: node scripts/seed-vip-test-guests.js
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

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

const VIP_GUESTS = [
  { first: 'Alexandra', last: 'Whitmore', title: 'Ms.' },
  { first: 'Richard', last: 'Steinberg', title: 'Mr.' },
  { first: 'Catherine', last: 'Lindström', title: 'Dr.' },
  { first: 'James', last: 'Harrington', title: 'Mr.' },
  { first: 'Isabella', last: 'Ferretti', title: 'Ms.' },
  { first: 'Thomas', last: 'Becker', title: 'Mr.' },
  { first: 'Elena', last: 'Kowalski', title: 'Ms.' },
  { first: 'Michael', last: 'Van der Berg', title: 'Mr.' },
  { first: 'Sophie', last: 'Delacroix', title: 'Dr.' },
  { first: 'Andrew', last: 'Nakamura', title: 'Mr.' },
];

async function main() {
  console.log('\n===========================================');
  console.log('  Seeding 10 VIP Test Guests with QR codes');
  console.log('===========================================\n');

  const created = [];

  for (let i = 0; i < VIP_GUESTS.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const email = `zolijavos+vip${num}@gmail.com`;
    const g = VIP_GUESTS[i];

    console.log(`[${num}/10] Creating ${g.title} ${g.first} ${g.last} (${email})...`);

    // Check if guest already exists
    const existing = await prisma.guest.findUnique({ where: { email } });
    if (existing) {
      console.log(`  ⚠ Already exists (id: ${existing.id}), skipping...`);
      continue;
    }

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        email,
        first_name: g.first,
        last_name: g.last,
        title: g.title,
        guest_type: 'invited',
        registration_status: 'approved',
        company: 'VIP Test Company',
        position: 'CEO',
        pwa_auth_code: generatePwaCode(),
      },
    });

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        guest_id: guest.id,
        ticket_type: 'vip_free',
        gdpr_consent: true,
        cancellation_accepted: true,
      },
    });

    // Generate JWT token for QR
    const payload = {
      registration_id: registration.id,
      guest_id: guest.id,
      ticket_type: 'vip_free',
      guest_name: `${g.first} ${g.last}`,
    };

    const exp = calculateExpiry();
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(payload, QR_SECRET, {
      expiresIn: exp - now,
      algorithm: 'HS256',
    });

    // Store QR token
    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        qr_code_hash: token,
        qr_code_generated_at: new Date(),
      },
    });

    console.log(`  ✅ Guest #${guest.id}, Registration #${registration.id}, QR generated`);
    created.push({ email, guestId: guest.id, regId: registration.id, name: `${g.title} ${g.first} ${g.last}` });
  }

  console.log('\n===========================================');
  console.log('  Summary');
  console.log('===========================================\n');
  console.log(`Created ${created.length} VIP test guests:\n`);
  created.forEach(c => {
    console.log(`  ${c.name} | ${c.email} | Guest #${c.guestId} | Reg #${c.regId}`);
  });
  console.log('\nAll guests have status: approved, ticket_type: vip_free, QR code generated.');
  console.log('Ready for vip_invitation email test.\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
