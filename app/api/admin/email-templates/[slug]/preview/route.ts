/**
 * Email Template Preview API
 *
 * POST /api/admin/email-templates/[slug]/preview - Preview template with sample data
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody } from '@/lib/api';
import {
  interpolateTemplate,
  DEFAULT_TEMPLATES,
  type TemplateSlug,
} from '@/lib/services/email-templates';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

type SlugContext = { params: Promise<{ slug: string }> };

// Sample data for previewing templates
const SAMPLE_DATA: Record<string, Record<string, string>> = {
  magic_link: {
    guestName: 'John Smith',
    magicLinkUrl: 'https://ceogala.hu/register?code=abc123&email=john@example.com',
  },
  ticket_delivery: {
    guestName: 'John Smith',
    ticketType: 'VIP Ticket',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    partnerName: 'Jane Smith',
  },
  applicant_approval: {
    guestName: 'John Smith',
    magicLinkUrl: 'https://ceogala.hu/register?code=xyz789&email=john@example.com',
  },
  applicant_rejection: {
    guestName: 'John Smith',
    rejectionReason: 'Limited capacity for this event.',
  },
  payment_reminder: {
    guestName: 'John Smith',
    ticketType: 'Single Ticket',
    amount: '150,000 HUF',
    paymentUrl: 'https://ceogala.hu/payment?id=12345',
    dueDate: 'March 15, 2026',
  },
  payment_confirmation: {
    guestName: 'John Smith',
    ticketType: 'Single Ticket',
    amount: '150,000 HUF',
    paymentDate: 'March 10, 2026',
    transactionId: 'TXN-2026-001234',
  },
  table_assignment: {
    guestName: 'John Smith',
    tableName: 'Table A1',
    seatNumber: '3',
    tablemates: 'Jane Doe, Robert Johnson, Mary Williams',
  },
  event_reminder: {
    guestName: 'John Smith',
    eventDate: 'Friday, March 27, 2026',
    eventTime: '6:00 PM',
    eventVenue: 'Budapest Marriott Hotel',
    eventAddress: '1052 Budapest, Apáczai Csere János u. 4.',
    tableName: 'Table A1',
  },
};

const previewSchema = z.object({
  html_body: z.string().optional(),
  text_body: z.string().optional(),
  subject: z.string().optional(),
  customVariables: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest, context: SlugContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const params = await context.params;
    const { slug } = params;

    // Check if it's a valid template slug
    if (!(slug in DEFAULT_TEMPLATES)) {
      return NextResponse.json(
        { error: 'Invalid template slug' },
        { status: 400 }
      );
    }

    const validation = await validateBody(request, previewSchema);
    if (!validation.success) return validation.response;

    const defaultTemplate = DEFAULT_TEMPLATES[slug as TemplateSlug];
    const sampleData = {
      ...SAMPLE_DATA[slug],
      ...validation.data.customVariables,
    };

    // Use provided templates or defaults
    const htmlBody = validation.data.html_body || defaultTemplate.html_body;
    const textBody = validation.data.text_body || defaultTemplate.text_body;
    const subject = validation.data.subject || defaultTemplate.subject;

    const preview = {
      subject: interpolateTemplate(subject, sampleData, true),
      html: interpolateTemplate(htmlBody, sampleData, true),
      text: interpolateTemplate(textBody, sampleData, false),
    };

    return NextResponse.json({
      preview,
      sampleData,
      availableVariables: defaultTemplate.variables,
    });
  } catch (error) {
    logError('[EMAIL-TEMPLATES] Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
