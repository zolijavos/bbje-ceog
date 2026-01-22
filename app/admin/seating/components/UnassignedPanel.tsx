'use client';

/**
 * UnassignedPanel Component
 * Left panel showing guests waiting to be assigned to tables
 * Acts as a droppable area to remove guests from tables
 */

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableGuest } from './DraggableGuest';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { DraggableGuest as DraggableGuestType } from '../types';

interface UnassignedPanelProps {
  guests: DraggableGuestType[];
  isReceiving?: boolean;
}

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

  // Count actual guests (not cards) - paired guests count as 2
  const totalGuestCount = filteredGuests.reduce((sum, g) => sum + g.seatsRequired, 0);

  return (
    <div
      ref={setNodeRef}
      data-testid="unassigned-panel"
      className={`
        bg-white rounded-lg shadow p-6 h-full
        transition-all
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${isReceiving ? 'ring-2 ring-orange-400 bg-orange-50' : ''}
      `}
    >
      <h3 className="text-lg font-medium mb-4">
        {t('unassignedGuestsPanel')} ({totalGuestCount})
      </h3>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('searchGuests')}
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      {/* Guest list */}
      <SortableContext
        items={filteredGuests.map(g => g.id)}
        strategy={verticalListSortingStrategy}
        id="unassigned"
      >
        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-8">
              {guests.length === 0 ? (
                <p className="text-gray-500 text-sm">{t('noUnassignedGuests')}</p>
              ) : (
                <p className="text-gray-500 text-sm">{t('noSearchResults')}</p>
              )}
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <DraggableGuest
                key={guest.id}
                guest={guest}
                containerId="unassigned"
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Drop hint when dragging from table */}
      {isOver && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg text-center">
          <p className="text-blue-700 text-sm font-medium">
            {t('dropToRemove')}
          </p>
        </div>
      )}
    </div>
  );
}

export default UnassignedPanel;
