'use client';

/**
 * Check-in Log Dashboard Client Component
 *
 * Interactive dashboard with stats cards, search, date filtering, and paginated log.
 * Story 3.4: Admin Check-in Log Dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { TICKET_TYPE_LABELS } from '@/lib/constants';
import { logError } from '@/lib/utils/logger';

// Types
interface CheckinStats {
  totalCheckins: number;
  totalRegistrations: number;
  checkinRate: number;
  recentCheckins: Array<{
    guestName: string;
    checkedInAt: string;
  }>;
}

interface CheckinEntry {
  id: number;
  checked_in_at: string;
  is_override: boolean;
  guest: {
    id: number;
    name: string;
    email: string;
    guest_type: string;
  };
  registration: {
    ticket_type: string;
    partner_name: string | null;
  };
  staff_user: {
    name: string;
  } | null;
}

interface CheckinLogResponse {
  checkins: CheckinEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CheckinLogDashboard() {
  const [stats, setStats] = useState<CheckinStats | null>(null);
  const [logData, setLogData] = useState<CheckinLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/checkin-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      logError('Failed to fetch stats:', error);
    }
  }, []);

  // Fetch log entries
  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/admin/checkin-log?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogData(data);
      }
    } catch (error) {
      logError('Failed to fetch log:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Check-ins */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Összes beléptetés
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.totalCheckins ?? '-'}
          </p>
        </div>

        {/* Total Registrations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Regisztrált vendégek
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats?.totalRegistrations ?? '-'}
          </p>
        </div>

        {/* Check-in Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Belépési arány
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats ? `${stats.checkinRate.toFixed(1)}%` : '-'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Keresés
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Név vagy email..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Date From */}
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">
              Dátum (-tól)
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">
              Dátum (-ig)
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear filters button */}
        {(search || dateFrom || dateTo) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSearch('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Szűrők törlése
            </button>
          </div>
        )}
      </div>

      {/* Check-in Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Időpont
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendég
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jegy típus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Státusz
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Betöltés...
                  </td>
                </tr>
              ) : logData?.checkins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Nincs beléptetés a szűrési feltételeknek megfelelően.
                  </td>
                </tr>
              ) : (
                logData?.checkins.map((entry) => (
                  <tr key={entry.id} className={entry.is_override ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.checked_in_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.guest.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.guest.email}
                      </div>
                      {entry.registration.partner_name && (
                        <div className="text-xs text-gray-400">
                          + {entry.registration.partner_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.registration.ticket_type === 'vip_free'
                            ? 'bg-purple-100 text-purple-800'
                            : entry.registration.ticket_type === 'paid_paired'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {TICKET_TYPE_LABELS[entry.registration.ticket_type] ||
                          entry.registration.ticket_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.staff_user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.is_override ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Override
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logData && logData.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Előző
              </button>
              <button
                onClick={() => setPage((p) => Math.min(logData.totalPages, p + 1))}
                disabled={page === logData.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Következő
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Összesen <span className="font-medium">{logData.total}</span> beléptetés,{' '}
                  <span className="font-medium">{page}</span>. oldal /{' '}
                  <span className="font-medium">{logData.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    &lsaquo;
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(logData.totalPages, p + 1))}
                    disabled={page === logData.totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => setPage(logData.totalPages)}
                    disabled={page === logData.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Check-ins (Real-time feed) */}
      {stats && stats.recentCheckins.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Legutóbbi beléptetések
          </h3>
          <div className="space-y-2">
            {stats.recentCheckins.map((checkin, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">
                  {checkin.guestName}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(checkin.checkedInAt)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={fetchStats}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Frissítés
          </button>
        </div>
      )}
    </div>
  );
}
