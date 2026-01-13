/**
 * CSV Service Module
 * Handles CSV parsing, validation, and bulk guest import
 *
 * Story 1.4: CSV Guest List Import
 */

import { z } from 'zod';
import Papa from 'papaparse';
import { prisma } from '@/lib/db/prisma';
import { GuestType, RegistrationStatus } from '@prisma/client';

// =============================================================================
// Type Definitions
// =============================================================================

export interface CSVRow {
  email: string;
  name: string;
  guest_type: string;
  phone: string;
  company: string;
  position: string;
  status?: string;
}

export interface ImportError {
  row: number;
  email?: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  total: number;
  errors: ImportError[];
}

export interface ParseResult {
  rows: CSVRow[];
  errors: ImportError[];
}

// =============================================================================
// Validation Schemas
// =============================================================================

const guestTypeValues = ['vip', 'paying_single', 'paying_paired'] as const;
const statusValues = ['pending', 'invited', 'registered', 'approved'] as const;

const csvRowSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .transform((val) => val.trim()),
  guest_type: z.enum(guestTypeValues, {
    errorMap: () => ({
      message: `Invalid guest type (must be vip, paying_single, or paying_paired)`,
    }),
  }),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .transform((val) => val.trim()),
  company: z
    .string()
    .min(1, 'Company is required')
    .transform((val) => val.trim()),
  position: z
    .string()
    .min(1, 'Position is required')
    .transform((val) => val.trim()),
  status: z
    .enum(statusValues, {
      errorMap: () => ({
        message: `Invalid status (must be pending, invited, registered, or approved)`,
      }),
    })
    .optional()
    .default('invited'),
});

// =============================================================================
// Constants
// =============================================================================

const MAX_ROWS = 10000;

// =============================================================================
// CSV Parsing Functions
// =============================================================================

/**
 * Parse CSV content from a string or buffer
 */
export function parseCSV(content: string): ParseResult {
  const rows: CSVRow[] = [];
  const errors: ImportError[] = [];

  const parseResult = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    delimitersToGuess: [',', ';', '\t', '|'], // Support multiple delimiters
    transformHeader: (header: string) => header.toLowerCase().trim(),
  });

  // Check for parse errors
  if (parseResult.errors.length > 0) {
    parseResult.errors.forEach((err) => {
      errors.push({
        row: err.row ? err.row + 2 : 0, // +2 for header row and 0-based index
        message: `CSV parse error: ${err.message}`,
      });
    });
  }

  // Process each row
  parseResult.data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header row and 1-based index

    // Map CSV columns (support various column name formats)
    const mappedRow: CSVRow = {
      email: row.email || row['e-mail'] || '',
      name: row.name || '',
      guest_type:
        row.guest_type ||
        row['guest type'] ||
        row['type'] ||
        '',
      phone: row.phone || row['telephone'] || row['tel'] || '',
      company: row.company || row['organization'] || row['cég'] || '',
      position: row.position || row['beosztás'] || row['title'] || '',
      status: row.status || row['státusz'] || row['állapot'] || undefined,
    };

    rows.push(mappedRow);
  });

  return { rows, errors };
}

/**
 * Validate a single CSV row using Zod schema
 */
export function validateCSVRow(
  row: CSVRow,
  rowNumber: number
): { valid: boolean; data?: CSVRow; errors: ImportError[] } {
  const result = csvRowSchema.safeParse(row);

  if (!result.success) {
    const errors: ImportError[] = result.error.errors.map((err) => ({
      row: rowNumber,
      email: row.email || undefined,
      message: err.message,
    }));
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: result.data as CSVRow,
    errors: [],
  };
}

/**
 * Check for duplicate emails in the database
 */
export async function checkDuplicateEmails(
  emails: string[]
): Promise<Set<string>> {
  const existingGuests = await prisma.guest.findMany({
    where: {
      email: {
        in: emails,
      },
    },
    select: {
      email: true,
    },
  });

  return new Set(existingGuests.map((g) => g.email.toLowerCase()));
}

