'use client';

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 15,
  medium: 30,
  heavy: 50,
  success: [30, 50, 30],
  warning: [50, 30, 50],
  error: [50, 30, 50, 30, 50],
};

export function useHaptic() {
  const vibrate = useCallback((pattern: HapticPattern | number | number[] = 'light') => {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return false;
    }

    const vibrationPattern =
      typeof pattern === 'string' ? HAPTIC_PATTERNS[pattern] : pattern;

    try {
      return navigator.vibrate(vibrationPattern);
    } catch {
      return false;
    }
  }, []);

  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return {
    vibrate,
    isSupported,
    patterns: {
      light: () => vibrate('light'),
      medium: () => vibrate('medium'),
      heavy: () => vibrate('heavy'),
      success: () => vibrate('success'),
      warning: () => vibrate('warning'),
      error: () => vibrate('error'),
    },
  };
}
