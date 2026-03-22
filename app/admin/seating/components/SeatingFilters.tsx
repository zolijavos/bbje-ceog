'use client';

/**
 * SeatingFilters Component
 * Occupancy filter chips + sort control + expand/collapse all toggle for seating grid view
 */

import { ArrowsOut, ArrowsIn, SortAscending } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type OccupancyFilter = 'all' | 'available' | 'full' | 'empty';
export type TableSortMode = 'name' | 'freeSeatsDesc' | 'freeSeatsAsc';

interface SeatingFiltersProps {
  activeFilter: OccupancyFilter;
  onFilterChange: (filter: OccupancyFilter) => void;
  isAllExpanded: boolean;
  onToggleExpandAll: () => void;
  sortMode: TableSortMode;
  onSortChange: (sort: TableSortMode) => void;
}

const FILTER_OPTIONS: { key: OccupancyFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'seatingFilterAll' },
  { key: 'available', labelKey: 'seatingFilterAvailable' },
  { key: 'full', labelKey: 'seatingFilterFull' },
  { key: 'empty', labelKey: 'seatingFilterEmpty' },
];

const SORT_OPTIONS: { key: TableSortMode; labelKey: string }[] = [
  { key: 'name', labelKey: 'seatingSortName' },
  { key: 'freeSeatsDesc', labelKey: 'seatingSortFreeSeatsDesc' },
  { key: 'freeSeatsAsc', labelKey: 'seatingSortFreeSeatsAsc' },
];

export function SeatingFilters({
  activeFilter,
  onFilterChange,
  isAllExpanded,
  onToggleExpandAll,
  sortMode,
  onSortChange,
}: SeatingFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeFilter === key
                ? 'bg-accent-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
            }`}
            data-testid={`seating-filter-${key}`}
          >
            {t(labelKey as any)}
          </button>
        ))}
      </div>

      {/* Sort + Expand/Collapse controls */}
      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <SortAscending size={14} weight="bold" className="text-neutral-400 dark:text-neutral-500" />
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as TableSortMode)}
            className="text-xs font-medium bg-neutral-100 text-neutral-600 border-0 rounded-full
                       px-2 py-1.5 cursor-pointer outline-none
                       hover:bg-neutral-200 transition-colors
                       dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            data-testid="seating-sort-select"
          >
            {SORT_OPTIONS.map(({ key, labelKey }) => (
              <option key={key} value={key}>
                {t(labelKey as any)}
              </option>
            ))}
          </select>
        </div>

        {/* Expand/Collapse All toggle */}
        <button
          onClick={onToggleExpandAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600
                     bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors whitespace-nowrap
                     dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
          data-testid="seating-toggle-expand-all"
        >
          {isAllExpanded ? (
            <>
              <ArrowsIn size={14} weight="bold" />
              {t('seatingCollapseAll')}
            </>
          ) : (
            <>
              <ArrowsOut size={14} weight="bold" />
              {t('seatingExpandAll')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SeatingFilters;
