/**
 * Audit Log Service
 *
 * Provides audit logging functionality for tracking admin actions
 */

import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { headers } from 'next/headers';

// Action types
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'SEND_EMAIL'
  | 'LOGIN'
  | 'LOGOUT'
  | 'IMPORT'
  | 'EXPORT'
  | 'ASSIGN'
  | 'UNASSIGN';

// Entity types
export type AuditEntityType =
  | 'guest'
  | 'table'
  | 'payment'
  | 'email'
  | 'applicant'
  | 'table_assignment'
  | 'user'
  | 'session';

/**
 * Input for creating an audit log entry
 */
export interface AuditLogInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: number;
  entityName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

/**
 * Audit log entry from database
 */
export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  entity_name: string | null;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

/**
 * Query parameters for listing audit logs
 */
export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

/**
 * Get client IP address from request headers
 */
async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    // Check various headers for proxied requests
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    const realIp = headersList.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get user agent from request headers
 */
async function getUserAgent(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get('user-agent');
  } catch {
    return null;
  }
}

/**
 * Create an audit log entry
 *
 * @param input - Audit log data
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    // Get current session
    const session = await getServerSession(authOptions);

    // Get request metadata
    const [ipAddress, userAgent] = await Promise.all([
      getClientIp(),
      getUserAgent(),
    ]);

    await prisma.auditLog.create({
      data: {
        user_id: session?.user?.id ? Number(session.user.id) : null,
        user_email: session?.user?.email || null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        entity_name: input.entityName || null,
        old_values: input.oldValues ? JSON.stringify(input.oldValues) : null,
        new_values: input.newValues ? JSON.stringify(input.newValues) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    console.error('[AUDIT] Failed to create audit log:', error);
  }
}

/**
 * Get paginated audit log list
 *
 * @param params - Query parameters
 */
export async function getAuditLogList(params: AuditLogListParams = {}) {
  const {
    page = 1,
    limit = 50,
    action,
    entityType,
    userId,
    startDate,
    endDate,
    search,
  } = params;

  // Build where clause
  const where: {
    action?: string;
    entity_type?: string;
    user_id?: number;
    created_at?: { gte?: Date; lte?: Date };
    OR?: Array<{ user_email?: { contains: string }; entity_name?: { contains: string } }>;
  } = {};

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entity_type = entityType;
  }

  if (userId) {
    where.user_id = userId;
  }

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) {
      where.created_at.gte = startDate;
    }
    if (endDate) {
      where.created_at.lte = endDate;
    }
  }

  if (search) {
    where.OR = [
      { user_email: { contains: search } },
      { entity_name: { contains: search } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute queries in parallel
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single audit log entry by ID
 */
export async function getAuditLogById(id: number) {
  return prisma.auditLog.findUnique({
    where: { id },
  });
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
  entityType: AuditEntityType,
  entityId: number
) {
  return prisma.auditLog.findMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
    },
    orderBy: { created_at: 'desc' },
  });
}

/**
 * Get recent activity summary for dashboard
 */
export async function getRecentActivitySummary() {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [recentLogs, actionCounts] = await Promise.all([
    // Get last 10 activities
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
    }),
    // Count by action in last 24 hours
    prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        created_at: { gte: last24Hours },
      },
      _count: true,
    }),
  ]);

  return {
    recentLogs,
    actionCounts: actionCounts.reduce(
      (acc, item) => {
        acc[item.action] = item._count;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}
