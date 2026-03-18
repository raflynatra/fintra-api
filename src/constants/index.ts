export { HttpStatus, HttpStatusCode } from "./http-status";
export { ErrorCode, ErrorCodeType } from "./error-codes";

export const PORT = process.env.API_PORT || "3000";
export const COOKIE_SECURE = process.env.NODE_ENV === "production";

export const JWT_SECRET = process.env.JWT_SECRET_KEY || "defaultkey";
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET_KEY || "defaultkey";
export const JWT_ACCESS_EXPIRY = Number(process.env.JWT_ACCESS_EXPIRY) || 900;
export const JWT_REFRESH_EXPIRY =
  Number(process.env.JWT_REFRESH_EXPIRY) || 604800;

export const RATE_LIMIT = {
  LOGIN: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
  },
  REGISTER: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_ATTEMPTS: 3,
  },
  REFRESH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 10,
  },
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 100,
  },
};

export const CORS_OPTIONS = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000", // React/Next.js default
    "http://localhost:5173", // Vite default
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
export const APP = {
  NAME: "Fintra API",
  VERSION: "3.0.0",
  DESCRIPTION: "Personal Finance Tracker API",
};
