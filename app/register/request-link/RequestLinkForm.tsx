'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface RequestLinkFormProps {
  defaultEmail?: string;
  bypassRateLimit?: boolean;
}

export default function RequestLinkForm({
  defaultEmail = '',
  bypassRateLimit = false,
}: RequestLinkFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/register/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          bypassRateLimit,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Hiba történt a küldés során');
      }
    } catch {
      setError('Hálózati hiba. Kérjük, próbálja újra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Email elküldve!
        </h3>
        <p className="text-gray-600 mb-6">
          Amennyiben a megadott email cím szerepel a vendéglistán, hamarosan
          megkapja az új meghívó linket.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Kérjük, ellenőrizze a spam mappát is.
        </p>
        <Link
          href="/"
          className="inline-block py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email Input */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email cím
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="pelda@email.hu"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Rate limit bypass info */}
      {bypassRateLimit && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            A lejárt link miatt a rate limit nem vonatkozik erre a kérésre.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !email}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          isSubmitting || !email
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Küldés...
          </span>
        ) : (
          'Új link küldése'
        )}
      </button>

      {/* Back Link */}
      <Link
        href="/"
        className="block w-full py-3 px-4 mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-center transition-colors"
      >
        Vissza
      </Link>

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        A link 5 percig érvényes a küldéstől számítva.
      </p>
    </form>
  );
}
