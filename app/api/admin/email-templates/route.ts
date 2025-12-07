/**
 * Email Templates List API
 *
 * GET /api/admin/email-templates - List all templates
 * POST /api/admin/email-templates/init - Initialize default templates
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import {
  getAllTemplates,
  initializeDefaultTemplates,
  DEFAULT_TEMPLATES,
} from '@/lib/services/email-templates';
import { logError } from '@/lib/utils/logger';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Initialize defaults if needed
    await initializeDefaultTemplates();

    const templates = await getAllTemplates();

    // Merge with defaults to show available variables
    const templatesWithMeta = templates.map((template) => {
      const defaultTemplate =
        DEFAULT_TEMPLATES[template.slug as keyof typeof DEFAULT_TEMPLATES];
      return {
        ...template,
        availableVariables: defaultTemplate?.variables || [],
        hasDefault: !!defaultTemplate,
      };
    });

    return NextResponse.json({
      templates: templatesWithMeta,
      availableSlugs: Object.keys(DEFAULT_TEMPLATES),
    });
  } catch (error) {
    logError('[EMAIL-TEMPLATES] Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
