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

export default function StatisticsPage() {
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
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-neutral-500 font-sans">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700 font-sans">{error || 'Failed to load statistics'}</p>
          <button onClick={fetchStatistics} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-neutral-800 flex items-center gap-3">
            <ChartBar weight="light" size={36} className="text-accent-teal" />
            Event Statistics
          </h1>
          <p className="text-neutral-500 font-sans mt-1">
            Comprehensive overview of CEO Gala 2026
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-neutral-800 font-sans">
            <CalendarBlank weight="light" size={20} />
            <span className="font-semibold">{stats.event.daysUntil} days</span>
            <span className="text-neutral-500">until event</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Guests */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users weight="light" size={24} className="text-blue-600" />
            <span className="text-xs font-sans text-neutral-500 uppercase tracking-wide">
              Total Guests
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 mb-1">
            {stats.registration.total}
          </div>
          <div className="text-sm font-sans text-neutral-500">
            {stats.registration.registrationRate}% registered
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <CurrencyDollar weight="light" size={24} className="text-green-600" />
            <span className="text-xs font-sans text-neutral-500 uppercase tracking-wide">
              Total Revenue
            </span>
          </div>
          <div className="font-display text-3xl font-semibold text-neutral-800 mb-1">
            {formatCurrency(stats.payments.paidRevenue)}
          </div>
          <div className="text-sm font-sans text-neutral-500">
            {formatCurrency(stats.payments.pendingRevenue)} pending
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <Armchair weight="light" size={24} className="text-amber-600" />
            <span className="text-xs font-sans text-neutral-500 uppercase tracking-wide">
              Occupancy
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 mb-1">
            {stats.seating.occupancyRate}%
          </div>
          <div className="text-sm font-sans text-neutral-500">
            {stats.seating.totalAssigned} / {stats.seating.totalCapacity} seats
          </div>
        </div>

        {/* Check-in Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <UserCheck weight="light" size={24} className="text-purple-600" />
            <span className="text-xs font-sans text-neutral-500 uppercase tracking-wide">
              Check-in Rate
            </span>
          </div>
          <div className="font-display text-4xl font-semibold text-neutral-800 mb-1">
            {stats.checkins.checkinRate}%
          </div>
          <div className="text-sm font-sans text-neutral-500">
            {stats.checkins.total} checked in
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <ChartPie weight="light" size={24} className="text-accent-teal" />
            Registration Overview
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Invited</span>
              <span className="font-semibold text-neutral-800">{stats.registration.byStatus.invited}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Registered</span>
              <span className="font-semibold text-neutral-800">{stats.registration.byStatus.registered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Approved</span>
              <span className="font-semibold text-green-600">{stats.registration.byStatus.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Declined</span>
              <span className="font-semibold text-red-600">{stats.registration.byStatus.declined}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-300/20">
            <h3 className="font-sans text-sm font-medium text-neutral-800 mb-3">By Guest Type</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500">VIP Guests</span>
                <span className="font-semibold text-neutral-800">{stats.registration.byType.vip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500">Paying (Single)</span>
                <span className="font-semibold text-neutral-800">{stats.registration.byType.paying_single}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500">Paying (Paired)</span>
                <span className="font-semibold text-neutral-800">{stats.registration.byType.paying_paired}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <CurrencyDollar weight="light" size={24} className="text-accent-teal" />
            Payment Statistics
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Total Expected</span>
              <span className="font-semibold text-neutral-800">{formatCurrency(stats.payments.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Paid</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats.payments.paidRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Pending</span>
              <span className="font-semibold text-amber-600">{formatCurrency(stats.payments.pendingRevenue)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-sans text-sm font-medium text-neutral-800 mb-3">Payment Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle weight="fill" size={16} className="text-green-600" />
                  <span className="text-sm font-sans text-neutral-500">Paid</span>
                </div>
                <span className="font-semibold text-neutral-800">{stats.payments.byStatus.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock weight="fill" size={16} className="text-amber-600" />
                  <span className="text-sm font-sans text-neutral-500">Pending</span>
                </div>
                <span className="font-semibold text-neutral-800">{stats.payments.byStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle weight="fill" size={16} className="text-red-600" />
                  <span className="text-sm font-sans text-neutral-500">Failed</span>
                </div>
                <span className="font-semibold text-neutral-800">{stats.payments.byStatus.failed}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-300/20">
            <h3 className="font-sans text-sm font-medium text-neutral-800 mb-3">Payment Method</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500">Card</span>
                <span className="font-semibold text-neutral-800">{stats.payments.byMethod.card}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-neutral-500">Bank Transfer</span>
                <span className="font-semibold text-neutral-800">{stats.payments.byMethod.bank_transfer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seating & Email Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seating Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Armchair weight="light" size={24} className="text-accent-teal" />
            Seating Overview
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Total Tables</span>
              <span className="font-semibold text-neutral-800">{stats.seating.totalTables}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Total Capacity</span>
              <span className="font-semibold text-neutral-800">{stats.seating.totalCapacity} seats</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Assigned Seats</span>
              <span className="font-semibold text-green-600">{stats.seating.totalAssigned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Unassigned Guests</span>
              <span className="font-semibold text-amber-600">{stats.seating.unassignedGuests}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-300/20">
            <h3 className="font-sans text-sm font-medium text-neutral-800 mb-3">By Table Type</h3>
            <div className="space-y-3">
              {stats.seating.byTableType.map((tableType) => (
                <div key={tableType.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-sans text-neutral-500 capitalize">{tableType.type}</span>
                    <span className="text-xs font-sans text-neutral-500">
                      {tableType.occupied} / {tableType.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-300/20 rounded-full h-2">
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
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Envelope weight="light" size={24} className="text-accent-teal" />
            Email Statistics
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Total Sent</span>
              <span className="font-semibold text-neutral-800">{stats.emails.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Successful</span>
              <span className="font-semibold text-green-600">{stats.emails.successful}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-neutral-500">Delivery Rate</span>
              <span className="font-semibold text-neutral-800">{stats.emails.deliveryRate}%</span>
            </div>
          </div>

          {stats.emails.byType.length > 0 && (
            <div className="pt-6 border-t border-neutral-300/20">
              <h3 className="font-sans text-sm font-medium text-neutral-800 mb-3">By Email Type</h3>
              <div className="space-y-2">
                {stats.emails.byType.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-sans text-neutral-500 capitalize">
                      {email.type.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-neutral-800">{email.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dietary Requirements */}
      {Object.keys(stats.dietary).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-300/20 p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <ForkKnife weight="light" size={24} className="text-accent-teal" />
            Dietary Requirements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.dietary).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="font-display text-2xl font-semibold text-neutral-800">{count}</div>
                <div className="text-sm font-sans text-neutral-500 mt-1">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
