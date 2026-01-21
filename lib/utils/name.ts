/**
 * Name Utility Functions
 *
 * Helper functions for formatting and manipulating first/last name fields.
 * Uses English format: firstName lastName (with optional title prefix)
 */

/**
 * Get display name with optional title
 * Format: "Title FirstName LastName" or "FirstName LastName"
 */
export function getDisplayName(
  firstName: string,
  lastName: string,
  title?: string | null
): string {
  const titlePart = title ? `${title} ` : '';
  return `${titlePart}${firstName} ${lastName}`.trim();
}

/**
 * Get full name without title
 * Format: "FirstName LastName"
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Split a full name into first and last name
 * Simple split: first word = firstName, rest = lastName
 * Used for migrating legacy data
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 0 || !parts[0]) {
    return { firstName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  return { firstName, lastName };
}

/**
 * Get initials from first and last name
 * Format: "JD" for "John Doe"
 */
export function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

/**
 * Format name for sorting (lastName, firstName)
 */
export function getSortableName(firstName: string, lastName: string): string {
  return `${lastName}, ${firstName}`.trim();
}
