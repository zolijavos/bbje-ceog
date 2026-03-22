'use client';

/**
 * FloorPlanCanvas Component
 *
 * The actual Konva canvas rendering for the floor plan.
 * This component is loaded client-side only via lazy loading.
 *
 * Features:
 * - Drag tables to reposition
 * - Resize tables by dragging the resize handle
 * - Zoom and pan the canvas
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, memo, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Circle, Text, Rect, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import type { TableData, Assignment } from '../types';
import { Users, User, UsersFour } from '@phosphor-icons/react';

// Export handle type for parent component to call getStage()
export interface FloorPlanCanvasHandle {
  getStage: () => Konva.Stage | null;
}

// Guest type labels
const GUEST_TYPE_LABELS: Record<string, string> = {
  vip: 'VIP',
  paying_single: 'Paying',
  paying_paired: 'Paired',
};

/**
 * Calculate actual occupied seats for a table
 * Paired guests (paying_paired or paid_paired ticket) count as 2 seats
 * Partners (guests with paired_with_id) are not counted separately - they're included in main guest's count
 */
function calculateOccupiedSeats(assignments: TableData['assignments']): number {
  let seats = 0;
  for (const assignment of assignments) {
    // Skip partner guests - they're counted with their main guest
    if (assignment.guest.paired_with_id) {
      continue;
    }
    // Paired guests take 2 seats
    if (assignment.guest.guest_type === 'paying_paired' ||
        assignment.guest.registration?.ticket_type === 'paid_paired') {
      seats += 2;
    } else {
      seats += 1;
    }
  }
  return seats;
}

// Table type labels
const TABLE_TYPE_LABELS: Record<string, string> = {
  vip: 'VIP table',
  standard: 'Standard table',
  sponsor: 'Sponsor table',
};

// Table type colors - professional muted palette
const TABLE_COLORS: Record<string, string> = {
  vip: '#B8860B',      // Dark Gold (muted)
  standard: '#3e6bb1', // Deep Blue (accent)
  sponsor: '#71717a',  // Gray
};

// Room configuration
interface RoomConfig {
  width: number;   // meters
  height: number;  // meters
  name: string;
}

interface FloorPlanCanvasProps {
  tables: TableData[];
  roomConfig: RoomConfig;
  onTableMove: (tableId: number, xMeters: number, yMeters: number) => void;
  onTableResize?: (tableId: number, newCapacity: number) => void;
  onStageReady?: (stage: Konva.Stage) => void;
  searchQuery?: string;
  matchingTableIds?: Set<number>;
  heatmapLabels?: { empty: string; available: string; partial: string; full: string };
}

// Pixels per meter (scale factor)
const PIXELS_PER_METER = 50;

// Min/max table radius in pixels
const MIN_TABLE_RADIUS = 30;
const MAX_TABLE_RADIUS = 80;

// Capacity range
const MIN_CAPACITY = 4;
const MAX_CAPACITY = 12;

