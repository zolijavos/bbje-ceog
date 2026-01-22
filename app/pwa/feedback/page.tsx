'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  ChatCircle,
  CheckCircle,
  Sparkle,
} from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button3D from '../components/ui/Button3D';
import Skeleton from '../components/ui/Skeleton';
import { useHaptic } from '../hooks/useHaptic';

// Feedback is only available after the event
const EVENT_DATE = new Date('2026-03-27T19:00:00');
const FEEDBACK_AVAILABLE = false; // Set to true after the event

interface FeedbackData {
  overallRating: number;
  venueRating: number;
  foodRating: number;
  networkingRating: number;
  comment: string;
}

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (rating: number) => void;
  label: string;
}) {
  const { patterns } = useHaptic();
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium pwa-text-primary mb-2">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              patterns.light();
              onChange(star);
            }}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              size={32}
              weight={(hoverValue || value) >= star ? 'fill' : 'regular'}
              style={{
                color:
                  (hoverValue || value) >= star
                    ? 'var(--color-accent)'
                    : 'var(--color-text-tertiary)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonFeedback() {
  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      <header className="pwa-bg-header px-4 py-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-5 skeleton-shimmer"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          />
          <div
            className="w-32 h-6 skeleton-shimmer"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          />
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto">
        <div className="card-static p-4 space-y-4">
          <Skeleton variant="title" width="60%" />
          <Skeleton variant="text" count={3} />
          <Skeleton variant="custom" height={48} />
        </div>
      </div>
    </div>
  );
}

export default function PWAFeedbackPage() {
  const router = useRouter();
  const { patterns } = useHaptic();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 0,
    venueRating: 0,
    foodRating: 0,
    networkingRating: 0,
    comment: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/pwa/auth/session');
        if (!res.ok) {
          router.replace('/pwa');
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/pwa');
          return;
        }

        // Check if user already submitted feedback
        const feedbackKey = 'ceog_feedback_submitted';
        if (localStorage.getItem(feedbackKey)) {
          setAlreadySubmitted(true);
        }
      } catch {
        router.replace('/pwa');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (feedback.overallRating === 0) {
      patterns.error();
      return;
    }

    setSubmitting(true);
    patterns.medium();

    try {
      // In production, this would send to an API endpoint
      // await fetch('/api/pwa/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedback),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark as submitted
      localStorage.setItem('ceog_feedback_submitted', 'true');
      patterns.success();
      setSubmitted(true);
    } catch {
      patterns.error();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonFeedback />;
  }

  // Check if feedback is available
  const now = new Date();
  const isBeforeEvent = now < EVENT_DATE;

  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header */}
      <header className="pwa-bg-header pwa-text-inverse px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/pwa/dashboard"
            className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="font-display text-xl pwa-text-inverse">Event Feedback</h1>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto">
        {!FEEDBACK_AVAILABLE || isBeforeEvent ? (
          // Feedback not yet available
          <Card variant="static" className="text-center py-12">
            <div className="mb-4">
              <ChatCircle
                size={64}
                weight="duotone"
                className="mx-auto"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>
            <h2 className="text-xl font-semibold pwa-text-primary mb-2">
              Feedback Coming Soon
            </h2>
            <p className="pwa-text-secondary text-sm mb-4">
              You can share your feedback after the event.
            </p>
            <Link href="/pwa/dashboard">
              <Button3D variant="secondary">Back to Dashboard</Button3D>
            </Link>
          </Card>
        ) : alreadySubmitted || submitted ? (
          // Already submitted
          <Card variant="static" className="text-center py-12">
            <div className="mb-4">
              <div className="relative inline-block">
                <div
                  className="absolute inset-0 blur-xl opacity-50 animate-pulse"
                  style={{ background: 'var(--color-success)' }}
                />
                <CheckCircle
                  size={64}
                  weight="fill"
                  className="relative"
                  style={{ color: 'var(--color-success)' }}
                />
              </div>
            </div>
            <h2 className="text-xl font-semibold pwa-text-primary mb-2">
              Thank You!
            </h2>
            <p className="pwa-text-secondary text-sm mb-4">
              Your feedback has been submitted. We appreciate your input!
            </p>
            <Link href="/pwa/dashboard">
              <Button3D variant="secondary">Back to Dashboard</Button3D>
            </Link>
          </Card>
        ) : (
          // Feedback form
          <>
            <Card variant="static" className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={20} weight="fill" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg font-semibold pwa-text-primary">
                  Share Your Experience
                </h2>
              </div>
              <p className="pwa-text-secondary text-sm">
                Help us make future events even better by sharing your feedback.
              </p>
            </Card>

            <form onSubmit={handleSubmit}>
              <Card variant="static" className="mb-4">
                <StarRating
                  value={feedback.overallRating}
                  onChange={(rating) =>
                    setFeedback((prev) => ({ ...prev, overallRating: rating }))
                  }
                  label="Overall Experience *"
                />

                <StarRating
                  value={feedback.venueRating}
                  onChange={(rating) =>
                    setFeedback((prev) => ({ ...prev, venueRating: rating }))
                  }
                  label="Venue & Atmosphere"
                />

                <StarRating
                  value={feedback.foodRating}
                  onChange={(rating) =>
                    setFeedback((prev) => ({ ...prev, foodRating: rating }))
                  }
                  label="Food & Drinks"
                />

                <StarRating
                  value={feedback.networkingRating}
                  onChange={(rating) =>
                    setFeedback((prev) => ({ ...prev, networkingRating: rating }))
                  }
                  label="Networking Opportunities"
                />
              </Card>

              <Card variant="static" className="mb-4">
                <label className="block text-sm font-medium pwa-text-primary mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Share any suggestions or highlights from the event..."
                  rows={4}
                  className="w-full px-4 py-3 resize-none transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                />
              </Card>

              <Button3D
                type="submit"
                disabled={submitting || feedback.overallRating === 0}
                loading={submitting}
                fullWidth
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button3D>

              {feedback.overallRating === 0 && (
                <p className="text-center pwa-text-tertiary text-sm mt-2">
                  Please rate your overall experience to submit
                </p>
              )}

              {/* Help link */}
              <p className="text-center pwa-text-tertiary text-sm mt-6">
                <Link href="/pwa/help" className="pwa-text-accent hover:underline">
                  Need help?
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
