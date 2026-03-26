'use client';

import { useEffect, useState, useCallback } from 'react';
import { Printer, ArrowLeft } from '@phosphor-icons/react';
import Link from 'next/link';

interface DisplayGuest {
  id: number;
  firstName: string;
  lastName: string;
  title: string | null;
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

function parseTableNumber(name: string): number | null {
  const match = name.match(/^(?:Table|Asztal)\s+(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export default function PrintableSeating() {
  const [tables, setTables] = useState<TableDisplayData[]>([]);
  const [stats, setStats] = useState({ checkedIn: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/seating-display-data');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SeatingDisplayResponse = await res.json();

        // Sort tables by number
        const sorted = [...data.tables].sort((a, b) => {
          const numA = parseTableNumber(a.name) ?? 999;
          const numB = parseTableNumber(b.name) ?? 999;
          return numA - numB;
        });

        // Sort guests within each table alphabetically
        sorted.forEach(t => {
          t.guests.sort((a, b) => a.lastName.localeCompare(b.lastName, 'hu'));
        });

        setTables(sorted);
        setStats(data.checkinStats);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  const now = new Date().toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; font-size: 11px; }
          @page { margin: 1cm 1cm 1.2cm 1cm; size: A4; }
          .page-break { break-inside: avoid; }
          .print-page-break { break-after: page; }
          .print-content { padding: 0 !important; }
          .print-header h1 { font-size: 16px !important; margin-bottom: 2px !important; }
          .print-header p { font-size: 10px !important; }
          .print-grid { gap: 6px !important; }
          .print-table { padding: 6px !important; }
          .print-table h2 { font-size: 12px !important; }
          .print-table ol { font-size: 11px !important; }
          .print-table li { margin: 0 !important; }
          .print-branding { margin-top: 4px; }
        }
        @media screen {
          .print-branding { margin-top: 8px; }
        }
      `}</style>

      {/* Top bar — hidden in print */}
      <div className="no-print sticky top-0 z-50 bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
        <Link href="/display/seating" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          <span>Back to Live Display</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{tables.length} tables, {stats.total} guests</span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-content max-w-[210mm] mx-auto px-8 py-6">
        {/* Header */}
        <div className="print-header text-center mb-6">
          <h1 className="text-2xl font-bold">CEO Gala — Seating Plan / Ülésrend</h1>
          <p className="text-sm text-gray-500 mt-1">{now} — {stats.total} guests / vendég, {tables.length} tables / asztal</p>
        </div>

        {/* Tables — 6 per page (3 rows × 2 columns), explicit page breaks */}
        {Array.from({ length: Math.ceil(tables.length / 6) }, (_, pageIdx) => {
          const pageTables = tables.slice(pageIdx * 6, (pageIdx + 1) * 6);
          const isLastPage = pageIdx === Math.ceil(tables.length / 6) - 1;
          return (
            <div key={pageIdx} className={isLastPage ? '' : 'print-page-break'}>
              <div className="print-grid grid grid-cols-2 gap-4">
                {pageTables.map((table) => {
                  const tableNum = parseTableNumber(table.name);
                  return (
                    <div key={table.id} className="print-table border border-gray-300 rounded-lg p-3">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                        <h2 className="text-base font-bold">
                          {tableNum !== null ? `Table ${tableNum}` : table.name}
                        </h2>
                        <span className="text-xs text-gray-500">{table.guests.length} guests</span>
                      </div>
                      {table.guests.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Empty / Üres</p>
                      ) : (
                        <ol className="text-sm space-y-0">
                          {table.guests.map((guest, idx) => (
                            <li key={guest.id} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-4 text-right">{idx + 1}.</span>
                              <span className={guest.checkedIn ? 'font-semibold' : ''}>
                                {guest.title ? `${guest.title} ` : ''}{guest.lastName} {guest.firstName}
                              </span>
                              {guest.checkedIn && (
                                <span className="text-xs text-green-600">✓</span>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400 border-t pt-3">
          Generated {now} — CEO Gala Event Registration System
        </div>
        {/* Branding — printed on every page footer via fixed positioning */}
        <div className="print-branding" style={{ fontSize: '9px', color: '#bbb', textAlign: 'center' }}>
          Built by MyForge Labs
        </div>
      </div>
    </>
  );
}
