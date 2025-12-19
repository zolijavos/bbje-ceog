const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const guest = await prisma.guest.findUnique({
    where: { email: 'zolijavos@gmail.com' },
    include: { registration: true }
  });

  if (!guest) {
    console.log('❌ Vendég nem található');
    return;
  }

  console.log('👤 Vendég adatok:');
  console.log('   ID:', guest.id);
  console.log('   Név:', guest.name);
  console.log('   Email:', guest.email);
  console.log('   Típus:', guest.guest_type);
  console.log('   Státusz:', guest.registration_status);
  console.log('   PWA kód:', guest.pwa_auth_code || 'NINCS');
  console.log('');

  if (guest.registration) {
    console.log('📋 Regisztráció:');
    console.log('   Reg ID:', guest.registration.id);
    console.log('   QR hash:', guest.registration.qr_code_hash ? guest.registration.qr_code_hash.substring(0,30) + '...' : 'NINCS');
    console.log('   Létrehozva:', guest.registration.created_at);
  } else {
    console.log('❌ Nincs regisztráció rekord!');
  }

  await prisma.$disconnect();
}

check().catch(console.error);
