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
    subject: 'CEO Gala - Registration Invitation',
    variables: ['guestName', 'magicLinkUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .event-info { background-color: #f8f9fa; border-left: 4px solid #4a5568; padding: 15px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .event-info h3 { margin: 0 0 10px 0; color: #1a1a2e; }
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
        <h1>CEO Gala</h1>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>We are pleased to inform you that you have received an invitation to the CEO Gala event.</p>
        <div class="event-info">
          <h3>Event Details</h3>
          <p><strong>Event:</strong> CEO Gala 2026</p>
          <p><strong>Venue:</strong> Budapest</p>
          <p>You will find more details during registration.</p>
        </div>
        <p>Click the button below to start your registration:</p>
        <div class="cta-container">
          <a href="{{magicLinkUrl}}" class="cta-button">Start Registration</a>
        </div>
        <p class="expiry-note">This link is valid for 24 hours.</p>
      </div>
      <div class="footer">
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
      <p class="link-fallback">
        If the button doesn't work, copy this link into your browser:<br>
        {{magicLinkUrl}}
      </p>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Invitation

Dear {{guestName}},

We are pleased to inform you that you have received an invitation to the CEO Gala event.

Event details:
- Event: CEO Gala 2026
- Venue: Budapest
- You will find more details during registration.

Click the link below to start your registration:
{{magicLinkUrl}}

This link is valid for 24 hours.

If you have any questions, please contact us.

Best regards,
CEO Gala Organizing Committee`,
  },
  applicant_approval: {
    slug: 'applicant_approval',
    name: 'Applicant Approval',
    subject: 'CEO Gala 2026 - Application Approved',
    variables: ['guestName', 'magicLinkUrl'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Application Approved</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .success-badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
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
        <h1>CEO Gala</h1>
        <span class="success-badge">- Application Approved</span>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>Great news! Your application to attend the CEO Gala 2026 has been <strong>approved</strong>.</p>
        <p>You can now complete your registration by clicking the button below:</p>
        <div class="cta-container">
          <a href="{{magicLinkUrl}}" class="cta-button">Complete Registration</a>
        </div>
        <p class="expiry-note">This link is valid for 72 hours.</p>
      </div>
      <div class="footer">
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
      <p class="link-fallback">
        If the button doesn't work, copy this link into your browser:<br>
        {{magicLinkUrl}}
      </p>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Application Approved

Dear {{guestName}},

Great news! Your application to attend the CEO Gala 2026 has been APPROVED.

You can now complete your registration by clicking the link below:
{{magicLinkUrl}}

This link is valid for 72 hours.

If you have any questions, please contact us.

Best regards,
CEO Gala Organizing Committee`,
  },
  applicant_rejection: {
    slug: 'applicant_rejection',
    name: 'Applicant Rejection',
    subject: 'CEO Gala 2026 - Application Status',
    variables: ['guestName', 'rejectionReason'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Application Status</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .reason-box { background-color: #f8f9fa; border-left: 4px solid #6b7280; padding: 15px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gala</h1>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>Thank you for your interest in attending the CEO Gala 2026.</p>
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
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Application Status

Dear {{guestName}},

Thank you for your interest in attending the CEO Gala 2026.

After careful consideration, we regret to inform you that we are unable to accommodate your application at this time.

{{#if rejectionReason}}Note: {{rejectionReason}}{{/if}}

We appreciate your understanding and hope to welcome you at future events.

If you have any questions, please contact us.

Best regards,
CEO Gala Organizing Committee`,
  },
  payment_reminder: {
    slug: 'payment_reminder',
    name: 'Payment Reminder',
    subject: 'CEO Gala 2026 - Payment Reminder',
    variables: ['guestName', 'ticketType', 'amount', 'paymentUrl', 'dueDate'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Payment Reminder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .reminder-badge { display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
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
        <h1>CEO Gala</h1>
        <span class="reminder-badge">Payment Reminder</span>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>This is a friendly reminder that your registration payment for CEO Gala 2026 is still pending.</p>
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
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Payment Reminder

Dear {{guestName}},

This is a friendly reminder that your registration payment for CEO Gala 2026 is still pending.

PAYMENT DETAILS
---------------
Ticket Type: {{ticketType}}
Amount Due: {{amount}}
{{#if dueDate}}Due Date: {{dueDate}}{{/if}}

Please complete your payment to secure your spot at the event:
{{paymentUrl}}

If you have already completed the payment, please disregard this email.

Best regards,
CEO Gala Organizing Committee`,
  },
  payment_confirmation: {
    slug: 'payment_confirmation',
    name: 'Payment Confirmation',
    subject: 'CEO Gala 2026 - Payment Confirmed',
    variables: ['guestName', 'ticketType', 'amount', 'paymentDate', 'transactionId'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Payment Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .success-badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
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
        <h1>CEO Gala</h1>
        <span class="success-badge">- Payment Confirmed</span>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>Thank you! Your payment for CEO Gala 2026 has been successfully processed.</p>
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
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Payment Confirmed

Dear {{guestName}},

Thank you! Your payment for CEO Gala 2026 has been successfully processed.

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
CEO Gala Organizing Committee`,
  },
  table_assignment: {
    slug: 'table_assignment',
    name: 'Table Assignment Notification',
    subject: 'CEO Gala 2026 - Your Table Assignment',
    variables: ['guestName', 'tableName', 'seatNumber', 'tablemates'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Table Assignment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .table-badge { display: inline-block; background-color: #8b5cf6; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
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
        <h1>CEO Gala</h1>
        <span class="table-badge">Table Assignment</span>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>Your table assignment for CEO Gala 2026 has been confirmed!</p>
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
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Table Assignment

Dear {{guestName}},

Your table assignment for CEO Gala 2026 has been confirmed!

TABLE: {{tableName}}
{{#if seatNumber}}SEAT: {{seatNumber}}{{/if}}

{{#if tablemates}}YOUR TABLEMATES:
{{tablemates}}{{/if}}

We look forward to seeing you at the event!

If you have any questions about your seating, please contact us.

Best regards,
CEO Gala Organizing Committee`,
  },
  event_reminder: {
    slug: 'event_reminder',
    name: 'Event Reminder',
    subject: 'CEO Gala 2026 - Event Tomorrow!',
    variables: ['guestName', 'eventDate', 'eventTime', 'eventVenue', 'eventAddress', 'tableName'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Event Reminder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0; }
    .reminder-badge { display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 20px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
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
        <h1>CEO Gala</h1>
        <span class="reminder-badge">Tomorrow!</span>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>We're excited to remind you that CEO Gala 2026 is <strong>tomorrow</strong>!</p>
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
            <li>Have your QR code ready (check your email or the CEO Gala app)</li>
            <li>Bring a valid photo ID</li>
            <li>Arrive by 5:30 PM for smooth registration</li>
            <li>Dress code: Business formal</li>
          </ul>
        </div>
        <p>We look forward to welcoming you!</p>
      </div>
      <div class="footer">
        <p>If you have any last-minute questions, please contact us.</p>
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala - Event Tomorrow!

Dear {{guestName}},

We're excited to remind you that CEO Gala 2026 is TOMORROW!

EVENT DETAILS
-------------
Date: {{eventDate}}
Time: {{eventTime}}
Venue: {{eventVenue}}
{{#if eventAddress}}Address: {{eventAddress}}{{/if}}
{{#if tableName}}Your Table: {{tableName}}{{/if}}

BEFORE YOU ARRIVE
-----------------
- Have your QR code ready (check your email or the CEO Gala app)
- Bring a valid photo ID
- Arrive by 5:30 PM for smooth registration
- Dress code: Business formal

We look forward to welcoming you!

If you have any last-minute questions, please contact us.

Best regards,
CEO Gala Organizing Committee`,
  },
  ticket_delivery: {
    slug: 'ticket_delivery',
    name: 'E-Ticket Delivery',
    subject: 'CEO Gala 2026 - E-ticket - {{guestName}}',
    variables: ['guestName', 'ticketType', 'qrCodeDataUrl', 'partnerName'],
    html_body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - E-ticket</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #1a1a2e; font-size: 28px; margin: 0 0 10px 0; }
    .header .subtitle { color: #6b7280; font-size: 16px; margin: 0; }
    .ticket-badge { display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; padding: 6px 16px; border-radius: 20px; margin-top: 15px; }
    .content { margin-bottom: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .event-info { background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 15px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; }
    .event-info h3 { margin: 0 0 10px 0; color: #1a1a2e; }
    .event-info p { margin: 5px 0; }
    .qr-container { text-align: center; margin: 30px 0; padding: 20px; background-color: #ffffff; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .qr-container img { max-width: 250px; height: auto; margin-bottom: 15px; }
    .qr-instructions { font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 10px 0; }
    .qr-note { font-size: 14px; color: #6b7280; }
    .guest-info { background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 15px 20px; margin: 20px 0; }
    .guest-info h4 { margin: 0 0 10px 0; color: #166534; }
    .guest-info p { margin: 5px 0; color: #15803d; }
    .tips { background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px 20px; margin: 20px 0; }
    .tips h4 { margin: 0 0 10px 0; color: #b45309; }
    .tips ul { margin: 0; padding-left: 20px; color: #92400e; }
    .tips li { margin: 5px 0; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
    .footer p { font-size: 14px; color: #6b7280; margin: 5px 0; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gala 2026</h1>
        <p class="subtitle">E-ticket / Entry Pass</p>
        <span class="ticket-badge">{{ticketType}}</span>
      </div>
      <div class="content">
        <p class="greeting">Dear {{guestName}},</p>
        <p>Thank you for registering! The QR code below is your entry pass to the CEO Gala event.</p>
        <div class="event-info">
          <h3>Event Details</h3>
          <p><strong>Event:</strong> CEO Gala 2026</p>
          <p><strong>Date:</strong> Friday, March 27, 2026, 6:00 PM</p>
          <p><strong>Venue:</strong> Budapest, Marriott Hotel</p>
        </div>
        <div class="qr-container">
          <img src="{{qrCodeDataUrl}}" alt="QR code entry pass" />
          <p class="qr-instructions">Show this QR code at the entrance!</p>
          <p class="qr-note">You can display the QR code on your phone screen.</p>
        </div>
        <div class="guest-info">
          <h4>Ticket Details</h4>
          <p><strong>Name:</strong> {{guestName}}</p>
          <p><strong>Ticket Type:</strong> {{ticketType}}</p>
          {{#if partnerName}}<p><strong>Partner:</strong> {{partnerName}}</p>{{/if}}
        </div>
        <div class="tips">
          <h4>Helpful Information</h4>
          <ul>
            <li>Arrive by 5:30 PM for smooth registration</li>
            <li>Save the QR code to your phone or print it out</li>
            <li>Photo ID may be required</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        <p>If you have any questions, please contact us:</p>
        <p><a href="mailto:info@ceogala.hu">info@ceogala.hu</a></p>
        <p style="margin-top: 20px;">Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>`,
    text_body: `CEO Gala 2026 - E-ticket

Dear {{guestName}},

Thank you for registering! This message contains your entry pass to the CEO Gala event.

EVENT DETAILS
-------------------
Event: CEO Gala 2026
Date: Friday, March 27, 2026, 6:00 PM
Venue: Budapest, Marriott Hotel

TICKET DETAILS
-----------
Name: {{guestName}}
Ticket Type: {{ticketType}}
{{#if partnerName}}Partner: {{partnerName}}{{/if}}

IMPORTANT: To display the QR code, open this email in a modern email client.

HELPFUL INFORMATION
------------------
- Arrive by 5:30 PM for smooth registration
- Save the QR code to your phone or print it out
- Photo ID may be required

If you have any questions, please contact us: info@ceogala.hu

Best regards,
CEO Gala Organizing Committee`,
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
  const template = await getTemplateWithFallback(slug);

  return {
    subject: interpolateTemplate(template.subject, variables, true),
    html: interpolateTemplate(template.html_body, variables, true),
    text: interpolateTemplate(template.text_body, variables, false),
  };
}
