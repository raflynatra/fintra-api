import dotenv from "dotenv";
import { createApp } from "./app";
import { logInfo, logError, logWarn } from "./configs/logger";
import { testConnection, closeConnection } from "./configs/db";
import { PORT, APP } from "./constants";

dotenv.config();

async function startServer(): Promise<void> {
  try {
    logInfo("Testing database connection...");

    try {
      await testConnection();
      logInfo("Database connection successful");
    } catch (error) {
      logError("Database connection failed", error);
      logError("Server cannot start without database connection");
      process.exit(1); // Exit with error code
    }

    logInfo("Creating Express application...");
    const app = createApp();

    logInfo(`Starting ${APP.NAME} v${APP.VERSION}...`);

    const server = app.listen(PORT, () => {
      logInfo(`🚀 ${APP.NAME} is running!`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        url: `http://localhost:${PORT}`,
        healthCheck: `http://localhost:${PORT}/health`,
        apiDocs: "See docs/TRANSACTION_API.md for API documentation",
      });

      if (process.env.NODE_ENV !== "production") {
        console.log("\n");
        console.log("================================================");
        console.log(`  ${APP.NAME} v${APP.VERSION}`);
        console.log("================================================");
        console.log(`  Server URL:     http://localhost:${PORT}`);
        console.log(`  Health Check:   http://localhost:${PORT}/health`);
        console.log(
          `  Environment:    ${process.env.NODE_ENV || "development"}`,
        );
        console.log(`  Node Version:   ${process.version}`);
        console.log("================================================");
        console.log("\n");
      }
    });

    /**
     * Graceful shutdown handler
     *
     * When the server receives a shutdown signal (SIGTERM, SIGINT),
     * we want to:
     * 1. Stop accepting new requests
     * 2. Wait for existing requests to complete
     * 3. Close database connections
     * 4. Exit cleanly
     *
     * This prevents data loss and ensures clean shutdown
     */
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logInfo(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logInfo("HTTP server closed (no longer accepting connections)");

        try {
          logInfo("Closing database connections...");
          await closeConnection();
          logInfo("Database connections closed");

          logInfo("Graceful shutdown complete. Exiting...");
          process.exit(0);
        } catch (error) {
          logError("Error during graceful shutdown", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logError("Graceful shutdown timeout. Forcing exit...");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logError("Fatal error during server startup", error);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 *
 * These are errors that weren't caught by try-catch blocks.
 * They should be rare if code is written properly.
 *
 * When this happens:
 * 1. Log the error
 * 2. Exit the process
 * 3. Let process manager (PM2, Docker, etc.) restart the app
 */
process.on("uncaughtException", (error: Error) => {
  logError("UNCAUGHT EXCEPTION! Application will exit...", error, {
    stack: error.stack,
  });

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

/**
 * Handle unhandled promise rejections
 *
 * These are promises that were rejected but not caught with .catch()
 * Should be rare with async/await and proper error handling.
 *
 * When this happens:
 * 1. Log the error
 * 2. Exit the process
 * 3. Let process manager restart the app
 */
process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
  logError(
    "UNHANDLED PROMISE REJECTION! Application will exit...",
    reason as Error,
    {
      promise: promise.toString(),
    },
  );

  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

/**
 * Handle warnings
 * Useful for debugging memory leaks, deprecated APIs, etc.
 */
process.on("warning", (warning: Error) => {
  logWarn("Node.js warning", {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

startServer().catch((error) => {
  logError("Failed to start server", error);
  process.exit(1);
});
