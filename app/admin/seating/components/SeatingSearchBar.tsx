'use client';

/**
 * SeatingSearchBar Component
 * Global search bar for seating page - searches guests and tables
 */

import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SeatingSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: { guests: number; tables: number } | null;
}

export function SeatingSearchBar({ searchQuery, onSearchChange, resultCount }: SeatingSearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-1">
      <div className="relative">
        <MagnifyingGlass
          size={18}
          weight="duotone"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('seatingSearchPlaceholder')}
          className="w-full pl-10 pr-10 py-2.5 border-2 border-neutral-300 dark:border-neutral-600
                     bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm
                     focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none
                     transition-colors"
          data-testid="seating-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600
                       transition-colors"
            data-testid="seating-search-clear"
          >
            <X size={18} weight="bold" />
          </button>
        )}
      </div>
      {searchQuery && resultCount && (
        <p className="text-xs text-neutral-500 px-1">
          {resultCount.guests === 0 && resultCount.tables === 0
            ? t('seatingNoResults')
            : t('seatingSearchResults').replace('{count}', String(resultCount.guests + resultCount.tables))
              + ` (${resultCount.guests} ${t('guests').toLowerCase()}, ${resultCount.tables} ${t('totalTables').toLowerCase()})`
          }
        </p>
      )}
    </div>
  );
}

export default SeatingSearchBar;
