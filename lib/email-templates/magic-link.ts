/**
 * Magic Link Email Template
 * HTML and plain text templates for magic link invitation emails
 */

export interface MagicLinkEmailParams {
  guestName: string;
  magicLinkUrl: string;
}

/**
 * Get magic link email template (HTML and plain text)
 */
export function getMagicLinkEmailTemplate(params: MagicLinkEmailParams): {
  html: string;
  text: string;
} {
  const { guestName, magicLinkUrl } = params;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala - Invitation</title>
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
      margin: 0;
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
      border-left: 4px solid #4a5568;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .event-info h3 {
      margin: 0 0 10px 0;
      color: #1a1a2e;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .expiry-note {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin-top: 15px;
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
    .link-fallback {
      font-size: 12px;
      color: #9ca3af;
      word-break: break-all;
      margin-top: 20px;
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
      .cta-button {
        display: block;
        padding: 16px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>CEO Gala</h1>
      </div>

      <div class="content">
        <p class="greeting">Dear ${escapeHtml(guestName)},</p>

        <p>We are pleased to inform you that you have received an invitation to the CEO Gala event.</p>

        <div class="event-info">
          <h3>Event Details</h3>
          <p><strong>Event:</strong> CEO Gala 2026</p>
          <p><strong>Venue:</strong> Budapest</p>
          <p>You will find more details during registration.</p>
        </div>

        <p>Click the button below to start your registration:</p>

        <div class="cta-container">
          <a href="${escapeHtml(magicLinkUrl)}" class="cta-button">Start Registration</a>
        </div>

        <p class="expiry-note">This link is valid for 24 hours.</p>
      </div>

      <div class="footer">
        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>CEO Gala Organizing Committee</p>
      </div>

      <p class="link-fallback">
        If the button doesn't work, copy this link into your browser:<br>
        ${escapeHtml(magicLinkUrl)}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
CEO Gala - Invitation

Dear ${guestName},

We are pleased to inform you that you have received an invitation to the CEO Gala event.

Event details:
- Event: CEO Gala 2026
- Venue: Budapest
- You will find more details during registration.

Click the link below to start your registration:
${magicLinkUrl}

This link is valid for 24 hours.

If you have any questions, please contact us.

Best regards,
CEO Gala Organizing Committee
  `.trim();

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
