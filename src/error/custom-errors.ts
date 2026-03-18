import { HttpStatus } from "@/constants/http-status";
import { ErrorCode, ErrorCodeType } from "@/constants/error-codes";
export interface ErrorDetails {
  field?: string; // Field name that caused the error
  value?: any; // The invalid value (sanitized)
  constraint?: string; // What constraint was violated
  message?: string; // Field-specific error message
  [key: string]: any; // Allow additional properties
}

/**
 * Base error class that all custom errors extend
 *
 * Provides:
 * - HTTP status code (for response)
 * - Error code (for programmatic handling)
 * - Operational flag (distinguishes user vs programming errors)
 * - Error details (additional context)
 * - Stack trace (for debugging)
 */
export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodeType;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails[];

  /**
   * Create a new base error
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (404, 500, etc.)
   * @param code - Application error code (USER_NOT_FOUND, etc.)
   * @param details - Additional error context
   * @param isOperational - Is this a user error (true) or bug (false)
   */
  constructor(
    message: string,
    statusCode: number,
    code: ErrorCodeType,
    details?: ErrorDetails[],
    isOperational = true,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace(this);
  }
}

/**
 * Authentication failed error
 * Use when login credentials are invalid
 *
 * Status: 401 Unauthorized
 * Code: AUTH_INVALID_CREDENTIALS
 */
export class AuthenticationError extends BaseError {
  constructor(message = "Authentication failed", details?: ErrorDetails[]) {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      details,
    );
  }
}

/**
 * Token missing error
 * Use when JWT token is not provided in request
 *
 * Status: 401 Unauthorized
 * Code: AUTH_TOKEN_MISSING
 */
export class TokenMissingError extends BaseError {
  constructor(message = "Authentication token is missing") {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_TOKEN_MISSING);
  }
}

/**
 * Token invalid error
 * Use when JWT token is malformed, expired, or invalid
 *
 * Status: 401 Unauthorized
 * Code: AUTH_TOKEN_INVALID
 */
export class TokenInvalidError extends BaseError {
  constructor(message = "Authentication token is invalid or expired") {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_TOKEN_INVALID);
  }
}

/**
 * Unauthorized access error
 * Use when user is authenticated but not authorized
 *
 * Status: 401 Unauthorized
 * Code: AUTH_UNAUTHORIZED
 */
export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized access") {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_UNAUTHORIZED);
  }
}

/**
 * Forbidden access error
 * Use when user is authenticated but lacks permission
 *
 * Status: 403 Forbidden
 * Code: AUTH_FORBIDDEN
 * ```
 */
export class ForbiddenError extends BaseError {
  constructor(message = "Access forbidden") {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.AUTH_FORBIDDEN);
  }
}

/**
 * User not found error
 * Use when requested user doesn't exist
 *
 * Status: 404 Not Found
 * Code: USER_NOT_FOUND
 */
export class UserNotFoundError extends BaseError {
  constructor(message = "User not found", details?: ErrorDetails[]) {
    super(message, HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, details);
  }
}

/**
 * User already exists error
 * Use when trying to create a user with existing email
 *
 * Status: 409 Conflict
 * Code: USER_ALREADY_EXISTS
 */
export class UserAlreadyExistsError extends BaseError {
  constructor(message = "User already exists with this email") {
    super(message, HttpStatus.CONFLICT, ErrorCode.USER_ALREADY_EXISTS);
  }
}

/**
 * Invalid user ID error
 * Use when user ID format is invalid (not UUID, etc.)
 *
 * Status: 400 Bad Request
 * Code: USER_INVALID_ID
 */
export class UserInvalidIdError extends BaseError {
  constructor(message = "Invalid user ID provided") {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.USER_INVALID_ID);
  }
}

/**
 * Validation error
 * Use when input validation fails (multiple fields can fail)
 *
 * Status: 422 Unprocessable Entity
 * Code: VALIDATION_ERROR
 */
export class ValidationError extends BaseError {
  constructor(message = "Validation failed", details?: ErrorDetails[]) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      ErrorCode.VALIDATION_ERROR,
      details,
    );
  }
}

