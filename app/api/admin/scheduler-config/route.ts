/**
 * Scheduler Configuration API
 *
 * GET  /api/admin/scheduler-config - List all scheduler configs
 * POST /api/admin/scheduler-config - Create new config
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';
import { z } from 'zod';

/**
 * GET - List all scheduler configurations
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const configs = await prisma.schedulerConfig.findMany({
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json({ configs });
  } catch (error) {
    logError('[SCHEDULER-CONFIG] Error listing configs:', error);
    return NextResponse.json(
      { error: 'Failed to list scheduler configs' },
      { status: 500 }
    );
  }
}

const createConfigSchema = z.object({
  config_key: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  template_slug: z.string().min(1).max(100),
  days_before: z.number().int().min(0).max(365).nullable().optional(),
  days_after: z.number().int().min(0).max(365).nullable().optional(),
  interval_days: z.number().int().min(1).max(365).nullable().optional(),
  send_time: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  target_status: z.array(z.string()).optional(),
  target_types: z.array(z.string()).optional(),
});

/**
 * POST - Create new scheduler configuration
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const validation = await validateBody(request, createConfigSchema);
    if (!validation.success) return validation.response;

    const data = validation.data;

    // Check for duplicate key
    const existing = await prisma.schedulerConfig.findUnique({
      where: { config_key: data.config_key },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Configuration with this key already exists' },
        { status: 400 }
      );
    }

    const config = await prisma.schedulerConfig.create({
      data: {
        config_key: data.config_key,
        name: data.name,
        description: data.description,
        enabled: data.enabled,
        template_slug: data.template_slug,
        days_before: data.days_before,
        days_after: data.days_after,
        interval_days: data.interval_days,
        send_time: data.send_time,
        target_status: data.target_status ? JSON.stringify(data.target_status) : null,
        target_types: data.target_types ? JSON.stringify(data.target_types) : null,
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    logError('[SCHEDULER-CONFIG] Error creating config:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduler config' },
      { status: 500 }
    );
  }
}
