/**
 * API Utilities - Barrel Export
 *
 * Centralized utilities for API routes:
 * - Authentication helpers
 * - Validation response handlers
 * - Route parameter parsing
 */

export {
  requireAuth,
  requireAdmin,
  type AuthSession,
  type AuthResult,
} from './auth';
export {
  validationErrorResponse,
  validateBody,
  errorResponse,
  type ValidationErrorResponse,
  type ValidationResult,
} from './validation';
export {
  parseIdParam,
  parsePaginationParams,
  type RouteContext,
  type IdParseResult,
} from './params';
