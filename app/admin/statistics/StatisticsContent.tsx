'use client';

import { useEffect, useState } from 'react';
import {
  ChartBar,
  Users,
  CurrencyDollar,
  ChartPie,
  Envelope,
  CalendarBlank,
  CheckCircle,
  XCircle,
  Clock,
  Armchair,
  UserCheck,
  ForkKnife,
} from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Statistics {
  registration: {
    total: number;
    byStatus: {
      invited: number;
      registered: number;
      approved: number;
      declined: number;
    };
    byType: {
      vip: number;
      paying_single: number;
      paying_paired: number;
    };
    registrationRate: number;
  };
  payments: {
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
    byStatus: {
      paid: number;
      pending: number;
      failed: number;
    };
    byMethod: {
      card: number;
      bank_transfer: number;
    };
  };
  seating: {
    totalTables: number;
    totalCapacity: number;
    totalAssigned: number;
    unassignedGuests: number;
    occupancyRate: number;
    byTableType: Array<{
      type: string;
      count: number;
      capacity: number;
      occupied: number;
    }>;
  };
  checkins: {
    total: number;
    checkinRate: number;
    overrides: number;
    byStaff: Array<{
      staff_id: number;
      count: number;
    }>;
  };
  emails: {
    total: number;
    successful: number;
    deliveryRate: number;
    byType: Array<{
      type: string;
      status: string;
      count: number;
    }>;
  };
  dietary: Record<string, number>;
  trends: {
    dailyRegistrations: Array<{ date: string; count: number }>;
    dailyPayments: Array<{ date: string; count: number; total: number }>;
  };
  event: {
    date: string;
    daysUntil: number;
  };
}

export default function StatisticsContent() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400 font-sans">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-700 dark:text-red-300 font-sans">{error || 'Failed to load statistics'}</p>
          <button onClick={fetchStatistics} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Countdown */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-sans bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700">
          <CalendarBlank weight="light" size={20} />
          <span className="font-semibold">{stats.event.daysUntil}</span>
          <span className="text-neutral-500 dark:text-neutral-400">{t('daysUntilEvent')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guests */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6 h-full">
          <div className="flex items-center justify-between mb-2">
            <Users weight="light" size={24} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-sans text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {t('totalGuests')}
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            {stats.registration.total}
          </div>
          <div className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
            {stats.registration.registrationRate}% registered
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6 h-full">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollar weight="light" size={24} className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-sans text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {t('totalRevenue')}
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            {formatCurrency(stats.payments.paidRevenue)}
          </div>
          <div className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
            {formatCurrency(stats.payments.pendingRevenue)} pending
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6 h-full">
          <div className="flex items-center justify-between mb-2">
            <Armchair weight="light" size={24} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-sans text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {t('occupancy')}
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            {stats.seating.occupancyRate}%
          </div>
          <div className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
            {stats.seating.totalAssigned} / {stats.seating.totalCapacity} seats
          </div>
        </div>

        {/* Check-in Rate */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6 h-full">
          <div className="flex items-center justify-between mb-2">
            <UserCheck weight="light" size={24} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-sans text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              {t('checkinRate')}
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            {stats.checkins.checkinRate}%
          </div>
          <div className="text-sm font-sans text-neutral-500 dark:text-neutral-400">
            {stats.checkins.total} checked in
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Overview */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <ChartPie weight="light" size={24} className="text-accent-teal" />
            {t('registrationOverview')}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('invited')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.registration.byStatus.invited}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('registered')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.registration.byStatus.registered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('approved')}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.registration.byStatus.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('declined')}</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{stats.registration.byStatus.declined}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-300/20 dark:border-neutral-700">
            <h3 className="font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">{t('byGuestType')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('vip')}</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.registration.byType.vip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('payingSingle')}</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.registration.byType.paying_single}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('payingPaired')}</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.registration.byType.paying_paired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <CurrencyDollar weight="light" size={24} className="text-accent-teal" />
            {t('paymentStatistics')}
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('totalExpected')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{formatCurrency(stats.payments.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('paid')}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(stats.payments.paidRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('pending')}</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(stats.payments.pendingRevenue)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">{t('paymentStatus')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('paid')}</span>
                </div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.payments.byStatus.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock weight="fill" size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('pending')}</span>
                </div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.payments.byStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle weight="fill" size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('failed')}</span>
                </div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.payments.byStatus.failed}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-300/20 dark:border-neutral-700">
            <h3 className="font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">{t('paymentMethod')}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('card')}</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.payments.byMethod.card}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('bankTransfer')}</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.payments.byMethod.bank_transfer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seating & Email Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seating Overview */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Armchair weight="light" size={24} className="text-accent-teal" />
            {t('seatingOverview')}
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('totalTables')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.seating.totalTables}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('totalCapacity')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.seating.totalCapacity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('assignedSeats')}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.seating.totalAssigned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('unassignedGuests')}</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.seating.unassignedGuests}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-300/20 dark:border-neutral-700">
            <h3 className="font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">{t('byTableType')}</h3>
            <div className="space-y-3">
              {stats.seating.byTableType.map((tableType) => (
                <div key={tableType.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400 capitalize">{tableType.type}</span>
                    <span className="text-xs font-sans text-neutral-500 dark:text-neutral-400">
                      {tableType.occupied} / {tableType.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-300/20 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-accent-teal h-2 rounded-full"
                      style={{
                        width: `${tableType.capacity > 0 ? (tableType.occupied / tableType.capacity) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email Statistics */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Envelope weight="light" size={24} className="text-accent-teal" />
            {t('emailStatistics')}
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('totalSent')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.emails.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('successful')}</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{stats.emails.successful}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400">{t('deliveryRate')}</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.emails.deliveryRate}%</span>
            </div>
          </div>

          {stats.emails.byType.length > 0 && (
            <div className="pt-6 border-t border-neutral-300/20 dark:border-neutral-700">
              <h3 className="font-sans text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">{t('byEmailType')}</h3>
              <div className="space-y-2">
                {stats.emails.byType.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-sans text-neutral-500 dark:text-neutral-400 capitalize">
                      {email.type.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{email.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dietary Requirements */}
      {Object.keys(stats.dietary).length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-300/20 dark:border-neutral-700 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <ForkKnife weight="light" size={24} className="text-accent-teal" />
            {t('dietaryRequirements')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.dietary).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="font-display text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{count}</div>
                <div className="text-sm font-sans text-neutral-500 dark:text-neutral-400 mt-1">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
