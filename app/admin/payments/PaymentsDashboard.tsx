'use client';

/**
 * Payments Dashboard Component
 *
 * Displays payment history with filtering, stats, and pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyDollar,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Bank,
  MagnifyingGlass,
  Funnel,
  ArrowClockwise,
  CaretLeft,
  CaretRight,
  CalendarBlank,
} from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Payment {
  id: number;
  registration_id: number;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  guest: {
    id: number;
    name: string;
    email: string;
    guest_type: string;
  } | null;
  ticket_type: string | null;
}

interface Stats {
  total_paid: number;
  total_pending: number;
  total_failed: number;
  paid_today: number;
  revenue_total: number;
  revenue_today: number;
  by_method: Record<string, { count: number; amount: number }>;
}

interface ApiResponse {
  payments: Payment[];
  total: number;
  limit: number;
  offset: number;
  stats: Stats;
}

export default function PaymentsDashboard() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (method) params.set('method', method);
      if (search) params.set('search', search);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());

      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data: ApiResponse = await res.json();

      setPayments(data.payments);
      setStats(data.stats);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [status, method, search, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number, currency: string = 'HUF') => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            <CheckCircle size={14} weight="fill" />
            {t('paid')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
            <Clock size={14} weight="fill" />
            {t('pending')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
            <XCircle size={14} weight="fill" />
            {t('failed')}
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <ArrowClockwise size={14} weight="fill" />
            {t('refunded')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'card':
        return (
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <CreditCard size={16} weight="duotone" />
            {t('card')}
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <Bank size={16} weight="duotone" />
            {t('bankTransfer')}
          </span>
        );
      default:
        return <span className="text-sm text-gray-600">{method}</span>;
    }
  };

  const getGuestTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      paying_single: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      paying_paired: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
      applicant: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    };
    const labels: Record<string, string> = {
      vip: t('vip'),
      paying_single: t('single'),
      paying_paired: t('paired'),
      applicant: t('applicant'),
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
      >
        {labels[type] || type}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setStatus('');
    setMethod('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle size={20} weight="fill" />
              <span className="text-sm font-medium">{t('paid')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_paid}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Clock size={20} weight="fill" />
              <span className="text-sm font-medium">{t('pending')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_pending}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <XCircle size={20} weight="fill" />
              <span className="text-sm font-medium">{t('failed')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.total_failed}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <CalendarBlank size={20} weight="fill" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.paid_today}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <CurrencyDollar size={20} weight="fill" />
              <span className="text-sm font-medium">{t('totalRevenue')}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(stats.revenue_total)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-teal-600 mb-1">
              <CurrencyDollar size={20} weight="fill" />
              <span className="text-sm font-medium">Today Revenue</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(stats.revenue_today)}
            </p>
          </div>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {stats && Object.keys(stats.by_method).length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            By Payment Method
          </h3>
          <div className="flex flex-wrap gap-6">
            {Object.entries(stats.by_method).map(([method, data]) => (
              <div key={method} className="flex items-center gap-3">
                {method === 'card' ? (
                  <CreditCard size={24} weight="duotone" className="text-blue-500" />
                ) : (
                  <Bank size={24} weight="duotone" className="text-green-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {method === 'bank_transfer' ? 'Bank Transfer' : 'Card'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.count} payments • {formatCurrency(data.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Funnel size={20} className="text-gray-500" />
          <span className="font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={t('searchByNameOrEmail')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="paid">{t('paid')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="failed">{t('failed')}</option>
            <option value="refunded">{t('refunded')}</option>
          </select>
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('allMethods')}</option>
            <option value="card">{t('card')}</option>
            <option value="bank_transfer">{t('bankTransfer')}</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="To date"
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('clearFilters')}
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('guest')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('type')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('paymentMethod')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <ArrowClockwise size={20} className="animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {t('noPaymentsFound')}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {payment.guest ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {payment.guest.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.guest.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {payment.guest && getGuestTypeBadge(payment.guest.guest_type)}
                      {payment.ticket_type && (
                        <div className="text-xs text-gray-500 mt-1">
                          {payment.ticket_type}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {getMethodBadge(payment.payment_method)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(payment.payment_status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(payment.paid_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {t('showing')} {page * limit + 1} {t('to')} {Math.min((page + 1) * limit, total)}{' '}
              {t('of')} {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <CaretLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} {t('of')} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <CaretRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
