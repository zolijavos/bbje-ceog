/**
 * Guest List Pagination Component
 *
 * Page size selector and previous/next navigation.
 */

interface GuestPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function GuestPagination({
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: GuestPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Oldalmeret:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
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
          {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems}
        </span>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="prev-page-button"
        >
          Elozo
        </button>
        <span className="text-sm text-gray-700">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="next-page-button"
        >
          Kovetkezo
        </button>
      </div>
    </div>
  );
}
