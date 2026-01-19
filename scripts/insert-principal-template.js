const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to the CEO Gala 2026</title>
  <style>
    body { font-family: Verdana, Geneva, sans-serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; text-align: center; }
    p { margin: 0 0 16px 0; font-size: 13px; color: #333333; text-align: center; }
    .greeting { font-size: 13px; margin-bottom: 20px; text-align: center; }
    .highlight { font-weight: bold; }
    .signatures { margin: 40px 0 30px 0; text-align: center; }
    .signatures-row { display: table; width: 100%; margin: 0 auto; }
    .signature { display: table-cell; width: 50%; text-align: center; vertical-align: top; }
    .signature-name { font-weight: bold; font-size: 13px; margin-bottom: 2px; color: #000000; }
    .signature-title { font-size: 12px; color: #333333; }
    .footer { text-align: center; padding: 25px 0; border-top: 1px solid #cccccc; margin-top: 30px; font-size: 11px; color: #666666; }
    .footer p { margin: 4px 0; text-align: center; font-size: 11px; }
    .footer a { color: #333333; text-decoration: underline; }
    .small-note { font-size: 10px; color: #999999; margin-top: 15px; }
    .email-marketing { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eeeeee; }
    .email-marketing a { color: #666666; text-decoration: underline; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{baseUrl}}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" alt="CEO Gala 2026 - March 27, 2026" class="header-image" />

    <div class="content">
      <p class="greeting">Dear {{guestTitle}} {{guestName}},</p>

      <p>We are delighted to announce that the next CEO Gala will take place on <span class="highlight">Friday, March 27, 2026</span>, at the <span class="highlight">Corinthia Hotel Budapest</span>.</p>

      <p>Now in its <span class="highlight">12th edition</span>, the CEO Gala has become a landmark event in Hungary's business calendar, a must-attend occasion for the country's most distinguished business leaders, diplomats, and representatives of international business organizations.</p>

      <p>The evening brings together a unique <span class="highlight">concentration of decision-makers</span> under one roof, individuals whose vision, leadership, and achievements drive a remarkable share of Hungary's economic performance. The atmosphere is truly inspiring: a celebration of excellence, innovation, and recognition, where meaningful connections are made and maintained.</p>

      <p>During the evening, we will present two of the most prestigious titles in Hungary's business community. The <span class="highlight">Expat CEO of the Year Award</span> honors an outstanding international business leader for their contribution to Hungary's economic life, while the <span class="highlight">CEO Community Award</span> recognizes a visionary leader whose activities have had a lasting, positive impact on society and the business environment.</p>

      <p>Please <span class="highlight">save the date</span> in your calendar; full event details and formal invitations will follow soon. We look forward to welcoming you to another inspiring edition of the CEO Gala in 2026.</p>

      <p>Warm regards,</p>

      <div class="signatures">
        <div class="signatures-row">
          <div class="signature">
            <div class="signature-name">Tamas Botka</div>
            <div class="signature-title">Publisher, BBJ</div>
          </div>
          <div class="signature">
            <div class="signature-name">Balazs Roman</div>
            <div class="signature-title">CEO, BBJ</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>For more details about the event and the award, including previous winners, visit our website at <a href="https://www.ceogala.com">www.ceogala.com</a>. We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.</p>
        <br>
        <p>&copy; Copyright, 2024-25</p>
        <p>1075 Budapest, Madách 11-13 14. Hungary</p>
        <p>This email has been sent to you, because you are a customer or subscriber of</p>
        <p>BUSINESS PUBLISHING SERVICES KFT.</p>
        <p><a href="https://ceogala.com">www.ceogala.com</a> - <a href="mailto:event@bbj.hu">event@bbj.hu</a></p>
        <p class="small-note"><a href="{{baseUrl}}/unsubscribe">Unsubscribe</a> | <a href="{{baseUrl}}/privacy">Manage my subscription</a></p>
      </div>

      <div class="email-marketing">
        <p>Email Marketing<br>Powered by<br><a href="https://www.mailpoet.com">MailPoet</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;

const textBody = `Dear {{guestTitle}} {{guestName}},

We are delighted to announce that the next CEO Gala will take place on Friday, March 27, 2026, at the Corinthia Hotel Budapest.

Now in its 12th edition, the CEO Gala has become a landmark event in Hungary's business calendar, a must-attend occasion for the country's most distinguished business leaders, diplomats, and representatives of international business organizations.

The evening brings together a unique concentration of decision-makers under one roof, individuals whose vision, leadership, and achievements drive a remarkable share of Hungary's economic performance.

During the evening, we will present two of the most prestigious titles in Hungary's business community: the Expat CEO of the Year Award and the CEO Community Award.

Please save the date in your calendar; full event details and formal invitations will follow soon.

Warm regards,
Tamas Botka, Publisher, BBJ
Balazs Roman, CEO, BBJ

For more details: www.ceogala.com
Email: event@bbj.hu`;

async function main() {
  const template = await prisma.emailTemplate.upsert({
    where: { slug: 'principal_invitation' },
    create: {
      slug: 'principal_invitation',
      name: 'Principal Guest Invitation',
      subject: 'Invitation to the CEO Gala 2026',
      html_body: htmlBody,
      text_body: textBody,
      variables: JSON.stringify(['guestTitle', 'guestName', 'baseUrl']),
      is_active: true,
    },
    update: {
      name: 'Principal Guest Invitation',
      subject: 'Invitation to the CEO Gala 2026',
      html_body: htmlBody,
      text_body: textBody,
      variables: JSON.stringify(['guestTitle', 'guestName', 'baseUrl']),
      is_active: true,
    },
  });

  console.log('✅ Template created/updated:', template.slug);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
