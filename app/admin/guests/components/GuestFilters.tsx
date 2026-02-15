/**
 * Guest List Filters Component
 *
 * Search, type filter, and status filter for guest list.
 */

import { GUEST_TYPE_LABELS, REGISTRATION_STATUS_INFO } from '@/lib/constants';
import { GuestType, RegistrationStatus } from '@prisma/client';

interface GuestFiltersProps {
  search: string;
  typeFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export default function GuestFilters({
  search,
  typeFilter,
  statusFilter,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
}: GuestFiltersProps) {
  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Search */}
      <div className="md:col-span-2">
        <label htmlFor="search" className="sr-only">
          Kereses
        </label>
        <input
          id="search"
          type="text"
          placeholder="Kereses nev vagy email alapjan..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="search-input"
        />
      </div>

      {/* Type filter */}
      <div>
        <label htmlFor="type-filter" className="sr-only">
          Tipus szuro
        </label>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="type-filter"
        >
          <option value="all">Minden tipus</option>
          {Object.entries(GUEST_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <div>
        <label htmlFor="status-filter" className="sr-only">
          Statusz szuro
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="status-filter"
        >
          <option value="all">Minden statusz</option>
          <option value="not_checked_in">Not Checked In (No-Show)</option>
          {Object.entries(REGISTRATION_STATUS_INFO).map(([value, info]) => (
            <option key={value} value={value}>
              {info.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
