'use client';

/**
 * DroppableTable Component
 * A table card that accepts dropped guests
 * Shows capacity, current guests, and visual feedback during drag
 * Supports collapse/expand and search highlight
 */

import { useState, useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { TABLE_TYPE_COLORS } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DraggableGuest } from './DraggableGuest';
import type { DraggableGuest as DraggableGuestType, TableData } from '../types';

interface DroppableTableProps {
  table: TableData;
  guests: DraggableGuestType[];
  activeGuest: DraggableGuestType | null;
  onRemoveGuest?: (assignmentId: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isHighlighted?: boolean;
  highlightedGuestIds?: Set<number>;
}

// Calculate total occupied seats (paired guests = 2)
function calculateOccupancy(guests: DraggableGuestType[]): number {
  return guests.reduce((sum, g) => sum + g.seatsRequired, 0);
}

export function DroppableTable({
  table,
  guests,
  activeGuest,
  onRemoveGuest,
  isCollapsed = false,
  onToggleCollapse,
  isHighlighted = false,
  highlightedGuestIds,
}: DroppableTableProps) {
  const { t } = useLanguage();
  const containerId = `table-${table.id}`;
  const currentOccupancy = calculateOccupancy(guests);
  const isFull = currentOccupancy >= table.capacity;

  // Tooltip state for collapsed cards
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseEnter = useCallback(() => {
    if (!isCollapsed || guests.length === 0) return;
    tooltipTimeout.current = setTimeout(() => setShowTooltip(true), 300);
  }, [isCollapsed, guests.length]);
  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = null;
    setShowTooltip(false);
  }, []);

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

  // Occupancy-based color coding
  const occupancyRatio = table.capacity > 0 ? currentOccupancy / table.capacity : 0;
  const occupancyColorClass = isFull
    ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'
    : occupancyRatio >= 0.5
      ? 'border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20'
      : currentOccupancy > 0
        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20'
        : 'border-gray-200 bg-gray-50 dark:border-neutral-600 dark:bg-neutral-800';

  return (
    <div
      ref={setNodeRef}
      data-testid="droppable-table"
      data-table-id={table.id}
      data-table-name={table.name}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative border-2 rounded-lg transition-all
        ${isCollapsed ? 'p-3' : 'p-4 min-h-[180px]'}
        ${occupancyColorClass}
        ${isValidDrop ? 'border-green-400 bg-green-50 ring-2 ring-green-200 dark:border-green-500 dark:bg-green-950/30' : ''}
        ${isInvalidDrop ? 'border-red-400 bg-red-100 ring-2 ring-red-200 dark:border-red-500 dark:bg-red-950/50' : ''}
        ${isHighlighted ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-300 dark:border-amber-400 dark:bg-amber-950/30' : ''}
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

      {/* Header - clickable for collapse toggle */}
      <div
        className={`flex items-center justify-between ${isCollapsed ? '' : 'mb-2'} ${onToggleCollapse ? 'cursor-pointer select-none' : ''}`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            isCollapsed
              ? <CaretRight size={14} weight="bold" className="text-gray-500 flex-shrink-0" />
              : <CaretDown size={14} weight="bold" className="text-gray-500 flex-shrink-0" />
          )}
          <h4 className="font-medium text-sm text-gray-900 dark:text-neutral-100">{table.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Compact occupancy when collapsed */}
          {isCollapsed && (
            <span className={`text-xs font-medium ${
              isFull ? 'text-red-600 dark:text-red-400'
                : occupancyRatio >= 0.5 ? 'text-amber-600 dark:text-amber-400'
                : currentOccupancy > 0 ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-neutral-400'
            }`}>
              {currentOccupancy}/{table.capacity}
            </span>
          )}
          <span className={`w-3 h-3 rounded-full ${TABLE_TYPE_COLORS[table.type] || 'bg-gray-400'}`} />
        </div>
      </div>

      {/* Occupancy bar - always visible */}
      {!isCollapsed && (
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className={`${isFull ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-neutral-400'}`}>
            <span data-testid="table-occupied">{currentOccupancy}</span>/<span data-testid="table-capacity">{table.capacity}</span>
            {isFull && ` ${t('full')}`}
          </span>
          <div className="flex-1 mx-2 bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull ? 'bg-red-500' : occupancyRatio >= 0.5 ? 'bg-amber-500' : currentOccupancy > 0 ? 'bg-emerald-500' : ''
              }`}
              style={{ width: `${Math.min((currentOccupancy / table.capacity) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Guest list - Sortable context always rendered for DnD consistency, visually hidden when collapsed */}
      <SortableContext
        items={isCollapsed ? [] : guests.map(g => g.id)}
        strategy={verticalListSortingStrategy}
        id={containerId}
      >
        <div className={isCollapsed ? 'hidden' : 'space-y-2'}>
          {guests.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">{t('dragGuestsHere')}</p>
              <p className="text-xs text-gray-500 mt-1">
                ({table.capacity} {t('seats')})
              </p>
            </div>
          ) : (
            guests.map((guest) => (
              <div key={guest.id} className="relative group">
                <DraggableGuest
                  guest={guest}
                  containerId={containerId}
                  isHighlighted={highlightedGuestIds?.has(guest.guestId)}
                />
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

      {/* Hover tooltip for collapsed state - shows guest names */}
      {isCollapsed && showTooltip && guests.length > 0 && (
        <div
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600
                     rounded-lg shadow-xl p-3 min-w-[200px]"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={handleMouseLeave}
        >
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5">
            {table.name} — {currentOccupancy}/{table.capacity} {t('seats')}
          </p>
          <ul className="space-y-0.5 max-h-[200px] overflow-y-auto">
            {guests.map((guest) => (
              <li key={guest.id} className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
                {guest.name}
                {guest.type === 'paired' && guest.partner?.name && (
                  <span className="text-neutral-400 dark:text-neutral-500"> + {guest.partner.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DroppableTable;
