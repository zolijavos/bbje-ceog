'use client';

import { useCallback, useState } from 'react';
import { useHaptic } from './useHaptic';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const DEFAULT_DURATION = 3000;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { patterns } = useHaptic();

  const show = useCallback(
    (message: string, type: ToastType = 'info', duration = DEFAULT_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newToast: Toast = {
        id,
        message,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Haptic feedback based on type
      switch (type) {
        case 'success':
          patterns.success();
          break;
        case 'error':
          patterns.error();
          break;
        case 'warning':
          patterns.warning();
          break;
        default:
          patterns.light();
      }

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [patterns]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    show,
    dismiss,
    dismissAll,
    success: (message: string, duration?: number) => show(message, 'success', duration),
    error: (message: string, duration?: number) => show(message, 'error', duration),
    warning: (message: string, duration?: number) => show(message, 'warning', duration),
    info: (message: string, duration?: number) => show(message, 'info', duration),
  };
}

// Create a singleton for global toast access
let globalToast: ReturnType<typeof useToast> | null = null;

export function setGlobalToast(toast: ReturnType<typeof useToast>) {
  globalToast = toast;
}

export function getGlobalToast() {
  return globalToast;
}
