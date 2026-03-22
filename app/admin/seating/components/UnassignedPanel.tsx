'use client';

/**
 * UnassignedPanel Component
 * Left panel showing guests waiting to be assigned to tables
 * Grouped by guest type with color-coded borders
 * Acts as a droppable area to remove guests from tables
 */

import { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableGuest } from './DraggableGuest';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { DraggableGuest as DraggableGuestType } from '../types';

interface UnassignedPanelProps {
  guests: DraggableGuestType[];
  isReceiving?: boolean;
}

// Guest type → border color for left accent
const GUEST_TYPE_BORDER: Record<string, string> = {
  invited: 'border-l-amber-500',
  vip: 'border-l-amber-500',
  paying_single: 'border-l-blue-500',
  paying_paired: 'border-l-purple-500',
};

// Guest type → group config
const GUEST_GROUPS: { types: string[]; labelKey: string; borderColor: string }[] = [
  { types: ['invited', 'vip'], labelKey: 'guestGroupInvited', borderColor: 'border-amber-500' },
  { types: ['paying_single'], labelKey: 'guestGroupPayingSingle', borderColor: 'border-blue-500' },
  { types: ['paying_paired'], labelKey: 'guestGroupPayingPaired', borderColor: 'border-purple-500' },
];

export function UnassignedPanel({ guests, isReceiving }: UnassignedPanelProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned',
    data: {
      type: 'unassigned',
      containerId: 'unassigned',
    },
  });

  // Filter guests by search (with null safety)
  const filteredGuests = guests.filter(g =>
    (g.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group guests by type
  const groupedGuests = useMemo(() => {
    return GUEST_GROUPS.map(group => ({
      ...group,
      guests: filteredGuests.filter(g => group.types.includes(g.guestType)),
    })).filter(g => g.guests.length > 0);
  }, [filteredGuests]);

  // Count actual guests (not cards) - paired guests count as 2
  const totalGuestCount = filteredGuests.reduce((sum, g) => sum + g.seatsRequired, 0);

  return (
    <div
      ref={setNodeRef}
      data-testid="unassigned-panel"
      className={`
        panel rounded-lg p-5 h-full transition-all
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-950/30' : ''}
        ${isReceiving ? 'ring-2 ring-orange-400 bg-orange-50 dark:bg-orange-950/30' : ''}
      `}
    >
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4">
        {t('unassignedGuestsPanel')} ({totalGuestCount})
      </h3>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('searchGuests')}
        className="w-full mb-4 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                   bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200
                   focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-sm"
      />

      {/* Guest list - grouped by type */}
      <SortableContext
        items={filteredGuests.map(g => g.id)}
        strategy={verticalListSortingStrategy}
        id="unassigned"
      >
        <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-8">
              {guests.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">{t('noUnassignedGuests')}</p>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">{t('noSearchResults')}</p>
              )}
            </div>
          ) : (
            groupedGuests.map((group) => (
              <div key={group.labelKey}>
                {/* Group header */}
                <div className={`flex items-center gap-2 mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-700`}>
                  <span className={`w-2 h-2 rounded-full ${group.borderColor.replace('border-', 'bg-')}`} />
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    {t(group.labelKey as any)} ({group.guests.length})
                  </p>
                </div>
                {/* Guest cards */}
                <div className="space-y-2">
                  {group.guests.map((guest) => (
                    <div
                      key={guest.id}
                      className={`border-l-3 ${GUEST_TYPE_BORDER[guest.guestType] || 'border-l-neutral-400'}`}
                      style={{ borderLeftWidth: '3px' }}
                    >
                      <DraggableGuest guest={guest} containerId="unassigned" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SortableContext>

      {/* Drop hint when dragging from table */}
      {isOver && (
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
            {t('dropToRemove')}
          </p>
        </div>
      )}
    </div>
  );
}

export default UnassignedPanel;
