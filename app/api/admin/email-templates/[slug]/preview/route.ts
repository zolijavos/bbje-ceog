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

// Sample QR code placeholder (1x1 transparent PNG)
const SAMPLE_QR_CODE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOCSURBVHic7d1BbhNBGIbh/+/YJBA2LOACwJZDcATO0Cuw5hQcgTVHYMkKbkCyCQTbM94wdBIncWwnVZL39Ug7Hp+Zvzqt1OXo5PLqKsBOHT73BYBddYQGUoehn/sKwI6ch6E/93WAnXQUhvLcFwF20vUeGnZ0PIb+7osAu+gKDRYOQ3/u6wA76br0n/s6wM66QtM+9yWAHXWEhnqHoT/3dYAddIQGe4ehP/d1gF10XHof+gKsxcCwsHcY+nNfB9hJR2jQO+yl7xLsjSs0WDgM/bmvA+ykIzTUO+yl7xLsjSs0WDgM/bmvA+ykIzToHfbSdwn2xhUaLByG/tzXAXbSERrqHfbSdwn2xhUaLByG/tzXAXbSERr0DnvpuwR74woNFg5Df+7rADvpCA31DnvpuwR74woNFg5Df+7rADvpCA16h730XYK9cYUGC4ehP/d1gJ10hIZ6h730XYK9cYUGC4ehP/d1gJ10hAa9w176LsHeuEKDhcPQn/s6wE46QkO9w176LsHeuEKDhcPQn/s6wE46QoPeYS99l2BvXKHBwmHoz30dYCcdoaHeYS99l2BvXKHBwmHoz30dYCcdoUHvsJe+S7A3rtBg4TD0574OsJOO0FDvsJe+S7A3rtBg4TD0574OsJOO0KB32EvfJdgbV2iwcBj6c18H2ElHaKh32EvfJdgbV2iwcBj6c18H2ElHaNA77KXvEuyNKzRYOAz9ua8D7KQjNNQ77KXvEuyNKzRYOAz9ua8D7KQjNOgd9tJ3CfbGFRosHIb+3NcBdtIRGuod9tJ3CfbGFRosHIb+3NcBdtIRGvQOe+m7BHvjCg0WDkN/7usAO+kIDfUOe+m7BHvjCg0WDkN/7usAO+kIDXqHvfRdgr1xhQYLh6E/93WAnXSEhnqHvfRdgr1xhQYLh6E/93WAnXSEBr3DXvouwd64QoOFw9Cf+zrATjpCQ73DXvouwd64QoOFw9Cf+zrATjpCg95hL32XYG9cocHCYejPfR1gJx2hod5hL32XYG9cocHCYejPfR1gJx2hQe+wl75LsDeu0GDhMPTnvg6wk47QUO+wl75LsDeu0GDhMPTnvg6wk47QoHfYS98l2BtXaLBwGPpzXwfYSUdoqHfYS98l2BtXaLBwGPpzXwfYyb+GprzD0J/7OsBOOkJDvcNe+i7B3rhCg4XD0J/7OsBO/gFi/T3fgxgJJAAAAABJRU5ErkJggg==';

// Sample header image URL for preview (using public path)
const SAMPLE_HEADER_IMAGE = '/images/email-header.jpg';

// Sample data for previewing templates
const SAMPLE_DATA: Record<string, Record<string, string>> = {
  magic_link: {
    guestName: 'John Smith',
    magicLinkUrl: 'https://ceogala.hu/register?code=abc123&email=john@example.com',
  },
  ticket_delivery: {
    guestName: 'John Smith',
    guestTitle: 'Mr.',
    ticketType: 'VIP Ticket',
    qrCodeDataUrl: SAMPLE_QR_CODE,
    guestQrCode: SAMPLE_QR_CODE,
    partnerQrCode: SAMPLE_QR_CODE,
    partnerName: 'Jane Smith',
    hasPartner: 'true',
    headerImage: SAMPLE_HEADER_IMAGE,
  },
  partner_ticket_delivery: {
    partnerName: 'Jane Smith',
    partnerTitle: 'Mrs.',
    mainGuestName: 'John Smith',
    mainGuestTitle: 'Mr.',
    partnerQrCode: SAMPLE_QR_CODE,
    mainGuestQrCode: SAMPLE_QR_CODE,
    headerImage: SAMPLE_HEADER_IMAGE,
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
    eventVenue: 'Budapest, Corinthia Hotel',
    eventAddress: '1073 Budapest, Erzsébet krt. 43-49.',
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
