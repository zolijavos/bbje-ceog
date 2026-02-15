/**
 * Email Log Detail API
 *
 * DELETE /api/admin/email-logs/[id] - Delete email log entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/utils/logger';

/**
 * DELETE - Delete email log
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (!auth.success) return auth.response;

    const { id } = await params;
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json({ error: 'Invalid log ID' }, { status: 400 });
    }

    // Check if log exists
    const existing = await prisma.emailLog.findUnique({
      where: { id: logId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Email log not found' }, { status: 404 });
    }

    await prisma.emailLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('[EMAIL-LOGS] Error deleting log:', error);
    return NextResponse.json(
      { error: 'Failed to delete email log' },
      { status: 500 }
    );
  }
}
