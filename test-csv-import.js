const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImport() {
  const timestamp = Date.now();

  // CSV tartalom
  const testGuests = [
    { email: `teszt.vip.${timestamp}@test.hu`, name: 'Teszt VIP Vendég', guest_type: 'vip' },
    { email: `teszt.fizeto.${timestamp}@test.hu`, name: 'Teszt Fizető Vendég', guest_type: 'paying_single' }
  ];

  console.log('📋 Teszt vendégek importálása...');
  console.log('');

  const created = [];

  for (const row of testGuests) {
    try {
      const guest = await prisma.guest.create({
        data: {
          email: row.email.toLowerCase(),
          name: row.name,
          guest_type: row.guest_type,
          registration_status: 'invited'
        }
      });
      console.log('✅ Létrehozva:', guest.email, '- ID:', guest.id);
      created.push(guest);
    } catch (err) {
      console.log('❌ Hiba:', row.email, '-', err.message);
    }
  }

  // Verify
  const count = await prisma.guest.count();
  console.log('');
  console.log('📊 Összesen vendég az adatbázisban:', count);
  console.log('');
  console.log('🆔 Létrehozott vendég ID-k:', created.map(g => g.id).join(', '));

  await prisma.$disconnect();

  return created;
}

testImport().catch(console.error);
