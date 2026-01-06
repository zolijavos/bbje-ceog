import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { DeviceMobile, QrCode, Users, Download, Info, CheckCircle } from '@phosphor-icons/react/dist/ssr';
import PageHeader from '../components/PageHeader';

export default async function PWAAppsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Only admins can access the PWA Apps page
  if (session.user?.role !== 'admin') {
    redirect('/checkin');
  }

  const appUrl = process.env.APP_URL || 'https://ceogala.mflevents.space';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PageHeader
        title="PWA Apps"
        description="Download and install Progressive Web Apps"
        currentPath="/admin/pwa-apps"
      />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">How to Install PWAs</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Progressive Web Apps can be installed directly from your browser. Visit the URL on your device,
                then use your browser&apos;s &quot;Add to Home Screen&quot; or &quot;Install App&quot; option.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Staff Scanner PWA */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <QrCode size={32} className="text-white" weight="fill" />
                <div>
                  <h2 className="text-xl font-bold text-white">Staff Scanner</h2>
                  <p className="text-teal-100 text-sm">Check-in QR Code Scanner</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Scan guest QR codes for check-in</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Works offline after initial load</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Color-coded status cards (green/yellow/red)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Admin override for duplicate check-ins</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <strong>URL:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{appUrl}/checkin</code>
                </p>
                <a
                  href="/checkin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Download size={20} />
                  Open Staff Scanner
                </a>
              </div>
            </div>
          </div>

          {/* Guest PWA */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <Users size={32} className="text-white" weight="fill" />
                <div>
                  <h2 className="text-xl font-bold text-white">Gala App</h2>
                  <p className="text-amber-100 text-sm">Guest Mobile Experience</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">View digital QR ticket</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Check assigned table number</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Edit profile & dietary preferences</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Offline ticket access</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <strong>URL:</strong> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{appUrl}/pwa</code>
                </p>
                <a
                  href="/pwa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Download size={20} />
                  Open Gala App
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DeviceMobile size={24} />
            Installation Instructions
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* iOS Instructions */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">iOS (Safari)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Open the app URL in Safari</li>
                <li>Tap the Share button (square with arrow)</li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                <li>Tap &quot;Add&quot; to confirm</li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Android (Chrome)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Open the app URL in Chrome</li>
                <li>Tap the three-dot menu (⋮)</li>
                <li>Tap &quot;Add to Home screen&quot; or &quot;Install app&quot;</li>
                <li>Tap &quot;Add&quot; or &quot;Install&quot; to confirm</li>
              </ol>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Note:</strong> The Staff Scanner includes an &quot;Install App&quot; button that appears when the browser supports PWA installation.
              Guests receive their app URL with pre-filled login code via email.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
