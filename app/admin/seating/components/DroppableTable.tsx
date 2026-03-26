'use client';

/**
 * DroppableTable Component
 * A table card that accepts dropped guests
 * Shows capacity, current guests, and visual feedback during drag
 * Supports collapse/expand, search highlight, inline edit modal
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CaretDown, CaretRight, PencilSimple } from '@phosphor-icons/react';
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
  onTableUpdate?: () => void;
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
  onTableUpdate,
}: DroppableTableProps) {
  const { t } = useLanguage();
  const containerId = `table-${table.id}`;
  // Use actual assignment count from DB, not filtered guest list
  const currentOccupancy = table._count.assignments;
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

  // Cleanup tooltip timer on unmount
  useEffect(() => () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  }, []);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: table.name, capacity: table.capacity, type: table.type });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ name: table.name, capacity: table.capacity, type: table.type });
    setEditError(null);
    setShowEditModal(true);
  }, [table.name, table.capacity, table.type]);

  const handleSaveEdit = useCallback(async () => {
    if (editForm.capacity < currentOccupancy) {
      setEditError(`Capacity cannot be less than current occupancy (${currentOccupancy})`);
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/tables/${table.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error saving');
      }
      setShowEditModal(false);
      onTableUpdate?.();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error');
    } finally {
      setEditSaving(false);
    }
  }, [table.id, editForm, onTableUpdate]);

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
    disabled: isFull && !activeGuest?.tableId,
  });

  // Visual states
  const isValidDrop = isOver && canAcceptGuest;
  const isInvalidDrop = isOver && !canAcceptGuest;

  // Occupancy-based color coding: gray (empty) → blue (<50%) → green (≥50%) → red (full)
  const occupancyRatio = table.capacity > 0 ? currentOccupancy / table.capacity : 0;
  const occupancyColorClass = isFull
    ? 'border-red-400 bg-red-100 dark:border-red-600 dark:bg-red-950/40'
    : occupancyRatio >= 0.5
      ? 'border-emerald-400 bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-950/40'
      : currentOccupancy > 0
        ? 'border-blue-400 bg-blue-100 dark:border-blue-600 dark:bg-blue-950/40'
        : 'border-neutral-400 bg-neutral-200 dark:border-neutral-500 dark:bg-neutral-700/50';

  return (
    <div
      ref={setNodeRef}
      data-testid="droppable-table"
      data-table-id={table.id}
      data-table-name={table.name}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        group relative border-2 rounded-lg transition-all
        ${isCollapsed ? 'p-3' : 'p-4 min-h-[180px]'}
        ${occupancyColorClass}
        ${isValidDrop ? 'border-green-400 bg-green-50 ring-2 ring-green-200 dark:border-green-500 dark:bg-green-950/30' : ''}
        ${isInvalidDrop ? 'border-red-400 bg-red-100 ring-2 ring-red-200 dark:border-red-500 dark:bg-red-950/50' : ''}
        ${isHighlighted ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-300 dark:border-amber-400 dark:bg-amber-950/30' : ''}
      `}
    >
      {/* Invalid drop overlay */}
      {isInvalidDrop && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100/90 dark:bg-red-950/90 rounded-lg z-10">
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
              ? <CaretRight size={14} weight="bold" className="text-gray-500 dark:text-neutral-400 flex-shrink-0" />
              : <CaretDown size={14} weight="bold" className="text-gray-500 dark:text-neutral-400 flex-shrink-0" />
          )}
          <h4 className="font-medium text-sm text-gray-900 dark:text-neutral-100">{table.name}</h4>
          {table.type === 'vip' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 uppercase tracking-wider">
              VIP
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Edit button */}
          {onTableUpdate && (
            <button
              onClick={handleOpenEdit}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200/50
                         dark:text-neutral-500 dark:hover:text-neutral-300 dark:hover:bg-neutral-700/50
                         opacity-0 group-hover:opacity-100 transition-all"
              title={t('edit')}
            >
              <PencilSimple size={14} weight="bold" />
            </button>
          )}
          {/* Compact occupancy when collapsed */}
          {isCollapsed && (
            <span className={`text-xs font-medium ${
              isFull ? 'text-red-600 dark:text-red-400'
                : occupancyRatio >= 0.5 ? 'text-emerald-600 dark:text-emerald-400'
                : currentOccupancy > 0 ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-neutral-400'
            }`}>
              {currentOccupancy}/{table.capacity}
            </span>
          )}
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
                isFull ? 'bg-red-500' : occupancyRatio >= 0.5 ? 'bg-emerald-500' : currentOccupancy > 0 ? 'bg-blue-500' : ''
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
            <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-neutral-600 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-neutral-400">{t('dragGuestsHere')}</p>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
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

      {/* Edit Table Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl p-6 w-full max-w-sm mx-4
                       border border-neutral-200 dark:border-neutral-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-4">{t('editTable')}</h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  {t('tableName')}
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                             bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100
                             focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none text-sm"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  {t('capacity')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editForm.capacity}
                  onChange={(e) => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                             bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100
                             focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none text-sm"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  {t('type')}
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                             bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100
                             focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none text-sm"
                >
                  <option value="standard">{t('tableTypeStandard')}</option>
                  <option value="vip">{t('tableTypeVip')}</option>
                  <option value="reserved">{t('tableTypeReserved')}</option>
                </select>
              </div>

              {/* Error */}
              {editError && (
                <p className="text-red-600 dark:text-red-400 text-sm">{editError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700
                           hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
                disabled={editSaving}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving || !editForm.name.trim()}
                className="px-4 py-2 text-sm text-white bg-accent-600 hover:bg-accent-700
                           rounded-lg transition-colors disabled:opacity-50"
              >
                {editSaving ? '...' : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DroppableTable;
