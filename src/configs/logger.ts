import winston from "winston";

const NODE_ENV = process.env.NODE_ENV || "development";

const LOG_LEVEL =
  process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "debug");

/**
 * Custom log format for console output (development)
 * Makes logs easy to read during development
 *
 * Format: [timestamp] level: message {metadata}
 * Example: [2024-01-15 10:30:00] info: User logged in {"userId":"123"}
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),

  winston.format.colorize({ all: true }),

  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let logMessage = `[${timestamp}] ${level}: ${message}`;

    if (Object.keys(metadata).length > 0) {
      logMessage += ` ${JSON.stringify(metadata)}`;
    }

    return logMessage;
  }),
);

/**
 * JSON format for file output (production)
 * Structured logs that can be easily parsed by log analysis tools
 *
 * Each log is a complete JSON object with all information
 * This makes it easy to search, filter, and analyze logs
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),

  winston.format.json(),
);

/**
 * Console transport - Logs to terminal/console
 * Used in development to see logs immediately
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: LOG_LEVEL,
});

/**
 * File transports - Logs to files
 * Used in production to persist logs for later analysis
 *
 * We use two files:
 * 1. error.log - Only error level logs
 * 2. combined.log - All logs
 */
const fileTransports = [
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: "logs/combined.log",
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

/**
 * Main logger instance
 * Use this throughout the application to log messages
 *
 * In development: Logs to console with colors
 * In production: Logs to console + files in JSON format
 */
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports:
    NODE_ENV === "production"
      ? [consoleTransport, ...fileTransports]
      : [consoleTransport],
  exitOnError: false,
  defaultMeta: {
    service: "fintra-api",
    environment: NODE_ENV,
  },
});

/**
 * Log an error message
 * Use for critical errors that need immediate attention
 *
 * @param message - Error description
 * @param error - Error object (optional)
 * @param metadata - Additional context (optional)
 */
export function logError(
  message: string,
  error?: Error | unknown,
  metadata?: Record<string, any>,
): void {
  const errorData: Record<string, any> = { ...metadata };

  if (error instanceof Error) {
    errorData.errorMessage = error.message;
    errorData.errorStack = error.stack;
  } else if (error) {
    errorData.error = error;
  }

  logger.error(message, errorData);
}

/**
 * Log a warning message
 * Use for non-critical issues that should be monitored
 *
 * @param message - Warning description
 * @param metadata - Additional context (optional)
 */
export function logWarn(message: string, metadata?: Record<string, any>): void {
  logger.warn(message, metadata || {});
}

/**
 * Log an informational message
 * Use for general application events
 *
 * @param message - Information description
 * @param metadata - Additional context (optional)
 */
export function logInfo(message: string, metadata?: Record<string, any>): void {
  logger.info(message, metadata || {});
}

/**
 * Log an HTTP request
 * Use for tracking API requests
 *
 * @param message - HTTP request description
 * @param metadata - Request details (optional)
 */
export function logHttp(message: string, metadata?: Record<string, any>): void {
  logger.http(message, metadata || {});
}

/**
 * Log a debug message
 * Use for detailed debugging information (development only)
 *
 * @param message - Debug description
 * @param metadata - Additional context (optional)
 */
export function logDebug(
  message: string,
  metadata?: Record<string, any>,
): void {
  logger.debug(message, metadata || {});
}

export default logger;
