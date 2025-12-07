/**
 * Scheduler Configuration Item API
 *
 * GET    /api/admin/scheduler-config/[id] - Get config details
 * PATCH  /api/admin/scheduler-config/[id] - Update config
 * DELETE /api/admin/scheduler-config/[id] - Delete config
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError, logInfo } from '@/lib/utils/logger';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET - Get scheduler config details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { id } = await context.params;
    const configId = parseInt(id);

    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const config = await prisma.schedulerConfig.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    logError('[SCHEDULER-CONFIG] Error getting config:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler config' },
      { status: 500 }
    );
  }
}

const updateConfigSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  template_slug: z.string().min(1).max(100).optional(),
  days_before: z.number().int().min(0).max(365).nullable().optional(),
  days_after: z.number().int().min(0).max(365).nullable().optional(),
  interval_days: z.number().int().min(1).max(365).nullable().optional(),
  send_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  target_status: z.array(z.string()).nullable().optional(),
  target_types: z.array(z.string()).nullable().optional(),
});

/**
 * PATCH - Update scheduler config
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const configId = parseInt(id);

    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const validation = await validateBody(request, updateConfigSchema);
    if (!validation.success) return validation.response;

    const data = validation.data;

    // Check if config exists
    const existing = await prisma.schedulerConfig.findUnique({
      where: { id: configId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.template_slug !== undefined) updateData.template_slug = data.template_slug;
    if (data.days_before !== undefined) updateData.days_before = data.days_before;
    if (data.days_after !== undefined) updateData.days_after = data.days_after;
    if (data.interval_days !== undefined) updateData.interval_days = data.interval_days;
    if (data.send_time !== undefined) updateData.send_time = data.send_time;
    if (data.target_status !== undefined) {
      updateData.target_status = data.target_status ? JSON.stringify(data.target_status) : null;
    }
    if (data.target_types !== undefined) {
      updateData.target_types = data.target_types ? JSON.stringify(data.target_types) : null;
    }

    const config = await prisma.schedulerConfig.update({
      where: { id: configId },
      data: updateData,
    });

    logInfo(`[SCHEDULER-CONFIG] Updated config ${configId} by user ${auth.session.user.id}`);

    return NextResponse.json({ success: true, config });
  } catch (error) {
    logError('[SCHEDULER-CONFIG] Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduler config' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete scheduler config
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const configId = parseInt(id);

    if (isNaN(configId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.schedulerConfig.delete({
      where: { id: configId },
    });

    logInfo(`[SCHEDULER-CONFIG] Deleted config ${configId} by user ${auth.session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('[SCHEDULER-CONFIG] Error deleting config:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduler config' },
      { status: 500 }
    );
  }
}
