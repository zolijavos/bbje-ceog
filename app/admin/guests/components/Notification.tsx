/**
 * Notification Component
 *
 * Toast-style notification for success/error/info messages.
 */

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Notification({ type, message }: NotificationProps) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`mb-4 p-4 rounded-lg border ${styles[type]}`}
      role="alert"
      data-testid="notification"
    >
      {message}
    </div>
  );
}
