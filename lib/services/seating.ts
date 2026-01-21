/**
 * Seating Management Service
 *
 * Handles table CRUD operations and guest-to-table assignments.
 * Epic 4: Seating Management
 */

import { prisma } from '@/lib/db/prisma';
import { TableStatus } from '@prisma/client';

// ========================================
// TYPES
// ========================================

export interface CreateTableData {
  name: string;
  capacity: number;
  type?: string;
  pos_x?: number;
  pos_y?: number;
}

export interface UpdateTableData {
  name?: string;
  capacity?: number;
  type?: string;
  status?: TableStatus;
}

export interface TableWithAssignments {
  id: number;
  name: string;
  capacity: number;
  type: string;
  pos_x: number | null;
  pos_y: number | null;
  status: TableStatus;
  created_at: Date;
  assignments: Array<{
    id: number;
    seat_number: number | null;
    guest: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      guest_type: string;
    };
  }>;
  _count: {
    assignments: number;
  };
}

export interface BulkAssignResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// ========================================
// TABLE CRUD
// ========================================

/**
 * Create a new table
 */
export async function createTable(data: CreateTableData) {
  // Check for duplicate name
  const existing = await prisma.table.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error('TABLE_NAME_EXISTS');
  }

  return prisma.table.create({
    data: {
      name: data.name,
      capacity: data.capacity,
      type: data.type || 'standard',
      pos_x: data.pos_x || 0,
      pos_y: data.pos_y || 0,
      status: 'available',
    },
  });
}

/**
 * Update an existing table
 */
export async function updateTable(id: number, data: UpdateTableData) {
  // Check if table exists
  const table = await prisma.table.findUnique({
    where: { id },
  });

  if (!table) {
    throw new Error('TABLE_NOT_FOUND');
  }

  // If renaming, check for duplicate name
  if (data.name && data.name !== table.name) {
    const existing = await prisma.table.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('TABLE_NAME_EXISTS');
    }
  }

  return prisma.table.update({
    where: { id },
    data,
  });
}

/**
 * Delete a table
 */
export async function deleteTable(id: number) {
  const table = await prisma.table.findUnique({
    where: { id },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  if (!table) {
    throw new Error('TABLE_NOT_FOUND');
  }

  if (table._count.assignments > 0) {
    throw new Error('TABLE_NOT_EMPTY');
  }

  await prisma.table.delete({
    where: { id },
  });
}

/**
 * Get a single table with assignments
 */
export async function getTable(id: number): Promise<TableWithAssignments | null> {
  const table = await prisma.table.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          guest: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              guest_type: true,
            },
          },
        },
        orderBy: {
          seat_number: 'asc',
        },
      },
      _count: {
        select: { assignments: true },
      },
    },
  });

  return table as TableWithAssignments | null;
}

/**
 * Get all tables with assignments
 * Includes paired_with_id for filtering partners in UI
 */
export async function getAllTables(): Promise<TableWithAssignments[]> {
  const tables = await prisma.table.findMany({
    include: {
      assignments: {
        include: {
          guest: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              guest_type: true,
              paired_with_id: true, // For filtering partners in drag & drop UI
              registration: {
                select: {
                  ticket_type: true,
                  partner_first_name: true,
                  partner_last_name: true,
                },
              },
              // Partner relation for paired guests display
              partner_of: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
        orderBy: {
          seat_number: 'asc',
        },
      },
      _count: {
        select: { assignments: true },
      },
    },
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });

  return tables as TableWithAssignments[];
}

/**
 * Update table position (for drag-drop)
 */
export async function updateTablePosition(id: number, pos_x: number, pos_y: number) {
  const table = await prisma.table.findUnique({
    where: { id },
  });

  if (!table) {
    throw new Error('TABLE_NOT_FOUND');
  }

  return prisma.table.update({
    where: { id },
    data: { pos_x, pos_y },
  });
}

// ========================================
// TABLE ASSIGNMENTS
// ========================================

/**
 * Get partner guest ID if exists (either paired_with or partner_of)
 */
async function getPartnerGuestId(guestId: number): Promise<number | null> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      paired_with_id: true,
      partner_of: { select: { id: true } },
    },
  });

  if (!guest) return null;

  // If this guest is paired with someone (this is the partner)
  if (guest.paired_with_id) {
    return guest.paired_with_id;
  }

  // If this guest has a partner (this is the main guest)
  if (guest.partner_of) {
    return guest.partner_of.id;
  }

  return null;
}

