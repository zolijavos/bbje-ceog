'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuestFormModal from './GuestFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EmailPreviewModal from './EmailPreviewModal';
import PaymentApprovalModal from './PaymentApprovalModal';
import {
  getGuestTypeLabel,
  getRegistrationStatusInfo,
  getPaymentStatusInfo,
} from '@/lib/constants';
import type { GuestType } from '@prisma/client';
import {
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  Envelope,
  SpinnerGap,
  ArrowsClockwise,
  DownloadSimple,
  CaretUp,
  CaretDown,
  CaretUpDown,
} from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface BillingInfo {
  billing_first_name: string;
  billing_last_name: string;
  billingName: string; // Computed full name
  company_name: string | null;
  tax_number: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
}

interface PartnerGuestInfo {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // Computed full name
  email: string;
  title?: string | null;
  dietaryRequirements?: string | null;
  seatingPreferences?: string | null;
}

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // Computed full name
  email: string;
  title: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  guestType: string;
  status: string;
  hasMagicLink: boolean;
  magicLinkExpired: boolean;
  emailsSent: number;
  createdAt: string;
  updatedAt: string;
  dietaryRequirements: string | null;
  seatingPreferences: string | null;
  tableAssignment?: {
    tableName: string;
    seatNumber: number | null;
  } | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | null;
  paymentMethod: 'card' | 'bank_transfer' | null;
  hasRegistration: boolean;
  partnerFirstName: string | null;
  partnerLastName: string | null;
  partnerName: string | null; // Computed full name
  partnerEmail: string | null;
  billingInfo: BillingInfo | null;
  isVipReception?: boolean;
  // Partner relation fields
  isPartner?: boolean;
  pairedWithId?: number | null;
  pairedWith?: { id: number; firstName: string; lastName: string; name: string; email: string } | null;
  partnerGuest?: PartnerGuestInfo | null;
  // Attendance tracking
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  hasCheckedIn?: boolean;
  checkedInAt?: string | null;
  // Magic link tracking for bulk email feature
  lastMagicLinkAt?: string | null;
  magicLinkCount?: number;
  magicLinkCategory?: 'ready' | 'warning' | 'recent' | 'never';
}

interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ guest_id: number; error: string }>;
}

interface GuestListProps {
  guests: Guest[];
}

