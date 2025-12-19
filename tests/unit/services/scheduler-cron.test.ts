/**
 * Scheduler Cron Service Unit Tests
 *
 * Tests for: lib/services/scheduler-cron.ts
 *
 * Coverage targets:
 * - initSchedulerCron() - Initialize cron jobs
 * - isCronInitialized() - Check initialization status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock node-cron
const mockSchedule = vi.fn();
vi.mock('node-cron', () => ({
  default: {
    schedule: mockSchedule,
  },
}));

// Mock email-scheduler functions
const mockProcessScheduledEmails = vi.fn();
const mockRunAutomaticSchedulers = vi.fn();
const mockInitializeDefaultConfigs = vi.fn();

vi.mock('@/lib/services/email-scheduler', () => ({
  processScheduledEmails: () => mockProcessScheduledEmails(),
  runAutomaticSchedulers: () => mockRunAutomaticSchedulers(),
  initializeDefaultConfigs: () => mockInitializeDefaultConfigs(),
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

// Dynamic import for fresh module each test
let cronModule: typeof import('@/lib/services/scheduler-cron');

describe('Scheduler Cron Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockSchedule.mockReset();
    mockProcessScheduledEmails.mockReset();
    mockRunAutomaticSchedulers.mockReset();
    mockInitializeDefaultConfigs.mockResolvedValue(undefined);
    mockRunAutomaticSchedulers.mockResolvedValue([]);

    // Reset modules to get fresh isInitialized state
    vi.resetModules();
    cronModule = await import('@/lib/services/scheduler-cron');
  });

  // ============================================
  // initSchedulerCron() Tests
  // ============================================
  describe('initSchedulerCron', () => {
    it('should initialize cron jobs', () => {
      cronModule.initSchedulerCron();

      // Should schedule two cron jobs (every minute and daily at 7 AM)
      expect(mockSchedule).toHaveBeenCalledTimes(2);
      expect(mockSchedule).toHaveBeenCalledWith('* * * * *', expect.any(Function));
      expect(mockSchedule).toHaveBeenCalledWith('0 7 * * *', expect.any(Function));
    });

    it('should call initializeDefaultConfigs on startup', () => {
      cronModule.initSchedulerCron();

      expect(mockInitializeDefaultConfigs).toHaveBeenCalledTimes(1);
    });

    it('should not reinitialize if already initialized', () => {
      cronModule.initSchedulerCron();
      cronModule.initSchedulerCron();
      cronModule.initSchedulerCron();

      // Should only schedule once
      expect(mockSchedule).toHaveBeenCalledTimes(2);
    });

    it('should handle initializeDefaultConfigs error gracefully', async () => {
      mockInitializeDefaultConfigs.mockRejectedValue(new Error('Config init error'));

      // Should not throw
      expect(() => cronModule.initSchedulerCron()).not.toThrow();
    });

    it('should execute minute cron callback successfully', async () => {
      mockProcessScheduledEmails.mockResolvedValue(undefined);
      cronModule.initSchedulerCron();

      // Get the minute cron callback (first call with '* * * * *')
      const minuteCallback = mockSchedule.mock.calls.find(
        (call) => call[0] === '* * * * *'
      )?.[1];

      expect(minuteCallback).toBeDefined();

      // Execute the callback
      await minuteCallback();

      expect(mockProcessScheduledEmails).toHaveBeenCalledTimes(1);
    });

    it('should handle minute cron callback error gracefully', async () => {
      mockProcessScheduledEmails.mockRejectedValue(new Error('Process error'));
      cronModule.initSchedulerCron();

      const minuteCallback = mockSchedule.mock.calls.find(
        (call) => call[0] === '* * * * *'
      )?.[1];

      // Should not throw
      await expect(minuteCallback()).resolves.not.toThrow();
    });

    it('should execute daily cron callback successfully', async () => {
      mockRunAutomaticSchedulers.mockResolvedValue([{ scheduler: 'test', scheduled: 5 }]);
      cronModule.initSchedulerCron();

      // Get the daily cron callback (call with '0 7 * * *')
      const dailyCallback = mockSchedule.mock.calls.find(
        (call) => call[0] === '0 7 * * *'
      )?.[1];

      expect(dailyCallback).toBeDefined();

      // Execute the callback
      await dailyCallback();

      expect(mockRunAutomaticSchedulers).toHaveBeenCalledTimes(1);
    });

    it('should handle daily cron callback error gracefully', async () => {
      mockRunAutomaticSchedulers.mockRejectedValue(new Error('Scheduler error'));
      cronModule.initSchedulerCron();

      const dailyCallback = mockSchedule.mock.calls.find(
        (call) => call[0] === '0 7 * * *'
      )?.[1];

      // Should not throw
      await expect(dailyCallback()).resolves.not.toThrow();
    });
  });

  // ============================================
  // isCronInitialized() Tests
  // ============================================
  describe('isCronInitialized', () => {
    it('should return false before initialization', () => {
      expect(cronModule.isCronInitialized()).toBe(false);
    });

    it('should return true after initialization', () => {
      cronModule.initSchedulerCron();

      expect(cronModule.isCronInitialized()).toBe(true);
    });

    it('should remain true after multiple init calls', () => {
      cronModule.initSchedulerCron();
      cronModule.initSchedulerCron();

      expect(cronModule.isCronInitialized()).toBe(true);
    });
  });
});
