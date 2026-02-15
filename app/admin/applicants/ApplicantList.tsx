'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, Eye, XCircle, CheckCircle } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Applicant {
  id: number;
  name: string;
  email: string;
  title: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  dietaryRequirements: string | null;
  seatingPreferences: string | null;
  status: string;
  rejectionReason: string | null;
  appliedAt: string;
}

interface ApplicantListProps {
  applicants: Applicant[];
}

type FilterStatus = 'all' | 'pending_approval' | 'approved' | 'rejected';

export default function ApplicantList({ applicants: initialApplicants }: ApplicantListProps) {
  const router = useRouter();
  const { t } = useLanguage();
  // Local state for applicants - allows immediate UI updates
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [filter, setFilter] = useState<FilterStatus>('all');

  // Sync local state when server data changes (e.g., after router.refresh())
  useEffect(() => {
    setApplicants(initialApplicants);
  }, [initialApplicants]);

  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  const filteredApplicants = applicants.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const handleApprove = async (id: number) => {
    if (processing) return;
    setProcessing(id);

    try {
      const response = await fetch(`/api/admin/applicants/${id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve application');
      }

      // Update local state immediately - change status to 'approved'
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'approved' } : a
        )
      );

      // Also trigger server refresh for stats bar in parent
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to approve application');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || processing) return;
    setProcessing(rejectingId);
    const currentRejectingId = rejectingId;
    const currentRejectionReason = rejectionReason;

    try {
      const response = await fetch(`/api/admin/applicants/${currentRejectingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: currentRejectionReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject application');
      }

      // Update local state immediately - change status to 'rejected'
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === currentRejectingId
            ? { ...a, status: 'rejected', rejectionReason: currentRejectionReason || null }
            : a
        )
      );

      setShowRejectModal(false);
      setRejectingId(null);
      setRejectionReason('');

      // Also trigger server refresh for stats bar in parent
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (id: number) => {
    setRejectingId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
            <Clock size={12} className="mr-1" />
            {t('pendingReview')}
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            <CheckCircle size={12} className="mr-1" />
            {t('approved')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
            <XCircle size={12} className="mr-1" />
            {t('rejected')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      {/* Filter Tabs */}
      <div className="mb-4 border-b border-gray-200" data-testid="filter-tabs">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'pending_approval', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              data-testid={`filter-${status}`}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                filter === status
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status === 'all' && t('all')}
              {status === 'pending_approval' && `${t('pending')} (${applicants.filter((a) => a.status === 'pending_approval').length})`}
              {status === 'approved' && `${t('approved')} (${applicants.filter((a) => a.status === 'approved').length})`}
              {status === 'rejected' && `${t('rejected')} (${applicants.filter((a) => a.status === 'rejected').length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Applicant Cards */}
      <div className="space-y-4" data-testid="applicant-list">
        {filteredApplicants.map((applicant) => (
          <div
            key={applicant.id}
            className="bg-white rounded-lg shadow overflow-hidden"
            data-testid={`applicant-card-${applicant.id}`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {applicant.title && `${applicant.title} `}{applicant.name}
                    </h3>
                    {getStatusBadge(applicant.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><span className="font-medium">{t('email')}:</span> {applicant.email}</p>
                    <p><span className="font-medium">{t('phone')}:</span> {applicant.phone || 'N/A'}</p>
                    <p><span className="font-medium">{t('company')}:</span> {applicant.company || 'N/A'}</p>
                    <p><span className="font-medium">{t('position')}:</span> {applicant.position || 'N/A'}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('applied')}: {new Date(applicant.appliedAt).toLocaleString()}
                  </p>
                  {applicant.status === 'rejected' && applicant.rejectionReason && (
                    <p className="mt-2 text-sm text-red-600">
                      <span className="font-medium">{t('rejectionReason')}:</span> {applicant.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title={t('viewDetails')}
                  >
                    <Eye size={20} />
                  </button>

                  {applicant.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleApprove(applicant.id)}
                        disabled={processing === applicant.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 disabled:opacity-50"
                        data-testid={`approve-btn-${applicant.id}`}
                      >
                        <Check size={16} className="mr-1" />
                        {t('approve')}
                      </button>
                      <button
                        onClick={() => openRejectModal(applicant.id)}
                        disabled={processing === applicant.id}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        data-testid={`reject-btn-${applicant.id}`}
                      >
                        <X size={16} className="mr-1" />
                        {t('reject')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('noApplicationsMatch')}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t('applicationDetails')}</h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('status')}</h3>
                  <div className="mt-1">{getStatusBadge(selectedApplicant.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('name')}</h3>
                    <p className="mt-1 text-gray-900">
                      {selectedApplicant.title && `${selectedApplicant.title} `}{selectedApplicant.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('email')}</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('phone')}</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('company')}</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.company || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('position')}</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.position || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('applied')}</h3>
                    <p className="mt-1 text-gray-900">
                      {new Date(selectedApplicant.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedApplicant.dietaryRequirements && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('dietaryRequirements')}</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.dietaryRequirements}</p>
                  </div>
                )}

                {selectedApplicant.seatingPreferences && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{t('seatingPreferences')}</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.seatingPreferences}</p>
                  </div>
                )}

                {selectedApplicant.status === 'rejected' && selectedApplicant.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">{t('rejectionReason')}</h3>
                    <p className="mt-1 text-red-700">{selectedApplicant.rejectionReason}</p>
                  </div>
                )}
              </div>

              {selectedApplicant.status === 'pending_approval' && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedApplicant(null);
                      openRejectModal(selectedApplicant.id);
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {t('rejectApplication')}
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedApplicant.id);
                      setSelectedApplicant(null);
                    }}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800"
                  >
                    {t('approveApplication')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('rejectApplication')}</h2>
              <p className="text-gray-600 mb-4">
                {t('confirmRejectApplication')}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('reasonOptional')}
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  placeholder={t('rejectionReasonPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('rejectionReasonNote')}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingId(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing !== null}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? t('rejecting') : t('rejectApplication')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
