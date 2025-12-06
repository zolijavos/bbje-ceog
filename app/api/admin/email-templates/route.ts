/**
 * Email Templates List API
 *
 * GET /api/admin/email-templates - List all templates
 * POST /api/admin/email-templates/init - Initialize default templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import {
  getAllTemplates,
  initializeDefaultTemplates,
  DEFAULT_TEMPLATES,
} from '@/lib/services/email-templates';
import { logError } from '@/lib/utils/logger';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
