'use client';

/**
 * PWA Cancel Attendance Page
 * Allows registered guests to cancel their attendance before the deadline
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Warning,
  CheckCircle,
  XCircle,
  CalendarX,
} from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button3D from '../components/ui/Button3D';
import { EVENT_CONFIG, formatEventDate } from '@/lib/config/event';

interface CancelStatus {
  canCancel: boolean;
  alreadyCancelled: boolean;
  deadlinePassed: boolean;
  eventPassed: boolean;
  daysUntilDeadline: number;
  cancelledAt?: string;
}

export default function PWACancelPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<CancelStatus | null>(null);

  useEffect(() => {
    checkCancelStatus();
  }, []);

  const checkCancelStatus = async () => {
    try {
      const res = await fetch('/api/registration/cancel-status');
      if (res.status === 401) {
        router.push('/pwa');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to check status');
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to load cancellation status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/registration/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel registration');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pwa-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
          <p className="pwa-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen pwa-bg-base flex items-center justify-center p-4">
        <Card variant="elevated" className="text-center max-w-sm">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <CheckCircle size={40} weight="fill" className="text-green-500" />
          </div>
          <h2 className="font-display text-xl font-semibold pwa-text-primary mb-2">
            Attendance Cancelled
          </h2>
          <p className="pwa-text-secondary text-sm mb-6">
            Your registration has been cancelled. Thank you for letting us know in advance.
          </p>
          <Link href="/pwa/dashboard">
            <Button3D variant="secondary" className="w-full">
              Return to Dashboard
            </Button3D>
          </Link>
        </Card>
      </div>
    );
  }

  // Already cancelled state
  if (status?.alreadyCancelled) {
    return (
      <div className="min-h-screen pwa-bg-base pb-20">
        <header className="pwa-bg-header px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pwa/dashboard"
              className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            <h1 className="font-display text-xl pwa-text-inverse">Cancel Attendance</h1>
          </div>
        </header>

        <div className="p-4 max-w-lg mx-auto">
          <Card variant="elevated" className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(107, 114, 128, 0.1)' }}
            >
              <CalendarX size={40} weight="fill" className="text-gray-500" />
            </div>
            <h2 className="font-display text-lg font-semibold pwa-text-primary mb-2">
              Already Cancelled
            </h2>
            <p className="pwa-text-secondary text-sm mb-2">
              Your attendance was cancelled on:
            </p>
            <p className="pwa-text-primary font-medium mb-6">
              {status.cancelledAt ? new Date(status.cancelledAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Unknown date'}
            </p>
            <Link href="/pwa/dashboard">
              <Button3D variant="secondary" className="w-full">
                Return to Dashboard
              </Button3D>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Event passed state
  if (status?.eventPassed) {
    return (
      <div className="min-h-screen pwa-bg-base pb-20">
        <header className="pwa-bg-header px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pwa/dashboard"
              className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            <h1 className="font-display text-xl pwa-text-inverse">Cancel Attendance</h1>
          </div>
        </header>

        <div className="p-4 max-w-lg mx-auto">
          <Card variant="elevated" className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <XCircle size={40} weight="fill" className="text-red-500" />
            </div>
            <h2 className="font-display text-lg font-semibold pwa-text-primary mb-2">
              Event Has Passed
            </h2>
            <p className="pwa-text-secondary text-sm mb-6">
              The event has already taken place. Cancellation is no longer possible.
            </p>
            <Link href="/pwa/dashboard">
              <Button3D variant="secondary" className="w-full">
                Return to Dashboard
              </Button3D>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Deadline passed state
  if (status?.deadlinePassed) {
    return (
      <div className="min-h-screen pwa-bg-base pb-20">
        <header className="pwa-bg-header px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pwa/dashboard"
              className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
            <h1 className="font-display text-xl pwa-text-inverse">Cancel Attendance</h1>
          </div>
        </header>

        <div className="p-4 max-w-lg mx-auto">
          <Card variant="elevated" className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(245, 158, 11, 0.1)' }}
            >
              <Warning size={40} weight="fill" className="text-amber-500" />
            </div>
            <h2 className="font-display text-lg font-semibold pwa-text-primary mb-2">
              Deadline Passed
            </h2>
            <p className="pwa-text-secondary text-sm mb-4">
              The cancellation deadline (7 days before the event) has passed.
              To cancel, please contact the organizer directly.
            </p>
            <p className="pwa-text-tertiary text-xs mb-6">
              Contact: {EVENT_CONFIG.contactEmail}
            </p>
            <Link href="/pwa/dashboard">
              <Button3D variant="secondary" className="w-full">
                Return to Dashboard
              </Button3D>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Can cancel - show confirmation form
  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header */}
      <header className="pwa-bg-header px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/pwa/dashboard"
            className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="font-display text-xl pwa-text-inverse">Cancel Attendance</h1>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Warning Card */}
        <Card variant="elevated" className="border-l-4" style={{ borderLeftColor: 'var(--color-accent)' }}>
          <div className="flex gap-3">
            <Warning size={24} weight="fill" style={{ color: 'var(--color-accent)' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold pwa-text-primary mb-1">
                Are you sure you want to cancel?
              </h3>
              <p className="text-sm pwa-text-secondary">
                This action is final. Your spot will be released for other guests.
              </p>
            </div>
          </div>
        </Card>

        {/* Event Info */}
        <Card variant="static">
          <h3 className="font-medium pwa-text-primary mb-2">Event Details</h3>
          <p className="text-sm pwa-text-secondary">
            {EVENT_CONFIG.name}
          </p>
          <p className="text-sm pwa-text-secondary">
            {formatEventDate()}
          </p>
          <p className="text-sm pwa-text-tertiary mt-2">
            {status?.daysUntilDeadline !== undefined && status.daysUntilDeadline > 0 && (
              <>Cancellation deadline: {status.daysUntilDeadline} day{status.daysUntilDeadline !== 1 ? 's' : ''} remaining</>
            )}
          </p>
        </Card>

        {/* Reason Input */}
        <Card variant="static">
          <label className="block mb-2 text-sm font-medium pwa-text-primary">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Schedule conflict, illness, travel issues..."
            className="w-full p-3 rounded-lg border pwa-border bg-transparent pwa-text-primary placeholder:pwa-text-tertiary resize-none focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--color-accent)' } as React.CSSProperties}
            rows={3}
            maxLength={500}
            disabled={submitting}
          />
          <p className="text-xs pwa-text-tertiary mt-1 text-right">
            {reason.length}/500
          </p>
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Link href="/pwa/dashboard" className="flex-1">
            <Button3D variant="secondary" className="w-full" disabled={submitting}>
              Keep Registration
            </Button3D>
          </Link>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: submitting ? 'none' : '0 4px 14px 0 rgba(220, 38, 38, 0.3)',
            }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
