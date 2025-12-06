/**
 * E-Ticket Delivery Email Template
 * HTML and plain text templates for ticket delivery with QR code
 */

import { TicketType } from '@prisma/client';

export interface TicketEmailParams {
  guestName: string;
  ticketType: TicketType;
  qrCodeDataUrl: string; // Base64 PNG data URL
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
 * Get ticket delivery email template (HTML and plain text)
 */
export function getTicketDeliveryEmailTemplate(params: TicketEmailParams): {
  html: string;
  text: string;
  subject: string;
} {
  const { guestName, ticketType, qrCodeDataUrl, partnerName } = params;
  const ticketLabel = getTicketTypeLabel(ticketType);

  const subject = `CEO Gala 2026 - E-ticket - ${guestName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - E-ticket</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1a1a2e;
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    .header .subtitle {
      color: #6b7280;
      font-size: 16px;
      margin: 0;
    }
    .ticket-badge {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 20px;
      margin-top: 15px;
    }
    .content {
      margin-bottom: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .event-info {
      background-color: #f8f9fa;
      border-left: 4px solid #2563eb;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .event-info h3 {
      margin: 0 0 10px 0;
      color: #1a1a2e;
    }
    .event-info p {
      margin: 5px 0;
    }
    .qr-container {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background-color: #ffffff;
      border: 2px dashed #e5e7eb;
      border-radius: 12px;
    }
    .qr-container img {
      max-width: 250px;
      height: auto;
      margin-bottom: 15px;
    }
    .qr-instructions {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 10px 0;
    }
    .qr-note {
      font-size: 14px;
      color: #6b7280;
    }
    .guest-info {
      background-color: #f0fdf4;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 15px 20px;
      margin: 20px 0;
    }
    .guest-info h4 {
      margin: 0 0 10px 0;
      color: #166534;
    }
    .guest-info p {
      margin: 5px 0;
      color: #15803d;
    }
    .tips {
      background-color: #fffbeb;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 15px 20px;
      margin: 20px 0;
    }
    .tips h4 {
      margin: 0 0 10px 0;
      color: #b45309;
    }
    .tips ul {
      margin: 0;
      padding-left: 20px;
      color: #92400e;
    }
    .tips li {
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      margin-top: 30px;
    }
    .footer p {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      .card {
        padding: 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .qr-container img {
        max-width: 200px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gala 2026</h1>
        <p class="subtitle">E-ticket / Entry Pass</p>
        <span class="ticket-badge">${escapeHtml(ticketLabel)}</span>
      </div>

      <div class="content">
        <p class="greeting">Dear ${escapeHtml(guestName)},</p>

        <p>Thank you for registering! The QR code below is your entry pass to the CEO Gala event.</p>

        <div class="event-info">
          <h3>Event Details</h3>
          <p><strong>Event:</strong> CEO Gala 2026</p>
          <p><strong>Date:</strong> Friday, March 27, 2026, 6:00 PM</p>
          <p><strong>Venue:</strong> Budapest, Marriott Hotel</p>
        </div>

        <div class="qr-container">
          <img src="${qrCodeDataUrl}" alt="QR code entry pass" />
          <p class="qr-instructions">Show this QR code at the entrance!</p>
          <p class="qr-note">You can display the QR code on your phone screen.</p>
        </div>

        <div class="guest-info">
          <h4>Ticket Details</h4>
          <p><strong>Name:</strong> ${escapeHtml(guestName)}</p>
          <p><strong>Ticket Type:</strong> ${escapeHtml(ticketLabel)}</p>
          ${partnerName ? `<p><strong>Partner:</strong> ${escapeHtml(partnerName)}</p>` : ''}
        </div>

        <div class="tips">
          <h4>Helpful Information</h4>
          <ul>
            <li>Arrive by 5:30 PM for smooth registration</li>
            <li>Save the QR code to your phone or print it out</li>
            <li>Photo ID may be required</li>
            ${ticketType === 'paid_paired' ? '<li>For paired tickets, both guests must arrive together</li>' : ''}
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
</html>
  `.trim();

  const text = `
CEO Gala 2026 - E-ticket

Dear ${guestName},

Thank you for registering! This message contains your entry pass to the CEO Gala event.

EVENT DETAILS
-------------------
Event: CEO Gala 2026
Date: Friday, March 27, 2026, 6:00 PM
Venue: Budapest, Marriott Hotel

TICKET DETAILS
-----------
Name: ${guestName}
Ticket Type: ${ticketLabel}
${partnerName ? `Partner: ${partnerName}` : ''}

IMPORTANT: To display the QR code, open this email in a modern email client (Gmail, Outlook, etc.), or download the attached image.

HELPFUL INFORMATION
------------------
- Arrive by 5:30 PM for smooth registration
- Save the QR code to your phone or print it out
- Photo ID may be required
${ticketType === 'paid_paired' ? '- For paired tickets, both guests must arrive together' : ''}

If you have any questions, please contact us: info@ceogala.hu

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
