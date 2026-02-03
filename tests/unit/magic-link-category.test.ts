import { describe, it, expect } from 'vitest';

/**
 * Magic link category logic tests
 *
 * Categories:
 * - 'ready': Last sent 48+ hours ago (safe to send again)
 * - 'warning': Last sent 24-48 hours ago
 * - 'recent': Last sent within 24 hours
 * - 'never': Never sent
 */

// This is the same logic used in app/admin/guests/page.tsx
const getMagicLinkCategory = (lastSentAt: Date | null): 'ready' | 'warning' | 'recent' | 'never' => {
  if (!lastSentAt) return 'never';
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (lastSentAt < fortyEightHoursAgo) return 'ready';
  if (lastSentAt < twentyFourHoursAgo) return 'warning';
  return 'recent';
};

describe('getMagicLinkCategory', () => {
  it('returns "never" when lastSentAt is null', () => {
    expect(getMagicLinkCategory(null)).toBe('never');
  });

  it('returns "ready" when email was sent more than 48 hours ago', () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(threeDaysAgo)).toBe('ready');
  });

  it('returns "ready" when email was sent exactly 48+ hours ago', () => {
    const now = new Date();
    const fortyNineHoursAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(fortyNineHoursAgo)).toBe('ready');
  });

  it('returns "warning" when email was sent between 24 and 48 hours ago', () => {
    const now = new Date();
    const thirtyHoursAgo = new Date(now.getTime() - 30 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(thirtyHoursAgo)).toBe('warning');
  });

  it('returns "warning" when email was sent exactly 24-48 hours ago', () => {
    const now = new Date();
    const fortySevenHoursAgo = new Date(now.getTime() - 47 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(fortySevenHoursAgo)).toBe('warning');

    const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(twentyFiveHoursAgo)).toBe('warning');
  });

  it('returns "recent" when email was sent within 24 hours', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(oneHourAgo)).toBe('recent');
  });

  it('returns "recent" when email was sent just now', () => {
    const now = new Date();
    expect(getMagicLinkCategory(now)).toBe('recent');
  });

  it('returns "recent" when email was sent 23 hours ago', () => {
    const now = new Date();
    const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
    expect(getMagicLinkCategory(twentyThreeHoursAgo)).toBe('recent');
  });
});
