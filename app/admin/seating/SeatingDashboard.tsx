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
 * - Grid: Card-based table display with search, filters, collapse, VIP/Standard sections
 * - Floor Plan: 2D visual canvas with round tables, heatmap, spotlight search
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { GUEST_TYPE_LABELS, TABLE_TYPE_COLORS, SEATING_AUTO_COLLAPSE_THRESHOLD } from '@/lib/constants';
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
import { SeatingSearchBar } from './components/SeatingSearchBar';
import { SeatingFilters } from './components/SeatingFilters';
import type { OccupancyFilter } from './components/SeatingFilters';
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

  // === Search, filter, collapse state ===
  const [globalSearch, setGlobalSearch] = useState('');
  const [occupancyFilter, setOccupancyFilter] = useState<OccupancyFilter>('all');
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [searchExpandedIds, setSearchExpandedIds] = useState<Set<number>>(new Set());
  const collapseInitialized = useRef(false);

  // DnD auto-expand timeout ref
  const autoExpandTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoExpandTableId = useRef<number | null>(null);

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

  // === Collapse initialization (once after tables load) ===
  useEffect(() => {
    if (tables.length > 0 && !collapseInitialized.current) {
      collapseInitialized.current = true;
      const shouldCollapse = tables.length > SEATING_AUTO_COLLAPSE_THRESHOLD;
      const initial: Record<number, boolean> = {};
      tables.forEach(t => { initial[t.id] = shouldCollapse; });
      setCollapsed(initial);
    }
  }, [tables]);

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
    handleDragOver: baseDragOver,
    handleDragEnd: baseDragEnd,
    handleDragCancel: baseDragCancel,
  } = useSeatingDnd({
    onAssign: handleAssign,
    onUnassign: handleUnassign,
    onMove: handleMove,
  });

  // Clear auto-expand timeout
  const clearAutoExpand = useCallback(() => {
    if (autoExpandTimeout.current) {
      clearTimeout(autoExpandTimeout.current);
      autoExpandTimeout.current = null;
    }
    autoExpandTableId.current = null;
  }, []);

  // Enhanced DnD handlers with auto-expand on hover
  const handleDragOver = useCallback((event: DragOverEvent) => {
    baseDragOver(event);

    const { over } = event;
    if (over) {
      const overId = String(over.id);
      if (overId.startsWith('table-')) {
        const tableId = parseInt(overId.replace('table-', ''), 10);
        // If hovering over a collapsed table, schedule auto-expand
        if (collapsed[tableId] && tableId !== autoExpandTableId.current) {
          clearAutoExpand();
          autoExpandTableId.current = tableId;
          autoExpandTimeout.current = setTimeout(() => {
            setCollapsed(prev => ({ ...prev, [tableId]: false }));
            autoExpandTableId.current = null;
          }, 400);
        }
      }
    } else {
      clearAutoExpand();
    }
  }, [baseDragOver, collapsed, clearAutoExpand]);

  const handleDragEnd = useCallback((event: any) => {
    clearAutoExpand();
    baseDragEnd(event);
  }, [baseDragEnd, clearAutoExpand]);

  const handleDragCancel = useCallback(() => {
    clearAutoExpand();
    baseDragCancel();
  }, [baseDragCancel, clearAutoExpand]);

  // Transform guests to draggable format
  const draggableUnassignedGuests = useMemo(() => {
    return unassignedGuests.map((g) => toDraggableGuest(g as Guest));
  }, [unassignedGuests]);

  // Transform table assignments to draggable format
  const tableGuestsMap = useMemo(() => {
    const map: Record<number, DraggableGuest[]> = {};
    tables.forEach((table) => {
      const mainGuestAssignments = table.assignments.filter(
        (a) => !isPartnerAssignment(a)
      );
      map[table.id] = mainGuestAssignments.map((a) =>
        assignmentToDraggableGuest(a, table.id)
      );
    });
    return map;
  }, [tables]);

  // === Search logic ===
  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) {
      return { matchingTableIds: new Set<number>(), matchingGuestIds: new Set<number>(), resultCount: null };
    }
    const query = globalSearch.toLowerCase().trim();
    const matchingTableIds = new Set<number>();
    const matchingGuestIds = new Set<number>();

    tables.forEach((table) => {
      // Table name match
      if (table.name.toLowerCase().includes(query)) {
        matchingTableIds.add(table.id);
      }
      // Guest name/email match in this table's assignments
      const guests = tableGuestsMap[table.id] || [];
      guests.forEach((guest) => {
        if (guest.name.toLowerCase().includes(query) || guest.email.toLowerCase().includes(query)) {
          matchingGuestIds.add(guest.guestId);
          matchingTableIds.add(table.id);
        }
        // Check partner name
        if (guest.partner?.name && guest.partner.name.toLowerCase().includes(query)) {
          matchingGuestIds.add(guest.guestId);
          matchingTableIds.add(table.id);
        }
      });
    });

    return {
      matchingTableIds,
      matchingGuestIds,
      resultCount: { guests: matchingGuestIds.size, tables: matchingTableIds.size },
    };
  }, [globalSearch, tables, tableGuestsMap]);

  // Auto-expand matching tables when searching
  useEffect(() => {
    if (globalSearch.trim()) {
      setSearchExpandedIds(searchResults.matchingTableIds);
    } else {
      setSearchExpandedIds(new Set());
    }
  }, [globalSearch, searchResults.matchingTableIds]);

  // === Occupancy filter logic ===
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const guests = tableGuestsMap[table.id] || [];
      const occupied = guests.reduce((sum, g) => sum + g.seatsRequired, 0);

      if (occupancyFilter === 'available') return occupied < table.capacity;
      if (occupancyFilter === 'full') return occupied >= table.capacity;
      if (occupancyFilter === 'empty') return occupied === 0;
      return true; // 'all'
    });
  }, [tables, tableGuestsMap, occupancyFilter]);

  // Apply search filter on top of occupancy filter
  const visibleTables = useMemo(() => {
    if (!globalSearch.trim()) return filteredTables;
    return filteredTables.filter((t) => searchResults.matchingTableIds.has(t.id));
  }, [filteredTables, globalSearch, searchResults.matchingTableIds]);

  // === Section grouping ===
  const vipTables = useMemo(() => visibleTables.filter(t => t.type === 'vip'), [visibleTables]);
  const standardTables = useMemo(() => visibleTables.filter(t => t.type !== 'vip'), [visibleTables]);

  // === Effective collapse state (respects search auto-expand) ===
  const isTableCollapsed = useCallback((tableId: number) => {
    if (searchExpandedIds.has(tableId)) return false;
    return !!collapsed[tableId];
  }, [collapsed, searchExpandedIds]);

  // === Expand All / Collapse All (operates on visible tables only) ===
  const isAllExpanded = useMemo(() => {
    if (visibleTables.length === 0) return true;
    return visibleTables.every(t => !collapsed[t.id]);
  }, [visibleTables, collapsed]);

  const handleToggleExpandAll = useCallback(() => {
    const newValue = isAllExpanded; // if all expanded, collapse all (true); if not, expand all (false)
    setCollapsed(prev => {
      const next = { ...prev };
      visibleTables.forEach(t => { next[t.id] = newValue; });
      return next;
    });
  }, [visibleTables, isAllExpanded]);

  // Toggle single table collapse
  const handleToggleCollapse = useCallback((tableId: number) => {
    setCollapsed(prev => ({ ...prev, [tableId]: !prev[tableId] }));
  }, []);

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

  // Render a section of tables (VIP or Standard)
  const renderTableSection = (sectionTables: TableData[], sectionLabel: string) => {
    if (sectionTables.length === 0) return null;
    return (
      <div>
        <h4 className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-3">
          {sectionLabel} {t('seatingTableCount').replace('{count}', String(sectionTables.length))}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {sectionTables.map((table) => (
            <DroppableTable
              key={table.id}
              table={table}
              guests={tableGuestsMap[table.id] || []}
              activeGuest={activeGuest}
              onRemoveGuest={handleRemoveGuest}
              isCollapsed={isTableCollapsed(table.id)}
              onToggleCollapse={() => handleToggleCollapse(table.id)}
              isHighlighted={globalSearch.trim() ? searchResults.matchingTableIds.has(table.id) : false}
              highlightedGuestIds={globalSearch.trim() ? searchResults.matchingGuestIds : undefined}
            />
          ))}
        </div>
      </div>
    );
  };

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

        {/* Search Bar */}
        <SeatingSearchBar
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          resultCount={searchResults.resultCount}
        />

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

            {/* Tables Grid with sections */}
            <div className="lg:col-span-3 panel p-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Tables</h3>
                <p className="text-sm text-neutral-500">
                  Drag guests to tables or between tables
                </p>
              </div>

              {/* Filters bar */}
              <div className="mb-4">
                <SeatingFilters
                  activeFilter={occupancyFilter}
                  onFilterChange={setOccupancyFilter}
                  isAllExpanded={isAllExpanded}
                  onToggleExpandAll={handleToggleExpandAll}
                />
              </div>

              {/* Table sections */}
              {visibleTables.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500">{t('seatingNoResults')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {renderTableSection(vipTables, t('seatingVipSection'))}
                  {renderTableSection(standardTables, t('seatingStandardSection'))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Floor Plan View: 2D visual canvas */
          <FloorPlanEditor
            tables={tables}
            onRefresh={fetchData}
            searchQuery={globalSearch}
            matchingTableIds={searchResults.matchingTableIds}
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
