'use client';

/**
 * FloorPlanEditor Component
 *
 * 2D visual floor plan with round tables that can be:
 * - Dragged to reposition
 * - Color-coded by type (VIP=gold, Standard=blue)
 *
 * Room dimensions are configurable.
 * Supports zoom and pan for large venues.
 * Exportable as PNG or PDF.
 */

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { jsPDF } from 'jspdf';
import { logError } from '@/lib/utils/logger';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { TableData } from '../types';

// Professional SVG Icons
const Icons = {
  settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="square" strokeLinejoin="miter" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  table: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  move: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="square" d="M7 11V7a5 5 0 0 1 10 0v4M12 12v7m-5-4h10" />
    </svg>
  ),
  resize: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="square" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  pdf: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
};

// Dynamic import with SSR disabled - required for react-konva
const FloorPlanCanvas = dynamic(() => import('./FloorPlanCanvas'), {
  ssr: false,
  loading: () => (
    <div className="bg-neutral-200 p-8 text-center" style={{ height: '500px' }}>
      <div className="spinner mx-auto mb-4" />
      <p className="text-neutral-500 text-sm">Loading canvas...</p>
    </div>
  ),
});

// Table type colors - muted professional palette
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

// Simplified props - component handles its own state and API calls
interface FloorPlanEditorProps {
  tables: TableData[];
  onRefresh?: () => void;
}

// Local storage key for room config
const ROOM_CONFIG_KEY = 'ceog-room-config';

// Default room configuration
const DEFAULT_ROOM_CONFIG: RoomConfig = {
  width: 20,
  height: 15,
  name: 'Ballroom',
};

