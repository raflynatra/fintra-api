import { Response } from "express";
import { HttpStatus } from "@/constants/http-status";

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard error response structure
 * All error API responses follow this format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}

/**
 * Paginated response structure
 * Used when returning lists of items with pagination
 */
export interface PaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationMetadata;
  message?: string;
}

/**
 * Pagination metadata
 * Information about the paginated data
 */
export interface PaginationMetadata {
  page: number; // Current page number
  limit: number; // Items per page
  total: number; // Total number of items
  totalPages: number; // Total number of pages
  hasNextPage: boolean; // Whether there's a next page
  hasPreviousPage: boolean; // Whether there's a previous page
}

/**
 * Send a successful response (200 OK)
 *
 * Use this for successful GET, PUT, PATCH operations
 *
 * @param res - Express response object
 * @param data - Data to send to client
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 * @param metadata - Additional metadata to include
 * @returns Express response
 *
 * Example:
 * ```
 * return sendSuccess(res, user, "User retrieved successfully");
 * ```
 */
export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HttpStatus.OK,
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a created response (201 Created)
 *
 * Use this when a new resource is successfully created (POST)
 *
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Optional success message
 * @param metadata - Additional metadata
 * @returns Express response
 *
 * Example:
 * ```
 * return sendCreated(res, newUser, "User created successfully");
 * ```
 */
export function sendCreated<T = any>(
  res: Response,
  data: T,
  message: string = "Resource created successfully",
): Response {
  return sendSuccess(res, data, message, HttpStatus.CREATED);
}

/**
 * Send a no content response (204 No Content)
 *
 * Use this for successful DELETE operations
 * No response body is sent (just status code)
 *
 * @param res - Express response object
 * @returns Express response
 *
 * Example:
 * ```
 * return sendNoContent(res);
 * ```
 */
export function sendNoContent(res: Response): Response {
  return res.status(HttpStatus.NO_CONTENT).send();
}

/**
 * Send a paginated response (200 OK)
 *
 * Use this when returning lists of items with pagination
 *
 * @param res - Express response object
 * @param data - Array of items for current page
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @param metadata - Additional metadata
 * @returns Express response
 *
 * Example:
 * ```
 * const pagination = calculatePagination(page, limit, total);
 * return sendPaginated(res, users, pagination, "Users retrieved");
 * ```
 */
export function sendPaginated<T = any>(
  res: Response,
  data: T[],
  pagination: PaginationMetadata,
  message?: string,
): Response {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    message,
  };

  return res.status(HttpStatus.OK).json(response);
}

/**
 * Send an error response
 *
 * Use this to send standardized error responses
 * Usually called by error middleware, not directly in controllers
 *
 * @param res - Express response object
 * @param code - Error code (for programmatic handling)
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code
 * @param details - Detailed error information (optional)
 * @param metadata - Additional metadata (path, method, etc.)
 * @returns Express response
 *
 * Example:
 * ```
 * return sendError(
 *   res,
 *   "USER_NOT_FOUND",
 *   "User not found",
 *   404,
 *   undefined,
 *   { userId: "123" }
 * );
 * ```
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: any[],
): Response {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Calculate pagination metadata
 *
 * Computes all pagination information based on page, limit, and total items
 *
 * @param page - Current page number (1-based)
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 *
 * Example:
 * ```
 * const pagination = calculatePagination(2, 10, 45);
 * // Returns:
 * // {
 * //   page: 2,
 * //   limit: 10,
 * //   total: 45,
 * //   totalPages: 5,
 * //   hasNextPage: true,
 * //   hasPreviousPage: true
 * // }
 * ```
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number,
): PaginationMetadata {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Extract and validate pagination parameters from query
 *
 * Ensures page and limit are valid positive integers within acceptable ranges
 *
 * @param query - Express request query object
 * @returns Validated page and limit values
 *
 * Example:
 * ```
 * const { page, limit } = extractPaginationParams(req.query);
 * // page: 1-1000 (default: 1)
 * // limit: 1-100 (default: 10)
 * ```
 */
export function extractPaginationParams(query: any): {
  page: number;
  limit: number;
} {
  const page = Math.max(1, Math.min(1000, parseInt(query.page) || 1));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10));

  return { page, limit };
}
