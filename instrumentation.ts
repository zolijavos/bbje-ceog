/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * Used to initialize background services like the email scheduler.
 */

export async function register() {
  // Only run on server (not during build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initSchedulerCron } = await import('@/lib/services/scheduler-cron');
    initSchedulerCron();
  }
}
