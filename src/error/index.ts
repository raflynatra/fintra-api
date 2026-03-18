export { BaseError, type ErrorDetails } from "./custom-errors";

/**
 * Authentication and authorization related errors
 *
 * - AuthenticationError: Login credentials invalid
 * - TokenMissingError: JWT token not provided
 * - TokenInvalidError: JWT token expired or malformed
 * - UnauthorizedError: User authenticated but not authorized
 * - ForbiddenError: User lacks permission
 */
export {
  AuthenticationError,
  TokenMissingError,
  TokenInvalidError,
  UnauthorizedError,
  ForbiddenError,
} from "./custom-errors";

/**
 * User-specific errors
 *
 * - UserNotFoundError: User doesn't exist
 * - UserAlreadyExistsError: Email already registered
 * - UserInvalidIdError: User ID format invalid
 */
export {
  UserNotFoundError,
  UserAlreadyExistsError,
  UserInvalidIdError,
} from "./custom-errors";

/**
 * Input validation errors
 *
 * - ValidationError: General validation failure (can include multiple fields)
 * - RequiredFieldError: Required field missing
 * - InvalidEmailError: Email format invalid
 * - InvalidPasswordError: Password doesn't meet requirements
 */
export {
  ValidationError,
  RequiredFieldError,
  InvalidEmailError,
  InvalidPasswordError,
} from "./custom-errors";

/**
 * Database operation errors
 *
 * - DatabaseError: Query execution failed
 * - DatabaseConnectionError: Cannot connect to database
 *
 * Note: These are non-operational (programming errors)
 */
export { DatabaseError, DatabaseConnectionError } from "./custom-errors";

/**
 * Generic resource errors (for any resource type)
 *
 * - NotFoundError: Resource doesn't exist
 * - ConflictError: Resource state conflicts with operation
 */
export { NotFoundError, ConflictError } from "./custom-errors";

/**
 * Rate limiting error
 *
 * - RateLimitError: Too many requests from client
 */
export { RateLimitError } from "./custom-errors";

/**
 * Server-side errors
 *
 * - InternalServerError: Unexpected server error
 * - NotImplementedError: Feature not yet implemented
 *
 * Note: These are non-operational (programming errors)
 */
export { InternalServerError, NotImplementedError } from "./custom-errors";
