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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to the CEO Gala 2026</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; text-align: center; }
    p { margin: 0 0 20px 0; font-size: 15px; text-align: center; color: #333333; }
    .greeting { font-size: 16px; margin-bottom: 25px; }
    .guest-name { font-size: 22px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
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
    .footer { text-align: center; padding: 20px 0; }
    .footer p { font-size: 13px; color: #666666; margin: 5px 0; }
    .footer a { color: #333333; text-decoration: underline; }
    .link-fallback { font-size: 11px; color: #999999; word-break: break-all; margin-top: 30px; text-align: center; padding: 20px; background-color: #f5f5f5; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{baseUrl}}/email-assets/CEO_Gala_2026_invitation_header_709x213.jpg" alt="CEO Gala 2026 - March 27, 2026" class="header-image" />

    <div class="content">
      <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>

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
        <p>1073 Budapest, Erzsébet krt. 43-49</p>
        <br>
        <p>Dress Code:</p>
        <p>Black tie for men, ball gown or cocktail dress for women</p>
      </div>

      <p>If you wish to reserve your place at the gala now, click the REGISTRATION button below.</p>

      <div class="cta-container">
        <a href="{{magicLinkUrl}}" class="cta-button">REGISTRATION</a>
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

      <div class="footer">
        <p><u>Business Publishing Services Kft.</u></p>
        <p>1075 Budapest, Madách Imre út 13–14., Hungary</p>
        <p>Publisher of Budapest Business Journal</p>
        <p>Event website: <a href="https://ceogala.com">ceogala.com</a></p>
      </div>

      <div class="link-fallback">
        If the button doesn't work, copy this link into your browser:<br>
        {{magicLinkUrl}}
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `Invitation to the CEO Gala 2026

Dear {{guestName}},

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
1073 Budapest, Erzsébet krt. 43-49

Dress Code:
Black tie for men, ball gown or cocktail dress for women

If you wish to reserve your place at the gala now, click the REGISTRATION link below.

>>> REGISTRATION: {{magicLinkUrl}} <<<

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

Business Publishing Services Kft.
1075 Budapest, Madách Imre út 13–14., Hungary
Publisher of Budapest Business Journal

Event website: ceogala.com`,
  },
  applicant_approval: {
    slug: 'applicant_approval',
    name: 'Applicant Approval',
    subject: 'CEO Gála 2026 - Application Approved',
    variables: ['guestName', 'magicLinkUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála -Application Approved</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .success-badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; }
    .expiry-note { font-size: 14px; color: #6b7280; text-align: center; margin-top: 15px; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
    .link-fallback { font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="success-badge">- Application Approved</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>Great news! Your application to attend the CEO Gála 2026 has been <strong>approved</strong>.</p>
        <p>You can now complete your registration by clicking the button below:</p>
        <div class="cta-container">
          <a href="{{magicLinkUrl}}" class="cta-button">Complete Registration</a>
        </div>
        <p class="expiry-note">This link is valid for 72 hours.</p>
      </div>
      <div class="footer">
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
      <p class="link-fallback">
        If the button doesn't work, copy this link into your browser:<br>
        {{magicLinkUrl}}
      </p>
    </div>
  </div>
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
    subject: 'CEO Gála 2026 - Application Status',
    variables: ['guestName', 'rejectionReason'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála -Application Status</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .reason-box { background-color: #f8f9fa; border-left: 4px solid #6b7280; padding: 15px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>Thank you for your interest in attending the CEO Gála 2026.</p>
        <p>After careful consideration, we regret to inform you that we are unable to accommodate your application at this time.</p>
        {{#if rejectionReason}}
        <div class="reason-box">
          <p><strong>Note:</strong> {{rejectionReason}}</p>
        </div>
        {{/if}}
        <p>We appreciate your understanding and hope to welcome you at future events.</p>
      </div>
      <div class="footer">
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gála -Application Status

Dear {{guestName}},

Thank you for your interest in attending the CEO Gála 2026.

After careful consideration, we regret to inform you that we are unable to accommodate your application at this time.

{{#if rejectionReason}}Note: {{rejectionReason}}{{/if}}

We appreciate your understanding and hope to welcome you at future events.

If you have any questions, please contact us.

Best regards,
CEO Gála Organizing Team`,
  },
  payment_reminder: {
    slug: 'payment_reminder',
    name: 'Payment Reminder',
    subject: 'CEO Gála 2026 - Payment Reminder',
    variables: ['guestName', 'ticketType', 'amount', 'paymentUrl', 'dueDate'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála -Payment Reminder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .reminder-badge { display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .payment-info { background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .payment-info h3 { margin: 0 0 15px 0; color: #b45309; }
    .payment-info p { margin: 8px 0; }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="reminder-badge">Payment Reminder</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>This is a friendly reminder that your registration payment for CEO Gála 2026 is still pending.</p>
        <div class="payment-info">
          <h3>Payment Details</h3>
          <p><strong>Ticket Type:</strong> {{ticketType}}</p>
          <p><strong>Amount Due:</strong> {{amount}}</p>
          {{#if dueDate}}<p><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
        </div>
        <p>Please complete your payment to secure your spot at the event:</p>
        <div class="cta-container">
          <a href="{{paymentUrl}}" class="cta-button">Complete Payment</a>
        </div>
      </div>
      <div class="footer">
        <p>If you have already completed the payment, please disregard this email.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála -Payment Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .success-badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .payment-info { background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .payment-info h3 { margin: 0 0 15px 0; color: #166534; }
    .payment-info p { margin: 8px 0; color: #15803d; }
    .next-steps { background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="success-badge">- Payment Confirmed</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>Thank you! Your payment for CEO Gála 2026 has been successfully processed.</p>
        <div class="payment-info">
          <h3>Payment Receipt</h3>
          <p><strong>Ticket Type:</strong> {{ticketType}}</p>
          <p><strong>Amount Paid:</strong> {{amount}}</p>
          <p><strong>Payment Date:</strong> {{paymentDate}}</p>
          {{#if transactionId}}<p><strong>Transaction ID:</strong> {{transactionId}}</p>{{/if}}
        </div>
        <div class="next-steps">
          <p><strong>What's next?</strong></p>
          <p>Your e-ticket with QR code will be sent to you in a separate email shortly.</p>
        </div>
      </div>
      <div class="footer">
        <p>Please keep this email for your records.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála -Table Assignment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .table-badge { display: inline-block; background-color: #8b5cf6; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .table-info { background-color: #f5f3ff; border: 2px solid #8b5cf6; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
    .table-info .table-name { font-size: 32px; font-weight: 700; color: #5b21b6; margin: 0; }
    .table-info .seat-number { font-size: 18px; color: #7c3aed; margin-top: 10px; }
    .tablemates { background-color: #f8f9fa; border-radius: 8px; padding: 15px 20px; margin: 20px 0; }
    .tablemates h4 { margin: 0 0 10px 0; color: #374151; }
    .tablemates p { margin: 5px 0; color: #6b7280; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="table-badge">Table Assignment</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>Your table assignment for CEO Gála 2026 has been confirmed!</p>
        <div class="table-info">
          <p class="table-name">{{tableName}}</p>
          {{#if seatNumber}}<p class="seat-number">Seat {{seatNumber}}</p>{{/if}}
        </div>
        {{#if tablemates}}
        <div class="tablemates">
          <h4>Your Tablemates</h4>
          <p>{{tablemates}}</p>
        </div>
        {{/if}}
        <p>We look forward to seeing you at the event!</p>
      </div>
      <div class="footer">
        <p>If you have any questions about your seating, please contact us.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála -Event Reminder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .reminder-badge { display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .event-details { background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .event-details h3 { margin: 0 0 15px 0; color: #dc2626; text-align: center; }
    .event-details p { margin: 10px 0; }
    .checklist { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .checklist h4 { margin: 0 0 15px 0; color: #374151; }
    .checklist ul { margin: 0; padding-left: 20px; }
    .checklist li { margin: 8px 0; color: #4b5563; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="reminder-badge">Tomorrow!</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>We're excited to remind you that CEO Gála 2026 is <strong>tomorrow</strong>!</p>
        <div class="event-details">
          <h3>Event Details</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> {{eventVenue}}</p>
          {{#if eventAddress}}<p><strong>Address:</strong> {{eventAddress}}</p>{{/if}}
          {{#if tableName}}<p><strong>Your Table:</strong> {{tableName}}</p>{{/if}}
        </div>
        <div class="checklist">
          <h4>Before You Arrive</h4>
          <ul>
            <li>Have your QR code ready (check your email or the Gala App)</li>
            <li>Bring a valid photo ID</li>
            <li>Arrive by 5:30 PM for smooth registration</li>
            <li>Dress code: Business formal</li>
          </ul>
        </div>
        <p>We look forward to welcoming you!</p>
      </div>
      <div class="footer">
        <p>If you have any last-minute questions, please contact us.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála - 10 Days to Go</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .countdown { display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 600; padding: 10px 24px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .event-details { background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .event-details h3 { margin: 0 0 15px 0; color: #1d4ed8; text-align: center; }
    .event-details p { margin: 10px 0; }
    .preparation { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .preparation h4 { margin: 0 0 15px 0; color: #374151; }
    .preparation ul { margin: 0; padding-left: 20px; }
    .preparation li { margin: 8px 0; color: #4b5563; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="countdown">10 Days to Go!</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>The countdown is on! CEO Gála 2026 is just <strong>10 days away</strong>.</p>
        <div class="event-details">
          <h3>Mark Your Calendar</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> {{eventVenue}}</p>
          {{#if eventAddress}}<p><strong>Address:</strong> {{eventAddress}}</p>{{/if}}
          {{#if tableName}}<p><strong>Your Table:</strong> {{tableName}}</p>{{/if}}
        </div>
        <div class="preparation">
          <h4>Get Ready</h4>
          <ul>
            <li>Download the Gala App for quick access to your ticket</li>
            <li>Check your wardrobe - dress code is business formal</li>
            <li>Let us know about any dietary requirements</li>
            <li>Plan your transportation to the venue</li>
          </ul>
        </div>
        <p>We're looking forward to seeing you!</p>
      </div>
      <div class="footer">
        <p>Questions? Contact our support team.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála - One Week to Go</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .countdown { display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 16px; font-weight: 600; padding: 10px 24px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .event-details { background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .event-details h3 { margin: 0 0 15px 0; color: #d97706; text-align: center; }
    .event-details p { margin: 10px 0; }
    .cancel-notice { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .cancel-notice p { margin: 0; color: #b91c1c; font-size: 14px; }
    .cancel-notice a { color: #b91c1c; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="countdown">One Week to Go!</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>CEO Gála 2026 is now just <strong>one week away</strong>! We hope you're as excited as we are.</p>
        <div class="event-details">
          <h3>Event Details</h3>
          <p><strong>Date:</strong> {{eventDate}}</p>
          <p><strong>Time:</strong> {{eventTime}}</p>
          <p><strong>Venue:</strong> {{eventVenue}}</p>
          {{#if eventAddress}}<p><strong>Address:</strong> {{eventAddress}}</p>{{/if}}
          {{#if tableName}}<p><strong>Your Table:</strong> {{tableName}}</p>{{/if}}
        </div>
        <div class="cancel-notice">
          <p><strong>Important:</strong> This is the last week to cancel your registration. If your plans have changed, please <a href="{{cancelUrl}}">cancel here</a> before the deadline.</p>
        </div>
        <p>We can't wait to welcome you!</p>
      </div>
      <div class="footer">
        <p>Questions? Contact our support team.</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation of Your Attendance at the CEO Gala 2026</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; }
    h2 { font-size: 20px; color: #333333; margin: 0 0 25px 0; }
    p { margin: 0 0 18px 0; font-size: 15px; color: #333333; }
    .greeting { font-size: 15px; margin-bottom: 20px; }
    .guest-name { font-size: 22px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .highlight { font-weight: bold; }
    .details-section { margin: 30px 0; }
    .details-section .label { font-weight: bold; margin-bottom: 5px; }
    .details-section .value { margin: 0 0 15px 0; }
    .notice { background-color: #f8f8f8; border-left: 4px solid #c41e3a; padding: 15px 20px; margin: 25px 0; }
    .notice p { margin: 0; font-size: 14px; }
    .qr-section { margin: 40px 0; text-align: center; }
    .qr-section h3 { font-size: 16px; color: #333333; margin: 0 0 25px 0; }
    .qr-codes { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
    .qr-item { text-align: center; }
    .qr-item img { width: 180px; height: 180px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .qr-item .name { font-weight: bold; font-size: 14px; color: #333333; margin-top: 12px; }
    .signature { margin-top: 40px; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; margin-top: 30px; }
    .footer p { font-size: 13px; color: #666666; margin: 5px 0; }
    .footer a { color: #333333; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{headerImage}}" alt="CEO Gala 2026" class="header-image" />
    <h2>Confirmation</h2>

    <div class="content">
      <p class="greeting">Dear<span class="guest-name">{{guestTitle}} {{guestName}}</span></p>

      <p><span class="highlight">Thank you for your registration!</span></p>

      {{#if hasPartner}}
      <p>We are pleased to confirm that you and your partner, <span class="highlight">{{partnerName}}</span>, have successfully registered for our 13th edition of the CEO Gala!</p>
      {{/if}}
      {{#if hasPartner}}{{else}}
      <p>We are pleased to confirm that you have successfully registered for our 13th edition of the CEO Gala!</p>
      {{/if}}

      <p>The Budapest Business Journal and our esteemed event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you officially to this special occasion.</p>

      <p>The event will take place on <span class="highlight">Friday, March 27, 2026</span>; be sure to mark your calendar!</p>

      {{#if hasPartner}}
      <p>Attached below are your and your partner's personal QR codes, which will grant you access to the gala. Kindly <span class="highlight">download our CEO Gala 2026 application</span> on your mobile device to find your personal QR code and more, or bring a printed copy to the event to ensure smooth entry. Please note that this <span class="highlight">personal invitation</span> is dedicated to the addressee and is <span class="highlight">not transferable</span>.</p>
      {{/if}}
      {{#if hasPartner}}{{else}}
      <p>Attached below is your personal QR code, which will grant you access to the gala. Kindly <span class="highlight">download our CEO Gala 2026 application</span> on your mobile device to find your personal QR code and more, or bring a printed copy to the event to ensure smooth entry. Please note that this <span class="highlight">personal invitation</span> is dedicated to the addressee and is <span class="highlight">not transferable</span>.</p>
      {{/if}}

      <div class="details-section">
        <p class="label">Date:</p>
        <p class="value">Friday, March 27, 2026</p>

        <p class="label">Location:</p>
        <p class="value">Corinthia Hotel Budapest<br>1073 Budapest, Erzsébet krt. 43-49.</p>

        <p class="label">Dress Code:</p>
        <p class="value">Black tie for men, ballgown or cocktail dress for women</p>
      </div>

      <div class="notice">
        <p>We kindly remind you that any <span class="highlight">cancellations</span> or changes to your registration must be made at least <span class="highlight">10 business days</span> prior to the gala. Cancellations should be sent to <a href="mailto:event@bbj.hu">event@bbj.hu</a>.</p>
        <p style="margin-top: 10px;">Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a <span class="highlight">no-show fee</span> of HUF 99,000 per person.</p>
      </div>

      <p>We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.</p>

      <p class="signature">The BBJ CEO Gala Team</p>

      <div class="qr-section">
        <h3>Your QR code(s) to access the gala</h3>
        <div class="qr-codes">
          <div class="qr-item">
            <img src="{{guestQrCode}}" alt="Your QR Code" />
            <p class="name">{{guestName}}</p>
          </div>
          {{#if hasPartner}}
          <div class="qr-item">
            <img src="{{partnerQrCode}}" alt="Partner QR Code" />
            <p class="name">{{partnerName}}</p>
          </div>
          {{/if}}
        </div>
      </div>

      <div class="footer">
        <p><u>Business Publishing Services Kft.</u></p>
        <p>1075 Budapest, Madách Imre út 13-14., Hungary</p>
        <p>Publisher of Budapest Business Journal</p>
        <p>Event website: <a href="https://ceogala.com">ceogala.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `Confirmation of Your Attendance at the CEO Gala 2026

Dear {{guestTitle}} {{guestName}},

Thank you for your registration!

{{#if hasPartner}}We are pleased to confirm that you and your partner, {{partnerName}}, have successfully registered for our 13th edition of the CEO Gala!{{/if}}
{{#if hasPartner}}{{else}}We are pleased to confirm that you have successfully registered for our 13th edition of the CEO Gala!{{/if}}

The Budapest Business Journal and our esteemed event partner, the Hungarian Investment Promotion Agency (HIPA), are delighted to welcome you officially to this special occasion.

The event will take place on Friday, March 27, 2026; be sure to mark your calendar!

{{#if hasPartner}}Attached below are your and your partner's personal QR codes, which will grant you access to the gala.{{/if}}
{{#if hasPartner}}{{else}}Attached below is your personal QR code, which will grant you access to the gala.{{/if}}

Kindly download our CEO Gala 2026 application on your mobile device to find your personal QR code and more, or bring a printed copy to the event to ensure smooth entry.

Please note that this personal invitation is dedicated to the addressee and is not transferable.

Date:
Friday, March 27, 2026

Location:
Corinthia Hotel Budapest
1073 Budapest, Erzsébet krt. 43-49.

Dress Code:
Black tie for men, ballgown or cocktail dress for women

We kindly remind you that any cancellations or changes to your registration must be made at least 10 business days prior to the gala. Cancellations should be sent to event@bbj.hu.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 per person.

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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation of Your Attendance at the CEO Gala 2026</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; }
    h2 { font-size: 20px; color: #333333; margin: 0 0 25px 0; }
    p { margin: 0 0 18px 0; font-size: 15px; color: #333333; }
    .greeting { font-size: 15px; margin-bottom: 20px; }
    .guest-name { font-size: 22px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .highlight { font-weight: bold; }
    .details-section { margin: 30px 0; }
    .details-section .label { font-weight: bold; margin-bottom: 5px; }
    .details-section .value { margin: 0 0 15px 0; }
    .notice { background-color: #f8f8f8; border-left: 4px solid #c41e3a; padding: 15px 20px; margin: 25px 0; }
    .notice p { margin: 0; font-size: 14px; }
    .qr-section { margin: 40px 0; text-align: center; }
    .qr-section h3 { font-size: 16px; color: #333333; margin: 0 0 25px 0; }
    .qr-codes { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; }
    .qr-item { text-align: center; }
    .qr-item img { width: 180px; height: 180px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .qr-item .name { font-weight: bold; font-size: 14px; color: #333333; margin-top: 12px; }
    .signature { margin-top: 40px; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; margin-top: 30px; }
    .footer p { font-size: 13px; color: #666666; margin: 5px 0; }
    .footer a { color: #333333; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{headerImage}}" alt="CEO Gala 2026" class="header-image" />
    <h2>Confirmation</h2>

    <div class="content">
      <p class="greeting">Dear<span class="guest-name">{{partnerTitle}} {{partnerName}}</span></p>

      <p><span class="highlight">Thank you for your registration!</span></p>

      <p>We are pleased to confirm your registration as a <span class="highlight">Partner guest</span> for the 13th CEO Gala.</p>

      <p>Your attendance has been registered by <span class="highlight">{{mainGuestTitle}} {{mainGuestName}}</span>, and we are delighted to welcome you to this distinguished occasion organised by the Budapest Business Journal, together with its official event partner, the Hungarian Investment Promotion Agency (HIPA).</p>

      <p>The event will take place on <span class="highlight">Friday, March 27, 2026</span>; be sure to mark your calendar!</p>

      <p>Attached below are your and your partner's personal QR codes, which will grant you access to the gala. Kindly <span class="highlight">download our CEO Gala 2026 application</span> on your mobile device to find your personal QR code and more, or bring a printed copy to the event to ensure smooth entry. Please note that this <span class="highlight">personal invitation</span> is dedicated to the addressee and is <span class="highlight">not transferable</span>.</p>

      <div class="details-section">
        <p class="label">Date:</p>
        <p class="value">Friday, March 27, 2026</p>

        <p class="label">Location:</p>
        <p class="value">Corinthia Hotel Budapest<br>1073 Budapest, Erzsébet krt. 43-49.</p>

        <p class="label">Dress Code:</p>
        <p class="value">Black tie for men, ballgown or cocktail dress for women</p>
      </div>

      <div class="notice">
        <p>Should you be unable to attend, we kindly ask that any changes be communicated via <span class="highlight">{{mainGuestTitle}} {{mainGuestName}}</span>. We kindly remind you that any <span class="highlight">cancellations</span> or changes to your registration must be made at least <span class="highlight">10 business days</span> prior to the gala.</p>
        <p style="margin-top: 10px;">Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a <span class="highlight">no-show fee</span> of HUF 99,000 per person.</p>
      </div>

      <p>We look forward to meeting you at the gala and celebrating this outstanding CEO Community with you.</p>

      <p class="signature">The BBJ CEO Gala Team</p>

      <div class="qr-section">
        <h3>Your QR code(s) to access the gala</h3>
        <div class="qr-codes">
          <div class="qr-item">
            <img src="{{partnerQrCode}}" alt="Your QR Code" />
            <p class="name">{{partnerName}}</p>
          </div>
          <div class="qr-item">
            <img src="{{mainGuestQrCode}}" alt="Partner QR Code" />
            <p class="name">{{mainGuestName}}</p>
          </div>
        </div>
      </div>

      <div class="footer">
        <p><u>Business Publishing Services Kft.</u></p>
        <p>1075 Budapest, Madách Imre út 13-14., Hungary</p>
        <p>Publisher of Budapest Business Journal</p>
        <p>Event website: <a href="https://ceogala.com">ceogala.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `Confirmation of Your Attendance at the CEO Gala 2026

Dear {{partnerTitle}} {{partnerName}},

Thank you for your registration!

We are pleased to confirm your registration as a Partner guest for the 13th CEO Gala.

Your attendance has been registered by {{mainGuestTitle}} {{mainGuestName}}, and we are delighted to welcome you to this distinguished occasion organised by the Budapest Business Journal, together with its official event partner, the Hungarian Investment Promotion Agency (HIPA).

The event will take place on Friday, March 27, 2026; be sure to mark your calendar!

Attached below are your and your partner's personal QR codes, which will grant you access to the gala. Kindly download our CEO Gala 2026 application on your mobile device to find your personal QR code and more, or bring a printed copy to the event to ensure smooth entry.

Please note that this personal invitation is dedicated to the addressee and is not transferable.

Date:
Friday, March 27, 2026

Location:
Corinthia Hotel Budapest
1073 Budapest, Erzsébet krt. 43-49.

Dress Code:
Black tie for men, ballgown or cocktail dress for women

Should you be unable to attend, we kindly ask that any changes be communicated via {{mainGuestTitle}} {{mainGuestName}}. We kindly remind you that any cancellations or changes to your registration must be made at least 10 business days prior to the gala.

Please keep in mind that any failure on your part to provide due cancellation notice may result in your being charged a no-show fee of HUF 99,000 per person.

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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gála - No-Show Fee Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .notice-badge { display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .guest-name { font-size: 24px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .notice-box { background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 25px; margin: 20px 0; }
    .notice-box h3 { margin: 0 0 15px 0; color: #dc2626; text-align: center; }
    .notice-box p { margin: 10px 0; }
    .fee-amount { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
    .details { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .details h4 { margin: 0 0 15px 0; color: #374151; }
    .details p { margin: 8px 0; color: #4b5563; }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; }
    .deadline { font-size: 14px; color: #dc2626; text-align: center; font-weight: 600; margin-top: 15px; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gála</h1>
        <span class="notice-badge">Payment Required</span>
      </div>
      <div class="content">
        <p class="greeting">Dear<span class="guest-name">{{guestName}}</span></p>
        <p>We noticed that you did not attend CEO Gála 2026 on {{eventDate}}, and you did not cancel your registration before the deadline.</p>
        <div class="notice-box">
          <h3>No-Show Fee</h3>
          <p>According to our registration terms, a no-show fee is applicable for registered guests who do not attend without prior cancellation.</p>
          <div class="fee-amount">{{noShowFee}}</div>
          <p><strong>Ticket Type:</strong> {{ticketType}}</p>
        </div>
        <div class="details">
          <h4>Payment Information</h4>
          <p>Please settle this fee by the deadline below to avoid further action.</p>
          <p>If you believe this notice was sent in error (e.g., you did attend), please contact us immediately.</p>
        </div>
        <div class="cta-container">
          <a href="{{paymentUrl}}" class="cta-button">Pay Now</a>
        </div>
        <p class="deadline">Payment Deadline: {{paymentDeadline}}</p>
      </div>
      <div class="footer">
        <p>If you have questions, please contact us at info@ceogala.hu</p>
        <p>Best regards,<br>CEO Gála Organizing Team</p>
      </div>
    </div>
  </div>
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
      'guestTitle', 'guestName', 'guestCompany', 'guestPhone', 'guestEmail', 'guestDiet', 'guestSeating',
      'hasPartner', 'partnerTitle', 'partnerName', 'partnerPhone', 'partnerEmail', 'partnerDiet',
      'headerImage', 'baseUrl'
    ],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Automatic feedback message CEO Gala 2026</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; }
    p { margin: 0 0 15px 0; font-size: 15px; color: #333333; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .guest-name { font-size: 22px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .highlight { font-weight: bold; }
    .order-details { background-color: #f8f8f8; border-left: 4px solid #c41e3a; padding: 20px; margin: 25px 0; }
    .order-details h3 { margin: 0 0 15px 0; font-size: 16px; color: #333333; }
    .detail-row { margin: 8px 0; font-size: 14px; }
    .detail-label { font-style: italic; color: #666666; display: inline-block; min-width: 140px; }
    .detail-value { color: #333333; }
    .partner-section { margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc; }
    .partner-section h4 { margin: 0 0 10px 0; font-size: 14px; color: #c41e3a; }
    .consents { background-color: #f0f0f0; padding: 15px 20px; margin: 20px 0; font-size: 13px; font-style: italic; color: #555555; }
    .consents p { margin: 8px 0; font-size: 13px; }
    .notice { background-color: #fff8e6; border-left: 4px solid #f0ad4e; padding: 15px 20px; margin: 25px 0; }
    .notice p { margin: 0; font-size: 14px; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; margin-top: 30px; }
    .footer p { font-size: 13px; color: #666666; margin: 5px 0; }
    .footer a { color: #333333; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{headerImage}}" alt="CEO Gala 2026" class="header-image" />

    <div class="content">
      <p class="greeting">Dear<span class="guest-name">{{guestTitle}} {{guestName}}</span></p>

      <p>Thank you for your registration!</p>

      <p><span class="highlight">Hereby, we confirm that your data has been received.</span> Kindly take a moment to review the information provided below.</p>

      <p>Our team will now review your registration. Please note that <span class="highlight">your registration will only be finalized after having the official confirmation received.</span> Your confirmation email will include a personalised QR code granting access to the event.</p>

      <div class="order-details">
        <h3>Order details:</h3>
        <div class="detail-row"><span class="detail-label">Prefix:</span> <span class="detail-value">{{guestTitle}}</span></div>
        <div class="detail-row"><span class="detail-label">Name:</span> <span class="detail-value">{{guestName}}</span></div>
        <div class="detail-row"><span class="detail-label">Company name:</span> <span class="detail-value">{{guestCompany}}</span></div>
        <div class="detail-row"><span class="detail-label">Phone number:</span> <span class="detail-value">{{guestPhone}}</span></div>
        <div class="detail-row"><span class="detail-label">Email address:</span> <span class="detail-value">{{guestEmail}}</span></div>
        <div class="detail-row"><span class="detail-label">Special diet:</span> <span class="detail-value">{{guestDiet}}</span></div>
        <div class="detail-row"><span class="detail-label">Seating preferences:</span> <span class="detail-value">{{guestSeating}}</span></div>
        <div class="detail-row"><span class="detail-label">Partner:</span> <span class="detail-value">{{hasPartner}}</span></div>

        {{#if hasPartner}}
        <div class="partner-section">
          <h4>Partner details:</h4>
          <div class="detail-row"><span class="detail-label">Partner's prefix:</span> <span class="detail-value">{{partnerTitle}}</span></div>
          <div class="detail-row"><span class="detail-label">Partner's name:</span> <span class="detail-value">{{partnerName}}</span></div>
          <div class="detail-row"><span class="detail-label">Partner's phone:</span> <span class="detail-value">{{partnerPhone}}</span></div>
          <div class="detail-row"><span class="detail-label">Partner's email:</span> <span class="detail-value">{{partnerEmail}}</span></div>
          <div class="detail-row"><span class="detail-label">Partner's special diet:</span> <span class="detail-value">{{partnerDiet}}</span></div>
        </div>
        {{/if}}
      </div>

      <div class="consents">
        <p>I agree to have photos and videos taken of me at the gala.</p>
        <p>I accept the Terms and Conditions and the Privacy Policy.</p>
        <p>Keep me updated on more events and news from the event organizer.</p>
        <p>By submitting this application, I consent to the program's organizers managing my personal information. Personal data is controlled very carefully and is not disclosed to third parties.</p>
        <p><em>The CEO Gala is open to the press. I consent to any photos and/or videos taken of me at the event being used by Business Publishing Services Ltd. for publicity purposes.</em></p>
      </div>

      <div class="notice">
        <p>Should you notice any inaccuracies in the information above, please contact us at <a href="mailto:event@bbj.hu">event@bbj.hu</a>.</p>
      </div>

      <p><span class="highlight">Thank you for your registration! Please kindly await our official confirmation letter, which will be sent to you shortly.</span></p>

      <p>Kind regards,<br>The BBJ CEO Gala Team</p>
    </div>

    <div class="footer">
      <p><u>Business Publishing Services Kft.</u></p>
      <p>1075 Budapest, Madách Imre út 13-14., Hungary</p>
      <p>Publisher of Budapest Business Journal</p>
      <p>Event website: <a href="https://ceogala.com">ceogala.com</a></p>
    </div>
  </div>
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
Phone number: {{guestPhone}}
Email address: {{guestEmail}}
Special diet: {{guestDiet}}
Seating preferences: {{guestSeating}}
Partner: {{hasPartner}}

{{#if hasPartner}}
PARTNER DETAILS
---------------
Partner's prefix: {{partnerTitle}}
Partner's name: {{partnerName}}
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
      'partnerTitle', 'partnerName', 'partnerCompany', 'partnerPhone', 'partnerEmail', 'partnerDiet',
      'mainGuestTitle', 'mainGuestName', 'headerImage', 'baseUrl'
    ],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration details received: CEO Gala 2026</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; line-height: 1.8; color: #333333; margin: 0; padding: 0; background-color: #ffffff; }
    .container { max-width: 680px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header-image { width: 100%; max-width: 680px; height: auto; display: block; margin: 0 auto 30px auto; }
    .content { padding: 0 20px; }
    p { margin: 0 0 15px 0; font-size: 15px; color: #333333; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .guest-name { font-size: 22px; font-weight: 700; color: #1a1a2e; display: block; margin-top: 8px; }
    .highlight { font-weight: bold; }
    .order-details { background-color: #f8f8f8; border-left: 4px solid #c41e3a; padding: 20px; margin: 25px 0; }
    .order-details h3 { margin: 0 0 15px 0; font-size: 16px; color: #333333; }
    .detail-row { margin: 8px 0; font-size: 14px; }
    .detail-label { font-style: italic; color: #666666; display: inline-block; min-width: 140px; }
    .detail-value { color: #333333; }
    .consents { background-color: #f0f0f0; padding: 15px 20px; margin: 20px 0; font-size: 13px; font-style: italic; color: #555555; }
    .consents p { margin: 8px 0; font-size: 13px; }
    .consents-intro { font-style: italic; color: #666666; margin-bottom: 10px; }
    .notice { background-color: #fff8e6; border-left: 4px solid #f0ad4e; padding: 15px 20px; margin: 25px 0; }
    .notice p { margin: 0 0 10px 0; font-size: 14px; }
    .notice p:last-child { margin: 0; }
    .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; margin-top: 30px; }
    .footer p { font-size: 13px; color: #666666; margin: 5px 0; }
    .footer a { color: #333333; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{headerImage}}" alt="CEO Gala 2026" class="header-image" />

    <div class="content">
      <p class="greeting">Dear<span class="guest-name">{{partnerTitle}} {{partnerName}}</span></p>

      <p>You are receiving this message because you have been registered as an accompanying guest for the CEO Gala 2026 by <span class="highlight">{{mainGuestTitle}} {{mainGuestName}}</span>.</p>

      <p>We confirm receipt of the details provided in connection with your participation. Please take a moment to review the information below to ensure its accuracy.</p>

      <p>Our team will now review your registration. Please note that <span class="highlight">your registration will only be finalized after having the official confirmation received.</span> Your confirmation email will include a personalised QR code granting access to the event.</p>

      <div class="order-details">
        <h3>Registration details (as provided):</h3>
        <div class="detail-row"><span class="detail-label">Prefix:</span> <span class="detail-value">{{partnerTitle}}</span></div>
        <div class="detail-row"><span class="detail-label">Name:</span> <span class="detail-value">{{partnerName}}</span></div>
        <div class="detail-row"><span class="detail-label">Company name:</span> <span class="detail-value">{{partnerCompany}}</span></div>
        <div class="detail-row"><span class="detail-label">Phone number:</span> <span class="detail-value">{{partnerPhone}}</span></div>
        <div class="detail-row"><span class="detail-label">Email address:</span> <span class="detail-value">{{partnerEmail}}</span></div>
        <div class="detail-row"><span class="detail-label">Special diet:</span> <span class="detail-value">{{partnerDiet}}</span></div>
      </div>

      <div class="consents">
        <p class="consents-intro">The following declarations were accepted at the time of registration on your behalf:</p>
        <p>I agree to have photos and videos taken of me at the gala.</p>
        <p>I accept the Terms and Conditions and the Privacy Policy.</p>
        <p><em>The CEO Gala is open to the press. I consent to any photos and/or videos taken of me at the event being used by Business Publishing Services Ltd. for publicity purposes.</em></p>
      </div>

      <div class="notice">
        <p>Should you notice any inaccuracies in the information above, or if you have any questions regarding the declarations listed, please contact us at <a href="mailto:event@bbj.hu">event@bbj.hu</a>.</p>
        <p>Please note that attendance-related administration, including cancellations, is handled through the guest who completed the registration on your behalf.</p>
      </div>

      <p><span class="highlight">Please kindly await our official confirmation letter, which will be sent to you shortly.</span></p>

      <p>Kind regards,<br>The BBJ CEO Gala Team</p>
    </div>

    <div class="footer">
      <p><u>Business Publishing Services Kft.</u></p>
      <p>1075 Budapest, Madách Imre út 13-14., Hungary</p>
      <p>Publisher of Budapest Business Journal</p>
      <p>Event website: <a href="https://ceogala.com">ceogala.com</a></p>
    </div>
  </div>
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
    html_body: `<!DOCTYPE html>
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
    .email-marketing img { width: 20px; height: 20px; vertical-align: middle; margin-right: 5px; }
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
 * Get template for rendering, with fallback to default
 */
export async function getTemplateWithFallback(slug: TemplateSlug): Promise<{
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[];
}> {
  const template = await getTemplate(slug);

  if (template && template.is_active) {
    return {
      subject: template.subject,
      html_body: template.html_body,
      text_body: template.text_body,
      variables: JSON.parse(template.variables),
    };
  }

  // Fall back to default
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
