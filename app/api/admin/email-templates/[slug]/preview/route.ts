/**
 * Email Template Preview API
 *
 * POST /api/admin/email-templates/[slug]/preview - Preview template with sample data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import {
  interpolateTemplate,
  DEFAULT_TEMPLATES,
  type TemplateSlug,
} from '@/lib/services/email-templates';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

type RouteContext = { params: Promise<{ slug: string }> };

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
};

const previewSchema = z.object({
  html_body: z.string().optional(),
  text_body: z.string().optional(),
  subject: z.string().optional(),
  customVariables: z.record(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const { slug } = params;

    // Check if it's a valid template slug
    if (!(slug in DEFAULT_TEMPLATES)) {
      return NextResponse.json(
        { error: 'Invalid template slug' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = previewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      );
    }

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
