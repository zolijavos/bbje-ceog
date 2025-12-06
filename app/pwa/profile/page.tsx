'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function PWAProfilePage() {
  const router = useRouter();
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
      } catch (err) {
        setError('Nem sikerült betölteni az adatokat');
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

      setSuccess('Adatok sikeresen mentve!');

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
    } catch (err) {
      setError('Nem sikerült menteni az adatokat');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Hiba történt'}</p>
          <Link href="/pwa/dashboard" className="text-slate-600 underline">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-slate-800 text-white px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/pwa/dashboard" className="text-slate-300 hover:text-white">
            ← Vissza
          </Link>
          <h1 className="font-playfair text-xl">Profil Szerkesztése</h1>
        </div>
      </header>

      {/* Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✓ {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Read-only fields */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-4">Alapadatok</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Név</label>
                <p className="text-slate-800 font-medium">{data.guest.name}</p>
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-1">Email</label>
                <p className="text-slate-800">{data.guest.email}</p>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-4">Kapcsolat</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telefonszám
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+36 30 123 4567"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cég
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Cégnév"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beosztás
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Pl. Ügyvezető"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Event preferences */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-slate-800 mb-4">Esemény Preferenciák</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Diétás igények / Allergia
                </label>
                <textarea
                  value={dietaryRequirements}
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  placeholder="Pl. Gluténmentes, laktózmentes, vegetáriánus..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ültetési preferencia
                </label>
                <textarea
                  value={seatingPreferences}
                  onChange={(e) => setSeatingPreferences(e.target.value)}
                  placeholder="Kivel szeretne egy asztalhoz kerülni? (Név, cég)"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Mentés...' : 'Mentés'}
          </button>
        </form>
      </div>
    </div>
  );
}
