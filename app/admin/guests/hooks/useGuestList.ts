/**
 * useGuestList Hook
 *
 * Manages guest list state, filtering, pagination, and CRUD operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Guest {
  id: number;
  name: string;
  email: string;
  guestType: string;
  status: string;
  hasMagicLink: boolean;
  magicLinkExpired: boolean;
  emailsSent: number;
  createdAt: string;
  tableAssignment?: {
    tableName: string;
    seatNumber: number | null;
  } | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | null;
  paymentMethod: 'card' | 'bank_transfer' | null;
  hasRegistration: boolean;
}

interface SendResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ guest_id: number; error: string }>;
}

export function useGuestList(initialGuests: Guest[]) {
  const router = useRouter();

  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Guest data
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(initialGuests);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sending, setSending] = useState<Set<number>>(new Set());
  const [approving, setApproving] = useState<Set<number>>(new Set());

  // Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Apply filters
  useEffect(() => {
    let result = [...initialGuests];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchLower) ||
          g.email.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((g) => g.guestType === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((g) => g.status === statusFilter);
    }

    setFilteredGuests(result);
    setCurrentPage(1);
  }, [initialGuests, search, typeFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredGuests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGuests = filteredGuests.slice(startIndex, endIndex);

  // Selection
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const pageIds = paginatedGuests.map((g) => g.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [paginatedGuests, selectedIds]);

  // Notification
  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 5000);
    },
    []
  );

  // Send invitations
  const sendSingle = useCallback(
    async (guestId: number) => {
      setSending((prev) => new Set(prev).add(guestId));

      try {
        const response = await fetch('/api/email/send-magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest_ids: [guestId] }),
        });

        const result: SendResult = await response.json();

        if (result.success && result.sent === 1) {
          showNotification('success', 'Meghivo sikeresen elkuldve!');
        } else if (result.errors.length > 0) {
          showNotification('error', result.errors[0].error);
        } else {
          showNotification('error', 'Hiba tortent a kuldes soran.');
        }
      } catch (error) {
        showNotification(
          'error',
          error instanceof Error ? error.message : 'Halozati hiba'
        );
      } finally {
        setSending((prev) => {
          const next = new Set(prev);
          next.delete(guestId);
          return next;
        });
      }
    },
    [showNotification]
  );

  const sendBulk = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    setSending(new Set(ids));

    try {
      const response = await fetch('/api/email/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_ids: ids }),
      });

      const result: SendResult = await response.json();

      if (result.failed === 0) {
        showNotification('success', `${result.sent} meghivo sikeresen elkuldve!`);
      } else {
        showNotification(
          'info',
          `${result.sent} elkuldve, ${result.failed} sikertelen`
        );
      }

      setSelectedIds(new Set());
    } catch (error) {
      showNotification(
        'error',
        error instanceof Error ? error.message : 'Halozati hiba'
      );
    } finally {
      setSending(new Set());
    }
  }, [selectedIds, showNotification]);

  // Approve payment
  const approvePayment = useCallback(
    async (guestId: number) => {
      setApproving((prev) => new Set(prev).add(guestId));

      try {
        const response = await fetch(
          `/api/admin/guests/${guestId}/approve-payment`,
          { method: 'PATCH' }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Hiba tortent a jovahagyas soran');
        }

        showNotification('success', 'Fizetes jovahagyva, e-ticket elkuldve');
        router.refresh();
      } catch (error) {
        showNotification(
          'error',
          error instanceof Error ? error.message : 'Halozati hiba'
        );
      } finally {
        setApproving((prev) => {
          const next = new Set(prev);
          next.delete(guestId);
          return next;
        });
      }
    },
    [showNotification, router]
  );

  return {
    // Filters
    search,
    typeFilter,
    statusFilter,
    setSearch,
    setTypeFilter,
    setStatusFilter,

    // Pagination
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    setPageSize,

    // Guest data
    filteredGuests,
    paginatedGuests,

    // Selection
    selectedIds,
    sending,
    approving,
    toggleSelect,
    toggleAll,
    allPageSelected:
      paginatedGuests.length > 0 &&
      paginatedGuests.every((g) => selectedIds.has(g.id)),

    // Actions
    sendSingle,
    sendBulk,
    approvePayment,

    // Notification
    notification,
    showNotification,
  };
}
