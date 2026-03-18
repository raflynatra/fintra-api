import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { TokenMissingError, TokenInvalidError } from "@/error/custom-errors";
import { sendError } from "@/utils/api-response";
import { HttpStatus } from "@/constants/http-status";
import { ErrorCode } from "@/constants/error-codes";
import { AppJWTPayload } from "@/modules/auth/auth.types";
import { JWT_SECRET, RATE_LIMIT } from "@/constants";

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new TokenMissingError();
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AppJWTPayload;

      req.user = {
        id: decoded.id,
        email: decoded.email,
      };

      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new TokenInvalidError("Authentication token has expired");
      }
      throw new TokenInvalidError();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limiter handler for custom error responses
 */
const rateLimitHandler = (
  _req: Request,
  res: Response,
  message: string,
  retryAfter: number,
) => {
  return sendError(
    res,
    ErrorCode.RATE_LIMIT_EXCEEDED,
    message,
    HttpStatus.TOO_MANY_REQUESTS,
    [{ retryAfter }],
  );
};

/**
 * Rate limiter for login endpoint
 * Prevents brute force attacks
 */
export const loginRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.LOGIN.WINDOW_MS,
  max: RATE_LIMIT.LOGIN.MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req: Request, res: Response) => {
    rateLimitHandler(
      req,
      res,
      "Too many login attempts. Please try again after 15 minutes.",
      15 * 60, // seconds
    );
  },
});

/**
 * Rate limiter for registration endpoint
 * Prevents automated account creation
 */
export const registerRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.REGISTER.WINDOW_MS,
  max: RATE_LIMIT.REGISTER.MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    rateLimitHandler(
      req,
      res,
      "Too many registration attempts. Please try again after 1 hour.",
      60 * 60, // seconds
    );
  },
});

/**
 * Rate limiter for refresh token endpoint
 * Prevents token refresh abuse
 */
export const refreshRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.REFRESH.WINDOW_MS,
  max: RATE_LIMIT.REFRESH.MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    rateLimitHandler(
      req,
      res,
      "Too many token refresh attempts. Please try again later.",
      15 * 60, // seconds
    );
  },
});

/**
 * General API rate limiter
 * Applies to all endpoints
 */
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL.WINDOW_MS,
  max: RATE_LIMIT.GENERAL.MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    rateLimitHandler(
      req,
      res,
      "Too many requests. Please try again after 15 minutes.",
      15 * 60, // seconds
    );
  },
});
