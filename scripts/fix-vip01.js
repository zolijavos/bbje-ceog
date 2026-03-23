#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const QR_SECRET = process.env.QR_SECRET;

async function fix() {
  const g = await prisma.guest.findUnique({ where: { email: 'zolijavos+vip01@gmail.com' } });
  if (!g) { console.log('Not found'); return; }
  console.log('Guest #' + g.id + ', status: ' + g.registration_status);

  let reg = await prisma.registration.findFirst({ where: { guest_id: g.id } });
  if (reg && reg.qr_code_hash) {
    console.log('Already has registration #' + reg.id + ' with QR. Done.');
    return;
  }

  if (!reg) {
    console.log('No registration - creating...');
    reg = await prisma.registration.create({
      data: { guest_id: g.id, ticket_type: 'vip_free', gdpr_consent: true, cancellation_accepted: true }
    });
  }

  const payload = {
    registration_id: reg.id,
    guest_id: g.id,
    ticket_type: 'vip_free',
    guest_name: g.first_name + ' ' + g.last_name,
  };
  const eventDate = new Date('2026-03-27');
  eventDate.setHours(23, 59, 59, 999);
  eventDate.setDate(eventDate.getDate() + 1);
  const exp = Math.floor(eventDate.getTime() / 1000);
  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(payload, QR_SECRET, { expiresIn: exp - now, algorithm: 'HS256' });

  await prisma.registration.update({
    where: { id: reg.id },
    data: { qr_code_hash: token, qr_code_generated_at: new Date() }
  });
  await prisma.guest.update({
    where: { id: g.id },
    data: { registration_status: 'approved' }
  });
  console.log('Fixed: reg #' + reg.id + ' with QR generated');
}

fix().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1); });
