'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, Eye, XCircle } from '@phosphor-icons/react';

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

type FilterStatus = 'all' | 'pending_approval' | 'rejected';

export default function ApplicantList({ applicants }: ApplicantListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterStatus>('all');
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

    try {
      const response = await fetch(`/api/admin/applicants/${rejectingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject application');
      }

      setShowRejectModal(false);
      setRejectingId(null);
      setRejectionReason('');
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={12} className="mr-1" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
          {(['all', 'pending_approval', 'rejected'] as FilterStatus[]).map((status) => (
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
              {status === 'all' && 'All'}
              {status === 'pending_approval' && `Pending (${applicants.filter((a) => a.status === 'pending_approval').length})`}
              {status === 'rejected' && `Rejected (${applicants.filter((a) => a.status === 'rejected').length})`}
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
                    <p><span className="font-medium">Email:</span> {applicant.email}</p>
                    <p><span className="font-medium">Phone:</span> {applicant.phone || 'N/A'}</p>
                    <p><span className="font-medium">Company:</span> {applicant.company || 'N/A'}</p>
                    <p><span className="font-medium">Position:</span> {applicant.position || 'N/A'}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Applied: {new Date(applicant.appliedAt).toLocaleString()}
                  </p>
                  {applicant.status === 'rejected' && applicant.rejectionReason && (
                    <p className="mt-2 text-sm text-red-600">
                      <span className="font-medium">Rejection reason:</span> {applicant.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setSelectedApplicant(applicant)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="View details"
                  >
                    <Eye size={20} />
                  </button>

                  {applicant.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleApprove(applicant.id)}
                        disabled={processing === applicant.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        data-testid={`approve-btn-${applicant.id}`}
                      >
                        <Check size={16} className="mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(applicant.id)}
                        disabled={processing === applicant.id}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        data-testid={`reject-btn-${applicant.id}`}
                      >
                        <X size={16} className="mr-1" />
                        Reject
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
            No applications match the current filter.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1">{getStatusBadge(selectedApplicant.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-gray-900">
                      {selectedApplicant.title && `${selectedApplicant.title} `}{selectedApplicant.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Company</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.company || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Position</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.position || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Applied</h3>
                    <p className="mt-1 text-gray-900">
                      {new Date(selectedApplicant.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedApplicant.dietaryRequirements && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dietary Requirements</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.dietaryRequirements}</p>
                  </div>
                )}

                {selectedApplicant.seatingPreferences && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Seating Preferences</h3>
                    <p className="mt-1 text-gray-900">{selectedApplicant.seatingPreferences}</p>
                  </div>
                )}

                {selectedApplicant.status === 'rejected' && selectedApplicant.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
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
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedApplicant.id);
                      setSelectedApplicant(null);
                    }}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Approve Application
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Application</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to reject this application? The applicant will be notified by email.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  placeholder="E.g., Event is at full capacity..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be stored internally for reference only (not sent to applicant).
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
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing !== null}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
