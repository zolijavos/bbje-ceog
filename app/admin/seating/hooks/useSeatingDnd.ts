'use client';

/**
 * useSeatingDnd Hook
 * Manages drag & drop state and operations for seating management
 *
 * Supports 3 operations:
 * 1. Unassigned → Table (assign)
 * 2. Table → Unassigned (remove)
 * 3. Table → Table (move)
 */

import { useState, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import type { DraggableGuest } from '../types';
import { extractTableId } from '../types';

interface UseSeatingDndProps {
  onAssign: (guestId: number, tableId: number) => Promise<void>;
  onUnassign: (assignmentId: number) => Promise<void>;
  onMove: (assignmentId: number, newTableId: number) => Promise<void>;
}

export function useSeatingDnd({ onAssign, onUnassign, onMove }: UseSeatingDndProps) {
  const [activeGuest, setActiveGuest] = useState<DraggableGuest | null>(null);
  const [sourceContainerId, setSourceContainerId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const guest = active.data.current?.guest as DraggableGuest | undefined;
    const containerId = active.data.current?.containerId as string | undefined;

    if (guest) {
      setActiveGuest(guest);
      setSourceContainerId(containerId || null);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Could add preview logic here if needed
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset state
    setActiveGuest(null);
    setSourceContainerId(null);

    if (!over) return;

    const guest = active.data.current?.guest as DraggableGuest | undefined;
    const sourceContainer = active.data.current?.containerId as string | undefined;
    const targetContainer = over.data.current?.containerId as string | undefined;

    if (!guest || !sourceContainer || !targetContainer) return;

    // Same container - no action
    if (sourceContainer === targetContainer) return;

    try {
      // 1. Unassigned → Table (NEW ASSIGNMENT)
      if (sourceContainer === 'unassigned' && targetContainer.startsWith('table-')) {
        const tableId = extractTableId(targetContainer);
        await onAssign(guest.guestId, tableId);
      }

      // 2. Table → Unassigned (REMOVE)
      if (sourceContainer.startsWith('table-') && targetContainer === 'unassigned') {
        if (guest.assignmentId) {
          await onUnassign(guest.assignmentId);
        }
      }

      // 3. Table → Table (MOVE)
      if (
        sourceContainer.startsWith('table-') &&
        targetContainer.startsWith('table-')
      ) {
        if (guest.assignmentId) {
          const newTableId = extractTableId(targetContainer);
          await onMove(guest.assignmentId, newTableId);
        }
      }
    } catch (error) {
      console.error('Drag operation failed:', error);
      // Error is handled in the callback functions
    }
  }, [onAssign, onUnassign, onMove]);

  const handleDragCancel = useCallback(() => {
    setActiveGuest(null);
    setSourceContainerId(null);
  }, []);

  return {
    activeGuest,
    sourceContainerId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}

export default useSeatingDnd;
