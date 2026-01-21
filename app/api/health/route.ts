/**
 * Health Check API
 *
 * GET /api/health
 *
 * Returns system health status for deployment verification.
 * Checks: database connection, environment, app version.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    environment: {
      status: 'ok' | 'warning' | 'error';
      missing?: string[];
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'healthy',
    version: process.env.npm_package_version || '0.0.0',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok' },
      environment: { status: 'ok' },
    },
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database.latency = Date.now() - dbStart;
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  // Check required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'APP_SECRET',
    'QR_SECRET',
    'NEXTAUTH_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

  if (missingEnvVars.length > 0) {
    health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    health.checks.environment = {
      status: missingEnvVars.length > 2 ? 'error' : 'warning',
      missing: missingEnvVars,
    };
  }

  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
