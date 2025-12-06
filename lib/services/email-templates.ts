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
        <p class="expiry-note">This link is valid for 5 minutes.</p>
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

This link is valid for 5 minutes.

If you have any questions, please contact us.

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
