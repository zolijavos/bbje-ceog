/**
 * E-Ticket Delivery Email Template
 * HTML and plain text templates for ticket delivery with QR code
 * Branded with CEO Gala 2026 visual identity
 */

import { TicketType } from '@prisma/client';

export interface TicketEmailParams {
  guestName: string;
  ticketType: TicketType;
  qrCodeDataUrl: string; // Base64 PNG data URL or CID reference
  partnerName?: string; // For paired tickets
}

/**
 * Get human-readable ticket type label
 */
function getTicketTypeLabel(ticketType: TicketType): string {
  const labels: Record<TicketType, string> = {
    vip_free: 'VIP Ticket',
    paid_single: 'Single Ticket',
    paid_paired: 'Paired Ticket',
  };
  return labels[ticketType] || ticketType;
}

/**
 * Get ticket badge color based on type
 */
function getTicketBadgeColor(ticketType: TicketType): { bg: string; text: string } {
  const colors: Record<TicketType, { bg: string; text: string }> = {
    vip_free: { bg: '#FEF3C7', text: '#B45309' },
    paid_single: { bg: '#DBEAFE', text: '#1D4ED8' },
    paid_paired: { bg: '#F3E8FF', text: '#7C3AED' },
  };
  return colors[ticketType] || { bg: '#F3F4F6', text: '#374151' };
}

/**
 * Get ticket delivery email template (HTML and plain text)
 */
export function getTicketDeliveryEmailTemplate(params: TicketEmailParams): {
  html: string;
  text: string;
  subject: string;
} {
  const { guestName, ticketType, qrCodeDataUrl, partnerName } = params;
  const ticketLabel = getTicketTypeLabel(ticketType);
  const badgeColors = getTicketBadgeColor(ticketType);

  const subject = `CEO Gala 2026 - Your E-Ticket - ${guestName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala 2026 - E-Ticket</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #F3F4F6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .header .subtitle {
      color: #D1D5DB;
      font-size: 14px;
      margin-top: 8px;
      letter-spacing: 1px;
    }
    .ticket-badge {
      display: inline-block;
      background-color: ${badgeColors.bg};
      color: ${badgeColors.text};
      font-size: 12px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 20px;
      margin-top: 16px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      color: #1F2937;
      margin-bottom: 20px;
    }
    .greeting strong {
      color: #14B8A6;
    }
    .intro-text {
      color: #4B5563;
      margin-bottom: 28px;
    }
    .event-info {
      background-color: #F9FAFB;
      border-left: 4px solid #14B8A6;
      padding: 20px 24px;
      margin: 28px 0;
      border-radius: 0 8px 8px 0;
    }
    .event-info-title {
      font-size: 14px;
      font-weight: 600;
      color: #14B8A6;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    .event-info p {
      margin: 8px 0;
      color: #4B5563;
    }
    .event-info strong {
      color: #1F2937;
    }
    .qr-container {
      text-align: center;
      margin: 32px 0;
      padding: 28px;
      background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
      border: 2px solid #E5E7EB;
      border-radius: 16px;
    }
    .qr-container img {
      max-width: 220px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .qr-instructions {
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
      margin: 20px 0 8px;
    }
    .qr-note {
      font-size: 13px;
      color: #6B7280;
    }
    .guest-info {
      background-color: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 12px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .guest-info-title {
      font-size: 14px;
      font-weight: 600;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    .guest-info p {
      margin: 8px 0;
      color: #065F46;
    }
    .guest-info strong {
      color: #047857;
    }
    .tips {
      background-color: #FFFBEB;
      border: 1px solid #FCD34D;
      border-radius: 12px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .tips-title {
      font-size: 14px;
      font-weight: 600;
      color: #B45309;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    .tips ul {
      margin: 0;
      padding-left: 20px;
      color: #92400E;
    }
    .tips li {
      margin: 8px 0;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
      margin: 32px 0;
    }
    .footer {
      text-align: center;
      padding: 0 40px 32px;
    }
    .footer p {
      font-size: 14px;
      color: #6B7280;
      margin: 4px 0;
    }
    .footer a {
      color: #14B8A6;
      text-decoration: none;
      font-weight: 500;
    }
    .footer .signature {
      margin-top: 20px;
      color: #1F2937;
      font-weight: 500;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 12px;
      }
      .header {
        padding: 24px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 24px 20px;
      }
      .qr-container {
        padding: 20px;
      }
      .qr-container img {
        max-width: 180px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gala 2026</h1>
        <p class="subtitle">E-TICKET / ENTRY PASS</p>
        <span class="ticket-badge">${escapeHtml(ticketLabel)}</span>
      </div>

      <div class="content">
        <p class="greeting">Dear <strong>${escapeHtml(guestName)}</strong>,</p>

        <p class="intro-text">Thank you for your registration. Below you will find your QR code, which serves as your entry pass to the CEO Gala event.</p>

        <div class="event-info">
          <p class="event-info-title">Event Details</p>
          <p><strong>Event:</strong> CEO Gala 2026</p>
          <p><strong>Date:</strong> Friday, March 27, 2026, 6:00 PM</p>
          <p><strong>Venue:</strong> Budapest, Corinthia Hotel</p>
        </div>

        <div class="qr-container">
          <img src="${qrCodeDataUrl}" alt="QR Code Entry Pass" />
          <p class="qr-instructions">Present this QR code at the entrance</p>
          <p class="qr-note">You may display it on your phone or print this email.</p>
        </div>

        <div class="guest-info">
          <p class="guest-info-title">Ticket Information</p>
          <p><strong>Name:</strong> ${escapeHtml(guestName)}</p>
          <p><strong>Ticket Type:</strong> ${escapeHtml(ticketLabel)}</p>
          ${partnerName ? `<p><strong>Partner:</strong> ${escapeHtml(partnerName)}</p>` : ''}
        </div>

        <div class="tips">
          <p class="tips-title">Important Information</p>
          <ul>
            <li>Please arrive by 5:30 PM for smooth registration</li>
            <li>Save the QR code to your phone or print it out</li>
            <li>A valid photo ID may be required at entry</li>
            ${ticketType === 'paid_paired' ? '<li>Both guests with paired tickets should arrive together</li>' : ''}
          </ul>
        </div>

      </div>

      <div class="divider"></div>

      <div class="footer">
        <p>For questions, please contact us at:</p>
        <p><a href="mailto:info@ceogala.hu">info@ceogala.hu</a></p>
        <p class="signature">Best regards,<br>CEO Gala Organizing Committee</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
CEO GALA 2026 - E-TICKET
========================

Dear ${guestName},

Thank you for your registration. This message contains your entry pass to the CEO Gala event.

EVENT DETAILS
-------------
Event: CEO Gala 2026
Date: Friday, March 27, 2026, 6:00 PM
Venue: Budapest, Corinthia Hotel

TICKET INFORMATION
------------------
Name: ${guestName}
Ticket Type: ${ticketLabel}
${partnerName ? `Partner: ${partnerName}` : ''}

IMPORTANT: To view the QR code, please open this email in a modern email client (Gmail, Outlook, etc.) or download the attached image.

IMPORTANT INFORMATION
---------------------
- Please arrive by 5:30 PM for smooth registration
- Save the QR code to your phone or print it out
- A valid photo ID may be required at entry
${ticketType === 'paid_paired' ? '- Both guests with paired tickets should arrive together' : ''}

For questions, please contact us at: info@ceogala.hu

Best regards,
CEO Gala Organizing Committee
  `.trim();

  return { html, text, subject };
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
