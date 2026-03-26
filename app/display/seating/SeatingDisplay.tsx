'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowsOut, ArrowsIn, Plus, Minus } from '@phosphor-icons/react';

// Table position mapping (calibrated from mockup, center-based with translateX(-50%))
const TABLE_POSITIONS: Record<number, { top: string; left: string }> = {
  1:  { top: '16%',   left: '7.5%' },
  2:  { top: '16%',   left: '18.5%' },
  3:  { top: '16%',   left: '82%' },
  4:  { top: '16%',   left: '93%' },
  5:  { top: '36.5%', left: '7.5%' },
  6:  { top: '36.5%', left: '18.5%' },
  7:  { top: '36.5%', left: '82%' },
  8:  { top: '36.5%', left: '93%' },
  9:  { top: '58.5%', left: '7.5%' },
  10: { top: '58.5%', left: '19.5%' },
  11: { top: '58.5%', left: '32%' },
  12: { top: '58.5%', left: '44%' },
  13: { top: '58.5%', left: '56%' },
  14: { top: '58.5%', left: '68.5%' },
  15: { top: '58.5%', left: '81%' },
  16: { top: '58.5%', left: '93%' },
  17: { top: '78%',   left: '7.5%' },
  18: { top: '78%',   left: '20%' },
  19: { top: '78%',   left: '32%' },
  20: { top: '78%',   left: '44%' },
  21: { top: '78%',   left: '56%' },
  22: { top: '78%',   left: '68.5%' },
  23: { top: '78%',   left: '80.5%' },
  24: { top: '78%',   left: '93%' },
};

// Table positions as numeric fractions for click-to-zoom hit detection
const TABLE_POSITIONS_NUMERIC = Object.entries(TABLE_POSITIONS).map(([num, pos]) => ({
  num: parseInt(num),
  x: parseFloat(pos.left) / 100,
  y: parseFloat(pos.top) / 100,
}));

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const TABLE_ZOOM = 2.5; // Zoom level when clicking a table
const CLICK_THRESHOLD_MS = 200; // Max time for a click (vs drag)
const CLICK_THRESHOLD_PX = 5;  // Max movement for a click (vs drag)
const TABLE_HIT_RADIUS = 0.06; // % of container size for table hit detection

interface DisplayGuest {
  id: number;
  firstName: string;
  lastName: string;
  checkedIn: boolean;
}

interface TableDisplayData {
  id: number;
  name: string;
  guests: DisplayGuest[];
}

interface SeatingDisplayResponse {
  tables: TableDisplayData[];
  checkinStats: { checkedIn: number; total: number };
}

interface DisplayCheckinEvent {
  type: 'DISPLAY_CHECKED_IN';
  guestId: number;
  guestName: string;
  tableName: string | null;
  tableType: string | null;
  seatNumber: number | null;
  checkedInAt: string;
  dietaryRequirements: string | null;
  title: string | null;
  guestType: string;
}

