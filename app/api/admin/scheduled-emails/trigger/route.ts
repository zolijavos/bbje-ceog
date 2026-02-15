/**
 * Scheduler Trigger API
 *
 * POST /api/admin/scheduled-emails/trigger - Manually trigger scheduler tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, validateBody } from '@/lib/api';
import {
  processScheduledEmails,
  runAutomaticSchedulers,
} from '@/lib/services/email-scheduler';
import { logInfo, logError } from '@/lib/utils/logger';
import { z } from 'zod';

const triggerSchema = z.object({
  action: z.enum(['process', 'all']),
});

/**
 * POST - Manually trigger scheduler actions
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    // Only admins can trigger scheduler
    if (auth.session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const validation = await validateBody(request, triggerSchema);
    if (!validation.success) return validation.response;

    const { action } = validation.data;
    const results: Record<string, unknown> = {};

    logInfo(`[SCHEDULER] Manual trigger: ${action} by user ${auth.session.user.id}`);

    if (action === 'process') {
      results.processed = await processScheduledEmails();
    }

    if (action === 'all') {
      // Process pending emails first
      results.processed = await processScheduledEmails();
      // Then run all automatic schedulers based on config
      results.schedulers = await runAutomaticSchedulers();
    }

    return NextResponse.json({
      success: true,
      action,
      results,
    });
  } catch (error) {
    logError('[SCHEDULER] Error in manual trigger:', error);
    return NextResponse.json(
      { error: 'Failed to trigger scheduler' },
      { status: 500 }
    );
  }
}
