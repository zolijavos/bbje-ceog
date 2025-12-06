'use client';

import Link from 'next/link';

export default function PWAOfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Offline icon */}
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">📡</span>
        </div>

        <h1 className="font-playfair text-2xl text-slate-800 mb-3">
          Nincs internetkapcsolat
        </h1>

        <p className="text-slate-600 mb-6">
          Az oldal betöltéséhez internetkapcsolat szükséges.
          Ellenőrizd a kapcsolatod, majd próbáld újra.
        </p>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors mb-4"
        >
          Újrapróbálás
        </button>

        {/* Home link */}
        <Link
          href="/pwa"
          className="text-slate-600 underline text-sm"
        >
          Vissza a főoldalra
        </Link>

        {/* Tip */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl">
          <p className="text-amber-800 text-sm">
            💡 <strong>Tipp:</strong> Ha már beléptél korábban,
            a jegyed offline is elérhető a &quot;Digitális Jegy&quot; menüpontban.
          </p>
        </div>
      </div>
    </div>
  );
}
