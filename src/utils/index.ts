/**
 * Response helper functions
 * Used in controllers to send standardized API responses
 */
export {
  // Success responses
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,

  // Error responses
  sendError,

  // Pagination helpers
  calculatePagination,
  extractPaginationParams,

  // Type definitions
  type SuccessResponse,
  type ErrorResponse,
  type PaginatedResponse,
  type PaginationMetadata,
} from "./api-response";

/**
 * Async handler wrapper
 * Wraps async route handlers to automatically catch errors
 */
export { asyncHandler, type AsyncRequestHandler } from "./async-handler";

/**
 * Validation and sanitization helpers
 * For quick validation checks in business logic
 */
export {
  // Validation checks
  isValidEmail,
  isValidUUID,
  isStrongPassword,
  isNotEmpty,
  isInRange,

  // Sanitization
  sanitizeString,
  sanitizeEmail,
  sanitizeName,

  // Formatting
  formatCurrency,
  formatDate,
  roundToDecimals,

  // Type guards
  isNumber,
  isString,
  isDate,
} from "./validation";
/**
 * Password generation and management
 * For creating secure random passwords when auto-generating user accounts
 */
export {
  generatePassword,
  generatePin,
  generateAlphanumericPassword,
  type PasswordOptions,
} from "./password";
