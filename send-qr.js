const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

const QR_SECRET = 'e3a145a950a22e8b37c1affc26c508b71126317619a7a8431121c6986c265367';
const EMAIL = 'zolijavos@gmail.com';

async function sendQR() {
  const guest = await prisma.guest.findUnique({
    where: { email: EMAIL },
    include: { registration: true }
  });

  if (!guest || !guest.registration) {
    console.log('❌ Nincs regisztráció');
    return;
  }

  console.log('👤 Vendég:', guest.id, '-', guest.name);
  console.log('📋 Regisztráció ID:', guest.registration.id);

  // JWT token generálás a QR kódhoz
  const payload = {
    registration_id: guest.registration.id,
    guest_id: guest.id,
    ticket_type: guest.registration.ticket_type || 'vip_free',
  };

  // Token lejárat: 2026. március 28. (event day + 1)
  const eventDate = new Date('2026-03-28T00:00:00');
  const exp = Math.floor(eventDate.getTime() / 1000);

  const token = jwt.sign({ ...payload, exp }, QR_SECRET, { algorithm: 'HS256' });
  console.log('🔐 JWT token generálva');

  // QR kód generálás (base64 PNG)
  const qrDataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: { dark: '#1A1F35', light: '#FFFFFF' }
  });
  console.log('📱 QR kód generálva');

  // QR hash mentése az adatbázisba
  await prisma.registration.update({
    where: { id: guest.registration.id },
    data: { qr_code_hash: token }
  });

  // Státusz frissítése
  await prisma.guest.update({
    where: { id: guest.id },
    data: { registration_status: 'approved' }
  });
  console.log('💾 Adatbázis frissítve');

  // Email küldés
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false,
    auth: { user: 'zolijavos@gmail.com', pass: 'ucgtikfsqvukpivw' }
  });

  const html = `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:8px;border:1px solid #ddd;">
      <h1 style="color:#1A1F35;border-bottom:3px solid #D4A84B;padding-bottom:10px;">🎫 CEO Gála 2026 - Belépőjegy</h1>
      <p>Kedves <strong>${guest.name}</strong>!</p>
      <p>Köszönjük a regisztrációt! Itt a belépőjegyed a <strong>CEO Gála 2026</strong> rendezvényre.</p>

      <div style="text-align:center;margin:30px 0;padding:20px;background:#f9f9f9;border-radius:8px;">
        <img src="${qrDataUrl}" alt="QR Belépőjegy" style="max-width:250px;"/>
        <p style="margin-top:15px;font-weight:bold;color:#1A1F35;">Mutasd be ezt a QR kódot a belépésnél!</p>
      </div>

      <div style="background:#FFF8E7;padding:15px;border-radius:8px;border-left:4px solid #D4A84B;">
        <p style="margin:0;"><strong>📅 Dátum:</strong> 2026. március 27. (péntek)</p>
        <p style="margin:5px 0 0 0;"><strong>📍 Helyszín:</strong> Budapest</p>
        <p style="margin:5px 0 0 0;"><strong>🎫 Jegy típus:</strong> VIP</p>
      </div>

      <p style="margin-top:20px;"><strong>PWA Alkalmazás belépési kód:</strong></p>
      <p style="font-size:24px;font-weight:bold;color:#D4A84B;letter-spacing:2px;text-align:center;">${guest.pwa_auth_code}</p>
      <p style="font-size:12px;color:#666;">Ezzel a kóddal léphetsz be a vendég alkalmazásba: <a href="https://ceogala.mflevents.space/pwa">https://ceogala.mflevents.space/pwa</a></p>

      <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;">
      <p style="font-size:11px;color:#999;">CEO Gála 2026 Szervező Bizottság</p>
    </div>
  `;

  const info = await transport.sendMail({
    from: 'CEO Gála 2026 <zolijavos@gmail.com>',
    to: EMAIL,
    subject: '🎫 CEO Gála 2026 - Belépőjegyed',
    html: html
  });

  console.log('');
  console.log('✅ QR jegy elküldve!');
  console.log('📬 Message ID:', info.messageId);
  console.log('');
  console.log('PWA kód:', guest.pwa_auth_code);

  await prisma.$disconnect();
}

sendQR().catch(console.error);