export default function GuestList({ guests: initialGuests }: GuestListProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // State for filtering and pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vipFilter, setVipFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [magicLinkFilter, setMagicLinkFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sorting state
  type SortColumn = 'name' | 'type' | 'status' | 'payment' | 'lastMagicLink' | 'magicLinkCount' | 'createdAt';
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Localized type labels
  const getLocalizedTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
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

  // Localized payment status labels
  const getLocalizedPaymentStatusLabel = (status: string | null): string => {
    if (!status) return t('paymentNone');
    const statusMap: Record<string, string> = {
      pending: t('paymentPending'),
      paid: t('paymentPaid'),
      failed: t('paymentFailed'),
      refunded: t('paymentRefunded'),
    };
    return statusMap[status] || status;
  };

  // State for guest data and operations
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(initialGuests);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // State for CRUD modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);

  // State for payment approval
  const [approving, setApproving] = useState<Set<number>>(new Set());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [approvingGuest, setApprovingGuest] = useState<Guest | null>(null);

  // State for email preview modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<Array<{ id: number; name: string; email: string }>>([]);

  // State for refresh button
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply filters and sorting when they change
  useEffect(() => {
    let result = [...initialGuests];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        g =>
          g.name.toLowerCase().includes(searchLower) ||
          g.email.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(g => g.guestType === typeFilter);
    }

    // Status filter (including special cancelled and no-show filters)
    if (statusFilter !== 'all') {
      if (statusFilter === 'cancelled') {
        result = result.filter(g => g.cancelledAt !== null);
      } else if (statusFilter === 'no-show') {
        // No-show = registered + has registration + not cancelled + not checked in
        // Note: This is a client-side approximation; actual no-show is only after event
        result = result.filter(g =>
          g.hasRegistration &&
          !g.cancelledAt &&
          !g.hasCheckedIn
        );
      } else {
        result = result.filter(g => g.status === statusFilter);
      }
    }

    // VIP filter
    if (vipFilter !== 'all') {
      result = result.filter(g => vipFilter === 'yes' ? g.isVipReception : !g.isVipReception);
    }

    // Payment status filter
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'none') {
        result = result.filter(g => !g.paymentStatus);
      } else {
        result = result.filter(g => g.paymentStatus === paymentFilter);
      }
    }

    // Magic link filter (for bulk email feature)
    if (magicLinkFilter !== 'all') {
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      switch (magicLinkFilter) {
        case 'ready': // 48+ hours since last magic link
          result = result.filter(g => {
            if (!g.lastMagicLinkAt) return true; // Never sent = ready
            return new Date(g.lastMagicLinkAt) < fortyEightHoursAgo;
          });
          break;
        case 'recent': // Within last 48 hours
          result = result.filter(g => {
            if (!g.lastMagicLinkAt) return false;
            return new Date(g.lastMagicLinkAt) >= fortyEightHoursAgo;
          });
          break;
        case 'never': // Never sent
          result = result.filter(g => !g.lastMagicLinkAt);
          break;
        case 'sendable': // Ready to send = ready OR never
          result = result.filter(g => {
            if (!g.lastMagicLinkAt) return true;
            return new Date(g.lastMagicLinkAt) < fortyEightHoursAgo;
          });
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.guestType.localeCompare(b.guestType);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'payment':
          comparison = (a.paymentStatus || '').localeCompare(b.paymentStatus || '');
          break;
        case 'lastMagicLink':
          const aTime = a.lastMagicLinkAt ? new Date(a.lastMagicLinkAt).getTime() : 0;
          const bTime = b.lastMagicLinkAt ? new Date(b.lastMagicLinkAt).getTime() : 0;
          comparison = aTime - bTime;
          break;
        case 'magicLinkCount':
          comparison = (a.magicLinkCount || 0) - (b.magicLinkCount || 0);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredGuests(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [initialGuests, search, typeFilter, statusFilter, vipFilter, paymentFilter, magicLinkFilter, sortColumn, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredGuests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGuests = filteredGuests.slice(startIndex, endIndex);

  // Toggle single guest selection
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle column sort click
  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with default desc direction
      setSortColumn(column);
      setSortDirection('desc');
    }
  }, [sortColumn]);

  // Sort indicator component
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <CaretUpDown size={14} className="ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <CaretUp size={14} weight="bold" className="ml-1 text-blue-600" />
      : <CaretDown size={14} weight="bold" className="ml-1 text-blue-600" />;
  };

  // Toggle all guests on current page
  const toggleAll = useCallback(() => {
    const pageIds = paginatedGuests.map(g => g.id);
    const allSelected = pageIds.every(id => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        pageIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [paginatedGuests, selectedIds]);

  // Show notification temporarily
  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 5000);
    },
    []
  );

  // Open email preview modal for single guest
  const openEmailPreview = useCallback(
    (guestId: number) => {
      const guest = filteredGuests.find(g => g.id === guestId);
      if (guest) {
        setEmailRecipients([{ id: guest.id, name: guest.name, email: guest.email }]);
        setShowEmailModal(true);
      }
    },
    [filteredGuests]
  );

  // Open email preview modal for selected guests (bulk)
  const openBulkEmailPreview = useCallback(() => {
    setShowConfirmDialog(false);
    if (selectedIds.size === 0) return;

    const recipients = filteredGuests
      .filter(g => selectedIds.has(g.id))
      .map(g => ({ id: g.id, name: g.name, email: g.email }));

    setEmailRecipients(recipients);
    setShowEmailModal(true);
  }, [selectedIds, filteredGuests]);

  // Actually send emails (called from EmailPreviewModal)
  const handleSendEmails = useCallback(
    async (_customSubject: string, _customBody: string) => {
      // Note: customSubject and customBody are for future implementation
      // Currently the backend uses its own template
      const ids = emailRecipients.map(r => r.id);

      // Mark all as sending
      setSending(new Set(ids));

      try {
        const response = await fetch('/api/email/send-magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest_ids: ids }),
        });

        const result: SendResult = await response.json();

        // Show summary
        if (result.failed === 0) {
          showNotification('success', `${result.sent} invitations successfully sent!`);
        } else if (result.sent > 0) {
          showNotification(
            'info',
            `${result.sent} sent, ${result.failed} failed`
          );
        } else {
          showNotification('error', result.errors[0]?.error || 'Error occurred during sending.');
        }

        // Clear selection if bulk send
        if (ids.length > 1) {
          setSelectedIds(new Set());
        }

        // Close modal
        setShowEmailModal(false);
        setEmailRecipients([]);
      } catch (error) {
        showNotification(
          'error',
          error instanceof Error ? error.message : 'Network error'
        );
      } finally {
        setSending(new Set());
      }
    },
    [emailRecipients, showNotification]
  );

  // Create new guest
  const handleCreateGuest = useCallback(
    async (data: {
      email?: string;
      first_name?: string;
      last_name?: string;
      title?: string | null;
      phone?: string | null;
      company?: string | null;
      position?: string | null;
      guest_type?: string;
      dietary_requirements?: string | null;
      seating_preferences?: string | null;
    }) => {
      const response = await fetch('/api/admin/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          guest_type: data.guest_type,
          title: data.title,
          phone: data.phone,
          company: data.company,
          position: data.position,
          dietary_requirements: data.dietary_requirements,
          seating_preferences: data.seating_preferences,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error occurred during save');
      }

      showNotification('success', 'Guest successfully added');
      router.refresh();
    },
    [showNotification, router]
  );

  // Update existing guest
  const handleUpdateGuest = useCallback(
    async (data: {
      email?: string;
      first_name?: string;
      last_name?: string;
      title?: string | null;
      phone?: string | null;
      company?: string | null;
      position?: string | null;
      guest_type?: string;
      status?: string;
      dietary_requirements?: string | null;
      seating_preferences?: string | null;
      is_vip_reception?: boolean;
    }) => {
      if (!editingGuest) return;

      const response = await fetch(`/api/admin/guests/${editingGuest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          title: data.title,
          phone: data.phone,
          company: data.company,
          position: data.position,
          guest_type: data.guest_type,
          registration_status: data.status,
          dietary_requirements: data.dietary_requirements,
          seating_preferences: data.seating_preferences,
          is_vip_reception: data.is_vip_reception,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error occurred during save');
      }

      showNotification('success', 'Guest data updated');
      router.refresh();
    },
    [editingGuest, showNotification, router]
  );

  // Delete guest
  const handleDeleteGuest = useCallback(async () => {
    if (!deletingGuest) return;

    const response = await fetch(`/api/admin/guests/${deletingGuest.id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error occurred during deletion');
    }

    showNotification('success', 'Guest deleted');
    setDeletingGuest(null);
    router.refresh();
  }, [deletingGuest, showNotification, router]);

  // Open edit modal
  const openEditModal = useCallback((guest: Guest) => {
    setEditingGuest(guest);
    setShowEditModal(true);
  }, []);

  // Open delete modal
  const openDeleteModal = useCallback((guest: Guest) => {
    setDeletingGuest(guest);
    setShowDeleteModal(true);
  }, []);

  // Check if guest can have payment approved (pending bank transfer)
  const canApprovePayment = (guest: Guest) => {
    return (
      guest.guestType !== 'invited' &&
      guest.hasRegistration &&
      guest.paymentStatus === 'pending'
    );
  };

  // Open payment approval modal
  const openPaymentModal = useCallback((guest: Guest) => {
    setApprovingGuest(guest);
    setShowPaymentModal(true);
  }, []);

  // Handle payment approval from modal
  const handlePaymentApproval = useCallback(async () => {
    if (!approvingGuest) return;

    setApproving(prev => new Set(prev).add(approvingGuest.id));

    try {
      const response = await fetch(`/api/admin/guests/${approvingGuest.id}/approve-payment`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error occurred during approval');
      }

      showNotification('success', 'Payment approved, e-ticket sent');
      setShowPaymentModal(false);
      setApprovingGuest(null);
      router.refresh();
    } catch (error) {
      showNotification(
        'error',
        error instanceof Error ? error.message : 'Network error'
      );
    } finally {
      setApproving(prev => {
        const next = new Set(prev);
        if (approvingGuest) next.delete(approvingGuest.id);
        return next;
      });
    }
  }, [approvingGuest, showNotification, router]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    router.refresh();
    // Small delay to show loading state
    setTimeout(() => setIsRefreshing(false), 500);
  }, [router]);

  // Check if all paginated guests are selected
  const allPageSelected =
    paginatedGuests.length > 0 &&
    paginatedGuests.every(g => selectedIds.has(g.id));

  return (
    <div>
      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
          role="alert"
          data-testid="notification"
        >
          {notification.message}
        </div>
      )}

      {/* Action bar with Add button */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-gray-900">{t('guestList')}</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title={t('refresh')}
            data-testid="refresh-button"
          >
            <ArrowsClockwise
              size={20}
              weight="duotone"
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </button>
        </div>
        <a
          href="/api/admin/guests/export"
          download
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Export CSV"
        >
          <DownloadSimple size={18} weight="duotone" className="mr-2" />
          {t('exportCSV')}
        </a>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-800/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-800"
          data-testid="add-guest-button"
        >
          <Plus size={18} weight="duotone" className="mr-2" />
          {t('newGuest')}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder={t('searchByNameOrEmail')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="search-input"
          />
        </div>

        {/* Type filter */}
        <div>
          <label htmlFor="type-filter" className="sr-only">
            Type Filter
          </label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="type-filter"
          >
            <option value="all">{t('allTypes')}</option>
            <option value="invited">{t('invited')}</option>
            <option value="paying_single">{t('payingSingle')}</option>
            <option value="paying_paired">{t('payingPaired')}</option>
            <option value="applicant">{t('applicant')}</option>
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Status Filter
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="status-filter"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="invited">{t('invited')}</option>
            <option value="registered">{t('registered')}</option>
            <option value="approved">{t('approved')}</option>
            <option value="declined">{t('declined')}</option>
            <option value="pending_approval">{t('pendingApproval')}</option>
            <option value="rejected">{t('rejected')}</option>
            <option value="cancelled">{t('cancelled')}</option>
            <option value="no-show">{t('noShow')}</option>
          </select>
        </div>

        {/* VIP filter */}
        <div>
          <label htmlFor="vip-filter" className="sr-only">
            VIP Filter
          </label>
          <select
            id="vip-filter"
            value={vipFilter}
            onChange={e => setVipFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="vip-filter"
          >
            <option value="all">{t('allVip')}</option>
            <option value="yes">{t('vipOnly')}</option>
            <option value="no">{t('nonVipOnly')}</option>
          </select>
        </div>

        {/* Payment status filter */}
        <div>
          <label htmlFor="payment-filter" className="sr-only">
            Payment Filter
          </label>
          <select
            id="payment-filter"
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="payment-filter"
          >
            <option value="all">{t('allPaymentStatuses')}</option>
            <option value="pending">{t('paymentPending')}</option>
            <option value="paid">{t('paymentPaid')}</option>
            <option value="failed">{t('paymentFailed')}</option>
            <option value="refunded">{t('paymentRefunded')}</option>
            <option value="none">{t('paymentNone')}</option>
          </select>
        </div>

        {/* Magic link filter (for bulk email) */}
        <div>
          <label htmlFor="magiclink-filter" className="sr-only">
            Magic Link Filter
          </label>
          <select
            id="magiclink-filter"
            value={magicLinkFilter}
            onChange={e => setMagicLinkFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="magiclink-filter"
          >
            <option value="all">{t('allMagicLinks') || 'All (Magic Link)'}</option>
            <option value="sendable">{t('readyToSend') || '📧 Ready to send (48h+)'}</option>
            <option value="ready">{t('mlReady') || '🟢 48h+ ago'}</option>
            <option value="recent">{t('mlRecent') || '🔴 Within 48h'}</option>
            <option value="never">{t('mlNever') || '⚪ Never sent'}</option>
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredGuests.length} {t('guests')}{' '}
        {filteredGuests.length !== initialGuests.length &&
          `(${t('total')} ${initialGuests.length})`}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
          <span className="text-blue-800">
            {selectedIds.size} {t('guestsSelected')}
          </span>
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={sending.size > 0}
            data-testid="bulk-send-button"
          >
            {t('sendInvitations')}
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('sendInvitations')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('confirmSendInvitations')} {selectedIds.size} {t('guests')}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('cancel')}
              </button>
              <button
                onClick={openBulkEmailPreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                data-testid="confirm-send-button"
              >
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div>
          <table className="w-full divide-y divide-gray-200" data-testid="guest-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left w-8">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    aria-label="Select all on this page"
                  />
                </th>
                <th
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center">
                    {t('guest').toUpperCase()}
                    <SortIndicator column="name" />
                  </span>
                </th>
                <th
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('type')}
                >
                  <span className="flex items-center">
                    {t('type').toUpperCase()}
                    <SortIndicator column="type" />
                  </span>
                </th>
                <th
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('status')}
                >
                  <span className="flex items-center">
                    {t('status').toUpperCase()}
                    <SortIndicator column="status" />
                  </span>
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase hidden sm:table-cell" title={t('vipReception')}>
                  VIP
                </th>
                <th
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('payment')}
                >
                  <span className="flex items-center">
                    {t('payment').toUpperCase()}
                    <SortIndicator column="payment" />
                  </span>
                </th>
                <th
                  className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase hidden xl:table-cell cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('lastMagicLink')}
                  title={t('lastMagicLinkTooltip') || 'Last magic link sent'}
                >
                  <span className="flex items-center justify-center">
                    {t('lastML') || 'ML'}
                    <SortIndicator column="lastMagicLink" />
                  </span>
                </th>
                <th
                  className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase hidden xl:table-cell cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort('magicLinkCount')}
                  title={t('magicLinkCountTooltip') || 'Number of magic links sent'}
                >
                  <span className="flex items-center justify-center">
                    #
                    <SortIndicator column="magicLinkCount" />
                  </span>
                </th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  {t('actions').toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {filteredGuests.length === 0 && initialGuests.length > 0
                      ? t('noFilterResults')
                      : t('noGuestsYet')}
                  </td>
                </tr>
              ) : (
                paginatedGuests.map(guest => {
                  const statusInfo = getRegistrationStatusInfo(guest.status as any);
                  const isSending = sending.has(guest.id);

                  return (
                    <tr
                      key={guest.id}
                      className={`${selectedIds.has(guest.id) ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                      data-testid={`guest-row-${guest.id}`}
                    >
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(guest.id)}
                          onChange={() => toggleSelect(guest.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          aria-label={`Select ${guest.name}`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div>
                            <div
                              className="text-sm font-medium text-gray-900"
                              data-testid={`guest-name-${guest.id}`}
                            >
                              {guest.title ? `${guest.title} ` : ''}{guest.name}
                              {/* Partner badge */}
                              {guest.isPartner && (
                                <span className="ml-2 inline-flex px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded" title={`${t('partner')}: ${guest.pairedWith?.name}`}>
                                  {t('partner')}
                                </span>
                              )}
                              {/* Has partner badge */}
                              {guest.partnerGuest && (
                                <span className="ml-2 inline-flex px-1.5 py-0.5 text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 rounded" title={`${t('partner')}: ${guest.partnerGuest.name}`}>
                                  👫 {t('paired')}
                                </span>
                              )}
                            </div>
                            <div
                              className="text-xs text-gray-500 truncate max-w-[200px]"
                              data-testid={`guest-email-${guest.id}`}
                              title={guest.email}
                            >
                              {guest.email}
                            </div>
                            {/* Show partner info inline - from Guest relation or Registration */}
                            {/* Case 1: Main guest with partner (partner_of relation) */}
                            {guest.partnerGuest && (
                              <div className="text-xs text-purple-600 mt-0.5">
                                + {guest.partnerGuest.title ? `${guest.partnerGuest.title} ` : ''}{guest.partnerGuest.name}
                              </div>
                            )}
                            {/* Case 2: Partner guest - show their main guest (pairedWith relation) */}
                            {guest.isPartner && guest.pairedWith && (
                              <div className="text-xs text-purple-600 mt-0.5">
                                + {guest.pairedWith.name}
                              </div>
                            )}
                            {/* Case 3: Fallback - legacy partner data from registration (main guests only) */}
                            {!guest.partnerGuest && !guest.isPartner && guest.partnerName && guest.partnerName !== 'Unknown' && (
                              <div className="text-xs text-purple-600 mt-0.5">
                                + {guest.partnerName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 hidden md:table-cell">
                        <span
                          className="text-xs text-gray-600"
                          data-testid={`guest-type-${guest.id}`}
                        >
                          {getLocalizedTypeLabel(guest.guestType)}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}
                          data-testid={`guest-status-${guest.id}`}
                        >
                          {getLocalizedStatusLabel(guest.status)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center hidden sm:table-cell">
                        {guest.isVipReception && (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 text-yellow-500"
                            title={t('vipReception')}
                          >
                            ⭐
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 hidden lg:table-cell">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            guest.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : guest.paymentStatus === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : guest.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : guest.paymentStatus === 'refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          data-testid={`guest-payment-${guest.id}`}
                        >
                          {getLocalizedPaymentStatusLabel(guest.paymentStatus)}
                        </span>
                      </td>
                      {/* Last Magic Link column */}
                      <td className="px-2 py-2 text-center hidden xl:table-cell">
                        {guest.lastMagicLinkAt ? (
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              guest.magicLinkCategory === 'ready'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                : guest.magicLinkCategory === 'warning'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                : guest.magicLinkCategory === 'recent'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                            title={new Date(guest.lastMagicLinkAt).toLocaleString()}
                          >
                            {(() => {
                              const sent = new Date(guest.lastMagicLinkAt!);
                              const now = new Date();
                              const diffMs = now.getTime() - sent.getTime();
                              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                              const diffDays = Math.floor(diffHours / 24);
                              if (diffDays > 0) return `${diffDays}d`;
                              return `${diffHours}h`;
                            })()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      {/* Magic Link Count column */}
                      <td className="px-2 py-2 text-center hidden xl:table-cell">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {guest.magicLinkCount || 0}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          {/* Edit button - icon only */}
                          <button
                            onClick={() => openEditModal(guest)}
                            className="p-1.5 text-neutral-800 hover:bg-neutral-800/10"
                            data-testid={`edit-guest-${guest.id}`}
                            title={t('edit')}
                          >
                            <PencilSimple size={18} weight="duotone" />
                          </button>

                          {/* Delete button - icon only */}
                          <button
                            onClick={() => openDeleteModal(guest)}
                            className="p-1.5 text-red-700 hover:bg-red-100"
                            data-testid={`delete-guest-${guest.id}`}
                            title={t('delete')}
                          >
                            <Trash size={18} weight="duotone" />
                          </button>

                          {/* Approve payment button - icon only */}
                          {canApprovePayment(guest) && (
                            <button
                              onClick={() => openPaymentModal(guest)}
                              disabled={approving.has(guest.id)}
                              className={`p-1.5 ${
                                approving.has(guest.id)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-emerald-700 hover:bg-emerald-100'
                              }`}
                              data-testid={`approve-payment-${guest.id}`}
                              title={t('approvePayment')}
                            >
                              {approving.has(guest.id) ? (
                                <SpinnerGap size={18} weight="duotone" className="animate-spin" />
                              ) : (
                                <CheckCircle size={18} weight="duotone" />
                              )}
                            </button>
                          )}

                          {/* Send invitation button - icon only */}
                          <button
                            onClick={() => openEmailPreview(guest.id)}
                            disabled={isSending}
                            className={`p-1.5 ${
                              isSending
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-accent-teal hover:bg-accent-teal/10'
                            }`}
                            data-testid={`send-invitation-${guest.id}`}
                            title={t('sendInvitation')}
                          >
                            {isSending ? (
                              <SpinnerGap size={18} weight="duotone" className="animate-spin" />
                            ) : (
                              <Envelope size={18} weight="duotone" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{t('pageSize')}</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="page-size-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {startIndex + 1}-{Math.min(endIndex, filteredGuests.length)} /{' '}
                {filteredGuests.length}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="prev-page-button"
              >
                {t('previous')}
              </button>
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="next-page-button"
              >
                {t('next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      <GuestFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateGuest}
        mode="add"
      />

      {/* Edit Guest Modal */}
      <GuestFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingGuest(null);
        }}
        onSave={handleUpdateGuest}
        initialData={
          editingGuest
            ? {
                id: editingGuest.id,
                email: editingGuest.email,
                first_name: editingGuest.firstName,
                last_name: editingGuest.lastName,
                title: editingGuest.title,
                phone: editingGuest.phone,
                company: editingGuest.company,
                position: editingGuest.position,
                guest_type: editingGuest.guestType as 'invited' | 'paying_single' | 'paying_paired' | 'applicant',
                status: editingGuest.status as 'pending' | 'invited' | 'registered' | 'approved' | 'declined',
                dietary_requirements: editingGuest.dietaryRequirements,
                seating_preferences: editingGuest.seatingPreferences,
                is_vip_reception: editingGuest.isVipReception || false,
                partner_first_name: editingGuest.partnerFirstName,
                partner_last_name: editingGuest.partnerLastName,
                partner_name: editingGuest.partnerName,
                partner_email: editingGuest.partnerEmail,
                billing_info: editingGuest.billingInfo,
                // Partner relation fields
                isPartner: editingGuest.isPartner,
                pairedWith: editingGuest.pairedWith,
                partnerGuest: editingGuest.partnerGuest,
              }
            : undefined
        }
        mode="edit"
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        guestName={deletingGuest?.name || ''}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingGuest(null);
        }}
        onConfirm={handleDeleteGuest}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={showEmailModal}
        recipients={emailRecipients}
        onClose={() => {
          setShowEmailModal(false);
          setEmailRecipients([]);
        }}
        onSend={handleSendEmails}
        isSending={sending.size > 0}
      />

      {/* Payment Approval Modal */}
      {showPaymentModal && approvingGuest && (
        <PaymentApprovalModal
          guest={approvingGuest}
          isLoading={approving.has(approvingGuest.id)}
          onConfirm={handlePaymentApproval}
          onClose={() => {
            setShowPaymentModal(false);
            setApprovingGuest(null);
          }}
        />
      )}
    </div>
  );
}