/**
 * Assign a guest to a table (with automatic partner handling)
 */
export async function assignGuestToTable(
  guestId: number,
  tableId: number,
  seatNumber?: number,
  assignedBy?: number
) {
  // Check if guest exists
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      table_assignment: true,
      paired_with: { select: { id: true, first_name: true, last_name: true, table_assignment: true } },
      partner_of: { select: { id: true, first_name: true, last_name: true, table_assignment: true } },
    },
  });

  if (!guest) {
    throw new Error('GUEST_NOT_FOUND');
  }

  if (guest.table_assignment) {
    throw new Error('GUEST_ALREADY_ASSIGNED');
  }

  // Determine if guest has a partner to move together
  const partner = guest.paired_with || guest.partner_of;
  const hasUnassignedPartner = partner && !partner.table_assignment;
  const seatsNeeded = hasUnassignedPartner ? 2 : 1;

  // Check if table exists and has capacity for guest (and partner if applicable)
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  if (!table) {
    throw new Error('TABLE_NOT_FOUND');
  }

  const availableSeats = table.capacity - table._count.assignments;
  if (availableSeats < seatsNeeded) {
    throw new Error('TABLE_FULL');
  }

  // Check if seat is taken
  if (seatNumber !== undefined) {
    if (seatNumber < 1 || seatNumber > table.capacity) {
      throw new Error('INVALID_SEAT_NUMBER');
    }

    const seatTaken = await prisma.tableAssignment.findFirst({
      where: {
        table_id: tableId,
        seat_number: seatNumber,
      },
    });

    if (seatTaken) {
      throw new Error('SEAT_TAKEN');
    }
  }

  // Use transaction to assign both guest and partner together
  const result = await prisma.$transaction(async (tx) => {
    // Create assignment for main guest
    const assignment = await tx.tableAssignment.create({
      data: {
        table_id: tableId,
        guest_id: guestId,
        seat_number: seatNumber || null,
        assigned_by: assignedBy || null,
      },
      include: {
        guest: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        table: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If partner exists and not already assigned, assign them too
    if (hasUnassignedPartner && partner) {
      await tx.tableAssignment.create({
        data: {
          table_id: tableId,
          guest_id: partner.id,
          seat_number: null, // Partner gets auto-assigned seat
          assigned_by: assignedBy || null,
        },
      });
    }

    return assignment;
  });

  // Update table status if full
  await updateTableStatus(tableId);

  return result;
}

/**
 * Remove guest from table (with automatic partner handling)
 */
export async function removeGuestFromTable(assignmentId: number) {
  const assignment = await prisma.tableAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      guest: {
        select: {
          id: true,
          paired_with_id: true,
          partner_of: { select: { id: true } },
        },
      },
    },
  });

  if (!assignment) {
    throw new Error('ASSIGNMENT_NOT_FOUND');
  }

  const tableId = assignment.table_id;

  // Check if guest has a partner
  const partnerId = assignment.guest.paired_with_id || assignment.guest.partner_of?.id;

  // Use transaction to remove both guest and partner
  await prisma.$transaction(async (tx) => {
    // Remove main guest
    await tx.tableAssignment.delete({
      where: { id: assignmentId },
    });

    // If partner exists and is at the same table, remove them too
    if (partnerId) {
      const partnerAssignment = await tx.tableAssignment.findFirst({
        where: {
          guest_id: partnerId,
          table_id: tableId,
        },
      });

      if (partnerAssignment) {
        await tx.tableAssignment.delete({
          where: { id: partnerAssignment.id },
        });
      }
    }
  });

  // Update table status
  await updateTableStatus(tableId);
}