/**
 * Check for duplicate emails within the CSV itself
 */
export function findCSVDuplicates(rows: CSVRow[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  rows.forEach((row) => {
    const email = row.email.toLowerCase();
    if (seen.has(email)) {
      duplicates.add(email);
    }
    seen.add(email);
  });

  return duplicates;
}

// =============================================================================
// Import Functions
// =============================================================================

/**
 * Process and import CSV content
 */
export async function importGuestsFromCSV(
  content: string
): Promise<ImportResult> {
  const errors: ImportError[] = [];

  // Step 1: Parse CSV
  const { rows: parsedRows, errors: parseErrors } = parseCSV(content);
  errors.push(...parseErrors);

  // Step 2: Check row limit
  if (parsedRows.length > MAX_ROWS) {
    return {
      success: false,
      imported: 0,
      total: parsedRows.length,
      errors: [
        {
          row: 0,
          message: `Maximum ${MAX_ROWS} rows can be imported at once. The file contains ${parsedRows.length} rows.`,
        },
      ],
    };
  }

  // Step 3: Validate each row
  const validRows: CSVRow[] = [];
  parsedRows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header and 1-based
    const validation = validateCSVRow(row, rowNumber);

    if (validation.valid && validation.data) {
      validRows.push(validation.data);
    } else {
      errors.push(...validation.errors);
    }
  });

  if (validRows.length === 0) {
    return {
      success: false,
      imported: 0,
      total: parsedRows.length,
      errors,
    };
  }

  // Step 4: Check for duplicates within CSV
  const csvDuplicates = findCSVDuplicates(validRows);
  if (csvDuplicates.size > 0) {
    // Mark duplicates in CSV (keep first occurrence)
    const seenEmails = new Set<string>();
    const uniqueRows: CSVRow[] = [];

    validRows.forEach((row, index) => {
      const email = row.email.toLowerCase();
      const rowNumber = index + 2;

      if (seenEmails.has(email)) {
        errors.push({
          row: rowNumber,
          email: row.email,
          message: 'Duplicate email in CSV',
        });
      } else {
        seenEmails.add(email);
        uniqueRows.push(row);
      }
    });

    // Replace validRows with unique ones
    validRows.length = 0;
    validRows.push(...uniqueRows);
  }

  // Step 5: Check for database duplicates
  const emails = validRows.map((r) => r.email.toLowerCase());
  const dbDuplicates = await checkDuplicateEmails(emails);

  const rowsToInsert: CSVRow[] = [];
  validRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const email = row.email.toLowerCase();

    if (dbDuplicates.has(email)) {
      errors.push({
        row: rowNumber,
        email: row.email,
        message: 'Email already exists in database',
      });
    } else {
      rowsToInsert.push(row);
    }
  });

  // Step 6: Bulk insert
  if (rowsToInsert.length === 0) {
    return {
      success: errors.length === 0,
      imported: 0,
      total: parsedRows.length,
      errors,
    };
  }

  try {
    const insertedCount = await bulkInsertGuests(rowsToInsert);
    return {
      success: true,
      imported: insertedCount,
      total: parsedRows.length,
      errors,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    errors.push({
      row: 0,
      message: `Database error: ${errorMessage}`,
    });
    return {
      success: false,
      imported: 0,
      total: parsedRows.length,
      errors,
    };
  }
}

/**
 * Bulk insert guests into the database
 */
export async function bulkInsertGuests(rows: CSVRow[]): Promise<number> {
  const result = await prisma.guest.createMany({
    data: rows.map((row) => ({
      email: row.email.toLowerCase().trim(),
      name: row.name.trim(),
      guest_type: row.guest_type as GuestType,
      registration_status: (row.status || 'invited') as RegistrationStatus,
      phone: row.phone,
      company: row.company,
      position: row.position,
    })),
    skipDuplicates: false, // We want to catch duplicates explicitly
  });

  return result.count;
}
