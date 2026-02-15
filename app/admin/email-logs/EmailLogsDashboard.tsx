'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  EnvelopeSimple,
  CheckCircle,
  XCircle,
  Clock,
  MagnifyingGlass,
  Trash,
  ArrowClockwise,
  Funnel,
  Eye,
  X,
  User,
} from '@phosphor-icons/react';

interface EmailLog {
  id: number;
  guest_id: number | null;
  recipient: string;
  subject: string;
  email_type: string;
  html_body: string | null;
  text_body: string | null;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  sent_at: string;
  guest?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface Stats {
  total_sent: number;
  total_failed: number;
  sent_today: number;
  by_type: Record<string, number>;
}

export default function EmailLogsDashboard() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 25;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('offset', (page * limit).toString());
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);

      const res = await fetch(`/api/admin/email-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs);
      setStats(data.stats);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDeleteEmailLog'))) return;

    try {
      const res = await fetch(`/api/admin/email-logs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('emailLogDeleted') });
        fetchLogs();
      } else {
        setMessage({ type: 'error', text: t('deleteFailed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('deleteFailed') });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={18} className="text-green-500" weight="fill" />;
      case 'failed':
        return <XCircle size={18} className="text-red-500" weight="fill" />;
      default:
        return <Clock size={18} className="text-yellow-500" weight="fill" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      failed: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const emailTypes = stats?.by_type ? Object.keys(stats.by_type) : [];

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button onClick={fetchLogs} className="btn btn-primary mt-4">
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
            {t('emailLogs')}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('emailLogsDesc')}
          </p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary flex items-center gap-2">
          <ArrowClockwise size={20} />
          {t('refresh')}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="panel p-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
              <CheckCircle size={18} weight="fill" className="text-green-500" />
              <span className="text-xs uppercase tracking-wide">{t('totalSent')}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {stats.total_sent}
            </p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
              <XCircle size={18} weight="fill" className="text-red-500" />
              <span className="text-xs uppercase tracking-wide">{t('totalFailed')}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {stats.total_failed}
            </p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
              <EnvelopeSimple size={18} weight="fill" className="text-blue-500" />
              <span className="text-xs uppercase tracking-wide">{t('sentToday')}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {stats.sent_today}
            </p>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
              <Funnel size={18} weight="fill" className="text-purple-500" />
              <span className="text-xs uppercase tracking-wide">{t('emailTypes')}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {emailTypes.length}
            </p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={t('searchEmailLogs')}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="sent">{t('sent')}</option>
          <option value="failed">{t('failed')}</option>
          <option value="pending">{t('pending')}</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
        >
          <option value="">{t('allTypes')}</option>
          {emailTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('recipient')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('subject')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('type')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('sentAt')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      log.status
                    )}`}
                  >
                    {getStatusIcon(log.status)}
                    {t(log.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {log.guest && (
                      <User size={16} className="text-neutral-400" />
                    )}
                    <div>
                      <p className="text-neutral-800 dark:text-neutral-100">
                        {log.guest?.name || log.recipient}
                      </p>
                      {log.guest && (
                        <p className="text-xs text-neutral-500">{log.recipient}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                  {log.subject}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs text-neutral-600 dark:text-neutral-300">
                    {log.email_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {new Date(log.sent_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                      title={t('view')}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      title={t('delete')}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <EnvelopeSimple size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">{t('noEmailLogs')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('showing')} {page * limit + 1}-{Math.min((page + 1) * limit, total)} {t('of')} {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="btn btn-secondary"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="btn btn-secondary"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedLog(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-xl shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                  {t('emailDetails')}
                </h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('status')}</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        selectedLog.status
                      )}`}
                    >
                      {getStatusIcon(selectedLog.status)}
                      {t(selectedLog.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('type')}</p>
                    <p className="font-medium text-neutral-800 dark:text-neutral-100">
                      {selectedLog.email_type}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('recipient')}</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {selectedLog.guest?.name && `${selectedLog.guest.name} - `}
                    {selectedLog.recipient}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('subject')}</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {selectedLog.subject}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('sentAt')}</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">
                    {new Date(selectedLog.sent_at).toLocaleString()}
                  </p>
                </div>

                {selectedLog.error_message && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                      {t('errorMessage')}
                    </p>
                    <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}

                {/* Email Content */}
                {(selectedLog.html_body || selectedLog.text_body) && (
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                      {t('emailContent')}
                    </p>
                    {selectedLog.html_body ? (
                      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 max-h-96 overflow-auto">
                        <iframe
                          srcDoc={selectedLog.html_body}
                          title="Email Preview"
                          className="w-full min-h-[300px] border-0"
                          sandbox=""
                        />
                      </div>
                    ) : selectedLog.text_body ? (
                      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 max-h-96 overflow-auto">
                        <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300 font-mono">
                          {selectedLog.text_body}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                )}

                {!selectedLog.html_body && !selectedLog.text_body && (
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                      {t('emailContentNotAvailable')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
                <button onClick={() => setSelectedLog(null)} className="btn btn-secondary">
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
