'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
  // Match "Table N" or "Asztal N" format, skip prefixed names like "VIP Table N"
  const match = name.match(/^(?:Table|Asztal)\s+(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export default function SeatingDisplay() {
  const [tableGuests, setTableGuests] = useState<Map<number, DisplayGuest[]>>(new Map());
  const [checkedInIds, setCheckedInIds] = useState<Set<number>>(new Set());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(3000);
  const mountedRef = useRef(true);

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

  // Use refs to break circular dependency between openEventSource and attemptReconnect
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

    // Close existing
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

  // Keep ref in sync
  openEventSourceRef.current = openEventSource;

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch then open SSE
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

  return (
    <div className="fixed inset-0 overflow-hidden bg-black flex items-center justify-center" style={{ fontFamily: "'Futura', 'Century Gothic', 'Trebuchet MS', sans-serif" }}>
      {/* Aspect-ratio container matching the background image (1920x1280 = 3:2) */}
      <div
        className="relative"
        style={{
          aspectRatio: '1920 / 1280',
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: '100vw',
          height: 'auto',
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
            <a href="https://www.myforgelabs.com/#kapcsolat" target="_blank" rel="noopener noreferrer" className="underline">
              MyForge Labs
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
