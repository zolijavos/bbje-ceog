import { defineConfig, devices } from '@playwright/test';

/**
 * CEO Gala E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    // Default timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Global timeout per test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  projects: [
    // Setup project - runs first to authenticate admin
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Main test projects
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Mobile tests for PWA and check-in scanner
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
      testMatch: /.*\.(pwa|checkin)\.spec\.ts/,
    },
  ],

  // Output directories
  outputDir: 'test-results',
});
