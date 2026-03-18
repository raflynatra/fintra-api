import { Request, Response, NextFunction } from "express";
import { logHttp } from "@/configs/logger";

/**
 * HTTP request logging middleware
 * Logs all incoming requests with relevant information
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now();

  // Log request
  logHttp(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.user?.id,
  });

  // Capture response finish event
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determine log level based on status code
    const level =
      statusCode >= 500
        ? "error"
        : statusCode >= 400
          ? "warn"
          : statusCode >= 300
            ? "info"
            : "http";

    // Log response
    logHttp(`${req.method} ${req.path} ${statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      ip: req.ip,
      userId: req.user?.id,
      level,
    });
  });

  next();
};

/**
 * Skip logging for specific paths (e.g., health checks)
 */
export const shouldSkipLogging = (req: Request): boolean => {
  const skipPaths = ["/health", "/favicon.ico"];
  return skipPaths.includes(req.path);
};

/**
 * Conditional request logger that skips certain paths
 */
export const conditionalRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (shouldSkipLogging(req)) {
    return next();
  }
  return requestLogger(req, res, next);
};
