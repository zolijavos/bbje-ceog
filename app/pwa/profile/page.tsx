'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Buildings,
  Briefcase,
  ForkKnife,
  UsersThree,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button3D from '../components/ui/Button3D';
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton';
import { useHaptic } from '../hooks/useHaptic';

interface ProfileData {
  guest: {
    id: number;
    email: string;
    name: string;
    guest_type: string;
    phone: string | null;
    company: string | null;
    position: string | null;
  };
  dietary_requirements: string | null;
  seating_preferences: string | null;
}

function SkeletonProfile() {
  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header skeleton */}
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

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Basic Info Card */}
        <div className="card-static p-4 space-y-3">
          <Skeleton variant="title" width="50%" />
          <div className="space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="60%" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="text" width="70%" />
          </div>
        </div>

        {/* Contact Card */}
        <div className="card-static p-4 space-y-3">
          <Skeleton variant="title" width="40%" />
          <div className="space-y-3">
            <Skeleton variant="text" height={48} />
            <Skeleton variant="text" height={48} />
            <Skeleton variant="text" height={48} />
          </div>
        </div>

        {/* Preferences Card */}
        <div className="card-static p-4 space-y-3">
          <Skeleton variant="title" width="55%" />
          <div className="space-y-3">
            <Skeleton variant="text" height={80} />
            <Skeleton variant="text" height={80} />
          </div>
        </div>

        {/* Button */}
        <Skeleton variant="custom" height={56} />
      </div>
    </div>
  );
}

export default function PWAProfilePage() {
  const router = useRouter();
  const { patterns } = useHaptic();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState('');
  const [seatingPreferences, setSeatingPreferences] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pwa/profile');

        if (res.status === 401) {
          router.replace('/pwa');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const json = await res.json();
        setData(json);

        // Initialize form fields
        setPhone(json.guest.phone || '');
        setCompany(json.guest.company || '');
        setPosition(json.guest.position || '');
        setDietaryRequirements(json.dietary_requirements || '');
        setSeatingPreferences(json.seating_preferences || '');
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    patterns.medium();

    try {
      const res = await fetch('/api/pwa/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          position: position.trim() || undefined,
          dietary_requirements: dietaryRequirements.trim() || undefined,
          seating_preferences: seatingPreferences.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      patterns.success();
      setSuccess('Data saved successfully!');

      // Update local data
      if (data) {
        setData({
          ...data,
          guest: {
            ...data.guest,
            phone: phone.trim() || null,
            company: company.trim() || null,
            position: position.trim() || null,
          },
          dietary_requirements: dietaryRequirements.trim() || null,
          seating_preferences: seatingPreferences.trim() || null,
        });
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      patterns.error();
      setError('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 pwa-bg-base">
        <div className="text-center">
          <p style={{ color: 'var(--color-error)' }} className="mb-4">
            {error || 'An error occurred'}
          </p>
          <Link href="/pwa/dashboard" className="pwa-text-secondary underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="font-display text-xl">Edit Profile</h1>
        </div>
      </header>

      {/* Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          {/* Success message */}
          {success && (
            <div
              className="flex items-center gap-2 px-4 py-3 text-sm border"
              style={{
                background: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                borderColor: 'var(--color-success)',
              }}
            >
              <CheckCircle size={18} weight="fill" />
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 text-sm border"
              style={{
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                borderColor: 'var(--color-error)',
              }}
            >
              <WarningCircle size={18} weight="fill" />
              {error}
            </div>
          )}

          {/* Read-only fields */}
          <Card variant="static">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} weight="fill" style={{ color: 'var(--color-accent)' }} />
              <h2 className="font-semibold pwa-text-primary">Basic Information</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm pwa-text-tertiary mb-1">Name</label>
                <p className="pwa-text-primary font-medium">{data.guest.name}</p>
              </div>

              <div>
                <label className="block text-sm pwa-text-tertiary mb-1">Email</label>
                <p className="pwa-text-primary">{data.guest.email}</p>
              </div>
            </div>
          </Card>

          {/* Editable fields */}
          <Card variant="static">
            <div className="flex items-center gap-2 mb-4">
              <Phone size={20} weight="fill" style={{ color: 'var(--color-accent)' }} />
              <h2 className="font-semibold pwa-text-primary">Contact</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium pwa-text-primary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+36 30 123 4567"
                  className="w-full px-4 py-3 transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium pwa-text-primary mb-1">
                  <Buildings size={16} />
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                  className="w-full px-4 py-3 transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium pwa-text-primary mb-1">
                  <Briefcase size={16} />
                  Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. CEO"
                  className="w-full px-4 py-3 transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Event preferences */}
          <Card variant="static">
            <div className="flex items-center gap-2 mb-4">
              <ForkKnife size={20} weight="fill" style={{ color: 'var(--color-accent)' }} />
              <h2 className="font-semibold pwa-text-primary">Event Preferences</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium pwa-text-primary mb-1">
                  Dietary Requirements / Allergies
                </label>
                <textarea
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  placeholder="e.g. Gluten-free, lactose-free, vegetarian..."
                  rows={3}
                  className="w-full px-4 py-3 resize-none transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-sm font-medium pwa-text-primary mb-1">
                  <UsersThree size={16} />
                  Seating Preference
                </label>
                <textarea
                  value={seatingPreferences}
                  onChange={(e) => setSeatingPreferences(e.target.value)}
                  placeholder="Who would you like to sit with? (Name, company)"
                  rows={3}
                  className="w-full px-4 py-3 resize-none transition-colors"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Submit button */}
          <Button3D type="submit" disabled={saving} loading={saving} fullWidth>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button3D>
        </form>
      </div>
    </div>
  );
}
