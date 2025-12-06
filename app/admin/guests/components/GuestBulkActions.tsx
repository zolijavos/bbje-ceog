/**
 * Guest Bulk Actions Component
 *
 * Bulk selection and actions (send invitations).
 */

interface GuestBulkActionsProps {
  selectedCount: number;
  isSending: boolean;
  onSendBulk: () => void;
}

export default function GuestBulkActions({
  selectedCount,
  isSending,
  onSendBulk,
}: GuestBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
      <span className="text-blue-800">{selectedCount} vendeg kivalasztva</span>
      <button
        onClick={onSendBulk}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={isSending}
        data-testid="bulk-send-button"
      >
        Meghivok kuldese
      </button>
    </div>
  );
}