/**
 * Move guest to a different table (by assignment ID) with automatic partner handling
 */
export async function moveGuestToTable(
  assignmentId: number,
  newTableId: number,
  newSeatNumber?: number,
  assignedBy?: number
) {
  // Find existing assignment with guest partner info
  const existingAssignment = await prisma.tableAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      guest: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          paired_with_id: true,
          partner_of: { select: { id: true } },
        },
      },
    },
  });

  if (!existingAssignment) {
    throw new Error('ASSIGNMENT_NOT_FOUND');
  }

  // Same table? No-op
  if (existingAssignment.table_id === newTableId) {
    return existingAssignment;
  }

  const oldTableId = existingAssignment.table_id;

  // Check if guest has a partner at the same table
  const partnerId = existingAssignment.guest.paired_with_id || existingAssignment.guest.partner_of?.id;
  let partnerAssignment: { id: number; table_id: number } | null = null;

  if (partnerId) {
    partnerAssignment = await prisma.tableAssignment.findFirst({
      where: {
        guest_id: partnerId,
        table_id: oldTableId, // Only if partner is at the same old table
      },
      select: { id: true, table_id: true },
    });
  }

  const seatsNeeded = partnerAssignment ? 2 : 1;

  // Check new table capacity
  const newTable = await prisma.table.findUnique({
    where: { id: newTableId },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  if (!newTable) {
    throw new Error('TABLE_NOT_FOUND');
  }

  const availableSeats = newTable.capacity - newTable._count.assignments;
  if (availableSeats < seatsNeeded) {
    throw new Error('TABLE_FULL');
  }

  // Check seat availability
  if (newSeatNumber !== undefined) {
    if (newSeatNumber < 1 || newSeatNumber > newTable.capacity) {
      throw new Error('INVALID_SEAT_NUMBER');
    }

    const seatTaken = await prisma.tableAssignment.findFirst({
      where: {
        table_id: newTableId,
        seat_number: newSeatNumber,
      },
    });

    if (seatTaken) {
      throw new Error('SEAT_TAKEN');
    }
  }

  // Use transaction to move both guest and partner together
  const updated = await prisma.$transaction(async (tx) => {
    // Update main guest assignment
    const mainUpdated = await tx.tableAssignment.update({
      where: { id: assignmentId },
      data: {
        table_id: newTableId,
        seat_number: newSeatNumber || null,
        assigned_by: assignedBy || null,
        assigned_at: new Date(),
      },
      include: {
        guest: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        table: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If partner was at the same old table, move them too
    if (partnerAssignment) {
      await tx.tableAssignment.update({
        where: { id: partnerAssignment.id },
        data: {
          table_id: newTableId,
          seat_number: null, // Partner gets auto-assigned seat
          assigned_by: assignedBy || null,
          assigned_at: new Date(),
        },
      });
    }

    return mainUpdated;
  });

  // Update both table statuses
  await updateTableStatus(oldTableId);
  await updateTableStatus(newTableId);

  return updated;
}

/**
 * Update table status based on capacity
 */
async function updateTableStatus(tableId: number) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  if (!table) return;

  let newStatus: TableStatus = 'available';
  if (table._count.assignments >= table.capacity) {
    newStatus = 'full';
  }

  // Don't override 'reserved' status
  if (table.status !== 'reserved') {
    await prisma.table.update({
      where: { id: tableId },
      data: { status: newStatus },
    });
  }
}

// ========================================
// QUERIES
// ========================================

/**
 * Get all unassigned guests (registered but no table)
 * Includes partner relation info for paired guests
 *
 * IMPORTANT: Only returns "main" guests (those WITHOUT paired_with_id).
 * Partners (guests with paired_with_id) are NOT returned separately -
 * they appear as part of their main guest's card via partner_of relation.
 * This prevents duplicate cards in the drag & drop UI.
 */
export async function getUnassignedGuests() {
  return prisma.guest.findMany({
    where: {
      // Include invited guests (newly imported) as well as registered/approved
      registration_status: { in: ['invited', 'registered', 'approved'] },
      table_assignment: null,
      // Only show "main" guests - partners (with paired_with_id) are shown via partner_of relation
      paired_with_id: null,
    },
    select: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      guest_type: true,
      registration: {
        select: {
          ticket_type: true,
          partner_first_name: true,
          partner_last_name: true,
          partner_email: true,
        },
      },
      // Partner relation info for drag & drop UI
      paired_with_id: true,
      paired_with: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          table_assignment: { select: { id: true } },
        },
      },
      // This guest's partner (if this is the main guest)
      partner_of: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          table_assignment: { select: { id: true } },
        },
      },
    },
    // Sort alphabetically by last name (ABC order)
    orderBy: [
      { last_name: 'asc' },
      { first_name: 'asc' },
    ],
  });
}

