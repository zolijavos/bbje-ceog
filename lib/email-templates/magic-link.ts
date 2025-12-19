/**
 * Magic Link Email Template
 * HTML and plain text templates for magic link invitation emails
 * Branded with CEO Gala 2026 visual identity
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
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CEO Gala 2026 - Meghívó</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #1A1F35;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .card {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1A1F35 0%, #2D3555 100%);
      padding: 40px;
      text-align: center;
      border-bottom: 4px solid #C4A24D;
    }
    .logo-text {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 42px;
      font-weight: 700;
      color: #C4A24D;
      margin: 0;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .logo-sub {
      font-family: 'Georgia', 'Times New Roman', serif;
      color: #D4B86A;
      font-size: 18px;
      font-weight: 400;
      letter-spacing: 8px;
      margin-top: 8px;
      text-transform: uppercase;
    }
    .decorative-line {
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #C4A24D, transparent);
      margin: 16px auto 0;
    }
    .content {
      padding: 40px;
      background: #FAFAF8;
    }
    .greeting {
      font-size: 18px;
      color: #1A1F35;
      margin-bottom: 24px;
    }
    .greeting strong {
      color: #B8923D;
      font-weight: 600;
    }
    .intro-text {
      color: #4B5563;
      margin-bottom: 24px;
      font-size: 16px;
    }
    .event-info {
      background: linear-gradient(135deg, #1A1F35 0%, #2D3555 100%);
      padding: 24px 28px;
      margin: 28px 0;
      border-radius: 12px;
      border-left: 4px solid #C4A24D;
    }
    .event-info-title {
      font-size: 12px;
      font-weight: 700;
      color: #C4A24D;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 0 0 16px 0;
    }
    .event-info p {
      margin: 10px 0;
      color: #E5E7EB;
      font-size: 15px;
    }
    .event-info strong {
      color: #C4A24D;
    }
    .cta-container {
      text-align: center;
      margin: 36px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #C4A24D 0%, #B8923D 100%);
      color: #1A1F35 !important;
      text-decoration: none;
      padding: 18px 48px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(196, 162, 77, 0.4);
    }
    .expiry-note {
      font-size: 13px;
      color: #9CA3AF;
      text-align: center;
      margin-top: 16px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #C4A24D, transparent);
      margin: 32px 40px;
    }
    .footer {
      text-align: center;
      padding: 0 40px 40px;
      background: #FAFAF8;
    }
    .footer p {
      font-size: 14px;
      color: #6B7280;
      margin: 4px 0;
    }
    .footer .signature {
      margin-top: 20px;
      color: #1A1F35;
      font-weight: 600;
      font-size: 15px;
    }
    .link-fallback {
      background-color: #F3F4F6;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 0 40px 32px;
      font-size: 12px;
      color: #6B7280;
      word-break: break-all;
    }
    .link-fallback strong {
      display: block;
      margin-bottom: 8px;
      color: #4B5563;
    }
    .link-fallback a {
      color: #B8923D;
      text-decoration: none;
    }
    .bottom-brand {
      background: #1A1F35;
      padding: 20px;
      text-align: center;
    }
    .bottom-brand p {
      color: #C4A24D;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 16px 12px;
      }
      .header {
        padding: 32px 20px;
      }
      .logo-text {
        font-size: 32px;
      }
      .logo-sub {
        font-size: 14px;
        letter-spacing: 4px;
      }
      .content {
        padding: 28px 20px;
      }
      .cta-button {
        display: block;
        padding: 16px 24px;
      }
      .link-fallback {
        margin: 0 20px 24px;
      }
      .divider {
        margin: 24px 20px;
      }
      .footer {
        padding: 0 20px 32px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1 class="logo-text">CEO Gala</h1>
        <div class="logo-sub">2026</div>
        <div class="decorative-line"></div>
      </div>

      <div class="content">
        <p class="greeting">Kedves <strong>${escapeHtml(guestName)}</strong>!</p>

        <p class="intro-text">Örömmel értesítjük, hogy exkluzív meghívást kapott a CEO Gala rendezvényre.</p>

        <div class="event-info">
          <p class="event-info-title">Rendezvény Információ</p>
          <p><strong>Esemény:</strong> CEO Gala 2026</p>
          <p><strong>Dátum:</strong> 2026. március 27., péntek</p>
          <p><strong>Helyszín:</strong> Budapest Marriott Hotel</p>
        </div>

        <p style="color: #4B5563;">Kattintson az alábbi gombra a regisztráció megkezdéséhez:</p>

        <div class="cta-container">
          <a href="${escapeHtml(magicLinkUrl)}" class="cta-button">Regisztráció</a>
        </div>

        <p class="expiry-note">Ez a link 24 órán belül lejár.</p>
      </div>

      <div class="divider"></div>

      <div class="footer">
        <p>Amennyiben kérdése van, kérjük, forduljon hozzánk bizalommal.</p>
        <p class="signature">Üdvözlettel,<br>CEO Gala Szervezőbizottság</p>
      </div>

      <div class="link-fallback">
        <strong>Ha a gomb nem működik, másolja be ezt a linket a böngészőjébe:</strong>
        <a href="${escapeHtml(magicLinkUrl)}">${escapeHtml(magicLinkUrl)}</a>
      </div>

      <div class="bottom-brand">
        <p>CEO Gala • Budapest • 2026</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
CEO GALA 2026 - MEGHÍVÓ
=======================

Kedves ${guestName}!

Örömmel értesítjük, hogy exkluzív meghívást kapott a CEO Gala rendezvényre.

RENDEZVÉNY INFORMÁCIÓ
---------------------
Esemény: CEO Gala 2026
Dátum: 2026. március 27., péntek
Helyszín: Budapest Marriott Hotel

Kattintson az alábbi linkre a regisztráció megkezdéséhez:
${magicLinkUrl}

Ez a link 24 órán belül lejár.

Amennyiben kérdése van, kérjük, forduljon hozzánk bizalommal.

Üdvözlettel,
CEO Gala Szervezőbizottság
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
