'use client';

/**
 * Scheduled Emails Dashboard
 *
 * Admin interface for viewing and managing scheduled emails.
 * Includes: email list, create new, bulk scheduling, and auto-config management.
 */

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Clock,
  EnvelopeSimple,
  CheckCircle,
  XCircle,
  Prohibit,
  ArrowClockwise,
  Play,
  Calendar,
  Trash,
  Plus,
  Users,
  Gear,
  X,
  MagnifyingGlass,
  CaretDown,
  ClockCounterClockwise,
  PaperPlaneTilt,
} from '@phosphor-icons/react';

interface ScheduledEmail {
  id: number;
  guest_id: number | null;
  template_slug: string;
  scheduled_for: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  schedule_type: string;
  created_at: string;
  sent_at: string | null;
  guest?: { first_name: string; last_name: string; email: string } | null;
}

interface Stats {
  pending: number;
  sent_today: number;
  failed_today: number;
  upcoming_24h: number;
}

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  guest_type: string;
  registration_status: string;
}

interface SchedulerConfig {
  id: number;
  config_key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  template_slug: string;
  days_before: number | null;
  days_after: number | null;
  interval_days: number | null;
  send_time: string;
  target_status: string[] | null;  // Parsed from JSON
  target_types: string[] | null;   // Parsed from JSON
}

interface EmailLog {
  id: number;
  guest_id: number;
  email_type: string;
  recipient: string;
  subject: string;
  status: string;
  error_message: string | null;
  sent_at: string;
  guest: { id: number; first_name: string; last_name: string; email: string } | null;
}

interface EmailLogStats {
  total_sent: number;
  total_failed: number;
  sent_today: number;
  by_type: Record<string, number>;
}

const STATUS_CONFIG_BASE = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  processing: { icon: ArrowClockwise, color: 'text-blue-600', bg: 'bg-blue-100' },
  sent: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  cancelled: { icon: Prohibit, color: 'text-gray-600', bg: 'bg-gray-100' },
};

const TEMPLATE_LABELS: Record<string, string> = {
  magic_link: 'Magic Link',
  ticket_delivery: 'E-Ticket',
  applicant_approval: 'Approval',
  applicant_rejection: 'Rejection',
  payment_reminder: 'Payment Reminder',
  payment_confirmation: 'Payment Confirm',
  table_assignment: 'Table Assignment',
  event_reminder: 'Event Reminder',
  principal_invitation: 'Principal Invitation',
};

const TEMPLATES = Object.entries(TEMPLATE_LABELS);

type TabType = 'emails' | 'history' | 'schedule' | 'bulk' | 'automation';

