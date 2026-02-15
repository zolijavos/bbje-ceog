/**
 * Scheduler Cron Jobs
 *
 * Runs periodic tasks for email scheduling:
 * - Process pending emails every minute
 * - Run automatic schedulers daily (based on SchedulerConfig)
 */

import cron from 'node-cron';
import {
  processScheduledEmails,
  runAutomaticSchedulers,
  initializeDefaultConfigs,
} from './email-scheduler';
import { logInfo, logError } from '@/lib/utils/logger';

let isInitialized = false;

/**
 * Initialize all scheduler cron jobs
 */
export function initSchedulerCron(): void {
  if (isInitialized) {
    logInfo('[CRON] Scheduler already initialized');
    return;
  }

  // Initialize default configs on startup
  initializeDefaultConfigs().catch((error) => {
    logError('[CRON] Error initializing default configs:', error);
  });

  // Process pending emails every minute
  cron.schedule('* * * * *', async () => {
    try {
      await processScheduledEmails();
    } catch (error) {
      logError('[CRON] Error processing scheduled emails:', error);
    }
  });

  // Run automatic schedulers daily at 7:00 AM
  // This will check all enabled SchedulerConfig entries and schedule accordingly
  cron.schedule('0 7 * * *', async () => {
    try {
      logInfo('[CRON] Running daily automatic schedulers');
      const results = await runAutomaticSchedulers();
      logInfo('[CRON] Automatic schedulers results:', JSON.stringify(results));
    } catch (error) {
      logError('[CRON] Error running automatic schedulers:', error);
    }
  });

  isInitialized = true;
  logInfo('[CRON] Email scheduler cron jobs initialized');
}

/**
 * Check if cron is initialized
 */
export function isCronInitialized(): boolean {
  return isInitialized;
}
