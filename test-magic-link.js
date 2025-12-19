const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// Env változók
const APP_SECRET = process.env.APP_SECRET || 'e3a145a950a22e8b37c1affc26c508b71126317619a7a8431121c6986c265367';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://46.202.153.178';

// SMTP config
const SMTP_HOST = 'smtp-relay.brevo.com';
const SMTP_PORT = 587;
const SMTP_USER = '9d86f7001@smtp-brevo.com';
const SMTP_PASS = 'tX9DY16dVWjmz5Sr';
const SMTP_FROM = '9d86f7001@smtp-brevo.com';

// A saját email címed ide:
const TEST_EMAIL = 'szilagyi.janos.viktor@gmail.com';

function generateMagicLinkHash(email, timestamp) {
  const data = `${email}:${APP_SECRET}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function generateMagicLink(email, guestType) {
  const timestamp = Date.now();
  const hash = generateMagicLinkHash(email, timestamp);

  // VIP vs paying route
  const route = guestType === 'vip' ? '/register/vip' : '/register/paid';

  return {
    url: `${BASE_URL}${route}?code=${hash}&email=${encodeURIComponent(email)}&t=${timestamp}`,
    hash,
    timestamp
  };
}

async function testMagicLink() {
  console.log('🔗 Magic Link Teszt');
  console.log('==================');
  console.log('');

  // 1. Létrehozunk egy teszt vendéget
  const testEmail = TEST_EMAIL;
  let guest;

  try {
    // Ellenőrizzük, létezik-e már
    guest = await prisma.guest.findUnique({ where: { email: testEmail } });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          email: testEmail,
          name: 'Javo Teszt',
          guest_type: 'vip',
          registration_status: 'invited'
        }
      });
      console.log('✅ Teszt vendég létrehozva:', guest.id);
    } else {
      console.log('ℹ️ Teszt vendég már létezik:', guest.id);
    }
  } catch (err) {
    console.log('❌ Vendég létrehozási hiba:', err.message);
    return;
  }

  // 2. Magic link generálás
  console.log('');
  console.log('📧 Magic Link generálása...');
  const magicLink = generateMagicLink(testEmail, guest.guest_type);

  console.log('');
  console.log('🔑 Generált link:');
  console.log(magicLink.url);
  console.log('');
  console.log('Hash:', magicLink.hash.substring(0, 20) + '...');
  console.log('Timestamp:', new Date(magicLink.timestamp).toLocaleString('hu-HU'));
  console.log('');

  // 3. Email küldés
  console.log('📨 E-mail küldése...');

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #1A1F35; border-bottom: 3px solid #D4A84B; padding-bottom: 10px; }
        .button { display: inline-block; background: #D4A84B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 CEO Gála 2026 - Meghívó</h1>
        <p>Kedves <strong>${guest.name}</strong>!</p>
        <p>Örömmel értesítünk, hogy meghívást kaptál a <strong>CEO Gála 2026</strong> rendezvényre.</p>
        <p>A regisztráció befejezéséhez kattints az alábbi gombra:</p>
        <p style="text-align: center;">
          <a href="${magicLink.url}" class="button">Regisztráció Befejezése</a>
        </p>
        <p><small>Vagy másold be ezt a linket a böngésződbe:<br>${magicLink.url}</small></p>
        <p>⚠️ A link 5 percig érvényes!</p>
        <div class="footer">
          <p>CEO Gála 2026 - Regisztrációs Rendszer</p>
          <p>Ez egy automatikus üzenet, kérjük ne válaszolj rá.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transport.sendMail({
      from: SMTP_FROM,
      to: testEmail,
      subject: '🎉 CEO Gála 2026 - Magic Link Teszt',
      html: emailHtml
    });

    console.log('✅ E-mail sikeresen elküldve!');
    console.log('📬 Message ID:', info.messageId);
    console.log('');
    console.log('========================================');
    console.log('🎯 TESZT EREDMÉNY: SIKERES');
    console.log('========================================');
    console.log('');
    console.log('Ellenőrizd a postafiókod:', testEmail);
    console.log('(Lehet a spam mappában!)');

  } catch (err) {
    console.log('❌ E-mail küldési hiba:', err.message);
  }

  // 4. Email log mentése
  try {
    await prisma.emailLog.create({
      data: {
        guest_id: guest.id,
        email_type: 'magic_link',
        recipient: testEmail,
        subject: 'CEO Gála 2026 - Magic Link Teszt',
        status: 'sent',
        sent_at: new Date()
      }
    });
    console.log('');
    console.log('📝 Email log mentve az adatbázisba');
  } catch (err) {
    console.log('⚠️ Email log mentési hiba:', err.message);
  }

  await prisma.$disconnect();
}

testMagicLink().catch(console.error);