export default function ScheduledEmailsDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('emails');
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const STATUS_CONFIG = {
    pending: { ...STATUS_CONFIG_BASE.pending, label: t('pending') },
    processing: { ...STATUS_CONFIG_BASE.processing, label: t('processing') },
    sent: { ...STATUS_CONFIG_BASE.sent, label: t('sent') },
    failed: { ...STATUS_CONFIG_BASE.failed, label: t('failed') },
    cancelled: { ...STATUS_CONFIG_BASE.cancelled, label: t('emailCancelled') },
  };

  // Schedule form state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Bulk form state
  const [bulkFilters, setBulkFilters] = useState({
    guest_types: [] as string[],
    registration_statuses: [] as string[],
    is_vip_reception: null as boolean | null,
    has_ticket: null as boolean | null,
    has_table: null as boolean | null,
  });
  const [bulkPreviewGuests, setBulkPreviewGuests] = useState<Guest[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Localized type labels
  const getLocalizedTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      vip: t('vip'),
      invited: t('invited'),
      paying_single: t('payingSingle'),
      paying_paired: t('payingPaired'),
      applicant: t('applicant'),
    };
    return typeMap[type] || type;
  };

  // Localized status labels
  const getLocalizedStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: t('pending'),
      invited: t('invited'),
      registered: t('registered'),
      approved: t('approved'),
      declined: t('declined'),
      pending_approval: t('pendingApproval'),
      rejected: t('rejected'),
    };
    return statusMap[status] || status;
  };
  const [bulkTemplate, setBulkTemplate] = useState('');
  const [bulkScheduledDate, setBulkScheduledDate] = useState('');
  const [bulkScheduledTime, setBulkScheduledTime] = useState('10:00');
  const [bulkScheduling, setBulkScheduling] = useState(false);

  // Automation config state
  const [configs, setConfigs] = useState<SchedulerConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<SchedulerConfig | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Email history state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailLogStats, setEmailLogStats] = useState<EmailLogStats | null>(null);
  const [logFilter, setLogFilter] = useState<string>('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('');

  const fetchEmails = useCallback(async () => {
    try {
      const url = `/api/admin/scheduled-emails?stats=true${filter ? `&status=${filter}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.emails) {
        setEmails(data.emails);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load scheduled emails' });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/guests?limit=500');
      const data = await res.json();
      if (data.guests) {
        setGuests(data.guests);
      }
    } catch {
      console.error('Failed to load guests');
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/scheduler-config');
      const data = await res.json();
      if (data.configs) {
        // Parse JSON strings to arrays for target fields
        const parsedConfigs = data.configs.map((c: SchedulerConfig & { target_status: string | null; target_types: string | null }) => ({
          ...c,
          target_status: c.target_status ? JSON.parse(c.target_status) : null,
          target_types: c.target_types ? JSON.parse(c.target_types) : null,
        }));
        setConfigs(parsedConfigs);
      }
    } catch {
      console.error('Failed to load scheduler configs');
    }
  }, []);

  const fetchEmailLogs = useCallback(async () => {
    try {
      let url = '/api/admin/email-logs?limit=100';
      if (logFilter) url += `&status=${logFilter}`;
      if (logTypeFilter) url += `&type=${logTypeFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) {
        setEmailLogs(data.logs);
      }
      if (data.stats) {
        setEmailLogStats(data.stats);
      }
    } catch {
      console.error('Failed to load email logs');
    }
  }, [logFilter, logTypeFilter]);

  useEffect(() => {
    fetchEmails();
    fetchGuests();
    fetchConfigs();
    fetchEmailLogs();
  }, [fetchEmails, fetchGuests, fetchConfigs, fetchEmailLogs]);

  // Fetch preview of guests matching bulk filters
  const fetchBulkPreview = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const params = new URLSearchParams();
      if (bulkFilters.guest_types.length > 0) {
        params.set('guest_types', bulkFilters.guest_types.join(','));
      }
      if (bulkFilters.registration_statuses.length > 0) {
        params.set('registration_statuses', bulkFilters.registration_statuses.join(','));
      }
      if (bulkFilters.is_vip_reception !== null) {
        params.set('is_vip_reception', bulkFilters.is_vip_reception.toString());
      }
      if (bulkFilters.has_ticket !== null) {
        params.set('has_ticket', bulkFilters.has_ticket.toString());
      }
      if (bulkFilters.has_table !== null) {
        params.set('has_table', bulkFilters.has_table.toString());
      }
      params.set('limit', '500');

      const res = await fetch(`/api/admin/guests?${params.toString()}`);
      const data = await res.json();
      if (data.guests) {
        setBulkPreviewGuests(data.guests);
      }
    } catch {
      console.error('Failed to load preview');
    } finally {
      setLoadingPreview(false);
    }
  }, [bulkFilters]);

  // Auto-fetch preview when filters change
  useEffect(() => {
    if (activeTab === 'bulk') {
      fetchBulkPreview();
    }
  }, [activeTab, fetchBulkPreview]);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this scheduled email?')) return;

    try {
      const res = await fetch(`/api/admin/scheduled-emails/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('emailCancelled') });
        fetchEmails();
      } else {
        setMessage({ type: 'error', text: t('failedToCancelEmail') });
      }
    } catch {
      setMessage({ type: 'error', text: t('failedToCancelEmail') });
    }
  };

  const handleTrigger = async (action: string) => {
    try {
      const res = await fetch('/api/admin/scheduled-emails/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: `Trigger complete: ${JSON.stringify(data.results)}` });
        fetchEmails();
      } else {
        setMessage({ type: 'error', text: 'Failed to trigger action' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to trigger action' });
    }
  };

  const handleSchedule = async () => {
    if (selectedGuests.length === 0 || !selectedTemplate || !scheduledFor) {
      setMessage({ type: 'error', text: 'Please select guests, template, and schedule time' });
      return;
    }

    setScheduling(true);
    try {
      const res = await fetch('/api/admin/scheduled-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_ids: selectedGuests,
          template_slug: selectedTemplate,
          scheduled_for: new Date(scheduledFor).toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: `Scheduled ${data.scheduled} emails` });
        setSelectedGuests([]);
        setSelectedTemplate('');
        setScheduledFor('');
        fetchEmails();
        setActiveTab('emails');
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to schedule emails' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to schedule emails' });
    } finally {
      setScheduling(false);
    }
  };

  const handleBulkSchedule = async () => {
    if (!bulkTemplate || !bulkScheduledDate || !bulkScheduledTime) {
      setMessage({ type: 'error', text: 'Please select template, date and time' });
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${bulkScheduledDate}T${bulkScheduledTime}`);

    setBulkScheduling(true);
    try {
      const res = await fetch('/api/admin/scheduled-emails/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter: {
            guest_types: bulkFilters.guest_types.length > 0 ? bulkFilters.guest_types : undefined,
            registration_statuses: bulkFilters.registration_statuses.length > 0 ? bulkFilters.registration_statuses : undefined,
            is_vip_reception: bulkFilters.is_vip_reception,
            has_ticket: bulkFilters.has_ticket,
            has_table: bulkFilters.has_table,
          },
          template_slug: bulkTemplate,
          scheduled_for: scheduledDateTime.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({
          type: 'success',
          text: `Scheduled: ${data.scheduled}, Skipped: ${data.skipped}, Failed: ${data.failed}`,
        });
        setBulkFilters({ guest_types: [], registration_statuses: [], is_vip_reception: null, has_ticket: null, has_table: null });
        setBulkTemplate('');
        setBulkScheduledDate('');
        setBulkScheduledTime('10:00');
        fetchEmails();
        setActiveTab('emails');
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to bulk schedule' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to bulk schedule' });
    } finally {
      setBulkScheduling(false);
    }
  };

  const handleToggleConfig = async (id: number, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/scheduler-config/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Rule ${enabled ? 'enabled' : 'disabled'}` });
        fetchConfigs();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update rule' });
    }
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    try {
      const res = await fetch(`/api/admin/scheduler-config/${editingConfig.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingConfig.name,
          description: editingConfig.description,
          template_slug: editingConfig.template_slug,
          days_before: editingConfig.days_before,
          days_after: editingConfig.days_after,
          interval_days: editingConfig.interval_days,
          send_time: editingConfig.send_time,
          enabled: editingConfig.enabled,
          target_status: editingConfig.target_status && editingConfig.target_status.length > 0
            ? editingConfig.target_status
            : null,
          target_types: editingConfig.target_types && editingConfig.target_types.length > 0
            ? editingConfig.target_types
            : null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('ruleUpdated') });
        setShowConfigModal(false);
        setEditingConfig(null);
        fetchConfigs();
      }
    } catch {
      setMessage({ type: 'error', text: t('failedToUpdateRule') });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('hu-HU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredGuests = guests.filter(
    (g) =>
      `${g.first_name} ${g.last_name}`.toLowerCase().includes(guestSearch.toLowerCase()) ||
      g.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  const getDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
              : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('pending')}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock size={32} className="text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next 24h</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming_24h}</p>
              </div>
              <Calendar size={32} className="text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sent Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent_today}</p>
              </div>
              <CheckCircle size={32} className="text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed Today</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed_today}</p>
              </div>
              <XCircle size={32} className="text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('emails')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'emails'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <EnvelopeSimple size={20} className="inline mr-2" />
            {t('scheduledEmails')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClockCounterClockwise size={20} className="inline mr-2" />
            {t('emailLog')}
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus size={20} className="inline mr-2" />
            Schedule New
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bulk'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={20} className="inline mr-2" />
            Bulk Schedule
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'automation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gear size={20} className="inline mr-2" />
            Automation Rules
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'emails' && (
        <>
          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">{t('filter')}:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="sent">{t('sent')}</option>
                <option value="failed">{t('failed')}</option>
                <option value="cancelled">{t('emailCancelled')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTrigger('process')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Play size={16} />
                Process Now
              </button>
              <button
                onClick={() => handleTrigger('all')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Run Schedulers
              </button>
              <button
                onClick={fetchEmails}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowClockwise size={18} />
              </button>
            </div>
          </div>

          {/* Email list */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('recipient')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('scheduled')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('type')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <EnvelopeSimple size={48} className="mx-auto text-gray-300 mb-4" />
                      <p>{t('noScheduledEmails')}</p>
                    </td>
                  </tr>
                ) : (
                  emails.map((email) => {
                    const statusConfig = STATUS_CONFIG[email.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                          >
                            <StatusIcon size={14} weight="bold" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {TEMPLATE_LABELS[email.template_slug] || email.template_slug}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {email.guest ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {email.guest.first_name} {email.guest.last_name}
                              </div>
                              <div className="text-xs text-gray-500">{email.guest.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(email.scheduled_for)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {email.schedule_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {email.status === 'pending' && (
                            <button
                              onClick={() => handleCancel(email.id)}
                              className="text-red-600 hover:text-red-900"
                              title={t('cancel')}
                            >
                              <Trash size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <>
          {/* History Stats */}
          {emailLogStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Sent</p>
                    <p className="text-2xl font-bold text-green-600">{emailLogStats.total_sent}</p>
                  </div>
                  <PaperPlaneTilt size={32} className="text-green-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Failed</p>
                    <p className="text-2xl font-bold text-red-600">{emailLogStats.total_failed}</p>
                  </div>
                  <XCircle size={32} className="text-red-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sent Today</p>
                    <p className="text-2xl font-bold text-blue-600">{emailLogStats.sent_today}</p>
                  </div>
                  <Calendar size={32} className="text-blue-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Email Types</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Object.keys(emailLogStats.by_type).length}
                    </p>
                  </div>
                  <EnvelopeSimple size={32} className="text-purple-400" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">{t('status')}:</label>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="sent">{t('sent')}</option>
                <option value="failed">{t('failed')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">{t('type')}:</label>
              <select
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">{t('allTypes')}</option>
                {TEMPLATES.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchEmailLogs}
              className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowClockwise size={18} />
            </button>
          </div>

          {/* Email log table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('recipient')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('sentAt')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <ClockCounterClockwise size={48} className="mx-auto text-gray-300 mb-4" />
                      <p>No email history found</p>
                    </td>
                  </tr>
                ) : (
                  emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300'
                          }`}
                        >
                          {log.status === 'sent' ? (
                            <CheckCircle size={14} weight="bold" />
                          ) : (
                            <XCircle size={14} weight="bold" />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {TEMPLATE_LABELS[log.email_type] || log.email_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.guest ? `${log.guest.first_name} ${log.guest.last_name}` : '-'}
                          </div>
                          <div className="text-xs text-gray-500">{log.recipient}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 truncate block max-w-xs">
                          {log.subject}
                        </span>
                        {log.error_message && (
                          <span className="text-xs text-red-500 truncate block max-w-xs">
                            {log.error_message}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(log.sent_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Schedule New Email</h2>

          <div className="space-y-6">
            {/* Template selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select template...</option>
                {TEMPLATES.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send At
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                min={getDefaultDateTime()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                style={{ colorScheme: 'light' }}
              />
            </div>

            {/* Guest selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Recipients ({selectedGuests.length} selected)
              </label>
              <div className="relative mb-2">
                <MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                {filteredGuests.slice(0, 100).map((guest) => (
                  <label
                    key={guest.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuests.includes(guest.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGuests([...selectedGuests, guest.id]);
                        } else {
                          setSelectedGuests(selectedGuests.filter((id) => id !== guest.id));
                        }
                      }}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium">{guest.first_name} {guest.last_name}</div>
                      <div className="text-xs text-gray-500">{guest.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              {selectedGuests.length > 0 && (
                <button
                  onClick={() => setSelectedGuests([])}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSchedule}
              disabled={scheduling || selectedGuests.length === 0 || !selectedTemplate || !scheduledFor}
              className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {scheduling ? 'Scheduling...' : `Schedule ${selectedGuests.length} Email(s)`}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Bulk Schedule Emails</h2>
          <p className="text-gray-600 mb-6">
            Schedule emails for multiple guests based on filters. Guests who already have a pending
            email with the same template will be skipped.
          </p>

          <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Types
                </label>
                <div className="space-y-2">
                  {['vip', 'paying_single', 'paying_paired', 'applicant'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={bulkFilters.guest_types.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkFilters({
                              ...bulkFilters,
                              guest_types: [...bulkFilters.guest_types, type],
                            });
                          } else {
                            setBulkFilters({
                              ...bulkFilters,
                              guest_types: bulkFilters.guest_types.filter((t) => t !== type),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{getLocalizedTypeLabel(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('status')}
                </label>
                <div className="space-y-2">
                  {['pending', 'invited', 'registered', 'approved', 'declined', 'pending_approval', 'rejected'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={bulkFilters.registration_statuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkFilters({
                              ...bulkFilters,
                              registration_statuses: [...bulkFilters.registration_statuses, status],
                            });
                          } else {
                            setBulkFilters({
                              ...bulkFilters,
                              registration_statuses: bulkFilters.registration_statuses.filter(
                                (s) => s !== status
                              ),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{getLocalizedStatusLabel(status)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('vipReception')}</label>
                <select
                  value={bulkFilters.is_vip_reception === null ? '' : bulkFilters.is_vip_reception.toString()}
                  onChange={(e) =>
                    setBulkFilters({
                      ...bulkFilters,
                      is_vip_reception: e.target.value === '' ? null : e.target.value === 'true',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('all')}</option>
                  <option value="true">{t('vipOnly')}</option>
                  <option value="false">{t('nonVipOnly')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Has Ticket?</label>
                <select
                  value={bulkFilters.has_ticket === null ? '' : bulkFilters.has_ticket.toString()}
                  onChange={(e) =>
                    setBulkFilters({
                      ...bulkFilters,
                      has_ticket: e.target.value === '' ? null : e.target.value === 'true',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Has Table Assignment?
                </label>
                <select
                  value={bulkFilters.has_table === null ? '' : bulkFilters.has_table.toString()}
                  onChange={(e) =>
                    setBulkFilters({
                      ...bulkFilters,
                      has_table: e.target.value === '' ? null : e.target.value === 'true',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            {/* Template and time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={bulkTemplate}
                  onChange={(e) => setBulkTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select template...</option>
                  {TEMPLATES.map(([slug, label]) => (
                    <option key={slug} value={slug}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Date</label>
                <input
                  type="date"
                  value={bulkScheduledDate}
                  onChange={(e) => setBulkScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Time</label>
                <input
                  type="time"
                  value={bulkScheduledTime}
                  onChange={(e) => setBulkScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            {/* Preview of filtered guests */}
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">
                  {loadingPreview ? (
                    'Loading...'
                  ) : (
                    <>Filtered Guests ({bulkPreviewGuests.length})</>
                  )}
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {bulkPreviewGuests.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Users size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">No guests match the selected filters</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bulkPreviewGuests.slice(0, 50).map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{guest.first_name} {guest.last_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{guest.email}</td>
                          <td className="px-4 py-2 text-xs">
                            <span className="px-2 py-1 bg-gray-100 rounded">{getLocalizedTypeLabel(guest.guest_type)}</span>
                          </td>
                          <td className="px-4 py-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{getLocalizedStatusLabel(guest.registration_status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {bulkPreviewGuests.length > 50 && (
                  <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                    + {bulkPreviewGuests.length - 50} more guests...
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleBulkSchedule}
              disabled={bulkScheduling || !bulkTemplate || !bulkScheduledDate || !bulkScheduledTime || bulkPreviewGuests.length === 0}
              className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {bulkScheduling ? 'Scheduling...' : `Schedule Bulk Emails (${bulkPreviewGuests.length} guests)`}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Automation Rules</h2>
              <p className="text-gray-600 text-sm">
                Configure automatic email scheduling rules
              </p>
            </div>
            <button
              onClick={() => handleTrigger('all')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Play size={16} />
              Run All Now
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Gear size={48} className="mx-auto text-gray-300 mb-4" />
                      <p>No automation rules configured</p>
                    </td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleConfig(config.id, !config.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{config.name}</div>
                        <div className="text-xs text-gray-500">{config.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {TEMPLATE_LABELS[config.template_slug] || config.template_slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {config.days_before && `${config.days_before} days before event`}
                        {config.days_after && `${config.days_after} days after`}
                        {config.interval_days && `Every ${config.interval_days} days`}
                        <br />
                        <span className="text-xs text-gray-400">at {config.send_time}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            setEditingConfig(config);
                            setShowConfigModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Config Edit Modal */}
      {showConfigModal && editingConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Edit Automation Rule</h3>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setEditingConfig(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingConfig.name}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingConfig.description || ''}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={editingConfig.template_slug}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, template_slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {TEMPLATES.map(([slug, label]) => (
                    <option key={slug} value={slug}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days Before Event
                  </label>
                  <input
                    type="number"
                    value={editingConfig.days_before || ''}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        days_before: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Interval (days)
                  </label>
                  <input
                    type="number"
                    value={editingConfig.interval_days || ''}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        interval_days: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send Time (HH:MM)
                </label>
                <input
                  type="time"
                  value={editingConfig.send_time}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, send_time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingConfig.enabled}
                  onChange={(e) =>
                    setEditingConfig({ ...editingConfig, enabled: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Enabled</label>
              </div>

              {/* Target Audience Filters */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Target Audience (Optional)
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Leave empty to use default rule logic. Selected filters combine with AND.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Guest Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Types
                    </label>
                    <div className="space-y-2">
                      {['vip', 'paying_single', 'paying_paired', 'applicant'].map((type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingConfig.target_types?.includes(type) || false}
                            onChange={(e) => {
                              const current = editingConfig.target_types || [];
                              if (e.target.checked) {
                                setEditingConfig({
                                  ...editingConfig,
                                  target_types: [...current, type],
                                });
                              } else {
                                setEditingConfig({
                                  ...editingConfig,
                                  target_types: current.filter((t) => t !== type),
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{getLocalizedTypeLabel(type)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Registration Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Status
                    </label>
                    <div className="space-y-2">
                      {['invited', 'registered', 'approved', 'declined', 'pending_approval', 'rejected'].map((status) => (
                        <label key={status} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingConfig.target_status?.includes(status) || false}
                            onChange={(e) => {
                              const current = editingConfig.target_status || [];
                              if (e.target.checked) {
                                setEditingConfig({
                                  ...editingConfig,
                                  target_status: [...current, status],
                                });
                              } else {
                                setEditingConfig({
                                  ...editingConfig,
                                  target_status: current.filter((s) => s !== status),
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{getLocalizedStatusLabel(status)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear filters button */}
                {((editingConfig.target_types && editingConfig.target_types.length > 0) ||
                  (editingConfig.target_status && editingConfig.target_status.length > 0)) && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingConfig({
                        ...editingConfig,
                        target_types: null,
                        target_status: null,
                      })
                    }
                    className="mt-3 text-sm text-red-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setEditingConfig(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
