'use client';

import { useEffect, useState } from 'react';
import { Check, Warning, X, Info } from '@phosphor-icons/react';
import { Toast as ToastType, ToastType as ToastVariant } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <Check size={18} weight="bold" />,
  error: <X size={18} weight="bold" />,
  warning: <Warning size={18} weight="bold" />,
  info: <Info size={18} weight="bold" />,
};

function ToastItem({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200);
  };

  return (
    <div
      className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      onClick={handleDismiss}
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-2"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Simpler single toast display for forms
interface SimpleToastProps {
  message: string;
  type: ToastVariant;
  show: boolean;
  onClose?: () => void;
  duration?: number;
}

export function SimpleToast({
  message,
  type,
  show,
  onClose,
  duration = 3000,
}: SimpleToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
          }, 200);
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="toast-container">
      <div
        className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}
        role="alert"
      >
        <span className="flex-shrink-0">{icons[type]}</span>
        <span className="flex-1">{message}</span>
      </div>
    </div>
  );
}
