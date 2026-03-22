'use client';

/**
 * SeatingFilters Component
 * Occupancy filter chips + expand/collapse all toggle for seating grid view
 */

import { ArrowsOut, ArrowsIn } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export type OccupancyFilter = 'all' | 'available' | 'full' | 'empty';

interface SeatingFiltersProps {
  activeFilter: OccupancyFilter;
  onFilterChange: (filter: OccupancyFilter) => void;
  isAllExpanded: boolean;
  onToggleExpandAll: () => void;
}

const FILTER_OPTIONS: { key: OccupancyFilter; labelKey: string }[] = [
  { key: 'all', labelKey: 'seatingFilterAll' },
  { key: 'available', labelKey: 'seatingFilterAvailable' },
  { key: 'full', labelKey: 'seatingFilterFull' },
  { key: 'empty', labelKey: 'seatingFilterEmpty' },
];

export function SeatingFilters({ activeFilter, onFilterChange, isAllExpanded, onToggleExpandAll }: SeatingFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeFilter === key
                ? 'bg-accent-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            data-testid={`seating-filter-${key}`}
          >
            {t(labelKey as any)}
          </button>
        ))}
      </div>

      {/* Expand/Collapse All toggle */}
      <button
        onClick={onToggleExpandAll}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600
                   bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors whitespace-nowrap"
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
  );
}

export default SeatingFilters;
