/**
 * Magic Link Email Template
 * HTML and plain text templates for magic link invitation emails
 * Branded with CEO Gala 2026 visual identity - PDF-matching design
 */

export interface MagicLinkEmailParams {
  guestName: string;
  magicLinkUrl: string;
  baseUrl?: string;
}

/**
 * Get magic link email template (HTML and plain text)
 */
export function getMagicLinkEmailTemplate(params: MagicLinkEmailParams): {
  html: string;
  text: string;
} {
  const { guestName, magicLinkUrl, baseUrl = 'https://ceogala.mflevents.space' } = params;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to the CEO Gala 2026</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; text-align: center; }
    p { margin: 0 0 20px 0; font-size: 15px; text-align: center; color: #333333; }
    .greeting { font-size: 16px; margin-bottom: 25px; }
    .event-title { font-size: 28px; font-weight: bold; text-align: center; color: #000000; margin: 25px 0; }
    .details-section { margin: 35px 0; text-align: center; }
    .details-section p { margin: 5px 0; font-size: 15px; }
    .cta-container { text-align: center; margin: 35px 0 25px 0; }
    .cta-button { display: inline-block; background-color: #c41e3a; color: #ffffff !important; text-decoration: none; padding: 12px 35px; font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
    .cta-button:hover { background-color: #a01830; }
    .signatures { margin: 50px 0 40px 0; text-align: center; }
    .signatures-row { display: inline-block; width: 100%; }
    .signature { display: inline-block; width: 45%; text-align: center; vertical-align: top; }
    .signature-name { font-weight: bold; font-size: 15px; margin-bottom: 3px; color: #000000; }
    .signature-title { font-size: 14px; color: #333333; }
    .bbj-logo { text-align: center; margin: 50px 0 30px 0; }
    .footer { text-align: center; padding: 20px 0; }
    .footer p { font-size: 13px; color: #666666; margin: 5px 0; }
    .footer a { color: #333333; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <img src="${escapeHtml(baseUrl)}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" alt="CEO Gala 2026 - March 27, 2026" class="header-image" />

    <div class="content">
      <p class="greeting">Dear ${escapeHtml(guestName)},</p>

      <p>The Budapest Business Journal is delighted to invite you to the official</p>

      <div class="event-title">CEO Gala 2026</div>

      <p>hosted at Corinthia Hotel Budapest on Friday, March 27, 2026.</p>

      <p>As has now become a tradition of several years, two awards will be presented during the evening: the Expat CEO Award, granted to the most successful and innovative expatriate CEO working in Hungary; and the CEO Community Award, bestowed to a Hungarian executive who has been a role model by being successful in markets while demonstrating exceptional commitment to the community.</p>

      <p>Two professional awards committees will choose the winners minutes before the gala starts from a shortlist of three candidates.</p>

      <p>The Budapest Business Journal and our official event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you at our CEO Gala.</p>

      <div class="details-section">
        <p>Date:</p>
        <p>Friday, March 27, 2026, 7 p.m.</p>
        <br>
        <p>Location:</p>
        <p>The Grand Ballroom of the Corinthia Hotel Budapest</p>
        <p>1073 Budapest, Erzsebet krt. 43-49</p>
        <br>
        <p>Dress Code:</p>
        <p>Black tie for men, ball gown or cocktail dress for women</p>
      </div>

      <p>If you wish to reserve your place at the gala now, click the REGISTRATION button below.</p>

      <div class="cta-container">
        <a href="${escapeHtml(magicLinkUrl)}" class="cta-button">REGISTRATION</a>
      </div>

      <p>Should you wish to reserve an exclusive table for yourself, your guests or your company, our team will be pleased to assist you upon request.</p>

      <p>This personal invitation is dedicated to the addressee and is not transferable.</p>

      <p>Due to the event's popularity and the limited seating, early registration is strongly recommended to ensure participation.</p>

      <p>When you register, please let us know if you have any special dietary requirements.</p>

      <p>We will send you a feedback email after successful registration.</p>

      <p>Please kindly note that your registration will only be finalised after having the official confirmation received.</p>

      <p>For more details about the event and the award, including previous winners, visit our website at <a href="https://www.ceogala.com" style="color: #333333;">www.ceogala.com</a>.</p>

      <p>We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to <a href="mailto:event@bbj.hu" style="color: #333333;">event@bbj.hu</a>.</p>

      <p>Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 per person.</p>

      <p>We look forward to meeting you at the gala and celebrating our outstanding CEO Community.</p>

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

      <div class="bbj-logo">
        <img src="${escapeHtml(baseUrl)}/email-assets/bbj-logo.png" alt="Budapest Business Journal" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />
      </div>

      <div class="footer">
        <p><u>Business Publishing Services Kft.</u></p>
        <p>1075 Budapest, Madach Imre ut 13-14., Hungary</p>
        <p>Publisher of Budapest Business Journal</p>
        <p>Event website: <a href="https://ceogala.com">ceogala.com</a></p>
      </div>

    </div>
  </div>
</body>
</html>`;

  const text = `Invitation to the CEO Gala 2026

Dear ${guestName},

The Budapest Business Journal is delighted to invite you to the official

CEO Gala 2026

hosted at Corinthia Hotel Budapest on Friday, March 27, 2026.

As has now become a tradition of several years, two awards will be presented during the evening: the Expat CEO Award, granted to the most successful and innovative expatriate CEO working in Hungary; and the CEO Community Award, bestowed to a Hungarian executive who has been a role model by being successful in markets while demonstrating exceptional commitment to the community.

Two professional awards committees will choose the winners minutes before the gala starts from a shortlist of three candidates.

The Budapest Business Journal and our official event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you at our CEO Gala.

Date:
Friday, March 27, 2026, 7 p.m.

Location:
The Grand Ballroom of the Corinthia Hotel Budapest
1073 Budapest, Erzsebet krt. 43-49

Dress Code:
Black tie for men, ball gown or cocktail dress for women

If you wish to reserve your place at the gala now, click the REGISTRATION link below.

>>> REGISTRATION: ${magicLinkUrl} <<<

Should you wish to reserve an exclusive table for yourself, your guests or your company, our team will be pleased to assist you upon request.

This personal invitation is dedicated to the addressee and is not transferable.

Due to the event's popularity and the limited seating, early registration is strongly recommended to ensure participation.

When you register, please let us know if you have any special dietary requirements.

We will send you a feedback email after successful registration.

Please kindly note that your registration will only be finalised after having the official confirmation received.

For more details about the event and the award, including previous winners, visit our website at www.ceogala.com.

We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to event@bbj.hu.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 per person.

We look forward to meeting you at the gala and celebrating our outstanding CEO Community.

Tamas Botka                    Balazs Roman
Publisher, BBJ                 CEO, BBJ

---

BUDAPEST BUSINESS JOURNAL

Business Publishing Services Kft.
1075 Budapest, Madach Imre ut 13-14., Hungary
Publisher of Budapest Business Journal

Event website: ceogala.com`;

  return { html, text };
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, char => htmlEscapes[char]);
}
