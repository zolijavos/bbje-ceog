'use client';

/**
 * DroppableTable Component
 * A table card that accepts dropped guests
 * Shows capacity, current guests, and visual feedback during drag
 */

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TABLE_TYPE_COLORS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DraggableGuest } from './DraggableGuest';
import type { DraggableGuest as DraggableGuestType, TableData } from '../types';

interface DroppableTableProps {
  table: TableData;
  guests: DraggableGuestType[];
  activeGuest: DraggableGuestType | null;
  onRemoveGuest?: (assignmentId: number) => void;
}

// Calculate total occupied seats (paired guests = 2)
function calculateOccupancy(guests: DraggableGuestType[]): number {
  return guests.reduce((sum, g) => sum + g.seatsRequired, 0);
}

export function DroppableTable({ table, guests, activeGuest, onRemoveGuest }: DroppableTableProps) {
  const { t } = useLanguage();
  const containerId = `table-${table.id}`;
  const currentOccupancy = calculateOccupancy(guests);
  const isFull = currentOccupancy >= table.capacity;

  // Check if active guest can fit
  const canAcceptGuest = activeGuest
    ? (currentOccupancy + activeGuest.seatsRequired) <= table.capacity
    : true;

  const { isOver, setNodeRef } = useDroppable({
    id: containerId,
    data: {
      type: 'table',
      table,
      containerId,
    },
    disabled: isFull && !activeGuest?.tableId, // Allow removing from full table
  });

  // Visual states
  const isValidDrop = isOver && canAcceptGuest;
  const isInvalidDrop = isOver && !canAcceptGuest;

  return (
    <div
      ref={setNodeRef}
      data-testid="droppable-table"
      data-table-id={table.id}
      data-table-name={table.name}
      className={`
        relative border-2 rounded-lg p-4 transition-all min-h-[180px]
        ${isFull ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}
        ${isValidDrop ? 'border-green-400 bg-green-50 ring-2 ring-green-200' : ''}
        ${isInvalidDrop ? 'border-red-400 bg-red-100 ring-2 ring-red-200' : ''}
      `}
    >
      {/* Invalid drop overlay */}
      {isInvalidDrop && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/90 rounded-lg z-10">
          <p className="text-red-600 font-medium text-sm text-center px-2">
            {activeGuest?.type === 'paired'
              ? t('pairedGuestNeedsSeats').replace('{available}', String(table.capacity - currentOccupancy))
              : t('tableFull')
            }
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900">{table.name}</h4>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${TABLE_TYPE_COLORS[table.type] || 'bg-gray-400'}`} />
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span className={isFull ? 'text-red-600 font-medium' : ''}>
          <span data-testid="table-occupied">{currentOccupancy}</span>/<span data-testid="table-capacity">{table.capacity}</span>
          {isFull && ` ${t('full')}`}
        </span>
        <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isFull ? 'bg-red-500' : currentOccupancy > 0 ? 'bg-green-500' : ''
            }`}
            style={{ width: `${Math.min((currentOccupancy / table.capacity) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Guest list - Sortable context */}
      <SortableContext
        items={guests.map(g => g.id)}
        strategy={verticalListSortingStrategy}
        id={containerId}
      >
        <div className="space-y-2">
          {guests.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-400">{t('dragGuestsHere')}</p>
              <p className="text-xs text-gray-300 mt-1">
                ({table.capacity} {t('seats')})
              </p>
            </div>
          ) : (
            guests.map((guest) => (
              <div key={guest.id} className="relative group">
                <DraggableGuest guest={guest} containerId={containerId} />
                {/* Remove button on hover */}
                {onRemoveGuest && guest.assignmentId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveGuest(guest.assignmentId!);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full
                             opacity-0 group-hover:opacity-100 transition-opacity
                             flex items-center justify-center text-xs hover:bg-red-600"
                    title={t('removeFromTable')}
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default DroppableTable;
