'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  User,
  Calendar,
  ArrowClockwise,
} from '@phosphor-icons/react';

interface AuditLog {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  entity_name: string | null;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  created_at: string;
}

interface AuditLogListResponse {
  success: boolean;
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: 'Created', color: 'bg-green-100 text-green-800' },
  UPDATE: { label: 'Updated', color: 'bg-blue-100 text-blue-800' },
  DELETE: { label: 'Deleted', color: 'bg-red-100 text-red-800' },
  APPROVE: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
  REJECT: { label: 'Rejected', color: 'bg-orange-100 text-orange-800' },
  SEND_EMAIL: { label: 'Sent Email', color: 'bg-purple-100 text-purple-800' },
  LOGIN: { label: 'Login', color: 'bg-gray-100 text-gray-800' },
  LOGOUT: { label: 'Logout', color: 'bg-gray-100 text-gray-600' },
  IMPORT: { label: 'Imported', color: 'bg-indigo-100 text-indigo-800' },
  EXPORT: { label: 'Exported', color: 'bg-cyan-100 text-cyan-800' },
  ASSIGN: { label: 'Assigned', color: 'bg-teal-100 text-teal-800' },
  UNASSIGN: { label: 'Unassigned', color: 'bg-amber-100 text-amber-800' },
};

const ENTITY_LABELS: Record<string, string> = {
  guest: 'Guest',
  table: 'Table',
  payment: 'Payment',
  email: 'Email',
  applicant: 'Applicant',
  table_assignment: 'Table Assignment',
  user: 'User',
  session: 'Session',
};

export default function AuditLogList() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expanded row for viewing details
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });

      if (search) params.set('search', search);
      if (actionFilter) params.set('action', actionFilter);
      if (entityTypeFilter) params.set('entityType', entityTypeFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/admin/audit-log?${params}`);
      const data: AuditLogListResponse = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        setError('Failed to fetch audit logs');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, entityTypeFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const parseJSON = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const renderChanges = (oldValues: string | null, newValues: string | null) => {
    const oldObj = parseJSON(oldValues);
    const newObj = parseJSON(newValues);

    if (!oldObj && !newObj) return null;

    const changes: Array<{ field: string; old: unknown; new: unknown }> = [];

    if (newObj) {
      Object.keys(newObj).forEach((key) => {
        const oldVal = oldObj?.[key];
        const newVal = newObj[key];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({ field: key, old: oldVal, new: newVal });
        }
      });
    }

    if (changes.length === 0) return null;

    return (
      <div className="mt-2 text-sm">
        <div className="font-medium text-gray-700 mb-1">Changes:</div>
        <div className="space-y-1">
          {changes.map((change, index) => (
            <div key={index} className="flex flex-wrap gap-2 text-xs">
              <span className="font-medium text-gray-600">{change.field}:</span>
              {change.old !== undefined && (
                <span className="line-through text-red-600">
                  {String(change.old || '(empty)')}
                </span>
              )}
              <span className="text-gray-400">&rarr;</span>
              <span className="text-green-600">
                {String(change.new || '(empty)')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search user or entity..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Actions</option>
            {Object.keys(ACTION_LABELS).map((action) => (
              <option key={action} value={action}>
                {ACTION_LABELS[action].label}
              </option>
            ))}
          </select>

          {/* Entity type filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Entities</option>
            {Object.keys(ENTITY_LABELS).map((type) => (
              <option key={type} value={type}>
                {ENTITY_LABELS[type]}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            placeholder="Start date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            placeholder="End date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Refresh button */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {total} {t('total')} entries
          </span>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowClockwise
              size={16}
              className={`mr-1.5 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Log list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit logs found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] || {
                label: log.action,
                color: 'bg-gray-100 text-gray-800',
              };
              const entityLabel = ENTITY_LABELS[log.entity_type] || log.entity_type;
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Action badge */}
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${actionInfo.color}`}
                        >
                          {actionInfo.label}
                        </span>

                        {/* Entity type */}
                        <span className="text-sm text-gray-600">
                          {entityLabel}
                        </span>

                        {/* Entity name */}
                        {log.entity_name && (
                          <span className="text-sm font-medium text-gray-900">
                            &quot;{log.entity_name}&quot;
                          </span>
                        )}

                        {/* Entity ID */}
                        {log.entity_id && (
                          <span className="text-xs text-gray-400">
                            (ID: {log.entity_id})
                          </span>
                        )}
                      </div>

                      {/* User info */}
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {log.user_email || 'System'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(log.created_at)}
                        </span>
                        {log.ip_address && (
                          <span className="text-gray-400">
                            IP: {log.ip_address}
                          </span>
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                          {renderChanges(log.old_values, log.new_values)}
                          {!log.old_values && !log.new_values && (
                            <span className="text-sm text-gray-500">
                              No additional details available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CaretLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