export function FloorPlanEditor({
  tables,
  onRefresh,
}: FloorPlanEditorProps) {
  const { t } = useLanguage();
  const [stageInstance, setStageInstance] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Callback to receive stage instance from canvas
  const handleStageReady = useCallback((stage: any) => {
    setStageInstance(stage);
  }, []);

  // Room configuration state
  const [roomConfig, setRoomConfig] = useState<RoomConfig>(DEFAULT_ROOM_CONFIG);
  const [localRoomConfig, setLocalRoomConfig] = useState<RoomConfig>(DEFAULT_ROOM_CONFIG);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-export-menu]')) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  // Clear export success message after 3 seconds
  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => setExportSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  // Export floor plan as PNG
  const exportAsPNG = useCallback(() => {
    if (!stageInstance) {
      console.error('Stage not available');
      setError('Canvas not ready. Please wait and try again.');
      setShowExportMenu(false);
      return;
    }
    const stage = stageInstance;

    try {
      // Temporarily reset stage position and scale for full export
      const oldScale = stage.scaleX();
      const oldPosition = { x: stage.x(), y: stage.y() };

      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });

      const dataURL = stage.toDataURL({
        pixelRatio: 2, // High quality
        mimeType: 'image/png',
      });

      // Restore original position and scale
      stage.scale({ x: oldScale, y: oldScale });
      stage.position(oldPosition);

      // Create download link
      const link = document.createElement('a');
      link.download = `floor-plan-${roomConfig.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataURL;
      link.click();

      setExportSuccess(t('floorPlanExported'));
      setShowExportMenu(false);
    } catch (err) {
      logError('Failed to export PNG:', err);
      setError('Failed to export PNG');
    }
  }, [roomConfig.name, t, stageInstance]);

  // Export floor plan as PDF
  const exportAsPDF = useCallback(() => {
    if (!stageInstance) {
      console.error('Stage not available');
      setError('Canvas not ready. Please wait and try again.');
      setShowExportMenu(false);
      return;
    }
    const stage = stageInstance;

    try {
      // Temporarily reset stage position and scale for full export
      const oldScale = stage.scaleX();
      const oldPosition = { x: stage.x(), y: stage.y() };

      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });

      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png',
      });

      // Restore original position and scale
      stage.scale({ x: oldScale, y: oldScale });
      stage.position(oldPosition);

      // Create PDF (landscape A4)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // A4 landscape dimensions: 297mm x 210mm
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2) - 30; // Reserve space for header

      // Add header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(roomConfig.name, margin, margin + 5);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${roomConfig.width}m x ${roomConfig.height}m`, margin, margin + 12);
      pdf.text(new Date().toLocaleDateString(), pageWidth - margin - 30, margin + 5);

      // Add table count
      const tableCount = tables.length;
      const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
      const totalAssigned = tables.reduce((sum, t) => sum + t.assignments.length, 0);
      pdf.text(`Tables: ${tableCount} | Capacity: ${totalCapacity} | Assigned: ${totalAssigned}`, margin, margin + 19);

      // Add floor plan image
      const imgWidth = stage.width();
      const imgHeight = stage.height();
      const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const imgX = margin + (contentWidth - scaledWidth) / 2;
      const imgY = margin + 25;

      pdf.addImage(dataURL, 'PNG', imgX, imgY, scaledWidth, scaledHeight);

      // Add legend at bottom
      const legendY = pageHeight - margin - 5;
      pdf.setFontSize(8);
      pdf.setFillColor(184, 134, 11); // VIP gold
      pdf.rect(margin, legendY - 3, 4, 4, 'F');
      pdf.text('VIP', margin + 6, legendY);

      pdf.setFillColor(62, 107, 177); // Standard blue
      pdf.rect(margin + 25, legendY - 3, 4, 4, 'F');
      pdf.text('Standard', margin + 31, legendY);

      pdf.setFillColor(113, 113, 122); // Sponsor gray
      pdf.rect(margin + 60, legendY - 3, 4, 4, 'F');
      pdf.text('Sponsor', margin + 66, legendY);

      // Save PDF
      pdf.save(`floor-plan-${roomConfig.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);

      setExportSuccess(t('floorPlanExported'));
      setShowExportMenu(false);
    } catch (err) {
      logError('Failed to export PDF:', err);
      setError('Failed to export PDF');
    }
  }, [roomConfig, tables, t, stageInstance]);

  // Load room config from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ROOM_CONFIG_KEY);
      if (saved) {
        try {
          const config = JSON.parse(saved);
          setRoomConfig(config);
          setLocalRoomConfig(config);
        } catch {
          // Use default
        }
      }
    }
    setIsClient(true);
  }, []);

  // Save table position via API
  const saveTablePosition = useCallback(async (tableId: number, xMeters: number, yMeters: number) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tables/${tableId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pos_x: Math.round(xMeters * 10) / 10,
          pos_y: Math.round(yMeters * 10) / 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error saving');
      }

      // Refresh parent data
      onRefresh?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      logError('Failed to save table position:', err);
    } finally {
      setSaving(false);
    }
  }, [onRefresh]);

  // Save table capacity (resize) via API
  const saveTableCapacity = useCallback(async (tableId: number, newCapacity: number) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: newCapacity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error saving capacity');
      }

      // Refresh parent data
      onRefresh?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
      logError('Failed to save table capacity:', err);
    } finally {
      setSaving(false);
    }
  }, [onRefresh]);

  // Save room config
  const handleSaveRoomConfig = () => {
    setRoomConfig(localRoomConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROOM_CONFIG_KEY, JSON.stringify(localRoomConfig));
    }
    setShowSettings(false);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isClient) {
    return (
      <div className="panel p-8 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-neutral-500 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Error Toast */}
      {error && (
        <div className="bg-red-600 text-white px-4 py-3 border-l-4 border-red-800 animate-slide-up">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Toast */}
      {exportSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-3 border-l-4 border-emerald-800 animate-slide-up">
          <p className="text-sm font-medium">{exportSuccess}</p>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="bg-accent-50 text-accent-800 px-4 py-2 border-l-4 border-accent-600 flex items-center gap-3 animate-slide-up">
          <div className="spinner" style={{ width: '16px', height: '16px' }} />
          <span className="text-sm font-medium">Saving...</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="panel flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-neutral-800">{t('floorPlan')}</h3>
          <span className="text-sm text-neutral-500 border-l border-neutral-300 pl-4">
            {roomConfig.name} ({roomConfig.width}m × {roomConfig.height}m)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative" data-export-menu>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`icon-btn flex items-center gap-1.5 ${showExportMenu ? 'icon-btn-active' : ''}`}
              title={t('exportFloorPlan')}
            >
              {Icons.download}
              {Icons.chevronDown}
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px] animate-fade-in">
                <button
                  onClick={exportAsPNG}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  {Icons.image}
                  {t('exportAsPNG')}
                </button>
                <button
                  onClick={exportAsPDF}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  {Icons.pdf}
                  {t('exportAsPDF')}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`icon-btn ${showSettings ? 'icon-btn-active' : ''}`}
            title="Room Settings"
          >
            {Icons.settings}
          </button>
        </div>
      </div>

      {/* Room Settings Panel */}
      {showSettings && (
        <div className="panel p-5 animate-slide-up">
          <h4 className="font-semibold text-neutral-800 mb-4">Room Settings</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 uppercase tracking-wide mb-2">Room Name</label>
              <input
                type="text"
                value={localRoomConfig.name}
                onChange={(e) => setLocalRoomConfig({ ...localRoomConfig, name: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 uppercase tracking-wide mb-2">Width (m)</label>
              <input
                type="number"
                min={5}
                max={100}
                value={localRoomConfig.width}
                onChange={(e) => setLocalRoomConfig({ ...localRoomConfig, width: parseInt(e.target.value) || 20 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 uppercase tracking-wide mb-2">Length (m)</label>
              <input
                type="number"
                min={5}
                max={100}
                value={localRoomConfig.height}
                onChange={(e) => setLocalRoomConfig({ ...localRoomConfig, height: parseInt(e.target.value) || 15 })}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3 border-t border-neutral-200 pt-4">
            <button
              onClick={handleSaveRoomConfig}
              className="btn btn-primary"
            >
              Save
            </button>
            <button
              onClick={() => {
                setLocalRoomConfig(roomConfig);
                setShowSettings(false);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="panel flex items-center gap-6 text-sm px-5 py-3">
        <span className="font-semibold text-neutral-700 uppercase text-xs tracking-wide">Legend</span>
        <div className="h-4 w-px bg-neutral-300" />
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#B8860B]" />
          <span className="text-neutral-600">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-accent-600" />
          <span className="text-neutral-600">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-neutral-500" />
          <span className="text-neutral-600">Sponsor</span>
        </div>
        <div className="h-4 w-px bg-neutral-300" />
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-neutral-600">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-neutral-300" />
          <span className="text-neutral-600">Empty</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-neutral-600">Full</span>
        </div>
      </div>

      {/* Canvas Container */}
      <FloorPlanCanvas
        tables={tables}
        roomConfig={roomConfig}
        onTableMove={saveTablePosition}
        onTableResize={saveTableCapacity}
        onStageReady={handleStageReady}
      />

      {/* Instructions */}
      <div className="panel p-4 border-l-4 border-accent-600">
        <h4 className="font-semibold text-neutral-800 text-sm mb-3 uppercase tracking-wide">Instructions</h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-neutral-600">
          <div className="flex items-start gap-2">
            <span className="text-accent-600 font-bold">1.</span>
            <span>Scroll to zoom in/out</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-600 font-bold">2.</span>
            <span>Drag background to move</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-600 font-bold">3.</span>
            <span>Drag tables to reposition</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-600 font-bold">4.</span>
            <span>Click a table to select</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-600 font-bold">5.</span>
            <span>Resize: drag the blue handle</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-600 font-bold">6.</span>
            <span>Capacity: 4-12 people / table</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloorPlanEditor;
