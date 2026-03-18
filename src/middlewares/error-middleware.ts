import { NextFunction, Response, Request } from "express";
import { BaseError } from "@/error/custom-errors";
import { sendError } from "@/utils/api-response";
import { HttpStatus } from "@/constants/http-status";
import { ErrorCode } from "@/constants/error-codes";
import { logError, logWarn } from "@/configs/logger";

/**
 * Global error handling middleware
 * Should be registered as the last middleware in the application
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Create error context for logging
  const errorContext = {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.user?.id,
  };

  // Handle custom BaseError instances
  if (err instanceof BaseError) {
    // Log operational errors at warn level
    logWarn("Operational error occurred", {
      ...errorContext,
      errorCode: err.code,
      errorMessage: err.message,
      statusCode: err.statusCode,
      details: err.details,
    });

    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    logWarn("JWT validation failed", {
      ...errorContext,
      error: err.message,
    });

    return sendError(
      res,
      ErrorCode.AUTH_TOKEN_INVALID,
      "Invalid authentication token",
      HttpStatus.UNAUTHORIZED,
      undefined,
    );
  }

  if (err.name === "TokenExpiredError") {
    logWarn("JWT token expired", {
      ...errorContext,
      error: err.message,
    });

    return sendError(
      res,
      ErrorCode.AUTH_TOKEN_EXPIRED,
      "Authentication token has expired",
      HttpStatus.UNAUTHORIZED,
      undefined,
    );
  }

  // Handle validation errors (if using libraries like express-validator, joi, etc.)
  if (err.name === "ValidationError") {
    logWarn("Validation error", {
      ...errorContext,
      error: err.message,
    });

    return sendError(
      res,
      ErrorCode.VALIDATION_ERROR,
      err.message || "Validation failed",
      HttpStatus.UNPROCESSABLE_ENTITY,
      undefined,
    );
  }

  // Handle database errors
  if (
    err.message?.includes("ECONNREFUSED") ||
    err.message?.includes("connection")
  ) {
    logError("Database connection failed", err, errorContext);

    return sendError(
      res,
      ErrorCode.DB_CONNECTION_ERROR,
      "Database connection failed",
      HttpStatus.SERVICE_UNAVAILABLE,
      undefined,
    );
  }

  // Handle PostgreSQL unique constraint violations
  if (
    err.message?.includes("unique constraint") ||
    err.message?.includes("duplicate key")
  ) {
    logWarn("Database constraint violation", {
      ...errorContext,
      error: err.message,
    });

    return sendError(
      res,
      ErrorCode.DB_CONSTRAINT_VIOLATION,
      "Resource already exists",
      HttpStatus.CONFLICT,
      undefined,
    );
  }

  // Log unexpected errors (these are programming errors that should be fixed)
  logError("Unexpected error occurred", err, errorContext);

  // Generic server error for unknown errors
  return sendError(
    res,
    ErrorCode.SERVER_ERROR,
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message || "Internal server error",
    HttpStatus.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === "production" ? undefined : [{ stack: err.stack }],
  );
};

/**
 * Middleware to handle 404 Not Found errors
 * Should be registered before the error middleware
 */
export const notFoundMiddleware = (req: Request, res: Response) => {
  logWarn("Route not found", {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  return sendError(
    res,
    ErrorCode.RESOURCE_NOT_FOUND,
    `Route ${req.method} ${req.path} not found`,
    HttpStatus.NOT_FOUND,
    undefined,
  );
};
