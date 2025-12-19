/**
 * Vitest Test Setup
 *
 * This file runs before all tests to set up the testing environment.
 */

import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// Global mocks that should be available in all tests
vi.mock('@/lib/utils/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