const FloorPlanCanvas = forwardRef<FloorPlanCanvasHandle, FloorPlanCanvasProps>(({
  tables,
  roomConfig,
  onTableMove,
  onTableResize,
  onStageReady,
  searchQuery,
  matchingTableIds,
  heatmapLabels,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [resizingTableId, setResizingTableId] = useState<number | null>(null);
  const [tableRadii, setTableRadii] = useState<Record<number, number>>({});

  // Expose getStage method to parent component
  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
  }));

  // Notify parent when stage is ready (after first render)
  useEffect(() => {
    // Use a small timeout to ensure the Stage component has mounted
    const timer = setTimeout(() => {
      if (stageRef.current && onStageReady) {
        onStageReady(stageRef.current);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [onStageReady]);

  // Spotlight glow animation
  const [glowRadius, setGlowRadius] = useState(0);
  const isSearchActive = !!(searchQuery && searchQuery.trim() && matchingTableIds && matchingTableIds.size > 0);

  // Pulsating glow effect
  useEffect(() => {
    if (!isSearchActive) {
      setGlowRadius(0);
      return;
    }
    const interval = setInterval(() => {
      setGlowRadius(prev => prev === 0 ? 10 : 0);
    }, 800);
    return () => clearInterval(interval);
  }, [isSearchActive]);

  // Auto-pan to single matching table (only when matchingTableIds changes)
  const lastPanRef = useRef<string | null>(null);
  useEffect(() => {
    if (matchingTableIds && matchingTableIds.size === 1 && containerRef.current) {
      const tableId = Array.from(matchingTableIds)[0];
      const panKey = `${tableId}`;
      // Avoid re-panning for the same match
      if (lastPanRef.current === panKey) return;
      lastPanRef.current = panKey;
      const table = tables.find(t => t.id === tableId);
      if (table && table.pos_x != null && table.pos_y != null) {
        const tableX = table.pos_x * PIXELS_PER_METER;
        const tableY = table.pos_y * PIXELS_PER_METER;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const targetScale = 1.5;
        setScale(targetScale);
        setPosition({
          x: width / 2 - tableX * targetScale,
          y: height / 2 - tableY * targetScale,
        });
      }
    } else {
      lastPanRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchingTableIds]);

  // Tooltip state
  const [hoveredTable, setHoveredTable] = useState<TableData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const tooltipHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear tooltip hide timeout
  const clearTooltipTimeout = useCallback(() => {
    if (tooltipHideTimeout.current) {
      clearTimeout(tooltipHideTimeout.current);
      tooltipHideTimeout.current = null;
    }
  }, []);

  // Schedule tooltip hide with delay
  const scheduleTooltipHide = useCallback(() => {
    clearTooltipTimeout();
    tooltipHideTimeout.current = setTimeout(() => {
      if (!isTooltipHovered) {
        setHoveredTable(null);
      }
    }, 800); // 800ms delay before hiding — enough time to reach tooltip for scrolling
  }, [clearTooltipTimeout, isTooltipHovered]);

  // Handle tooltip hover
  const handleTooltipMouseEnter = useCallback(() => {
    clearTooltipTimeout();
    setIsTooltipHovered(true);
  }, [clearTooltipTimeout]);

  const handleTooltipMouseLeave = useCallback(() => {
    setIsTooltipHovered(false);
    setHoveredTable(null);
  }, []);

  // Generate a key based on table data to force re-render when assignments change
  // Uses calculateOccupiedSeats instead of length to detect paired guest seat changes
  const tablesKey = useMemo(() => {
    return tables.map(t => `${t.id}:${calculateOccupiedSeats(t.assignments)}`).join(',');
  }, [tables]);

  // Calculate room dimensions in pixels
  const roomWidthPx = roomConfig.width * PIXELS_PER_METER;
  const roomHeightPx = roomConfig.height * PIXELS_PER_METER;

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setStageSize({ width, height: Math.max(height, 500) });

        // Auto-fit room to container
        const scaleX = (width - 40) / roomWidthPx;
        const scaleY = (height - 40) / roomHeightPx;
        const newScale = Math.min(scaleX, scaleY, 1.5);
        setScale(newScale);

        // Center the room
        setPosition({
          x: (width - roomWidthPx * newScale) / 2,
          y: (height - roomHeightPx * newScale) / 2,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [roomWidthPx, roomHeightPx]);

  // Zoom handler
  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.3), 3);

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [scale, position]);

  // Table drag handler
  const handleTableDragEnd = useCallback((tableId: number, e: any) => {
    const node = e.target;
    const x = node.x();
    const y = node.y();

    // Convert to meters
    const xMeters = x / PIXELS_PER_METER;
    const yMeters = y / PIXELS_PER_METER;

    // Clamp to room bounds
    const clampedX = Math.max(0, Math.min(xMeters, roomConfig.width));
    const clampedY = Math.max(0, Math.min(yMeters, roomConfig.height));

    onTableMove(tableId, clampedX, clampedY);
  }, [onTableMove, roomConfig.width, roomConfig.height]);

  // Get table radius (from local state or capacity)
  const getTableRadius = (table: TableData) => {
    // Use locally stored radius if available (during/after resize)
    if (tableRadii[table.id]) {
      return tableRadii[table.id];
    }
    // Calculate from capacity
    const normalizedCapacity = Math.min(1, Math.max(0, (table.capacity - MIN_CAPACITY) / (MAX_CAPACITY - MIN_CAPACITY)));
    return MIN_TABLE_RADIUS + normalizedCapacity * (MAX_TABLE_RADIUS - MIN_TABLE_RADIUS);
  };

  // Convert radius to capacity
  const radiusToCapacity = (radius: number): number => {
    const normalized = (radius - MIN_TABLE_RADIUS) / (MAX_TABLE_RADIUS - MIN_TABLE_RADIUS);
    const capacity = Math.round(MIN_CAPACITY + normalized * (MAX_CAPACITY - MIN_CAPACITY));
    return Math.min(MAX_CAPACITY, Math.max(MIN_CAPACITY, capacity));
  };

  // Handle resize drag on the resize handle
  const handleResizeDrag = useCallback((tableId: number, e: any) => {
    const node = e.target;
    const stage = node.getStage();
    const pointer = stage.getPointerPosition();

    // Get the table's group position
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const tableX = (table.pos_x ?? 5) * PIXELS_PER_METER;
    const tableY = (table.pos_y ?? 5) * PIXELS_PER_METER;

    // Calculate distance from table center to pointer (accounting for stage transform)
    const dx = (pointer.x - position.x) / scale - tableX;
    const dy = (pointer.y - position.y) / scale - tableY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Clamp the radius
    const newRadius = Math.min(MAX_TABLE_RADIUS, Math.max(MIN_TABLE_RADIUS, distance));

    setTableRadii(prev => ({ ...prev, [tableId]: newRadius }));
  }, [tables, position, scale]);

  // Handle resize end - save to database
  const handleResizeEnd = useCallback((tableId: number) => {
    const radius = tableRadii[tableId];
    if (radius && onTableResize) {
      const newCapacity = radiusToCapacity(radius);
      onTableResize(tableId, newCapacity);
    }
    setResizingTableId(null);
  }, [tableRadii, onTableResize]);

  // Get occupancy color intensity (heatmap)
  const getOccupancyColor = (table: TableData) => {
    const occupied = calculateOccupiedSeats(table.assignments);
    const ratio = occupied / table.capacity;

    if (occupied === 0) return '#9ca3af';   // Empty - gray-400
    if (ratio >= 1) return '#EF4444';       // Full - red
    if (ratio >= 0.5) return '#F59E0B';     // Half+ - orange
    return '#22c55e';                        // <50% - green
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-neutral-200 dark:bg-neutral-900 overflow-hidden border-2 border-neutral-300 dark:border-neutral-600"
      style={{ height: '500px' }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => {
          setPosition({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer key={tablesKey}>
          {/* Room background */}
          <Rect
            x={0}
            y={0}
            width={roomWidthPx}
            height={roomHeightPx}
            fill="#fafafa"
            stroke="#a1a1aa"
            strokeWidth={2}
            cornerRadius={0}
          />

          {/* Grid lines (every 2 meters) */}
          {Array.from({ length: Math.floor(roomConfig.width / 2) + 1 }).map((_, i) => (
            <Rect
              key={`vline-${i}`}
              x={i * 2 * PIXELS_PER_METER}
              y={0}
              width={1}
              height={roomHeightPx}
              fill="#d4d4d8"
            />
          ))}
          {Array.from({ length: Math.floor(roomConfig.height / 2) + 1 }).map((_, i) => (
            <Rect
              key={`hline-${i}`}
              x={0}
              y={i * 2 * PIXELS_PER_METER}
              width={roomWidthPx}
              height={1}
              fill="#d4d4d8"
            />
          ))}

          {/* Tables */}
          {tables.map((table) => {
            const x = (table.pos_x ?? 5) * PIXELS_PER_METER;
            const y = (table.pos_y ?? 5) * PIXELS_PER_METER;
            const radius = getTableRadius(table);
            const color = getOccupancyColor(table);
            const isSelected = selectedTableId === table.id;
            const isResizing = resizingTableId === table.id;
            // Calculate actual occupied seats (paired guests = 2 seats)
            const occupied = calculateOccupiedSeats(table.assignments);
            const displayCapacity = tableRadii[table.id]
              ? radiusToCapacity(tableRadii[table.id])
              : table.capacity;
            // Spotlight logic
            const isMatching = matchingTableIds?.has(table.id) ?? false;
            const spotlightOpacity = isSearchActive ? (isMatching ? 1 : 0.2) : 1;

            return (
              <Group
                key={table.id}
                x={x}
                y={y}
                opacity={spotlightOpacity}
                draggable={!isResizing}
                onDragEnd={(e) => handleTableDragEnd(table.id, e)}
                onClick={() => setSelectedTableId(isSelected ? null : table.id)}
                onTap={() => setSelectedTableId(isSelected ? null : table.id)}
                onMouseEnter={(e) => {
                  clearTooltipTimeout();
                  const stage = e.target.getStage();
                  if (stage) {
                    const container = stage.container();
                    if (container) container.style.cursor = 'pointer';
                    const pointer = stage.getPointerPosition();
                    if (pointer) {
                      setTooltipPosition({ x: pointer.x + 15, y: pointer.y + 15 });
                      setHoveredTable(table);
                    }
                  }
                }}
                onMouseMove={(e) => {
                  const stage = e.target.getStage();
                  if (stage && hoveredTable?.id === table.id) {
                    const pointer = stage.getPointerPosition();
                    if (pointer) {
                      setTooltipPosition({ x: pointer.x + 15, y: pointer.y + 15 });
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  const stage = e.target.getStage();
                  if (stage) {
                    const container = stage.container();
                    if (container) container.style.cursor = 'default';
                  }
                  scheduleTooltipHide();
                }}
              >
                {/* Spotlight glow ring */}
                {isSearchActive && isMatching && (
                  <Circle
                    x={0}
                    y={0}
                    radius={radius + glowRadius}
                    stroke="#facc15"
                    strokeWidth={3}
                    listening={false}
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <Circle
                    x={0}
                    y={0}
                    radius={radius + 8}
                    stroke="#3e6bb1"
                    strokeWidth={3}
                    dash={[8, 4]}
                  />
                )}

                {/* Table circle */}
                <Circle
                  x={0}
                  y={0}
                  radius={radius}
                  fill={color}
                  stroke={isSelected ? '#142d5c' : '#3f3f46'}
                  strokeWidth={isSelected ? 3 : 2}
                  shadowColor="black"
                  shadowBlur={4}
                  shadowOpacity={0.15}
                  shadowOffsetY={2}
                />

                {/* Table name */}
                <Text
                  x={-radius}
                  y={-12}
                  width={radius * 2}
                  text={table.name}
                  fontSize={12}
                  fontStyle="bold"
                  fill="#18181b"
                  align="center"
                />

                {/* Occupancy */}
                <Text
                  x={-radius}
                  y={4}
                  width={radius * 2}
                  text={`${occupied}/${displayCapacity}`}
                  fontSize={14}
                  fontStyle="bold"
                  fill={occupied >= table.capacity ? '#FFFFFF' : '#27272a'}
                  align="center"
                />

                {/* Capacity indicator (chairs around table) */}
                {Array.from({ length: displayCapacity }).map((_, i) => {
                  const angle = (i / displayCapacity) * Math.PI * 2 - Math.PI / 2;
                  const chairX = Math.cos(angle) * (radius + 12);
                  const chairY = Math.sin(angle) * (radius + 12);
                  const isOccupied = i < occupied;

                  return (
                    <Circle
                      key={i}
                      x={chairX}
                      y={chairY}
                      radius={6}
                      fill={isOccupied ? '#059669' : '#d4d4d8'}
                      stroke="#71717a"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Resize handle - only visible when selected */}
                {isSelected && (
                  <Circle
                    x={radius}
                    y={0}
                    radius={10}
                    fill="#3e6bb1"
                    stroke="#142d5c"
                    strokeWidth={2}
                    draggable
                    onDragStart={() => setResizingTableId(table.id)}
                    onDragMove={(e) => handleResizeDrag(table.id, e)}
                    onDragEnd={() => handleResizeEnd(table.id)}
                    onMouseEnter={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = 'ew-resize';
                    }}
                    onMouseLeave={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = 'default';
                    }}
                  />
                )}

                {/* Resize indicator arrow */}
                {isSelected && (
                  <Text
                    x={radius - 5}
                    y={-6}
                    text="<>"
                    fontSize={10}
                    fill="#FFFFFF"
                    fontStyle="bold"
                    listening={false}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Tooltip overlay - interactive for scrolling, smart positioning, generous hover zone */}
      {hoveredTable && (() => {
        // Smart positioning: calculate optimal position based on container bounds
        const tooltipWidth = 340;
        const tooltipMaxHeight = 420; // Generous max height for long guest lists
        const offset = 10; // Closer to cursor for easier reach

        // Determine horizontal position
        const showLeft = tooltipPosition.x > stageSize.width - tooltipWidth - offset;
        const left = showLeft
          ? Math.max(10, tooltipPosition.x - tooltipWidth - offset)
          : Math.min(tooltipPosition.x + offset, stageSize.width - tooltipWidth - 10);

        // Determine vertical position
        const showAbove = tooltipPosition.y > stageSize.height - tooltipMaxHeight - offset;
        const top = showAbove
          ? Math.max(10, tooltipPosition.y - tooltipMaxHeight - offset)
          : Math.min(tooltipPosition.y + offset, stageSize.height - tooltipMaxHeight - 10);

        return (
        <div
          className="absolute z-50"
          style={{ left: left - 12, top: top - 12 }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
        {/* Invisible padding for easier mouse access */}
        <div
          className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-xl p-4 min-w-[240px] max-w-[340px] m-3"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            <Users size={20} weight="duotone" className="text-neutral-500 dark:text-neutral-400" />
            <div>
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm">{hoveredTable.name}</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{TABLE_TYPE_LABELS[hoveredTable.type] || hoveredTable.type}</p>
            </div>
          </div>

          {/* Occupancy */}
          {(() => {
            const occupiedSeats = calculateOccupiedSeats(hoveredTable.assignments);
            return (
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Occupancy:</span>
                <span className={`font-semibold ${
                  occupiedSeats >= hoveredTable.capacity
                    ? 'text-red-600'
                    : occupiedSeats > 0
                      ? 'text-emerald-600'
                      : 'text-neutral-500'
                }`}>
                  {occupiedSeats} / {hoveredTable.capacity} seats
                </span>
              </div>
            );
          })()}

          {/* Guest list - scrollable */}
          {hoveredTable.assignments.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Guests:</p>
              <ul className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                {hoveredTable.assignments
                  .filter(a => !a.guest.paired_with_id) // Only show main guests, not partners
                  .map((assignment) => {
                    const isPaired = assignment.guest.guest_type === 'paying_paired';
                    const partnerName = assignment.guest.registration?.partner_first_name
                      ? `${assignment.guest.registration.partner_first_name} ${assignment.guest.registration.partner_last_name || ''}`.trim()
                      : null;
                    const guestName = `${assignment.guest.first_name || ''} ${assignment.guest.last_name || ''}`.trim() || 'Unknown';

                    return (
                      <li key={assignment.id} className="flex items-start gap-2 text-sm">
                        {isPaired ? (
                          <UsersFour size={16} weight="duotone" className="text-purple-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <User size={16} weight="duotone" className="text-blue-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{guestName}</p>
                          {isPaired && partnerName && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">+ {partnerName}</p>
                          )}
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                          assignment.guest.guest_type === 'invited'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                            : assignment.guest.guest_type === 'paying_paired'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {GUEST_TYPE_LABELS[assignment.guest.guest_type] || assignment.guest.guest_type}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">No assigned guests</p>
          )}
        </div>
        </div>
        );
      })()}

      {/* Heatmap legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-neutral-200 dark:border-neutral-600">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Heatmap:</span>
        {[
          { color: '#9ca3af', label: heatmapLabels?.empty ?? 'Empty' },
          { color: '#22c55e', label: heatmapLabels?.available ?? 'Available' },
          { color: '#F59E0B', label: heatmapLabels?.partial ?? 'Partial' },
          { color: '#EF4444', label: heatmapLabels?.full ?? 'Full' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-neutral-600 dark:text-neutral-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// Set display name for debugging
FloorPlanCanvas.displayName = 'FloorPlanCanvas';

// Memoize component to prevent unnecessary re-renders when parent state changes
// Only re-render when tables data, roomConfig, or callbacks actually change
export default memo(FloorPlanCanvas);
