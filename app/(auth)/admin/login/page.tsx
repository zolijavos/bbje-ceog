'use client';

import { useState, FormEvent, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { logError } from '@/lib/utils/logger';
import { ShieldCheck, Envelope, LockKey } from '@phosphor-icons/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract just the pathname from callbackUrl to avoid port/host mismatches
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/admin';
  const callbackUrl = rawCallbackUrl.startsWith('/')
    ? rawCallbackUrl
    : (() => {
        try {
          return new URL(rawCallbackUrl).pathname;
        } catch {
          return '/admin';
        }
      })();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        // Handle specific error messages
        if (result.error.includes('Too many login attempts')) {
          setError('Too many failed login attempts. Please try again later.');
        } else {
          setError('Invalid email address or password.');
        }
        setPassword(''); // Clear password on error
      } else if (result?.ok) {
        // Successful login - redirect to admin dashboard
        // Using window.location for full page reload to ensure session is recognized
        window.location.href = callbackUrl;
      }
    } catch (err) {
      logError('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheck weight="light" size={64} className="text-accent-teal" />
          </div>
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-display text-4xl font-semibold text-white tracking-tight">CEO Gala 2026</h1>
          </Link>
          <p className="text-accent-teal mt-2 font-sans uppercase tracking-widest text-sm">Admin</p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-200 rounded-lg shadow-2xl p-8">
          <h2 className="font-display text-2xl font-semibold text-neutral-800 text-center mb-6">
            Login
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-sans font-medium text-neutral-500 mb-1 flex items-center gap-2">
                  <Envelope weight="light" size={18} className="text-neutral-800" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  placeholder="admin@ceogala.hu"
                  disabled={isLoading}
                  aria-label="Email Address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-sans font-medium text-neutral-500 mb-1 flex items-center gap-2">
                  <LockKey weight="light" size={18} className="text-neutral-800" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Password"
                />
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg bg-red-50 border border-red-200 p-4"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-sm font-sans text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
              aria-label="Login"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner mr-2"></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/70 mt-6 font-sans">
          © 2026 CEO Gala - Registration System
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-700">
      <div className="spinner spinner-lg"></div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
