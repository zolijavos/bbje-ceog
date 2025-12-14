'use client';

/**
 * DraggableGuest Component
 * Wraps GuestChip or PairedGuestChip with dnd-kit sortable functionality
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { GuestChip } from './GuestChip';
import { PairedGuestChip } from './PairedGuestChip';
import type { DraggableGuest as DraggableGuestType } from '../types';

interface DraggableGuestProps {
  guest: DraggableGuestType;
  containerId: string;
}

export function DraggableGuest({ guest, containerId }: DraggableGuestProps) {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: guest.id,
    data: {
      type: 'guest',
      guest,
      containerId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (guest.type === 'paired') {
    return (
      <PairedGuestChip
        ref={setNodeRef}
        style={style}
        guest={guest}
        isDragging={isDragging}
        mainGuestLabel={t('mainGuest')}
        partnerLabel={t('partner')}
        {...attributes}
        {...listeners}
      />
    );
  }

  return (
    <GuestChip
      ref={setNodeRef}
      style={style}
      guest={guest}
      isDragging={isDragging}
      {...attributes}
      {...listeners}
    />
  );
}

export default DraggableGuest;