/**
 * Get table availability
 */
export async function getTableAvailability(tableId: number) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
  });

  if (!table) {
    throw new Error('TABLE_NOT_FOUND');
  }

  return {
    tableId: table.id,
    tableName: table.name,
    total: table.capacity,
    occupied: table._count.assignments,
    available: table.capacity - table._count.assignments,
  };
}

/**
 * Get all table assignments
 */
export async function getAllAssignments() {
  return prisma.tableAssignment.findMany({
    include: {
      table: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      guest: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          guest_type: true,
        },
      },
    },
    orderBy: [
      { table: { name: 'asc' } },
      { seat_number: 'asc' },
    ],
  });
}

// ========================================
// BULK OPERATIONS
// ========================================

/**
 * Sanitize CSV input value - remove potentially dangerous characters
 */
function sanitizeCsvValue(value: string): string {
  return value
    .trim()
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove potential CSV injection characters at start
    .replace(/^[=+\-@\t\r]/, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Limit length
    .substring(0, 255);
}

/**
 * Validate table name format
 */
function isValidTableName(name: string): boolean {
  // Allow alphanumeric, spaces, hyphens, underscores
  return /^[a-zA-Z0-9\s\-_áéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/.test(name) && name.length <= 100;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

/**
 * Bulk assign guests from CSV
 *
 * CSV format:
 * table_name,guest_email,seat_number
 */
export async function bulkAssignFromCsv(
  csvContent: string,
  assignedBy?: number
): Promise<BulkAssignResult> {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: BulkAssignResult['errors'] = [];
  let imported = 0;

  // Skip header row
  const dataLines = lines.slice(1);

  // Limit total rows to prevent DoS
  const MAX_ROWS = 1000;
  if (dataLines.length > MAX_ROWS) {
    return {
      success: false,
      imported: 0,
      errors: [{ row: 0, message: `CSV exceeds maximum of ${MAX_ROWS} rows` }],
    };
  }

  for (let i = 0; i < dataLines.length; i++) {
    const rowNum = i + 2; // Account for header and 0-index
    const line = dataLines[i].trim();

    if (!line) continue;

    const parts = line.split(',').map(p => sanitizeCsvValue(p));
    if (parts.length < 2) {
      errors.push({ row: rowNum, message: 'Missing columns' });
      continue;
    }

    const [tableName, guestEmail, seatNumberStr] = parts;

    // Validate table name format
    if (!isValidTableName(tableName)) {
      errors.push({ row: rowNum, message: `Invalid table name format: ${tableName}` });
      continue;
    }

    // Validate email format
    if (!isValidEmail(guestEmail)) {
      errors.push({ row: rowNum, message: `Invalid email format: ${guestEmail}` });
      continue;
    }

    // Find table
    const table = await prisma.table.findUnique({
      where: { name: tableName },
    });

    if (!table) {
      errors.push({ row: rowNum, message: `Table not found: ${tableName}` });
      continue;
    }

    // Find guest
    const guest = await prisma.guest.findUnique({
      where: { email: guestEmail },
      include: { table_assignment: true },
    });

    if (!guest) {
      errors.push({ row: rowNum, message: `Guest not found: ${guestEmail}` });
      continue;
    }

    if (guest.table_assignment) {
      errors.push({ row: rowNum, message: `Guest already assigned: ${guestEmail}` });
      continue;
    }

    // Parse seat number
    const seatNumber = seatNumberStr ? parseInt(seatNumberStr, 10) : undefined;

    try {
      await assignGuestToTable(guest.id, table.id, seatNumber, assignedBy);
      imported++;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ row: rowNum, message });
    }
  }

  return {
    success: errors.length === 0,
    imported,
    errors,
  };
}

// ========================================
// EXPORT
// ========================================

/**
 * Export seating arrangement as CSV
 */
export async function exportSeatingArrangement(): Promise<string> {
  const assignments = await prisma.tableAssignment.findMany({
    include: {
      table: {
        select: {
          name: true,
          type: true,
        },
      },
      guest: {
        select: {
          first_name: true,
          last_name: true,
          email: true,
          guest_type: true,
        },
      },
    },
    orderBy: [
      { table: { name: 'asc' } },
      { seat_number: 'asc' },
    ],
  });

  const header = 'table_name,table_type,guest_first_name,guest_last_name,guest_email,guest_type,seat_number';
  const rows = assignments.map(a => [
    a.table.name,
    a.table.type,
    `"${a.guest.first_name}"`,
    `"${a.guest.last_name}"`,
    a.guest.email,
    a.guest.guest_type,
    a.seat_number || '',
  ].join(','));

  return [header, ...rows].join('\n');
}

/**
 * Get seating statistics
 * Note: Paired guests (paying_paired) count as 2 occupied seats
 */
export async function getSeatingStats() {
  const [tables, totalGuests, assignments] = await Promise.all([
    prisma.table.findMany({
      include: {
        assignments: {
          include: {
            guest: {
              select: {
                guest_type: true,
                paired_with_id: true,
                registration: {
                  select: { ticket_type: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.guest.count({
      where: { registration_status: 'approved' },
    }),
    prisma.tableAssignment.findMany({
      include: {
        guest: {
          select: {
            guest_type: true,
            paired_with_id: true,
            registration: {
              select: { ticket_type: true },
            },
          },
        },
      },
    }),
  ]);

  // Calculate total occupied seats (paired guests = 2 seats, skip partner records)
  const calculateOccupiedSeats = (tableAssignments: typeof assignments) => {
    let seats = 0;
    for (const assignment of tableAssignments) {
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
  };

  const totalOccupiedSeats = calculateOccupiedSeats(assignments);
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

  const byType = tables.reduce((acc, t) => {
    if (!acc[t.type]) {
      acc[t.type] = { tables: 0, capacity: 0, occupied: 0 };
    }
    acc[t.type].tables++;
    acc[t.type].capacity += t.capacity;
    acc[t.type].occupied += calculateOccupiedSeats(t.assignments);
    return acc;
  }, {} as Record<string, { tables: number; capacity: number; occupied: number }>);

  // Count assigned guests (actual people, not seats)
  const assignedGuestCount = assignments.length;

  return {
    totalTables: tables.length,
    totalCapacity,
    totalOccupied: totalOccupiedSeats,
    occupancyRate: totalCapacity > 0 ? (totalOccupiedSeats / totalCapacity) * 100 : 0,
    totalGuests,
    unassignedGuests: totalGuests - assignedGuestCount,
    byType,
  };
}
