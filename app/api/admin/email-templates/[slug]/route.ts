/**
 * Individual Email Template API
 *
 * GET /api/admin/email-templates/[slug] - Get single template
 * PUT /api/admin/email-templates/[slug] - Update template
 * DELETE /api/admin/email-templates/[slug] - Reset to default
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import {
  getTemplate,
  upsertTemplate,
  resetTemplateToDefault,
  renderTemplate,
  DEFAULT_TEMPLATES,
  type TemplateSlug,
} from '@/lib/services/email-templates';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

type RouteContext = { params: Promise<{ slug: string }> };

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(500),
  html_body: z.string().min(1),
  text_body: z.string().min(1),
  is_active: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
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

    const template = await getTemplate(slug as TemplateSlug);
    const defaultTemplate = DEFAULT_TEMPLATES[slug as TemplateSlug];

    return NextResponse.json({
      template: template || {
        slug,
        name: defaultTemplate.name,
        subject: defaultTemplate.subject,
        html_body: defaultTemplate.html_body,
        text_body: defaultTemplate.text_body,
        variables: JSON.stringify(defaultTemplate.variables),
        is_active: true,
        isDefault: true,
      },
      defaultTemplate: {
        name: defaultTemplate.name,
        subject: defaultTemplate.subject,
        html_body: defaultTemplate.html_body,
        text_body: defaultTemplate.text_body,
      },
      availableVariables: defaultTemplate.variables,
    });
  } catch (error) {
    logError('[EMAIL-TEMPLATES] Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const defaultTemplate = DEFAULT_TEMPLATES[slug as TemplateSlug];

    const template = await upsertTemplate({
      slug,
      name: validation.data.name,
      subject: validation.data.subject,
      html_body: validation.data.html_body,
      text_body: validation.data.text_body,
      variables: defaultTemplate.variables as unknown as string[],
      is_active: validation.data.is_active ?? true,
    });

    return NextResponse.json({ template, success: true });
  } catch (error) {
    logError('[EMAIL-TEMPLATES] Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const template = await resetTemplateToDefault(slug as TemplateSlug);

    return NextResponse.json({
      template,
      success: true,
      message: 'Template reset to default',
    });
  } catch (error) {
    logError('[EMAIL-TEMPLATES] Error resetting template:', error);
    return NextResponse.json(
      { error: 'Failed to reset template' },
      { status: 500 }
    );
  }
}
