'use client';

/**
 * Seating Dashboard Client Component
 *
 * Interactive drag & drop seating assignment with tables and unassigned guests.
 * Story 4.2, 4.3, 4.4, 4.5
 *
 * Supports 3 drag operations:
 * 1. Unassigned → Table (assign)
 * 2. Table → Unassigned (remove)
 * 3. Table → Table (move)
 *
 * View modes:
 * - Grid: Card-based table display
 * - Floor Plan: 2D visual canvas with round tables
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { GUEST_TYPE_LABELS, TABLE_TYPE_COLORS } from '@/lib/constants';
import {
  SquaresFour,
  MapTrifold,
  UploadSimple,
  DownloadSimple,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { logError } from '@/lib/utils/logger';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UnassignedPanel } from './components/UnassignedPanel';
import { DroppableTable } from './components/DroppableTable';
import { GuestChip } from './components/GuestChip';
import { PairedGuestChip } from './components/PairedGuestChip';
import { FloorPlanEditor } from './components/FloorPlanEditor';
import { useSeatingDnd } from './hooks/useSeatingDnd';
import type {
  Guest,
  TableData,
  SeatingStats,
  DraggableGuest,
} from './types';
import {
  toDraggableGuest,
  assignmentToDraggableGuest,
  isPartnerAssignment,
} from './types';

type ViewMode = 'grid' | 'floorplan';

export default function SeatingDashboard() {
  const { t } = useLanguage();
  const [tables, setTables] = useState<TableData[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<SeatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [csvContent, setCsvContent] = useState('');
  const [csvResult, setCsvResult] = useState<{
    success: boolean;
    imported: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tablesRes, guestsRes, statsRes] = await Promise.all([
        fetch('/api/admin/tables'),
        fetch('/api/admin/table-assignments?unassigned=true'),
        fetch('/api/admin/seating-stats'),
      ]);

      if (tablesRes.ok) {
        const data = await tablesRes.json();
        setTables(data.tables);
      }
      if (guestsRes.ok) {
        const data = await guestsRes.json();
        setUnassignedGuests(data.guests);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (err) {
      logError('Failed to fetch data:', err);
      setError('Error occurred while loading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // API Handlers
  const handleAssign = useCallback(async (guestId: number, tableId: number) => {
    try {
      const response = await fetch('/api/admin/table-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, tableId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error occurred');
      }

      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      throw err;
    }
  }, [fetchData]);

  const handleUnassign = useCallback(async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/admin/table-assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error occurred');
      }

      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      throw err;
    }
  }, [fetchData]);

  const handleMove = useCallback(async (assignmentId: number, newTableId: number) => {
    try {
      const response = await fetch(`/api/admin/table-assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: newTableId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error occurred');
      }

      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      throw err;
    }
  }, [fetchData]);

  // Remove guest via button click
  const handleRemoveGuest = useCallback(async (assignmentId: number) => {
    if (!confirm(t('confirmRemoveGuest'))) return;
    await handleUnassign(assignmentId);
  }, [handleUnassign, t]);

  // DnD Hook
  const {
    activeGuest,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useSeatingDnd({
    onAssign: handleAssign,
    onUnassign: handleUnassign,
    onMove: handleMove,
  });

  // Transform guests to draggable format
  const draggableUnassignedGuests = useMemo(() => {
    return unassignedGuests.map((g) => toDraggableGuest(g as Guest));
  }, [unassignedGuests]);

  // Transform table assignments to draggable format
  // Filter out partner guests - only show main guests (partners are shown on their main guest's card)
  const tableGuestsMap = useMemo(() => {
    const map: Record<number, DraggableGuest[]> = {};
    tables.forEach((table) => {
      // Filter: only include main guests (those without paired_with_id)
      const mainGuestAssignments = table.assignments.filter(
        (a) => !isPartnerAssignment(a)
      );
      map[table.id] = mainGuestAssignments.map((a) =>
        assignmentToDraggableGuest(a, table.id)
      );
    });
    return map;
  }, [tables]);

  // Handle CSV import
  const handleCsvImport = async () => {
    if (!csvContent.trim()) return;

    try {
      const response = await fetch('/api/admin/table-assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvContent }),
      });

      const result = await response.json();
      setCsvResult(result);

      if (result.imported > 0) {
        await fetchData();
      }
    } catch (err) {
      setError('Hálózati hiba');
    }
  };

  // Export CSV
  const handleExport = () => {
    window.open('/api/admin/seating-export', '_blank');
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div data-testid="seating-dashboard" className="space-y-6 animate-fade-in">
        {/* Error Toast */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 border-l-4 border-red-800 shadow-lg animate-slide-up">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="panel p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{t('totalTables')}</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalTables}</p>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{t('capacity')}</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalCapacity}</p>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{t('assignedSeats')}</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalOccupied}</p>
            </div>
            <div className="panel p-4 border-l-4 border-emerald-600">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{t('occupancy')}</p>
              <p className="text-2xl font-bold text-emerald-700">
                {stats.occupancyRate.toFixed(1)}%
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{t('guests')}</p>
              <p className="text-2xl font-bold text-neutral-800">{stats.totalGuests}</p>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex gap-4 flex-wrap items-center">
          {/* View Mode Toggle */}
          <div className="inline-flex border-2 border-neutral-300 bg-neutral-100 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                viewMode === 'grid'
                  ? 'bg-accent-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
              }`}
              data-testid="view-grid-button"
            >
              <SquaresFour size={18} weight="duotone" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('floorplan')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                viewMode === 'floorplan'
                  ? 'bg-accent-600 text-white'
                  : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
              }`}
              data-testid="view-floorplan-button"
            >
              <MapTrifold size={18} weight="duotone" />
              {t('floorPlan')}
            </button>
          </div>

          <div className="h-8 w-px bg-neutral-300" />

          <button
            onClick={() => setShowCsvImport(!showCsvImport)}
            className="btn btn-success flex items-center gap-2"
            data-testid="csv-import-button"
          >
            <UploadSimple size={18} weight="duotone" />
            {t('importCSV')}
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary flex items-center gap-2"
            data-testid="csv-export-button"
          >
            <DownloadSimple size={18} weight="duotone" />
            {t('exportCSV')}
          </button>
          <button
            onClick={fetchData}
            className="btn btn-secondary flex items-center gap-2"
            data-testid="refresh-button"
          >
            <ArrowsClockwise size={18} weight="duotone" />
            {t('retry')}
          </button>
        </div>

        {/* CSV Import Panel */}
        {showCsvImport && (
          <div className="panel p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">CSV Import</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Format: <code className="bg-neutral-100 px-2 py-0.5 text-accent-700 font-mono">table_name,guest_email,seat_number</code>
            </p>
            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full h-32 p-3 font-mono text-sm"
              placeholder="table_name,guest_email,seat_number&#10;VIP-01,john@example.com,1&#10;VIP-01,jane@example.com,2"
            />
            <div className="mt-4 flex gap-3 border-t border-neutral-200 pt-4">
              <button
                onClick={handleCsvImport}
                className="btn btn-success"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowCsvImport(false);
                  setCsvContent('');
                  setCsvResult(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
            {csvResult && (
              <div className="mt-4 p-3 bg-neutral-50 border-l-4 border-accent-600">
                <p className={csvResult.success ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                  {csvResult.imported} rows successfully imported
                </p>
                {csvResult.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-600 space-y-1">
                    {csvResult.errors.map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'grid' ? (
          /* Grid View: Split layout with unassigned panel */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Unassigned Guests Panel */}
            <div className="lg:col-span-1">
              <UnassignedPanel
                guests={draggableUnassignedGuests}
                isReceiving={activeGuest?.tableId !== undefined}
              />
            </div>

            {/* Tables Grid */}
            <div className="lg:col-span-3 panel p-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Tables</h3>
                <p className="text-sm text-neutral-500">
                  Drag guests to tables or between tables
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <DroppableTable
                    key={table.id}
                    table={table}
                    guests={tableGuestsMap[table.id] || []}
                    activeGuest={activeGuest}
                    onRemoveGuest={handleRemoveGuest}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Floor Plan View: 2D visual canvas */
          <FloorPlanEditor
            tables={tables}
            onRefresh={fetchData}
          />
        )}

        {/* Instructions - shown for grid view */}
        {viewMode === 'grid' && (
          <div className="panel p-4 border-l-4 border-accent-600">
            <h4 className="font-semibold text-neutral-800 text-sm mb-3 uppercase tracking-wide">Drag & Drop Instructions</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-neutral-600">
              <div className="flex items-start gap-2">
                <span className="text-accent-600 font-bold">1.</span>
                <span>Drag guests from the left panel to any table</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600 font-bold">2.</span>
                <span>Drag guests between tables to move them</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600 font-bold">3.</span>
                <span>Drag back to the left panel to remove assignment</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600 font-bold">4.</span>
                <span>Paired guests (2 {t('seats')}) move together</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drag Overlay - Ghost element while dragging */}
      <DragOverlay>
        {activeGuest ? (
          activeGuest.type === 'paired' ? (
            <PairedGuestChip guest={activeGuest} isOverlay mainGuestLabel={t('mainGuest')} partnerLabel={t('partner')} />
          ) : (
            <GuestChip guest={activeGuest} isOverlay />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
