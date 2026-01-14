/**
 * Seating Drag & Drop Types
 * Story 4.2, 4.3, 4.4, 4.5
 */

export interface Guest {
  id: number;
  name: string;
  email: string;
  guest_type: 'vip' | 'invited' | 'paying_single' | 'paying_paired';
  registration?: {
    ticket_type: string;
    partner_name: string | null;
    partner_email?: string | null;
  } | null;
  // Partner relation - if this guest has a partner linked via paired_with_id
  partner_of?: {
    id: number;
    name: string;
  } | null;
}

export interface Assignment {
  id: number;
  seat_number: number | null;
  guest: {
    id: number;
    name: string;
    email: string;
    guest_type: string;
    paired_with_id?: number | null; // If set, this guest is a partner (not main guest)
    registration?: {
      ticket_type: string;
      partner_name: string | null;
    } | null;
    partner_of?: {
      id: number;
      name: string;
    } | null;
  };
}

export interface TableData {
  id: number;
  name: string;
  capacity: number;
  type: string;
  status: string;
  pos_x: number | null;
  pos_y: number | null;
  _count: {
    assignments: number;
  };
  assignments: Assignment[];
}

export interface SeatingStats {
  totalTables: number;
  totalCapacity: number;
  totalOccupied: number;
  occupancyRate: number;
  totalGuests: number;
  unassignedGuests: number;
}

// Draggable item type for dnd-kit
export interface DraggableGuest {
  id: string; // "guest-{id}" format
  guestId: number;
  name: string;
  email: string;
  guestType: 'vip' | 'invited' | 'paying_single' | 'paying_paired';
  type: 'single' | 'paired';
  partner?: {
    name: string;
    email: string | null;
  };
  seatsRequired: 1 | 2;
  assignmentId?: number; // Only set if already assigned to a table
  tableId?: number; // Only set if already assigned
}

// Container IDs for dnd-kit
export type ContainerId = 'unassigned' | `table-${number}`;

// Helper to create draggable ID
export function createDraggableId(guestId: number): string {
  return `guest-${guestId}`;
}

// Helper to extract guest ID from draggable ID
export function extractGuestId(draggableId: string): number {
  return parseInt(draggableId.replace('guest-', ''), 10);
}

// Helper to create table container ID
export function createTableContainerId(tableId: number): ContainerId {
  return `table-${tableId}`;
}

// Helper to extract table ID from container ID
export function extractTableId(containerId: string): number {
  return parseInt(containerId.replace('table-', ''), 10);
}

// Transform API guest to DraggableGuest
export function toDraggableGuest(
  guest: Guest,
  assignmentId?: number,
  tableId?: number
): DraggableGuest {
  // Check if guest has a partner:
  // 1. paying_paired guest type
  // 2. paid_paired ticket type
  // 3. Has partner_of relation (VIP/invited with linked partner)
  // 4. Has registration.partner_name (VIP registration with partner info)
  const hasPartner = guest.guest_type === 'paying_paired' ||
    guest.registration?.ticket_type === 'paid_paired' ||
    !!guest.partner_of ||
    !!guest.registration?.partner_name;

  // Get partner name from registration or partner_of relation
  const partnerName = guest.registration?.partner_name || guest.partner_of?.name;

  return {
    id: createDraggableId(guest.id),
    guestId: guest.id,
    name: guest.name,
    email: guest.email,
    guestType: guest.guest_type,
    type: hasPartner ? 'paired' : 'single',
    partner: hasPartner && partnerName ? {
      name: partnerName,
      email: guest.registration?.partner_email || null,
    } : undefined,
    seatsRequired: hasPartner ? 2 : 1,
    assignmentId,
    tableId,
  };
}

// Transform Assignment to DraggableGuest
// IMPORTANT: Only use this for main guests (guests without paired_with_id)
// Partners should be filtered out before calling this
export function assignmentToDraggableGuest(
  assignment: Assignment,
  tableId: number
): DraggableGuest {
  const guest = assignment.guest;

  // Check if guest has a partner (same logic as toDraggableGuest)
  const hasPartner = guest.guest_type === 'paying_paired' ||
    guest.registration?.ticket_type === 'paid_paired' ||
    !!guest.partner_of ||
    !!guest.registration?.partner_name;

  // Get partner name from either registration.partner_name or partner_of relation
  const partnerName = guest.registration?.partner_name || guest.partner_of?.name;

  return {
    id: createDraggableId(guest.id),
    guestId: guest.id,
    name: guest.name,
    email: guest.email,
    guestType: guest.guest_type as 'vip' | 'invited' | 'paying_single' | 'paying_paired',
    type: hasPartner ? 'paired' : 'single',
    partner: hasPartner && partnerName ? {
      name: partnerName,
      email: null,
    } : undefined,
    seatsRequired: hasPartner ? 2 : 1,
    assignmentId: assignment.id,
    tableId,
  };
}

// Helper to check if an assignment is for a partner (not main guest)
export function isPartnerAssignment(assignment: Assignment): boolean {
  return !!assignment.guest.paired_with_id;
}