/**
 * Required field error
 * Use when a required field is missing
 *
 * Status: 400 Bad Request
 * Code: VALIDATION_REQUIRED_FIELD
 */
export class RequiredFieldError extends BaseError {
  constructor(field: string, message?: string) {
    super(
      message || `Field '${field}' is required`,
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_REQUIRED_FIELD,
      [{ field }],
    );
  }
}

/**
 * Invalid email error
 * Use when email format is invalid
 *
 * Status: 400 Bad Request
 * Code: VALIDATION_INVALID_EMAIL
 */
export class InvalidEmailError extends BaseError {
  constructor(message = "Invalid email format") {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_INVALID_EMAIL);
  }
}

/**
 * Invalid password error
 * Use when password doesn't meet requirements
 *
 * Status: 400 Bad Request
 * Code: VALIDATION_PASSWORD_TOO_SHORT
 */
export class InvalidPasswordError extends BaseError {
  constructor(message = "Password must be at least 8 characters long") {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_PASSWORD_TOO_SHORT,
    );
  }
}

/**
 * Database operation error
 * Use when a database query fails
 *
 * Status: 500 Internal Server Error
 * Code: DB_QUERY_ERROR
 * Operational: false (this is a programming error)
 * ```
 */
export class DatabaseError extends BaseError {
  constructor(message = "Database operation failed", details?: ErrorDetails[]) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.DB_QUERY_ERROR,
      details,
      false, // Not operational - indicates a programming error
    );
  }
}

/**
 * Database connection error
 * Use when cannot connect to database
 *
 * Status: 503 Service Unavailable
 * Code: DB_CONNECTION_ERROR
 * Operational: false (this is a system error)
 */
export class DatabaseConnectionError extends BaseError {
  constructor(message = "Database connection failed") {
    super(
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.DB_CONNECTION_ERROR,
      undefined,
      false, // Not operational - indicates a system error
    );
  }
}

/**
 * Resource not found error
 * Use when any resource doesn't exist
 *
 * Status: 404 Not Found
 * Code: RESOURCE_NOT_FOUND
 */
export class NotFoundError extends BaseError {
  constructor(
    resource = "Resource",
    message?: string,
    details?: ErrorDetails[],
  ) {
    super(
      message || `${resource} not found`,
      HttpStatus.NOT_FOUND,
      ErrorCode.RESOURCE_NOT_FOUND,
      details,
    );
  }
}

/**
 * Resource conflict error
 * Use when resource state conflicts with operation
 *
 * Status: 409 Conflict
 * Code: RESOURCE_CONFLICT
 */
export class ConflictError extends BaseError {
  constructor(message = "Resource conflict", details?: ErrorDetails[]) {
    super(message, HttpStatus.CONFLICT, ErrorCode.RESOURCE_CONFLICT, details);
  }
}

/**
 * Rate limit exceeded error
 * Use when user exceeds request rate limit
 *
 * Status: 429 Too Many Requests
 * Code: RATE_LIMIT_EXCEEDED
 */
export class RateLimitError extends BaseError {
  constructor(message = "Too many requests", retryAfter?: number) {
    const details = retryAfter ? [{ retryAfter }] : undefined;
    super(
      message,
      HttpStatus.TOO_MANY_REQUESTS,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      details,
    );
  }
}

/**
 * Internal server error
 * Use for unexpected server errors
 *
 * Status: 500 Internal Server Error
 * Code: SERVER_ERROR
 * Operational: false (this is a programming error)
 */
export class InternalServerError extends BaseError {
  constructor(message = "Internal server error", details?: ErrorDetails[]) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVER_ERROR,
      details,
      false, // Not operational - indicates a programming error
    );
  }
}

/**
 * Not implemented error
 * Use for endpoints/features not yet implemented
 *
 * Status: 501 Not Implemented
 * Code: SERVER_NOT_IMPLEMENTED
 */
export class NotImplementedError extends BaseError {
  constructor(message = "Not implemented") {
    super(
      message,
      HttpStatus.NOT_IMPLEMENTED,
      ErrorCode.SERVER_NOT_IMPLEMENTED,
    );
  }
}
