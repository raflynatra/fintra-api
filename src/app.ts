import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { CORS_OPTIONS } from "./constants";
import { conditionalRequestLogger } from "./middlewares/request-logger-middleware";
import { registerRoutes } from "./register-routes";
import { logInfo } from "./configs/logger";

/**
 * Create and configure Express application
 *
 * This function sets up the entire Express app with all middleware and routes.
 * Using a factory function makes testing easier (we can create multiple instances).
 *
 * @returns Configured Express application
 */
export function createApp(): Express {
  const app = express();
  logInfo("Initializing Express application");

  app.use(conditionalRequestLogger);
  app.use(
    helmet({
      // Content Security Policy - Controls what resources can be loaded
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Only load resources from same origin
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (for React, etc.)
          scriptSrc: ["'self'"], // Only run scripts from same origin
          imgSrc: ["'self'", "data:", "https:"], // Allow images from same origin, data URLs, and HTTPS
        },
      },
      // HSTS - Force HTTPS for 1 year
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true, // Apply to all subdomains
        preload: true, // Allow preload list submission
      },
    }),
  );
  app.use(cors(CORS_OPTIONS));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    logInfo("Trust proxy enabled for production");
  }

  registerRoutes(app);

  logInfo("Express application configured successfully", {
    environment: process.env.NODE_ENV || "development",
    cors: CORS_OPTIONS.origin,
  });

  return app;
}

export default createApp;