function parseTableNumber(name: string): number | null {
  const match = name.match(/^(?:Table|Asztal)\s+(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export default function SeatingDisplay() {
  const [tableGuests, setTableGuests] = useState<Map<number, DisplayGuest[]>>(new Map());
  const [checkedInIds, setCheckedInIds] = useState<Set<number>>(new Set());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fullscreen & controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [focusedTable, setFocusedTable] = useState<number | null>(null);
  const [smoothTransition, setSmoothTransition] = useState(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const mouseDownTimeRef = useRef(0);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(3000);
  const mountedRef = useRef(true);

  // --- Controls auto-hide on mouse move ---
  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  // --- Reset zoom ---
  const resetZoom = useCallback(() => {
    setSmoothTransition(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFocusedTable(null);
    setTimeout(() => setSmoothTransition(false), 400);
  }, []);

  // --- Zoom to a specific table ---
  const zoomToTable = useCallback((tableNum: number) => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const tablePos = TABLE_POSITIONS_NUMERIC.find(t => t.num === tableNum);
    if (!tablePos) return;

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    // Target point in content space
    const targetX = tablePos.x * contentRect.width;
    const targetY = tablePos.y * contentRect.height;

    // Center of viewport
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    // Pan to center the table at TABLE_ZOOM
    const newPanX = centerX - targetX * TABLE_ZOOM;
    const newPanY = centerY - targetY * TABLE_ZOOM;

    setSmoothTransition(true);
    setZoom(TABLE_ZOOM);
    setPan({ x: newPanX, y: newPanY });
    setFocusedTable(tableNum);
    setTimeout(() => setSmoothTransition(false), 400);
  }, []);

  // --- Find nearest table to a click point ---
  const findNearestTable = useCallback((clientX: number, clientY: number): number | null => {
    const content = contentRef.current;
    if (!content) return null;

    const rect = content.getBoundingClientRect();
    const clickX = (clientX - rect.left) / rect.width;
    const clickY = (clientY - rect.top) / rect.height;

    let nearest: number | null = null;
    let minDist = TABLE_HIT_RADIUS;

    for (const t of TABLE_POSITIONS_NUMERIC) {
      const dx = clickX - t.x;
      const dy = clickY - t.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = t.num;
      }
    }

    return nearest;
  }, []);

  // --- Fullscreen ---
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // --- Zoom (Ctrl+wheel only, pinch still works) ---
  const applyZoom = useCallback((newZoom: number, clientX: number, clientY: number) => {
    setFocusedTable(null);
    setZoom(prev => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
      if (clamped === 1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      const scale = clamped / prev;
      setPan(p => ({
        x: clientX - (clientX - p.x) * scale,
        y: clientY - (clientY - p.y) * scale,
      }));
      return clamped;
    });
  }, []);

  // +/- button zoom (zooms toward center)
  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    applyZoom(zoom * 1.3, rect.width / 2, rect.height / 2);
    showControlsBriefly();
  }, [zoom, applyZoom, showControlsBriefly]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    applyZoom(zoom / 1.3, rect.width / 2, rect.height / 2);
    showControlsBriefly();
  }, [zoom, applyZoom, showControlsBriefly]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Only zoom with Ctrl/Meta key held (standard convention)
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      applyZoom(zoom * factor, e.clientX, e.clientY);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [zoom, applyZoom]);

  // Pinch-to-zoom via touch
  const lastTouchDistRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && zoom > 1) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panOffsetRef.current = { ...pan };
    }
  }, [zoom, pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistRef.current !== null && lastTouchCenterRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / lastTouchDistRef.current;
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      applyZoom(zoom * scale, center.x, center.y);
      lastTouchDistRef.current = dist;
      lastTouchCenterRef.current = center;
    } else if (e.touches.length === 1 && zoom > 1 && isPanningRef.current) {
      const dx = e.touches[0].clientX - panStartRef.current.x;
      const dy = e.touches[0].clientY - panStartRef.current.y;
      setPan({ x: panOffsetRef.current.x + dx, y: panOffsetRef.current.y + dy });
    }
  }, [zoom, applyZoom]);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistRef.current = null;
    lastTouchCenterRef.current = null;
    isPanningRef.current = false;
  }, []);

  // --- Mouse down/up/move: pan when zoomed, click-to-zoom on tables ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownTimeRef.current = Date.now();
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    if (zoom > 1) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOffsetRef.current = { ...pan };
    }
  }, [zoom, pan]);

  const handleMouseMovePan = useCallback((e: React.MouseEvent) => {
    showControlsBriefly();
    if (!isPanningRef.current || zoom <= 1) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({ x: panOffsetRef.current.x + dx, y: panOffsetRef.current.y + dy });
  }, [zoom, showControlsBriefly]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const wasPanning = isPanningRef.current;
    isPanningRef.current = false;

    // Detect click (short duration + small movement)
    const elapsed = Date.now() - mouseDownTimeRef.current;
    const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
    const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);

    if (elapsed < CLICK_THRESHOLD_MS && dx < CLICK_THRESHOLD_PX && dy < CLICK_THRESHOLD_PX) {
      // Click detected — find nearest table
      const tableNum = findNearestTable(e.clientX, e.clientY);

      if (tableNum !== null) {
        if (focusedTable === tableNum) {
          // Already focused on this table — reset zoom
          resetZoom();
        } else {
          // Zoom to this table
          zoomToTable(tableNum);
        }
      } else if (zoom > 1) {
        // Clicked empty area while zoomed — reset
        resetZoom();
      }
    }
  }, [findNearestTable, focusedTable, zoom, resetZoom, zoomToTable]);

  const handleMouseLeave = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // --- Keyboard: F for fullscreen, +/- for zoom, Escape to reset ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === 'Escape' && zoom > 1) resetZoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFullscreen, zoomIn, zoomOut, zoom, resetZoom]);

  // --- Data fetching & SSE ---
  const fetchData = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/seating-display-data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SeatingDisplayResponse = await res.json();

      if (!mountedRef.current) return false;

      const newMap = new Map<number, DisplayGuest[]>();
      const newCheckedIn = new Set<number>();

      data.tables.forEach((table) => {
        const num = parseTableNumber(table.name);
        if (num === null) {
          console.warn('Table name not mappable:', table.name);
          return;
        }
        newMap.set(num, table.guests);
        table.guests.forEach((g) => {
          if (g.checkedIn) newCheckedIn.add(g.id);
        });
      });

      setTableGuests(newMap);
      setCheckedInIds(newCheckedIn);
      setTotal(data.checkinStats.total);
      setError(null);
      setLoading(false);
      return true;
    } catch (err) {
      if (!mountedRef.current) return false;
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
      return false;
    }
  }, []);

  const openEventSourceRef = useRef<() => void>(() => {});

  const attemptReconnect = useCallback(() => {
    const delay = reconnectDelayRef.current;
    reconnectDelayRef.current = Math.min(delay * 2, 60000);
    console.warn(`[SeatingDisplay] SSE error, reconnecting in ${delay}ms`);

    reconnectRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      const success = await fetchData();
      if (success) {
        reconnectDelayRef.current = 3000;
        openEventSourceRef.current();
      } else {
        attemptReconnect();
      }
    }, delay);
  }, [fetchData]);

  const openEventSource = useCallback(() => {
    if (!mountedRef.current) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/admin/display-stream');
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: DisplayCheckinEvent = JSON.parse(event.data);
        if (data.type === 'DISPLAY_CHECKED_IN') {
          setCheckedInIds((prev) => {
            const next = new Set(prev);
            next.add(data.guestId);
            return next;
          });
        }
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      if (!mountedRef.current) return;
      attemptReconnect();
    };
  }, [attemptReconnect]);

  openEventSourceRef.current = openEventSource;

  useEffect(() => {
    mountedRef.current = true;

    fetchData().then((success) => {
      if (success && mountedRef.current) {
        openEventSource();
      }
    });

    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
    };
  }, [fetchData, openEventSource]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white text-2xl" style={{ fontFamily: "'Futura', 'Century Gothic', 'Trebuchet MS', sans-serif" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (error && tableGuests.size === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-red-400 text-2xl" style={{ fontFamily: "'Futura', 'Century Gothic', 'Trebuchet MS', sans-serif" }}>
          Error: {error}
        </p>
      </div>
    );
  }

  const isZoomed = zoom > 1;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-black flex items-center justify-center select-none"
      style={{
        fontFamily: "'Futura', 'Century Gothic', 'Trebuchet MS', sans-serif",
        cursor: isZoomed ? (isPanningRef.current ? 'grabbing' : 'grab') : 'pointer',
      }}
      onMouseMove={handleMouseMovePan}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Aspect-ratio container matching the background image (1920x1280 = 3:2) */}
      <div
        ref={contentRef}
        className="relative"
        style={{
          aspectRatio: '1920 / 1280',
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: '100vw',
          height: 'auto',
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: '0 0',
          transition: smoothTransition ? 'transform 0.4s ease-out' : (isPanningRef.current ? 'none' : 'transform 0.1s ease-out'),
        }}
      >
        {/* Background image fills the container exactly */}
        <img
          src="/images/ceo_gala_asztalterv_FINAL_ures_1.png"
          alt="Seating plan"
          className="absolute inset-0 w-full h-full"
          draggable={false}
        />

        {/* Check-in counter */}
        <div
          className="absolute top-[2%] right-[2%] z-10"
          style={{ fontSize: '1.25vw', fontWeight: 'bold', color: '#000000' }}
        >
          {checkedInIds.size}/{total} CHECKED IN
        </div>

        {/* Table overlays — positioned relative to the image container */}
        {Array.from(tableGuests.entries()).map(([tableNum, guests]) => {
          const pos = TABLE_POSITIONS[tableNum];
          if (!pos) return null;

          return (
            <div
              key={tableNum}
              className="absolute"
              style={{
                top: pos.top,
                left: pos.left,
                transform: 'translateX(-50%)',
                fontSize: '0.54vw',
                lineHeight: '1.5',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {guests.map((guest) => {
                const isCheckedIn = checkedInIds.has(guest.id);
                return (
                  <div
                    key={guest.id}
                    style={{
                      fontStyle: isCheckedIn ? 'normal' : 'italic',
                      fontWeight: isCheckedIn ? 'bold' : 'normal',
                      color: isCheckedIn ? '#000000' : '#737373',
                      transition: 'all 0.8s ease',
                    }}
                  >
                    {guest.lastName} {guest.firstName}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* Compact branding */}
        <div className="absolute bottom-[0.5%] left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 opacity-50">
          <span style={{ fontSize: '0.55vw', color: '#444' }}>
            Built by{' '}
            <a href="https://www.myforgelabs.com/#kapcsolat" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#333' }}>
              MyForge Labs
            </a>
          </span>
        </div>
      </div>

      {/* Controls panel — auto-hide */}
      <div
        className="fixed bottom-6 right-6 z-50 flex gap-2 transition-opacity duration-500"
        style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
      >
        {isZoomed && (
          <button
            onClick={(e) => { e.stopPropagation(); resetZoom(); }}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
            title="Reset zoom (Escape)"
          >
            <span style={{ fontSize: '14px', fontWeight: 600 }}>1:1</span>
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          title="Zoom out (-)"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          title="Zoom in (+)"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          className="bg-black/60 hover:bg-black/80 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? <ArrowsIn size={20} /> : <ArrowsOut size={20} />}
        </button>
      </div>

      {/* Zoom indicator — shows briefly when zoomed */}
      {isZoomed && showControls && (
        <div className="fixed top-6 right-6 z-50 bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-sm text-sm transition-opacity duration-500">
          {Math.round(zoom * 100)}%
          {focusedTable !== null && ` · Table ${focusedTable}`}
        </div>
      )}
    </div>
  );
}
