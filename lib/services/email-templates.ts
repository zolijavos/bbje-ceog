/**
 * Email Templates Service
 *
 * Manages customizable email templates stored in the database.
 * Supports variable interpolation for dynamic content.
 */

import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';
import type { EmailTemplate } from '@prisma/client';

// Default template definitions with their available variables
export const DEFAULT_TEMPLATES = {
  magic_link: {
    slug: 'magic_link',
    name: 'Magic Link Invitation',
    subject: 'Invitation to the CEO Gala 2026',
    variables: ['guestName', 'magicLinkUrl', 'baseUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>Invitation to the CEO Gala 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Verdana, Geneva, sans-serif; font-size: 15px; line-height: 1.6; color: #333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; width: 100%;">
          <!-- Header Image -->
          <tr>
            <td align="center" style="padding: 0;">
              <img src="{{baseUrl}}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" alt="CEO Gala 2026 - March 27, 2026" width="680" style="width: 100%; max-width: 680px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 20px 15px; text-align: center;">
              <!-- Greeting -->
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Dear <strong>{{guestName}}</strong>,</p>

              <!-- Intro paragraphs -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">The Budapest Business Journal and our official event partner, the <strong>Hungarian Investment Promotion Agency (HIPA)</strong>, are delighted to invite you to the official <strong>CEO Gala 2026</strong> hosted at <strong>Corinthia Hotel Budapest on Friday, March 27, 2026.</strong></p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">As has now become a tradition of several years, two awards will be presented during the evening: the <strong>Expat CEO Award</strong>, granted to the most successful and innovative expatriate CEO working in Hungary; and the <strong>CEO Community Award</strong>, bestowed to a Hungarian executive who has been a role model by being successful in markets while demonstrating exceptional commitment to the community. Two professional awards committees will choose the winners minutes before the gala starts from a shortlist of three candidates.</p>

              <!-- Details Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;"><strong>Date:</strong> Friday, March 27, 2026, 7 p.m.</td>
                </tr>
                <tr><td style="padding: 8px 0;"></td></tr>
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;"><strong>Location:</strong> The Grand Ballroom of the Corinthia Hotel Budapest</td>
                </tr>
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;">1073 Budapest, Erzsébet krt. 43-49</td>
                </tr>
                <tr><td style="padding: 8px 0;"></td></tr>
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;"><strong>Dress Code:</strong> Black tie for men, ball gown or cocktail dress for women</td>
                </tr>
              </table>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">If you wish to reserve your place at the gala now, click the registration button below.</p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 25px auto 20px auto;">
                <tr>
                  <td align="center" style="background-color: #c41e3a; padding: 12px 35px;">
                    <a href="{{magicLinkUrl}}" target="_blank" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif; display: inline-block;">REGISTRATION</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Should you wish to reserve an exclusive table for yourself, your guests or your company, our team will be pleased to assist you upon request.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">This personal invitation is dedicated to the addressee and is not transferable. Due to the event's popularity and the limited seating, early registration is strongly recommended to ensure participation. When you register, please let us know if you have any special dietary requirements. We will send you a feedback email after successful registration. Please kindly note that your registration will only be finalised after having the official confirmation received.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of <strong>HUF 99,000 + VAT</strong> per person.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">We look forward to meeting you at the gala and celebrating our outstanding CEO Community.</p>

              <!-- Warm regards -->
              <p style="margin: 25px 0 8px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: left; font-family: Verdana, Geneva, sans-serif;">Warm regards,</p>

              <!-- Signatures -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0 25px 0;">
                <tr>
                  <td width="50%" align="center" valign="top" style="padding: 0 10px;">
                    <p style="margin: 0 0 2px 0; font-weight: bold; font-size: 15px; color: #1a1a2e; font-family: Verdana, Geneva, sans-serif;">Tamas Botka</p>
                    <p style="margin: 0; font-size: 14px; color: #333333; font-family: Verdana, Geneva, sans-serif;">Publisher, BBJ</p>
                  </td>
                  <td width="50%" align="center" valign="top" style="padding: 0 10px;">
                    <p style="margin: 0 0 2px 0; font-weight: bold; font-size: 15px; color: #1a1a2e; font-family: Verdana, Geneva, sans-serif;">Balazs Roman</p>
                    <p style="margin: 0; font-size: 14px; color: #333333; font-family: Verdana, Geneva, sans-serif;">CEO, BBJ</p>
                  </td>
                </tr>
              </table>

              <!-- BBJ Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <img src="{{baseUrl}}/email-assets/bbj-logo.png" alt="Budapest Business Journal" width="300" style="max-width: 300px; height: auto; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td style="border-top: 1px solid #cccccc; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <p style="margin: 4px 0; font-size: 12px; color: #666666; font-family: Verdana, Geneva, sans-serif;"><a href="https://bbj.hu" style="color: #333333; text-decoration: underline;">Business Publishing Services Kft.</a></p>
                    <p style="margin: 4px 0; font-size: 12px; color: #666666; font-family: Verdana, Geneva, sans-serif;">For more details about the event and the award, <a href="https://www.ceogala.com" style="color: #333333; text-decoration: underline;">including previous winners</a>,<br>visit our website at <a href="https://www.ceogala.com" style="color: #333333; text-decoration: underline;">www.ceogala.com</a>.</p>
                    <p style="margin: 12px 0 4px 0; font-size: 11px; color: #666666; font-family: Verdana, Geneva, sans-serif;">© Copyright, 2024-26<br>1075 Budapest, Madách I. út 13-14, Hungary</p>
                    <p style="margin: 4px 0; font-size: 11px; color: #666666; font-family: Verdana, Geneva, sans-serif;">This email has been sent to you, because you are a customer or subscriber of<br>BUSINESS PUBLISHING SERVICES KFT.<br><a href="https://www.ceogala.com" style="color: #333333; text-decoration: underline;">www.ceogala.com</a> - <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text_body: `Invitation to the CEO Gala 2026

Dear {{guestName}},

The Budapest Business Journal and our official event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to invite you to the official CEO Gala 2026 hosted at Corinthia Hotel Budapest on Friday, March 27, 2026.

As has now become a tradition of several years, two awards will be presented during the evening: the Expat CEO Award, granted to the most successful and innovative expatriate CEO working in Hungary; and the CEO Community Award, bestowed to a Hungarian executive who has been a role model by being successful in markets while demonstrating exceptional commitment to the community. Two professional awards committees will choose the winners minutes before the gala starts from a shortlist of three candidates.

Date: Friday, March 27, 2026, 7 p.m.

Location: The Grand Ballroom of the Corinthia Hotel Budapest
1073 Budapest, Erzsébet krt. 43-49

Dress Code: Black tie for men, ball gown or cocktail dress for women

If you wish to reserve your place at the gala now, click the REGISTRATION link below.

>>> REGISTRATION: {{magicLinkUrl}} <<<

Should you wish to reserve an exclusive table for yourself, your guests or your company, our team will be pleased to assist you upon request.

This personal invitation is dedicated to the addressee and is not transferable. Due to the event's popularity and the limited seating, early registration is strongly recommended to ensure participation. When you register, please let us know if you have any special dietary requirements. We will send you a feedback email after successful registration. Please kindly note that your registration will only be finalised after having the official confirmation received.

We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to event@bbj.hu.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 + VAT per person.

We look forward to meeting you at the gala and celebrating our outstanding CEO Community.

Warm regards,

Tamas Botka                    Balazs Roman
Publisher, BBJ                 CEO, BBJ

---

BUDAPEST BUSINESS JOURNAL
For more details about the event and the award, including previous winners, visit our website at www.ceogala.com

© Copyright, 2024-26
Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13–14., Hungary
www.ceogala.com - event@bbj.hu`,
  },
  applicant_approval: {
    slug: 'applicant_approval',
    name: 'Applicant Approval',
    subject: 'CEO Gála 2026 - Application Approved',
    variables: ['guestName', 'magicLinkUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <title>CEO Gála - Application Approved</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <h1 style="color: #1a1a2e; font-size: 28px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">CEO Gála</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px;">
                          Application Approved
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="font-size: 18px; margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">Dear</p>
                    <p style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">{{guestName}}</p>
                    <p style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">Great news! Your application to attend the CEO Gála 2026 has been <strong>approved</strong>.</p>
                    <p style="margin: 0 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">You can now complete your registration by clicking the button below:</p>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #2563eb; padding: 14px 32px;">
                          <a href="{{magicLinkUrl}}" target="_blank" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">Complete Registration</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 15px;">
                    <p style="font-size: 14px; color: #6b7280; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">This link is valid for 72 hours.</p>
                  </td>
                </tr>
              </table>
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">If you have any questions, please contact us.</p>
                    <p style="font-size: 14px; color: #6b7280; margin: 5px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text_body: `CEO Gála -Application Approved

Dear {{guestName}},

Great news! Your application to attend the CEO Gála 2026 has been APPROVED.

You can now complete your registration by clicking the link below:
{{magicLinkUrl}}

This link is valid for 72 hours.

If you have any questions, please contact us.

Best regards,
CEO Gála Organizing Team`,
  },
  applicant_rejection: {
    slug: 'applicant_rejection',
    name: 'Applicant Rejection',
    subject: 'Registration Update for the CEO Gala 2026',
    variables: ['guestName', 'rejectionReason'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>Registration Update for the CEO Gala 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; width: 100%; background-color: #ffffff;">
          <tr>
            <td style="padding: 20px;">
              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 20px;">
                    <!-- Greeting -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.8; color: #333333; padding-bottom: 20px;">
                          Dear <span style="font-weight: 700;">{{guestName}}</span>,
                        </td>
                      </tr>
                    </table>
                    <!-- Message 1 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.8; color: #333333; padding-bottom: 18px;">
                          <span style="font-weight: bold;">We regret to inform you</span> that we cannot register you for the CEO of the Year Gala.
                        </td>
                      </tr>
                    </table>
                    <!-- Message 2 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.8; color: #333333; padding-bottom: 18px;">
                          Please note that only those on the invitation list can register for the event. Although we would be happy to invite many more guests, unfortunately, due to the limited number of seats, <span style="font-weight: bold;">we are unable to accommodate you</span> at the Gala this time.
                        </td>
                      </tr>
                    </table>
                    <!-- Message 3 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.8; color: #333333; padding-bottom: 18px;">
                          If you believe that, despite our best efforts, a mistake has been made, please contact our staff at <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>.
                        </td>
                      </tr>
                    </table>
                    <!-- Message 4 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.8; color: #333333; padding-bottom: 18px;">
                          We appreciate your understanding.
                        </td>
                      </tr>
                    </table>
                    <!-- Footer -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-top: 30px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #333333;">
                                Best regards,<br>The BBJ Team
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]>
      </td>
    </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `Registration Update for the CEO Gala 2026

Dear {{guestName}},

We regret to inform you that we cannot register you for the CEO of the Year Gala.

Please note that only those on the invitation list can register for the event. Although we would be happy to invite many more guests, unfortunately, due to the limited number of seats, we are unable to accommodate you at the Gala this time.

If you believe that, despite our best efforts, a mistake has been made, please contact our staff at event@bbj.hu.

We appreciate your understanding.

Best regards,
The BBJ Team`,
  },
  payment_reminder: {
    slug: 'payment_reminder',
    name: 'Payment Reminder',
    subject: 'CEO Gála 2026 - Payment Reminder',
    variables: ['guestName', 'ticketType', 'amount', 'paymentUrl', 'dueDate'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>CEO Gála - Payment Reminder</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">CEO Gála</h1>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
                <tr>
                  <td style="background-color: #f59e0b; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif;">Payment Reminder</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Dear<br><span style="font-size: 24px; font-weight: 700; color: #1a1a2e;">{{guestName}}</span></p>
              <p style="margin: 0 0 20px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;">This is a friendly reminder that your registration payment for CEO Gála 2026 is still pending.</p>
              <!-- Payment Info Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #fffbeb; border: 1px solid #f59e0b; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #b45309; font-size: 18px; font-family: Arial, Helvetica, sans-serif;">Payment Details</h3>
                    <p style="margin: 8px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Ticket Type:</strong> {{ticketType}}</p>
                    <p style="margin: 8px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Amount Due:</strong> {{amount}}</p>
                    {{#if dueDate}}<p style="margin: 8px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 30px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Please complete your payment to secure your spot at the event:</p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{paymentUrl}}" style="height:48px;v-text-anchor:middle;width:200px;" fillcolor="#2563eb" stroke="f">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;">Complete Payment</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{paymentUrl}}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Complete Payment</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">If you have already completed the payment, please disregard this email.</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">Best regards,<br>CEO Gála Organizing Team</p>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála -Payment Reminder

Dear {{guestName}},

This is a friendly reminder that your registration payment for CEO Gála 2026 is still pending.

PAYMENT DETAILS
---------------
Ticket Type: {{ticketType}}
Amount Due: {{amount}}
{{#if dueDate}}Due Date: {{dueDate}}{{/if}}

Please complete your payment to secure your spot at the event:
{{paymentUrl}}

If you have already completed the payment, please disregard this email.

Best regards,
CEO Gála Organizing Team`,
  },
  payment_confirmation: {
    slug: 'payment_confirmation',
    name: 'Payment Confirmation',
    subject: 'CEO Gála 2026 - Payment Confirmed',
    variables: ['guestName', 'ticketType', 'amount', 'paymentDate', 'transactionId'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>CEO Gála - Payment Confirmed</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td style="background-color: #ffffff; padding: 40px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 28px; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">CEO Gála</h1>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
                      <tr>
                        <td style="background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif;">Payment Confirmed</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px; line-height: 1.6; color: #333333; font-family: Arial, Helvetica, sans-serif;">Dear<span style="display: block; margin-top: 8px; font-size: 24px; font-weight: 700; color: #1a1a2e;">{{guestName}}</span></p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333; font-family: Arial, Helvetica, sans-serif;">Thank you! Your payment for CEO Gála 2026 has been successfully processed.</p>
                    <!-- Payment Info Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #f0fdf4; border: 1px solid #10b981; padding: 20px;">
                          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #166534; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">Payment Receipt</h3>
                          <p style="margin: 8px 0; font-size: 16px; line-height: 1.6; color: #15803d; font-family: Arial, Helvetica, sans-serif;"><strong>Ticket Type:</strong> {{ticketType}}</p>
                          <p style="margin: 8px 0; font-size: 16px; line-height: 1.6; color: #15803d; font-family: Arial, Helvetica, sans-serif;"><strong>Amount Paid:</strong> {{amount}}</p>
                          <p style="margin: 8px 0; font-size: 16px; line-height: 1.6; color: #15803d; font-family: Arial, Helvetica, sans-serif;"><strong>Payment Date:</strong> {{paymentDate}}</p>
                          {{#if transactionId}}<p style="margin: 8px 0; font-size: 16px; line-height: 1.6; color: #15803d; font-family: Arial, Helvetica, sans-serif;"><strong>Transaction ID:</strong> {{transactionId}}</p>{{/if}}
                        </td>
                      </tr>
                    </table>
                    <!-- Next Steps Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="border-left: 4px solid #2563eb; background-color: #f8f9fa; padding: 15px 20px;">
                          <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.6; color: #333333; font-family: Arial, Helvetica, sans-serif;"><strong>What's next?</strong></p>
                          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333; font-family: Arial, Helvetica, sans-serif;">Your e-ticket with QR code will be sent to you in a separate email shortly.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb; margin-top: 30px;">
                <tr>
                  <td align="center" style="padding-top: 30px;">
                    <p style="margin: 5px 0; font-size: 14px; line-height: 1.6; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">Please keep this email for your records.</p>
                    <p style="margin: 5px 0; font-size: 14px; line-height: 1.6; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála -Payment Confirmed

Dear {{guestName}},

Thank you! Your payment for CEO Gála 2026 has been successfully processed.

PAYMENT RECEIPT
---------------
Ticket Type: {{ticketType}}
Amount Paid: {{amount}}
Payment Date: {{paymentDate}}
{{#if transactionId}}Transaction ID: {{transactionId}}{{/if}}

WHAT'S NEXT?
Your e-ticket with QR code will be sent to you in a separate email shortly.

Please keep this email for your records.

Best regards,
CEO Gála Organizing Team`,
  },
  table_assignment: {
    slug: 'table_assignment',
    name: 'Table Assignment Notification',
    subject: 'CEO Gála 2026 - Your Table Assignment',
    variables: ['guestName', 'tableName', 'seatNumber', 'tablemates'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>CEO Gála - Table Assignment</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">CEO Gála</h1>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
                      <tr>
                        <td style="background-color: #8b5cf6; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif;">Table Assignment</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Dear</p>
                    <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">{{guestName}}</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Your table assignment for CEO Gála 2026 has been confirmed!</p>
                    <!-- Table Info Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #f5f3ff; border: 2px solid #8b5cf6; padding: 25px;" align="center">
                          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #5b21b6; font-family: Arial, Helvetica, sans-serif;">{{tableName}}</p>
                          {{#if seatNumber}}<p style="margin: 10px 0 0 0; font-size: 18px; color: #7c3aed; font-family: Arial, Helvetica, sans-serif;">Seat {{seatNumber}}</p>{{/if}}
                        </td>
                      </tr>
                    </table>
                    {{#if tablemates}}
                    <!-- Tablemates Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #f8f9fa; padding: 15px 20px;">
                          <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 16px; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Your Tablemates</h4>
                          <p style="margin: 5px 0; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">{{tablemates}}</p>
                        </td>
                      </tr>
                    </table>
                    {{/if}}
                    <p style="margin: 20px 0 0 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We look forward to seeing you at the event!</p>
                  </td>
                </tr>
              </table>
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb; margin-top: 30px;">
                <tr>
                  <td align="center" style="padding-top: 30px;">
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">If you have any questions about your seating, please contact us.</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála -Table Assignment

Dear {{guestName}},

Your table assignment for CEO Gála 2026 has been confirmed!

TABLE: {{tableName}}
{{#if seatNumber}}SEAT: {{seatNumber}}{{/if}}

{{#if tablemates}}YOUR TABLEMATES:
{{tablemates}}{{/if}}

We look forward to seeing you at the event!

If you have any questions about your seating, please contact us.

Best regards,
CEO Gála Organizing Team`,
  },
  event_reminder: {
    slug: 'event_reminder',
    name: 'Event Reminder',
    subject: 'CEO Gála 2026 - Event Tomorrow!',
    variables: ['guestName', 'eventDate', 'eventTime', 'eventVenue', 'eventAddress', 'tableName'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>CEO Gála - Event Reminder</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
  <tr><td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">CEO Gála</h1>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
                      <tr>
                        <td style="background-color: #ef4444; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif;">Tomorrow!</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Dear</p>
                    <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">{{guestName}}</p>
                    <p style="margin: 0 0 20px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We're excited to remind you that CEO Gála 2026 is <strong>tomorrow</strong>!</p>

                    <!-- Event Details Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #fef2f2; border: 2px solid #ef4444; padding: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #dc2626; text-align: center; font-size: 18px; font-family: Arial, Helvetica, sans-serif;">Event Details</h3>
                          <p style="margin: 10px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Date:</strong> {{eventDate}}</p>
                          <p style="margin: 10px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Time:</strong> {{eventTime}}</p>
                          <p style="margin: 10px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Venue:</strong> {{eventVenue}}</p>
                          {{#if eventAddress}}<p style="margin: 10px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Address:</strong> {{eventAddress}}</p>{{/if}}
                          {{#if tableName}}<p style="margin: 10px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Your Table:</strong> {{tableName}}</p>{{/if}}
                        </td>
                      </tr>
                    </table>

                    <!-- Checklist Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #f8f9fa; padding: 20px;">
                          <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">Before You Arrive</h4>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 4px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Have your QR code ready (check your email or the Gala App)</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Bring a valid photo ID</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Arrive by 5:30 PM for smooth registration</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Dress code: Business formal</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 20px 0 0 0; font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We look forward to welcoming you!</p>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 30px; text-align: center;">
                    <p style="margin: 5px 0; font-size: 14px; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">If you have any last-minute questions, please contact us.</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td></tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála -Event Tomorrow!

Dear {{guestName}},

We're excited to remind you that CEO Gála 2026 is TOMORROW!

EVENT DETAILS
-------------
Date: {{eventDate}}
Time: {{eventTime}}
Venue: {{eventVenue}}
{{#if eventAddress}}Address: {{eventAddress}}{{/if}}
{{#if tableName}}Your Table: {{tableName}}{{/if}}

BEFORE YOU ARRIVE
-----------------
- Have your QR code ready (check your email or the Gala App)
- Bring a valid photo ID
- Arrive by 5:30 PM for smooth registration
- Dress code: Business formal

We look forward to welcoming you!

If you have any last-minute questions, please contact us.

Best regards,
CEO Gála Organizing Team`,
  },
  event_reminder_e10: {
    slug: 'event_reminder_e10',
    name: 'Event Reminder (10 days)',
    subject: 'CEO Gála 2026 - 10 Days to Go!',
    variables: ['guestName', 'eventDate', 'eventTime', 'eventVenue', 'eventAddress', 'tableName'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>CEO Gála - 10 Days to Go</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px;">
        <!--[if mso]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff;">
          <tr>
            <td style="padding: 40px;">
              <!-- Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 30px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">CEO Gála</h1>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
                      <tr>
                        <td style="background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 600; padding: 10px 24px; font-family: Arial, Helvetica, sans-serif;">10 Days to Go!</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Dear<br><span style="font-size: 24px; font-weight: 700; color: #1a1a2e;">{{guestName}}</span></p>
                    <p style="margin: 0 0 20px 0; font-family: Arial, Helvetica, sans-serif; color: #333333;">The countdown is on! CEO Gála 2026 is just <strong>10 days away</strong>.</p>
                    <!-- Event Details Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #eff6ff; border: 2px solid #3b82f6; padding: 25px;">
                          <h3 style="margin: 0 0 15px 0; color: #1d4ed8; text-align: center; font-size: 18px; font-family: Arial, Helvetica, sans-serif;">Mark Your Calendar</h3>
                          <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Date:</strong> {{eventDate}}</p>
                          <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Time:</strong> {{eventTime}}</p>
                          <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Venue:</strong> {{eventVenue}}</p>
                          {{#if eventAddress}}<p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Address:</strong> {{eventAddress}}</p>{{/if}}
                          {{#if tableName}}<p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Your Table:</strong> {{tableName}}</p>{{/if}}
                        </td>
                      </tr>
                    </table>
                    <!-- Preparation Box -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                      <tr>
                        <td style="background-color: #f8f9fa; padding: 20px;">
                          <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">Get Ready</h4>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 4px 0; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Download the Gala App for quick access to your ticket</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Check your wardrobe - dress code is business formal</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Let us know about any dietary requirements</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; font-family: Arial, Helvetica, sans-serif; color: #4b5563;">&#8226; Plan your transportation to the venue</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; color: #333333;">We're looking forward to seeing you!</p>
                  </td>
                </tr>
              </table>
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e5e7eb; margin-top: 30px;">
                <tr>
                  <td align="center" style="padding-top: 30px;">
                    <p style="margin: 5px 0; font-size: 14px; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">Questions? Contact our support team.</p>
                    <p style="margin: 5px 0; font-size: 14px; color: #6b7280; font-family: Arial, Helvetica, sans-serif;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála - 10 Days to Go!

Dear {{guestName}},

The countdown is on! CEO Gála 2026 is just 10 DAYS AWAY.

EVENT DETAILS
-------------
Date: {{eventDate}}
Time: {{eventTime}}
Venue: {{eventVenue}}
{{#if eventAddress}}Address: {{eventAddress}}{{/if}}
{{#if tableName}}Your Table: {{tableName}}{{/if}}

GET READY
---------
- Download the Gala App for quick access to your ticket
- Check your wardrobe - dress code is business formal
- Let us know about any dietary requirements
- Plan your transportation to the venue

We're looking forward to seeing you!

Questions? Contact our support team.

Best regards,
CEO Gála Organizing Team`,
  },
  event_reminder_e7: {
    slug: 'event_reminder_e7',
    name: 'Event Reminder (7 days)',
    subject: 'CEO Gála 2026 - One Week to Go!',
    variables: ['guestName', 'eventDate', 'eventTime', 'eventVenue', 'eventAddress', 'tableName', 'cancelUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>CEO Gála - One Week to Go</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!--[if mso]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!--[if mso]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">CEO Gála</h1>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                <tr>
                  <td style="background-color: #f59e0b; color: #ffffff; font-size: 16px; font-weight: 600; padding: 10px 24px; font-family: Arial, Helvetica, sans-serif;">One Week to Go!</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 20px 0; font-size: 18px;">Dear<br><span style="font-size: 24px; font-weight: 700; color: #1a1a2e;">{{guestName}}</span></p>
              <p style="margin: 0 0 20px 0;">CEO Gála 2026 is now just <strong>one week away</strong>! We hope you're as excited as we are.</p>
              <!-- Event Details Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #d97706; text-align: center; font-size: 18px; font-family: Arial, Helvetica, sans-serif;">Event Details</h3>
                    <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;"><strong>Date:</strong> {{eventDate}}</p>
                    <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;"><strong>Time:</strong> {{eventTime}}</p>
                    <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;"><strong>Venue:</strong> {{eventVenue}}</p>
                    {{#if eventAddress}}<p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;"><strong>Address:</strong> {{eventAddress}}</p>{{/if}}
                    {{#if tableName}}<p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;"><strong>Your Table:</strong> {{tableName}}</p>{{/if}}
                  </td>
                </tr>
              </table>
              <!-- Cancel Notice Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px;">
                    <p style="margin: 0; color: #b91c1c; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong>Important:</strong> This is the last week to cancel your registration. If your plans have changed, please <a href="{{cancelUrl}}" style="color: #b91c1c; text-decoration: underline;">cancel here</a> before the deadline.</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0;">We can't wait to welcome you!</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #6b7280;">
                    <p style="margin: 0 0 5px 0;">Questions? Contact our support team.</p>
                    <p style="margin: 0;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála - One Week to Go!

Dear {{guestName}},

CEO Gála 2026 is now just ONE WEEK AWAY! We hope you're as excited as we are.

EVENT DETAILS
-------------
Date: {{eventDate}}
Time: {{eventTime}}
Venue: {{eventVenue}}
{{#if eventAddress}}Address: {{eventAddress}}{{/if}}
{{#if tableName}}Your Table: {{tableName}}{{/if}}

IMPORTANT NOTICE
----------------
This is the last week to cancel your registration.
If your plans have changed, please visit: {{cancelUrl}}

We can't wait to welcome you!

Questions? Contact our support team.

Best regards,
CEO Gála Organizing Team`,
  },
  ticket_delivery: {
    slug: 'ticket_delivery',
    name: 'Confirmation Email (Main Guest)',
    subject: 'Confirmation of Your Attendance at the CEO Gala 2026',
    variables: ['guestName', 'guestTitle', 'partnerName', 'guestQrCode', 'partnerQrCode', 'hasPartner', 'headerImage'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirmation of Your Attendance at the CEO Gala 2026</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
  <tr><td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <!--[if mso]>
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0">
        <tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; background-color: #ffffff;">
          <!-- Header Image -->
          <tr>
            <td align="center" style="padding: 0 0 30px 0;">
              <img src="{{headerImage}}" alt="CEO Gala 2026" width="680" style="width: 100%; max-width: 680px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding: 0 20px;">
              <h2 style="margin: 0 0 25px 0; font-size: 20px; font-weight: bold; color: #333333; font-family: Arial, Helvetica, sans-serif;">Confirmation</h2>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 20px;">
              <!-- Greeting -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Dear</p>
                    <p style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">{{guestTitle}} {{guestName}}</p>
                  </td>
                </tr>
              </table>

              <!-- Thank you -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;"><strong>Thank you for your registration!</strong></p>
                  </td>
                </tr>
              </table>

              <!-- Registration confirmation -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0;">
                    {{#if hasPartner}}
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We are pleased to confirm that you and your partner, <strong>{{partnerName}}</strong>, have successfully registered for our 12th CEO Gala!</p>
                    {{/if}}
                    {{#if hasPartner}}{{else}}
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We are pleased to confirm that you have successfully registered for our 12th CEO Gala!</p>
                    {{/if}}
                  </td>
                </tr>
              </table>

              <!-- Welcome message -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">The Budapest Business Journal and our esteemed event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you officially to this special occasion.</p>
                  </td>
                </tr>
              </table>

              <!-- Event date -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">The event will take place on <strong>Friday, March 27, 2026</strong>; be sure to mark your calendar!</p>
                  </td>
                </tr>
              </table>

              <!-- QR code instructions -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0;">
                    {{#if hasPartner}}
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Attached below are your and your partner's personal QR codes, which will grant you access to the gala. Please bring a printed copy to the event to ensure smooth entry. Please note that this <strong>personal invitation</strong> is dedicated to the addressee and is <strong>not transferable</strong>.</p>
                    {{/if}}
                    {{#if hasPartner}}{{else}}
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Attached below is your personal QR code, which will grant you access to the gala. Please bring a printed copy to the event to ensure smooth entry. Please note that this <strong>personal invitation</strong> is dedicated to the addressee and is <strong>not transferable</strong>.</p>
                    {{/if}}
                  </td>
                </tr>
              </table>

              <!-- Event Details Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 0 0 5px 0;">
                    <p style="margin: 0; font-size: 15px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; color: #333333;">Date:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 15px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Friday, March 27, 2026</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 5px 0;">
                    <p style="margin: 0; font-size: 15px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; color: #333333;">Location:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 15px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Corinthia Hotel Budapest<br>1073 Budapest, Erzsebet krt. 43-49.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 5px 0;">
                    <p style="margin: 0; font-size: 15px; font-weight: bold; font-family: Arial, Helvetica, sans-serif; color: #333333;">Dress Code:</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 15px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Black tie for men, ballgown or cocktail dress for women</p>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <!--[if mso]>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
              <tr>
                <td width="4" style="background-color: #c41e3a;"></td>
                <td style="background-color: #f8f8f8; padding: 15px 20px;">
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #f8f8f8; border-left: 4px solid #c41e3a; padding: 15px 20px;">
              <!--<![endif]-->
                    <p style="margin: 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We kindly remind you that any <strong>cancellations</strong> or changes to your registration must be made at least <strong>10 business days</strong> prior to the gala. Cancellations should be sent to <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>.</p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #333333;">Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a <strong>no-show fee</strong> of HUF 99,000 + VAT per person.</p>
              <!--[if mso]>
                </td>
              </tr>
              </table>
              <![endif]-->
              <!--[if !mso]><!-->
                  </td>
                </tr>
              </table>
              <!--<![endif]-->

              <!-- Looking forward -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.</p>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 40px 0 0 0;">
                    <p style="margin: 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">The BBJ CEO Gala Team</p>
                  </td>
                </tr>
              </table>

              <!-- QR Code Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0;">
                <tr>
                  <td align="center" style="padding: 0 0 25px 0;">
                    <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333333; font-family: Arial, Helvetica, sans-serif;">Your QR code(s) to access the gala</h3>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" valign="top" style="padding: 0 20px;">
                        <img src="{{guestQrCode}}" alt="Your QR Code" width="180" height="180" style="width: 180px; height: 180px; border: 1px solid #e0e0e0; display: block;" />
                        <p style="margin: 12px 0 0 0; font-size: 14px; font-weight: bold; color: #333333; font-family: Arial, Helvetica, sans-serif;">{{guestName}}</p>
                      </td>
                      {{#if hasPartner}}
                      <td align="center" valign="top" style="padding: 0 20px;">
                        <img src="{{partnerQrCode}}" alt="Partner QR Code" width="180" height="180" style="width: 180px; height: 180px; border: 1px solid #e0e0e0; display: block;" />
                        <p style="margin: 12px 0 0 0; font-size: 14px; font-weight: bold; color: #333333; font-family: Arial, Helvetica, sans-serif;">{{partnerName}}</p>
                      </td>
                      {{/if}}
                    </tr>
                    </table>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block; vertical-align: top;">
                      <tr>
                        <td align="center" style="padding: 0 20px;">
                          <img src="{{guestQrCode}}" alt="Your QR Code" width="180" height="180" style="width: 180px; height: 180px; border: 1px solid #e0e0e0; display: block;" />
                          <p style="margin: 12px 0 0 0; font-size: 14px; font-weight: bold; color: #333333; font-family: Arial, Helvetica, sans-serif;">{{guestName}}</p>
                        </td>
                      </tr>
                    </table>
                    {{#if hasPartner}}
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block; vertical-align: top;">
                      <tr>
                        <td align="center" style="padding: 0 20px;">
                          <img src="{{partnerQrCode}}" alt="Partner QR Code" width="180" height="180" style="width: 180px; height: 180px; border: 1px solid #e0e0e0; display: block;" />
                          <p style="margin: 12px 0 0 0; font-size: 14px; font-weight: bold; color: #333333; font-family: Arial, Helvetica, sans-serif;">{{partnerName}}</p>
                        </td>
                      </tr>
                    </table>
                    {{/if}}
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; border-top: 1px solid #e0e0e0;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <p style="margin: 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;"><u>Business Publishing Services Kft.</u></p>
                    <p style="margin: 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;">1075 Budapest, Madach Imre ut 13-14., Hungary</p>
                    <p style="margin: 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;">Publisher of Budapest Business Journal</p>
                    <p style="margin: 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;">Event website: <a href="https://ceogala.com" style="color: #333333; text-decoration: underline;">ceogala.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td></tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `Confirmation of Your Attendance at the CEO Gala 2026

Dear {{guestTitle}} {{guestName}},

Thank you for your registration!

{{#if hasPartner}}We are pleased to confirm that you and your partner, {{partnerName}}, have successfully registered for our 12th CEO Gala!{{/if}}
{{#if hasPartner}}{{else}}We are pleased to confirm that you have successfully registered for our 12th CEO Gala!{{/if}}

The Budapest Business Journal and our esteemed event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you officially to this special occasion.

The event will take place on Friday, March 27, 2026; be sure to mark your calendar!

{{#if hasPartner}}Attached below are your and your partner's personal QR codes, which will grant you access to the gala.{{/if}}
{{#if hasPartner}}{{else}}Attached below is your personal QR code, which will grant you access to the gala.{{/if}}

Please bring a printed copy to the event to ensure smooth entry.

Please note that this personal invitation is dedicated to the addressee and is not transferable.

Date:
Friday, March 27, 2026

Location:
Corinthia Hotel Budapest
1073 Budapest, Erzsébet krt. 43-49.

Dress Code:
Black tie for men, ballgown or cocktail dress for women

We kindly remind you that any cancellations or changes to your registration must be made at least 10 business days prior to the gala. Cancellations should be sent to event@bbj.hu.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 + VAT per person.

We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.

The BBJ CEO Gala Team

---

Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13-14., Hungary
Publisher of Budapest Business Journal
Event website: ceogala.com`,
  },
  partner_ticket_delivery: {
    slug: 'partner_ticket_delivery',
    name: 'Confirmation Email (Partner Guest)',
    subject: 'Confirmation of Your Attendance at the CEO Gala 2026',
    variables: ['partnerName', 'partnerTitle', 'mainGuestName', 'mainGuestTitle', 'partnerQrCode', 'mainGuestQrCode', 'headerImage'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation of Your Attendance at the CEO Gala 2026</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 20px;">
        <!--[if mso]>
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; background-color: #ffffff;">
          <!-- Header Image -->
          <tr>
            <td align="center" style="padding: 0 0 30px 0;">
              <img src="{{headerImage}}" alt="CEO Gala 2026" width="680" style="width: 100%; max-width: 680px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding: 0 20px;">
              <h2 style="margin: 0 0 25px 0; font-size: 20px; color: #333333; font-family: Arial, Helvetica, sans-serif;">Confirmation</h2>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 20px;">
              <!-- Greeting -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 20px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    Dear<br>
                    <span style="font-size: 22px; font-weight: 700; color: #1a1a2e;">{{partnerTitle}} {{partnerName}}</span>
                  </td>
                </tr>
              </table>
              <!-- Thank you -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    <strong>Thank you for your registration!</strong>
                  </td>
                </tr>
              </table>
              <!-- Confirmation text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    We are pleased to confirm your registration as a <strong>Partner guest</strong> for the 12th CEO Gala.
                  </td>
                </tr>
              </table>
              <!-- Registered by -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    Your attendance has been registered by <strong>{{mainGuestTitle}} {{mainGuestName}}</strong>, and we are delighted to welcome you to this distinguished occasion organised by the Budapest Business Journal, together with its official event partner, the Hungarian Investment Promotion Agency (HIPA).
                  </td>
                </tr>
              </table>
              <!-- Event date -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    The event will take place on <strong>Friday, March 27, 2026</strong>; be sure to mark your calendar!
                  </td>
                </tr>
              </table>
              <!-- QR codes info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    Attached below are your and your partner's personal QR codes, which will grant you access to the gala. Please bring a printed copy to the event to ensure smooth entry. Please note that this <strong>personal invitation</strong> is dedicated to the addressee and is <strong>not transferable</strong>.
                  </td>
                </tr>
              </table>
              <!-- Details Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td style="font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    <p style="margin: 0 0 5px 0; font-weight: bold;">Date:</p>
                    <p style="margin: 0 0 15px 0;">Friday, March 27, 2026</p>
                    <p style="margin: 0 0 5px 0; font-weight: bold;">Location:</p>
                    <p style="margin: 0 0 15px 0;">Corinthia Hotel Budapest<br>1073 Budapest, Erzs&#233;bet krt. 43-49.</p>
                    <p style="margin: 0 0 5px 0; font-weight: bold;">Dress Code:</p>
                    <p style="margin: 0 0 15px 0;">Black tie for men, ballgown or cocktail dress for women</p>
                  </td>
                </tr>
              </table>
              <!-- Notice Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #f8f8f8; border-left: 4px solid #c41e3a; padding: 15px 20px;">
                    <p style="margin: 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                      Should you be unable to attend, we kindly ask that any changes be communicated via <strong>{{mainGuestTitle}} {{mainGuestName}}</strong>. We kindly remind you that any <strong>cancellations</strong> or changes to your registration must be made at least <strong>10 business days</strong> prior to the gala.
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                      Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a <strong>no-show fee</strong> of HUF 99,000 + VAT per person.
                    </p>
                  </td>
                </tr>
              </table>
              <!-- Looking forward -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0 0 18px 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.
                  </td>
                </tr>
              </table>
              <!-- Signature -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 40px 0 0 0; font-size: 15px; font-family: Arial, Helvetica, sans-serif; color: #333333;">
                    The BBJ CEO Gala Team
                  </td>
                </tr>
              </table>
              <!-- QR Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0;">
                <tr>
                  <td align="center" style="padding: 0 0 25px 0;">
                    <h3 style="margin: 0; font-size: 16px; color: #333333; font-family: Arial, Helvetica, sans-serif;">Your QR code(s) to access the gala</h3>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                    <td align="center" valign="top" width="200">
                    <![endif]-->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block; vertical-align: top; margin: 0 20px 20px 20px;">
                      <tr>
                        <td align="center" style="padding: 0;">
                          <img src="{{partnerQrCode}}" alt="Your QR Code" width="180" height="180" style="width: 180px; height: 180px; border: 1px solid #e0e0e0; display: block;" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 12px 0 0 0; font-weight: bold; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif;">
                          {{partnerName}}
                        </td>
                      </tr>
                    </table>
                    <!--[if mso]>
                    </td>
                    <td align="center" valign="top" width="200">
                    <![endif]-->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block; vertical-align: top; margin: 0 20px 20px 20px;">
                      <tr>
                        <td align="center" style="padding: 0;">
                          <img src="{{mainGuestQrCode}}" alt="Partner QR Code" width="180" height="180" style="width: 180px; height: 180px; border: 1px solid #e0e0e0; display: block;" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 12px 0 0 0; font-weight: bold; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif;">
                          {{mainGuestName}}
                        </td>
                      </tr>
                    </table>
                    <!--[if mso]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                  </td>
                </tr>
              </table>
              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e0e0e0; margin-top: 30px;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;"><u>Business Publishing Services Kft.</u></p>
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;">1075 Budapest, Mad&#225;ch Imre &#250;t 13-14., Hungary</p>
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;">Publisher of Budapest Business Journal</p>
                    <p style="margin: 0; font-size: 13px; color: #666666; font-family: Arial, Helvetica, sans-serif;">Event website: <a href="https://ceogala.com" style="color: #333333; text-decoration: underline;">ceogala.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `Confirmation of Your Attendance at the CEO Gala 2026

Dear {{partnerTitle}} {{partnerName}},

Thank you for your registration!

We are pleased to confirm your registration as a Partner guest for the 12th CEO Gala.

Your attendance has been registered by {{mainGuestTitle}} {{mainGuestName}}, and we are delighted to welcome you to this distinguished occasion organised by the Budapest Business Journal, together with its official event partner, the Hungarian Investment Promotion Agency (HIPA).

The event will take place on Friday, March 27, 2026; be sure to mark your calendar!

Attached below are your and your partner's personal QR codes, which will grant you access to the gala. Please bring a printed copy to the event to ensure smooth entry.

Please note that this personal invitation is dedicated to the addressee and is not transferable.

Date:
Friday, March 27, 2026

Location:
Corinthia Hotel Budapest
1073 Budapest, Erzsébet krt. 43-49.

Dress Code:
Black tie for men, ballgown or cocktail dress for women

Should you be unable to attend, we kindly ask that any changes be communicated via {{mainGuestTitle}} {{mainGuestName}}. We kindly remind you that any cancellations or changes to your registration must be made at least 10 business days prior to the gala.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 + VAT per person.

We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.

The BBJ CEO Gala Team

---

Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13-14., Hungary
Publisher of Budapest Business Journal
Event website: ceogala.com`,
  },
  noshow_payment_request: {
    slug: 'noshow_payment_request',
    name: 'No-Show Payment Request',
    subject: 'CEO Gála 2026 - No-Show Fee Notice',
    variables: ['guestName', 'eventDate', 'ticketType', 'noShowFee', 'paymentDeadline', 'paymentUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>CEO Gála - No-Show Fee Notice</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!--[if mso]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!--[if mso]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a2e; font-family: Arial, Helvetica, sans-serif;">CEO Gála</h1>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                <tr>
                  <td style="background-color: #dc2626; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; font-family: Arial, Helvetica, sans-serif;">Payment Required</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 30px 40px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;">
              <p style="margin: 0 0 20px 0; font-size: 18px;">Dear<br><span style="font-size: 24px; font-weight: 700; color: #1a1a2e;">{{guestName}}</span></p>
              <p style="margin: 0 0 20px 0;">We noticed that you did not attend CEO Gála 2026 on {{eventDate}}, and you did not cancel your registration before the deadline.</p>
              <!-- No-Show Fee Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #fef2f2; border: 2px solid #dc2626; padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #dc2626; text-align: center; font-size: 18px; font-family: Arial, Helvetica, sans-serif;">No-Show Fee</h3>
                    <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;">According to our registration terms, a no-show fee is applicable for registered guests who do not attend without prior cancellation.</p>
                    <p style="margin: 20px 0; font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; font-family: Arial, Helvetica, sans-serif;">{{noShowFee}}</p>
                    <p style="margin: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333;"><strong>Ticket Type:</strong> {{ticketType}}</p>
                  </td>
                </tr>
              </table>
              <!-- Payment Information Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">Payment Information</h4>
                    <p style="margin: 8px 0; color: #4b5563; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">Please settle this fee by the deadline below to avoid further action.</p>
                    <p style="margin: 8px 0; color: #4b5563; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">If you believe this notice was sent in error (e.g., you did attend), please contact us immediately.</p>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{paymentUrl}}" style="height:48px;v-text-anchor:middle;width:180px;" arcsize="0%" fillcolor="#dc2626" stroke="f">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:600;">Pay Now</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{paymentUrl}}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Pay Now</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #dc2626; text-align: center; font-weight: 600;">Payment Deadline: {{paymentDeadline}}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #6b7280;">
                    <p style="margin: 0 0 5px 0;">If you have questions, please contact us at info@ceogala.hu</p>
                    <p style="margin: 0;">Best regards,<br>CEO Gála Organizing Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `CEO Gála - No-Show Fee Notice

Dear {{guestName}},

We noticed that you did not attend CEO Gála 2026 on {{eventDate}}, and you did not cancel your registration before the deadline.

NO-SHOW FEE
-----------
According to our registration terms, a no-show fee is applicable for registered guests who do not attend without prior cancellation.

Fee Amount: {{noShowFee}}
Ticket Type: {{ticketType}}

PAYMENT INFORMATION
-------------------
Please settle this fee by the deadline below to avoid further action.

If you believe this notice was sent in error (e.g., you did attend), please contact us immediately.

Pay here: {{paymentUrl}}

Payment Deadline: {{paymentDeadline}}

If you have questions, please contact us at info@ceogala.hu

Best regards,
CEO Gála Organizing Team`,
  },
  registration_feedback: {
    slug: 'registration_feedback',
    name: 'Registration Feedback (Main Guest)',
    subject: 'Automatic feedback message CEO Gala 2026',
    variables: [
      'guestTitle', 'guestName', 'guestCompany', 'guestPosition', 'guestPhone', 'guestEmail', 'guestDiet',
      'hasPartner', 'partnerTitle', 'partnerName', 'partnerCompany', 'partnerPosition', 'partnerPhone', 'partnerEmail', 'partnerDiet',
      'headerImage', 'baseUrl'
    ],
    html_body: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Automatic feedback message CEO Gala 2026</title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, Helvetica, sans-serif; line-height:1.8; color:#333333; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0; padding:0; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:0;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" align="center">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:680px; margin:0 auto; padding:20px; background-color:#ffffff;">
          <tr>
            <td style="padding:0;">
              <!-- Header Image -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 30px 0;">
                    <img src="{{headerImage}}" alt="CEO Gala 2026" width="680" style="width:100%; max-width:680px; height:auto; display:block; border:0;">
                  </td>
                </tr>
              </table>

              <!-- Content -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:0 20px;">
                    <!-- Greeting -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family:Arial, Helvetica, sans-serif; font-size:16px; color:#333333; padding:0 0 20px 0;">
                          Dear
                          <span style="display:block; font-size:22px; font-weight:700; color:#1a1a2e; margin-top:8px;">{{guestTitle}} {{guestName}}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Introduction paragraphs -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; padding:0 0 15px 0;">
                          Thank you for your registration!
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; padding:0 0 15px 0;">
                          <strong>Hereby, we confirm that your data has been received.</strong> Kindly take a moment to review the information provided below.
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; padding:0 0 15px 0;">
                          Our team will now review your registration. Please note that <strong>your registration will only be finalized after having the official confirmation received.</strong> Your confirmation email will include a personalised QR code granting access to the event.
                        </td>
                      </tr>
                    </table>

                    <!-- Order Details Box -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:25px 0;">
                      <tr>
                        <td style="padding:0;">
                          <!--[if mso]>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f8f8f8">
                          <tr>
                          <td width="4" bgcolor="#c41e3a"></td>
                          <td style="padding:20px;">
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f8f8; border-left:4px solid #c41e3a;">
                            <tr>
                              <td style="padding:20px;">
                          <!--<![endif]-->
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:bold; color:#333333; padding:0 0 15px 0;">
                                      Order details:
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Prefix:</span> <span style="color:#333333;">{{guestTitle}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Name:</span> <span style="color:#333333;">{{guestName}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Company name:</span> <span style="color:#333333;">{{guestCompany}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Position:</span> <span style="color:#333333;">{{guestPosition}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Phone number:</span> <span style="color:#333333;">{{guestPhone}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Email address:</span> <span style="color:#333333;">{{guestEmail}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Special diet:</span> <span style="color:#333333;">{{guestDiet}}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                      <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner:</span> <span style="color:#333333;">{{hasPartner}}</span>
                                    </td>
                                  </tr>

                                  {{#if hasPartner}}
                                  <!-- Partner Section -->
                                  <tr>
                                    <td style="padding:20px 0 0 0; border-top:1px dashed #cccccc; margin-top:15px;">
                                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:15px;">
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:#c41e3a; padding:0 0 10px 0;">
                                            Partner details:
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's prefix:</span> <span style="color:#333333;">{{partnerTitle}}</span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's name:</span> <span style="color:#333333;">{{partnerName}}</span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's company:</span> <span style="color:#333333;">{{partnerCompany}}</span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's position:</span> <span style="color:#333333;">{{partnerPosition}}</span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's phone:</span> <span style="color:#333333;">{{partnerPhone}}</span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's email:</span> <span style="color:#333333;">{{partnerEmail}}</span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; padding:4px 0;">
                                            <span style="font-style:italic; color:#666666; display:inline-block; width:140px;">Partner's special diet:</span> <span style="color:#333333;">{{partnerDiet}}</span>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  {{/if}}
                                </table>
                          <!--[if !mso]><!-->
                              </td>
                            </tr>
                          </table>
                          <!--<![endif]-->
                          <!--[if mso]>
                          </td>
                          </tr>
                          </table>
                          <![endif]-->
                        </td>
                      </tr>
                    </table>

                    <!-- Consents Box -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
                      <tr>
                        <td style="background-color:#f0f0f0; padding:15px 20px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-style:italic; color:#555555; padding:4px 0;">
                                I agree to have photos and videos taken of me at the gala.
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-style:italic; color:#555555; padding:4px 0;">
                                I accept the Terms and Conditions and the Privacy Policy.
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-style:italic; color:#555555; padding:4px 0;">
                                Keep me updated on more events and news from the event organizer.
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-style:italic; color:#555555; padding:4px 0;">
                                By submitting this application, I consent to the program's organizers managing my personal information. Personal data is controlled very carefully and is not disclosed to third parties.
                              </td>
                            </tr>
                            <tr>
                              <td style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-style:italic; color:#555555; padding:4px 0;">
                                <em>The CEO Gala is open to the press. I consent to any photos and/or videos taken of me at the event being used by Business Publishing Services Ltd. for publicity purposes.</em>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Notice Box -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:25px 0;">
                      <tr>
                        <td style="padding:0;">
                          <!--[if mso]>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#fff8e6">
                          <tr>
                          <td width="4" bgcolor="#f0ad4e"></td>
                          <td style="padding:15px 20px;">
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fff8e6; border-left:4px solid #f0ad4e;">
                            <tr>
                              <td style="padding:15px 20px;">
                          <!--<![endif]-->
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#333333; margin:0;">
                                      Should you notice any inaccuracies in the information above, please contact us at <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color:#333333; text-decoration:underline;">event@bbj.hu</a>.
                                    </td>
                                  </tr>
                                </table>
                          <!--[if !mso]><!-->
                              </td>
                            </tr>
                          </table>
                          <!--<![endif]-->
                          <!--[if mso]>
                          </td>
                          </tr>
                          </table>
                          <![endif]-->
                        </td>
                      </tr>
                    </table>

                    <!-- Closing paragraphs -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; padding:0 0 15px 0;">
                          <strong>Thank you for your registration! Please kindly await our official confirmation letter, which will be sent to you shortly.</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; padding:0 0 15px 0;">
                          Kind regards,<br>The BBJ CEO Gala Team
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e0e0e0; margin-top:30px;">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#666666; padding:2px 0;">
                          <u>Business Publishing Services Kft.</u>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#666666; padding:2px 0;">
                          1075 Budapest, Madách Imre út 13-14., Hungary
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#666666; padding:2px 0;">
                          Publisher of Budapest Business Journal
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#666666; padding:2px 0;">
                          Event website: <a href="https://ceogala.com" style="color:#333333; text-decoration:underline;">ceogala.com</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`,
    text_body: `Automatic feedback message CEO Gala 2026

Dear {{guestTitle}} {{guestName}},

Thank you for your registration!

Hereby, we confirm that your data has been received. Kindly take a moment to review the information provided below.

Our team will now review your registration. Please note that your registration will only be finalized after having the official confirmation received. Your confirmation email will include a personalised QR code granting access to the event.

ORDER DETAILS
-------------
Prefix: {{guestTitle}}
Name: {{guestName}}
Company name: {{guestCompany}}
Position: {{guestPosition}}
Phone number: {{guestPhone}}
Email address: {{guestEmail}}
Special diet: {{guestDiet}}
Partner: {{hasPartner}}

{{#if hasPartner}}
PARTNER DETAILS
---------------
Partner's prefix: {{partnerTitle}}
Partner's name: {{partnerName}}
Partner's company: {{partnerCompany}}
Partner's position: {{partnerPosition}}
Partner's phone: {{partnerPhone}}
Partner's email: {{partnerEmail}}
Partner's special diet: {{partnerDiet}}
{{/if}}

DECLARATIONS ACCEPTED
---------------------
- I agree to have photos and videos taken of me at the gala.
- I accept the Terms and Conditions and the Privacy Policy.
- Keep me updated on more events and news from the event organizer.
- By submitting this application, I consent to the program's organizers managing my personal information.
- The CEO Gala is open to the press. I consent to any photos and/or videos taken of me at the event being used by Business Publishing Services Ltd. for publicity purposes.

Should you notice any inaccuracies in the information above, please contact us at event@bbj.hu.

Thank you for your registration! Please kindly await our official confirmation letter, which will be sent to you shortly.

Kind regards,
The BBJ CEO Gala Team

---

Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13-14., Hungary
Publisher of Budapest Business Journal
Event website: ceogala.com`,
  },
  registration_feedback_partner: {
    slug: 'registration_feedback_partner',
    name: 'Registration Feedback (Partner)',
    subject: 'Registration details received: CEO Gala 2026',
    variables: [
      'partnerTitle', 'partnerName', 'partnerCompany', 'partnerPosition', 'partnerPhone', 'partnerEmail', 'partnerDiet',
      'mainGuestTitle', 'mainGuestName', 'headerImage', 'baseUrl'
    ],
    html_body: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration details received: CEO Gala 2026</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333;">
  <!--[if mso]>
  <table role="presentation" width="680" align="center" cellpadding="0" cellspacing="0" border="0" style="width: 680px;">
  <tr>
  <td>
  <![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
    <tr>
      <td style="padding: 0;">
        <!-- Header Image -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 0 0 30px 0; text-align: center;">
              <img src="{{headerImage}}" alt="CEO Gala 2026" width="680" style="width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 0 20px;">
              <!-- Greeting -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333; padding: 0 0 20px 0;">
                    Dear<br />
                    <span style="font-size: 22px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px;">{{partnerTitle}} {{partnerName}}</span>
                  </td>
                </tr>
              </table>

              <!-- Main Text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; padding: 0 0 15px 0;">
                    You are receiving this message because you have been registered as an accompanying guest for the CEO Gala 2026 by <strong>{{mainGuestTitle}} {{mainGuestName}}</strong>.
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; padding: 0 0 15px 0;">
                    We confirm receipt of the details provided in connection with your participation. Please take a moment to review the information below to ensure its accuracy.
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; padding: 0 0 15px 0;">
                    Our team will now review your registration. Please note that <strong>your registration will only be finalized after having the official confirmation received.</strong> Your confirmation email will include a personalised QR code granting access to the event.
                  </td>
                </tr>
              </table>

              <!-- Order Details Box -->
              <!--[if mso]>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
              <tr>
              <td width="4" bgcolor="#c41e3a" style="background-color: #c41e3a;"></td>
              <td bgcolor="#f8f8f8" style="background-color: #f8f8f8; padding: 20px;">
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td width="4" style="background-color: #c41e3a;"></td>
                  <td style="background-color: #f8f8f8; padding: 20px;">
              <!--<![endif]-->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; color: #333333; font-weight: bold; padding: 0 0 15px 0;">
                          Registration details (as provided):
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Prefix:</span> <span style="color: #333333;">{{partnerTitle}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Name:</span> <span style="color: #333333;">{{partnerName}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Company name:</span> <span style="color: #333333;">{{partnerCompany}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Position:</span> <span style="color: #333333;">{{partnerPosition}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Phone number:</span> <span style="color: #333333;">{{partnerPhone}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Email address:</span> <span style="color: #333333;">{{partnerEmail}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 8px 0;">
                          <span style="font-style: italic; color: #666666; display: inline-block; width: 140px;">Special diet:</span> <span style="color: #333333;">{{partnerDiet}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->

              <!-- Consents Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #f0f0f0; padding: 15px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-style: italic; color: #666666; padding: 0 0 10px 0;">
                          The following declarations were accepted at the time of registration on your behalf:
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-style: italic; color: #555555; padding: 8px 0;">
                          I agree to have photos and videos taken of me at the gala.
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-style: italic; color: #555555; padding: 8px 0;">
                          I accept the Terms and Conditions and the Privacy Policy.
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-style: italic; color: #555555; padding: 8px 0;">
                          <em>The CEO Gala is open to the press. I consent to any photos and/or videos taken of me at the event being used by Business Publishing Services Ltd. for publicity purposes.</em>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <!--[if mso]>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
              <tr>
              <td width="4" bgcolor="#f0ad4e" style="background-color: #f0ad4e;"></td>
              <td bgcolor="#fff8e6" style="background-color: #fff8e6; padding: 15px 20px;">
              <![endif]-->
              <!--[if !mso]><!-->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td width="4" style="background-color: #f0ad4e;"></td>
                  <td style="background-color: #fff8e6; padding: 15px 20px;">
              <!--<![endif]-->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 0 0 10px 0;">
                          Should you notice any inaccuracies in the information above, or if you have any questions regarding the declarations listed, please contact us at <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>.
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333333; padding: 0;">
                          Please note that attendance-related administration, including cancellations, is handled through the guest who completed the registration on your behalf.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!--[if mso]>
              </td>
              </tr>
              </table>
              <![endif]-->

              <!-- Closing Text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; padding: 0 0 15px 0;">
                    <strong>Please kindly await our official confirmation letter, which will be sent to you shortly.</strong>
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333333; padding: 0 0 15px 0;">
                    Kind regards,<br />The BBJ CEO Gala Team
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e0e0e0; margin-top: 30px;">
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #666666; text-align: center; padding: 5px 0;">
                    <u>Business Publishing Services Kft.</u>
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #666666; text-align: center; padding: 5px 0;">
                    1075 Budapest, Madach Imre ut 13-14., Hungary
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #666666; text-align: center; padding: 5px 0;">
                    Publisher of Budapest Business Journal
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #666666; text-align: center; padding: 5px 0;">
                    Event website: <a href="https://ceogala.com" style="color: #333333; text-decoration: underline;">ceogala.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `Registration details received: CEO Gala 2026

Dear {{partnerTitle}} {{partnerName}},

You are receiving this message because you have been registered as an accompanying guest for the CEO Gala 2026 by {{mainGuestTitle}} {{mainGuestName}}.

We confirm receipt of the details provided in connection with your participation. Please take a moment to review the information below to ensure its accuracy.

Our team will now review your registration. Please note that your registration will only be finalized after having the official confirmation received. Your confirmation email will include a personalised QR code granting access to the event.

REGISTRATION DETAILS (AS PROVIDED)
----------------------------------
Prefix: {{partnerTitle}}
Name: {{partnerName}}
Company name: {{partnerCompany}}
Position: {{partnerPosition}}
Phone number: {{partnerPhone}}
Email address: {{partnerEmail}}
Special diet: {{partnerDiet}}

The following declarations were accepted at the time of registration on your behalf:

- I agree to have photos and videos taken of me at the gala.
- I accept the Terms and Conditions and the Privacy Policy.
- The CEO Gala is open to the press. I consent to any photos and/or videos taken of me at the event being used by Business Publishing Services Ltd. for publicity purposes.

Should you notice any inaccuracies in the information above, or if you have any questions regarding the declarations listed, please contact us at event@bbj.hu.

Please note that attendance-related administration, including cancellations, is handled through the guest who completed the registration on your behalf.

Please kindly await our official confirmation letter, which will be sent to you shortly.

Kind regards,
The BBJ CEO Gala Team

---

Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13-14., Hungary
Publisher of Budapest Business Journal
Event website: ceogala.com`,
  },
  principal_invitation: {
    slug: 'principal_invitation',
    name: 'Principal Guest Invitation',
    subject: 'Invitation to the CEO Gala 2026',
    variables: ['guestTitle', 'guestName', 'baseUrl'],
    html_body: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Invitation to the CEO Gala 2026</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Verdana, Geneva, sans-serif; line-height: 1.8; color: #333333; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!--[if mso]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff;">
  <tr>
  <td align="center">
  <![endif]-->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <!-- Header Image -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 0 0 30px 0;">
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:680px;">
              <v:fill type="frame" src="{{baseUrl}}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" />
              </v:rect>
              <![endif]-->
              <!--[if !mso]><!-->
              <img src="{{baseUrl}}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" alt="CEO Gala 2026 - March 27, 2026" width="680" style="width: 100%; max-width: 680px; height: auto; display: block; border: 0;" />
              <!--<![endif]-->
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 0 20px;">
          <tr>
            <td align="center" style="padding: 0 20px;">
              <!-- Greeting -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 20px 0;">
                    Dear {{guestTitle}} {{guestName}},
                  </td>
                </tr>
              </table>

              <!-- Paragraph 1 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 16px 0;">
                    We are delighted to announce that the next CEO Gala will take place on <strong style="font-weight: bold;">Friday, March 27, 2026</strong>, at the <strong style="font-weight: bold;">Corinthia Hotel Budapest</strong>.
                  </td>
                </tr>
              </table>

              <!-- Paragraph 2 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 16px 0;">
                    Now in its <strong style="font-weight: bold;">12th edition</strong>, the CEO Gala has become a landmark event in Hungary's business calendar, a must-attend occasion for the country's most distinguished business leaders, diplomats, and representatives of international business organizations.
                  </td>
                </tr>
              </table>

              <!-- Paragraph 3 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 16px 0;">
                    The evening brings together a unique <strong style="font-weight: bold;">concentration of decision-makers</strong> under one roof, individuals whose vision, leadership, and achievements drive a remarkable share of Hungary's economic performance. The atmosphere is truly inspiring: a celebration of excellence, innovation, and recognition, where meaningful connections are made and maintained.
                  </td>
                </tr>
              </table>

              <!-- Paragraph 4 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 16px 0;">
                    During the evening, we will present two of the most prestigious titles in Hungary's business community. The <strong style="font-weight: bold;">Expat CEO of the Year Award</strong> honors an outstanding international business leader for their contribution to Hungary's economic life, while the <strong style="font-weight: bold;">CEO Community Award</strong> recognizes a visionary leader whose activities have had a lasting, positive impact on society and the business environment.
                  </td>
                </tr>
              </table>

              <!-- Paragraph 5 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 16px 0;">
                    Please <strong style="font-weight: bold;">save the date</strong> in your calendar; full event details and formal invitations will follow soon. We look forward to welcoming you to another inspiring edition of the CEO Gala in 2026.
                  </td>
                </tr>
              </table>

              <!-- Warm regards -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; line-height: 1.8; color: #333333; padding: 0 0 16px 0;">
                    Warm regards,
                  </td>
                </tr>
              </table>

              <!-- Signatures -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0 30px 0;">
                <tr>
                  <td width="50%" align="center" valign="top" style="font-family: Verdana, Geneva, sans-serif;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; font-weight: bold; color: #000000; padding: 0 0 2px 0;">
                          Tamas Botka
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 12px; color: #333333;">
                          Publisher, BBJ
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" align="center" valign="top" style="font-family: Verdana, Geneva, sans-serif;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 13px; font-weight: bold; color: #000000; padding: 0 0 2px 0;">
                          Balazs Roman
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 12px; color: #333333;">
                          CEO, BBJ
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #cccccc; margin-top: 30px;">
                <tr>
                  <td align="center" style="padding: 25px 0 0 0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; line-height: 1.6; color: #666666; padding: 0 0 4px 0;">
                          For more details about the event and the award, including previous winners, visit our website at <a href="https://www.ceogala.com" style="color: #333333; text-decoration: underline;">www.ceogala.com</a>. We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; color: #666666; padding: 15px 0 4px 0;">
                          &copy; Copyright, 2024-25
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; color: #666666; padding: 0 0 4px 0;">
                          1075 Budapest, Madách 11-13 14. Hungary
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; color: #666666; padding: 0 0 4px 0;">
                          This email has been sent to you, because you are a customer or subscriber of
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; color: #666666; padding: 0 0 4px 0;">
                          BUSINESS PUBLISHING SERVICES KFT.
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; color: #666666; padding: 0 0 4px 0;">
                          <a href="https://ceogala.com" style="color: #333333; text-decoration: underline;">www.ceogala.com</a> - <a href="mailto:event@bbj.hu?subject=Inquiry%20regarding%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 10px; color: #999999; padding: 15px 0 0 0;">
                          <a href="{{baseUrl}}/unsubscribe" style="color: #999999; text-decoration: underline;">Unsubscribe</a> | <a href="{{baseUrl}}/privacy" style="color: #999999; text-decoration: underline;">Manage my subscription</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Email Marketing -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #eeeeee; margin-top: 25px;">
                <tr>
                  <td align="center" style="padding: 15px 0 0 0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-family: Verdana, Geneva, sans-serif; font-size: 11px; line-height: 1.6; color: #666666;">
                          Email Marketing<br />Powered by<br /><a href="https://www.mailpoet.com" style="color: #666666; text-decoration: underline;">MailPoet</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if mso]>
  </td>
  </tr>
  </table>
  <![endif]-->
</body>
</html>`,
    text_body: `Invitation to the CEO Gala 2026

Dear {{guestTitle}} {{guestName}},

We are delighted to announce that the next CEO Gala will take place on Friday, March 27, 2026, at the Corinthia Hotel Budapest.

Now in its 12th edition, the CEO Gala has become a landmark event in Hungary's business calendar, a must-attend occasion for the country's most distinguished business leaders, diplomats, and representatives of international business organizations.

The evening brings together a unique concentration of decision-makers under one roof, individuals whose vision, leadership, and achievements drive a remarkable share of Hungary's economic performance. The atmosphere is truly inspiring: a celebration of excellence, innovation, and recognition, where meaningful connections are made and maintained.

During the evening, we will present two of the most prestigious titles in Hungary's business community. The Expat CEO of the Year Award honors an outstanding international business leader for their contribution to Hungary's economic life, while the CEO Community Award recognizes a visionary leader whose activities have had a lasting, positive impact on society and the business environment.

Please save the date in your calendar; full event details and formal invitations will follow soon. We look forward to welcoming you to another inspiring edition of the CEO Gala in 2026.

Warm regards,

Tamas Botka                    Balazs Roman
Publisher, BBJ                 CEO, BBJ

---

For more details about the event and the award, including previous winners, visit our website at www.ceogala.com. We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.

© Copyright, 2024-25
1075 Budapest, Madách 11-13 14. Hungary
BUSINESS PUBLISHING SERVICES KFT.
www.ceogala.com - event@bbj.hu

---
Email Marketing
Powered by MailPoet`,
  },
  invitation_reminder: {
    slug: 'invitation_reminder',
    name: 'Invitation Reminder',
    subject: 'Invitation to the CEO Gala 2026',
    variables: ['guestName', 'magicLinkUrl', 'baseUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>Invitation to the CEO Gala 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Verdana, Geneva, sans-serif; font-size: 15px; line-height: 1.6; color: #333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; width: 100%;">
          <!-- Header Image -->
          <tr>
            <td align="center" style="padding: 0;">
              <img src="{{baseUrl}}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" alt="CEO Gala 2026 - March 27, 2026" width="680" style="width: 100%; max-width: 680px; height: auto; display: block; border: 0;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 20px 15px; text-align: center;">
              <!-- Greeting -->
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Dear <strong>{{guestName}}</strong>,</p>

              <!-- Reminder intro -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">We would like to kindly remind you of your invitation to the</p>

              <!-- CEO Gala 2026 title -->
              <p style="margin: 0 0 12px 0; font-size: 22px; font-weight: bold; line-height: 1.4; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">CEO Gala 2026</p>

              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">hosted at Corinthia Hotel Budapest on Friday, March 27, 2026.</p>

              <!-- Urgency paragraphs -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">As this is a limited-capacity event, we wanted to share a gentle reminder that registrations are filling up quickly, and we will need to close registration soon.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Your presence would mean a great deal to us, and we would truly regret having to celebrate the evening without you.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">To confirm your attendance, please click the REGISTRATION button now. If you already know that you will not be able to attend, we would also appreciate it if you could kindly indicate your non-attendance by clicking the registration button.</p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 25px auto 20px auto;">
                <tr>
                  <td align="center" style="background-color: #c41e3a; padding: 12px 35px;">
                    <a href="{{magicLinkUrl}}" target="_blank" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif; display: inline-block;">REGISTRATION</a>
                  </td>
                </tr>
              </table>

              <!-- BBJ/HIPA welcome -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">The Budapest Business Journal and our official event partner, the <strong>Hungarian Investment Promotion Agency (HIPA)</strong>, are delighted to welcome you at our CEO Gala.</p>

              <!-- Awards info -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">As has now become a tradition of several years, two awards will be presented during the evening: the <strong>Expat CEO Award</strong> and the <strong>CEO Community Award</strong>. Two professional awards committees will select the winners minutes before the gala starts, each from its own shortlist of three candidates.</p>

              <!-- Rolling basis note -->
              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Kindly note that registrations will be accepted only until capacity allows, and confirmations will be sent on a rolling basis.</p>

              <!-- Details Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;"><strong>Date:</strong> Friday, March 27, 2026, 7 p.m.</td>
                </tr>
                <tr><td style="padding: 8px 0;"></td></tr>
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;"><strong>Location:</strong> The Grand Ballroom of the Corinthia Hotel Budapest</td>
                </tr>
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;">1073 Budapest, Erzsébet krt. 43-49</td>
                </tr>
                <tr><td style="padding: 8px 0;"></td></tr>
                <tr>
                  <td align="center" style="padding: 3px 0; font-size: 15px; line-height: 1.6; color: #333333; font-family: Verdana, Geneva, sans-serif;"><strong>Dress Code:</strong> Black tie for men, ball gown or cocktail dress for women</td>
                </tr>
              </table>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Should you wish to reserve an exclusive table for yourself, your guests or your company, our team will be pleased to assist you upon request. Please message us at <a href="mailto:event@bbj.hu?subject=Table%20reservation%20-%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">This personal invitation is dedicated to the addressee and is not transferable.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">When you register, please let us know if you have any special dietary requirements. We will send you a feedback email after successful registration.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Please kindly note that your registration will only be finalised after having the official confirmation received.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">For more details about the event and the award, including previous winners, visit our website at <a href="https://www.ceogala.com" style="color: #333333; text-decoration: underline;">www.ceogala.com</a>.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to <a href="mailto:event@bbj.hu?subject=Cancellation%20-%20CEO%20Gala%202026" style="color: #333333; text-decoration: underline;">event@bbj.hu</a>.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of <strong>HUF 99,000 + VAT</strong> per person.</p>

              <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #333333; text-align: center; font-family: Verdana, Geneva, sans-serif;">We look forward to meeting you at the gala and celebrating our outstanding CEO Community.</p>

              <!-- Signatures -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0 25px 0;">
                <tr>
                  <td width="50%" align="center" valign="top" style="padding: 0 10px;">
                    <p style="margin: 0 0 2px 0; font-weight: bold; font-size: 15px; color: #1a1a2e; font-family: Verdana, Geneva, sans-serif;">Tamas Botka</p>
                    <p style="margin: 0; font-size: 14px; color: #333333; font-family: Verdana, Geneva, sans-serif;">Publisher, BBJ</p>
                  </td>
                  <td width="50%" align="center" valign="top" style="padding: 0 10px;">
                    <p style="margin: 0 0 2px 0; font-weight: bold; font-size: 15px; color: #1a1a2e; font-family: Verdana, Geneva, sans-serif;">Balazs Roman</p>
                    <p style="margin: 0; font-size: 14px; color: #333333; font-family: Verdana, Geneva, sans-serif;">CEO, BBJ</p>
                  </td>
                </tr>
              </table>

              <!-- BBJ Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <img src="{{baseUrl}}/email-assets/bbj-logo.png" alt="Budapest Business Journal" width="300" style="max-width: 300px; height: auto; border: 0;" />
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 25px 0;">
                <tr>
                  <td style="border-top: 1px solid #cccccc; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 15px 0;">
                    <p style="margin: 4px 0; font-size: 12px; color: #666666; font-family: Verdana, Geneva, sans-serif;"><a href="https://bbj.hu" style="color: #333333; text-decoration: underline;">Business Publishing Services Kft.</a></p>
                    <p style="margin: 4px 0; font-size: 12px; color: #666666; font-family: Verdana, Geneva, sans-serif;">1075 Budapest, Madách Imre út 13–14., Hungary</p>
                    <p style="margin: 4px 0; font-size: 12px; color: #666666; font-family: Verdana, Geneva, sans-serif;">Publisher of Budapest Business Journal</p>
                    <p style="margin: 12px 0 4px 0; font-size: 11px; color: #666666; font-family: Verdana, Geneva, sans-serif;">Event website: <a href="https://www.ceogala.com" style="color: #333333; text-decoration: underline;">ceogala.com</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text_body: `Invitation to the CEO Gala 2026

Dear {{guestName}},

We would like to kindly remind you of your invitation to the

CEO Gala 2026

hosted at Corinthia Hotel Budapest on Friday, March 27, 2026.

As this is a limited-capacity event, we wanted to share a gentle reminder that registrations are filling up quickly, and we will need to close registration soon.

Your presence would mean a great deal to us, and we would truly regret having to celebrate the evening without you.

To confirm your attendance, please click the REGISTRATION link now. If you already know that you will not be able to attend, we would also appreciate it if you could kindly indicate your non-attendance by clicking the registration link.

>>> REGISTRATION: {{magicLinkUrl}} <<<

The Budapest Business Journal and our official event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you at our CEO Gala.

As has now become a tradition of several years, two awards will be presented during the evening: the Expat CEO Award and the CEO Community Award. Two professional awards committees will select the winners minutes before the gala starts, each from its own shortlist of three candidates.

Kindly note that registrations will be accepted only until capacity allows, and confirmations will be sent on a rolling basis.

Date: Friday, March 27, 2026, 7 p.m.

Location: The Grand Ballroom of the Corinthia Hotel Budapest
1073 Budapest, Erzsébet krt. 43-49

Dress Code: Black tie for men, ball gown or cocktail dress for women

Should you wish to reserve an exclusive table for yourself, your guests or your company, our team will be pleased to assist you upon request. Please message us at event@bbj.hu.

This personal invitation is dedicated to the addressee and is not transferable.

When you register, please let us know if you have any special dietary requirements. We will send you a feedback email after successful registration.

Please kindly note that your registration will only be finalised after having the official confirmation received.

For more details about the event and the award, including previous winners, visit our website at www.ceogala.com.

We remind you that any cancellations or changes to your registration must be made at least ten business days before the gala. Cancellations should be sent to event@bbj.hu.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 + VAT per person.

We look forward to meeting you at the gala and celebrating our outstanding CEO Community.

Tamas Botka                    Balazs Roman
Publisher, BBJ                 CEO, BBJ

---

Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13–14., Hungary
Publisher of Budapest Business Journal
Event website: ceogala.com`,
  },
} as const;

export type TemplateSlug = keyof typeof DEFAULT_TEMPLATES;

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

/**
 * Interpolate variables in template string
 * Supports {{variable}} syntax and {{#if variable}}...{{/if}} conditionals
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | undefined>,
  escapeValues = true
): string {
  let result = template;

  // Handle conditionals: {{#if variable}}content{{/if}}
  result = result.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, varName, content) => {
      const value = variables[varName];
      return value ? content : '';
    }
  );

  // Handle simple variable substitution: {{variable}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const value = variables[varName];
    if (value === undefined) return '';
    return escapeValues ? escapeHtml(value) : value;
  });

  return result;
}

/**
 * Get all email templates
 */
export async function getAllTemplates(): Promise<EmailTemplate[]> {
  return prisma.emailTemplate.findMany({
    orderBy: { name: 'asc' },
  });
}

/**
 * Get a template by slug, falling back to default if not in DB
 */
export async function getTemplate(
  slug: TemplateSlug
): Promise<EmailTemplate | null> {
  const template = await prisma.emailTemplate.findUnique({
    where: { slug },
  });

  return template;
}

/**
 * Get template for rendering - always uses code-defined templates
 * Note: DB templates are no longer used to ensure consistency across deployments
 */
export async function getTemplateWithFallback(slug: TemplateSlug): Promise<{
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
}> {
  // Always use code-defined templates for consistency
  const defaultTemplate = DEFAULT_TEMPLATES[slug];
  return {
    subject: defaultTemplate.subject,
    html_body: defaultTemplate.html_body,
    text_body: defaultTemplate.text_body,
    variables: [...defaultTemplate.variables],
  };
}

/**
 * Create or update a template
 */
export async function upsertTemplate(data: {
  slug: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
  is_active?: boolean;
}): Promise<EmailTemplate> {
  return prisma.emailTemplate.upsert({
    where: { slug: data.slug },
    create: {
      slug: data.slug,
      name: data.name,
      subject: data.subject,
      html_body: data.html_body,
      text_body: data.text_body,
      variables: JSON.stringify(data.variables),
      is_active: data.is_active ?? true,
    },
    update: {
      name: data.name,
      subject: data.subject,
      html_body: data.html_body,
      text_body: data.text_body,
      variables: JSON.stringify(data.variables),
      is_active: data.is_active ?? true,
    },
  });
}

/**
 * Delete a template (resets to default)
 */
export async function deleteTemplate(slug: string): Promise<void> {
  await prisma.emailTemplate.delete({
    where: { slug },
  });
}

/**
 * Initialize default templates in database
 */
export async function initializeDefaultTemplates(): Promise<void> {
  for (const [slug, template] of Object.entries(DEFAULT_TEMPLATES)) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { slug },
    });

    if (!existing) {
      try {
        await prisma.emailTemplate.create({
          data: {
            slug: template.slug,
            name: template.name,
            subject: template.subject,
            html_body: template.html_body,
            text_body: template.text_body,
            variables: JSON.stringify(template.variables),
            is_active: true,
          },
        });
      } catch (error) {
        logError(`Failed to initialize template ${slug}:`, error);
      }
    }
  }
}

/**
 * Reset a template to its default values
 */
export async function resetTemplateToDefault(
  slug: TemplateSlug
): Promise<EmailTemplate | null> {
  const defaultTemplate = DEFAULT_TEMPLATES[slug];
  if (!defaultTemplate) return null;

  return prisma.emailTemplate.upsert({
    where: { slug },
    create: {
      slug: defaultTemplate.slug,
      name: defaultTemplate.name,
      subject: defaultTemplate.subject,
      html_body: defaultTemplate.html_body,
      text_body: defaultTemplate.text_body,
      variables: JSON.stringify(defaultTemplate.variables),
      is_active: true,
    },
    update: {
      name: defaultTemplate.name,
      subject: defaultTemplate.subject,
      html_body: defaultTemplate.html_body,
      text_body: defaultTemplate.text_body,
      variables: JSON.stringify(defaultTemplate.variables),
      is_active: true,
    },
  });
}

/**
 * Render a template with variables
 */
export async function renderTemplate(
  slug: TemplateSlug,
  variables: Record<string, string | undefined>
): Promise<{
  subject: string;
  html: string;
  text: string;
}> {
  try {
    const template = await getTemplateWithFallback(slug);

    return {
      subject: interpolateTemplate(template.subject, variables, true),
      html: interpolateTemplate(template.html_body, variables, true),
      text: interpolateTemplate(template.text_body, variables, false),
    };
  } catch (error) {
    logError(`[TEMPLATE-RENDER] Failed to render template ${slug}:`, error);
    throw error;
  }
}
