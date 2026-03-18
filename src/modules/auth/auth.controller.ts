import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "@/utils/async-handler";
import { sendSuccess, sendNoContent } from "@/utils/api-response";
import { RegisterBody, LoginBody } from "./auth.validation";
import { REFRESH_TOKEN_COOKIE } from "./auth.types";
import { COOKIE_SECURE, JWT_REFRESH_EXPIRY } from "@/constants";

/**
 * Shared cookie options for the HttpOnly refresh token cookie.
 *
 * - httpOnly  → JS cannot read it (XSS protection)
 * - secure    → HTTPS only in production
 * - sameSite  → "strict" blocks cross-site requests (CSRF protection)
 * - maxAge    → matches the DB token expiry (7 days)
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: "strict" as const,
  maxAge: JWT_REFRESH_EXPIRY,
};

/**
 * Auth Controller Class
 * Handles all HTTP requests for authentication
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Handle user registration
   *
   * Endpoint: POST /api/auth/register
   * Body: { email, name, password }
   * Response: 201 Created with user data and token
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const registrationData = req.body as RegisterBody;

    await this.authService.register(registrationData);

    return sendNoContent(res);
  });

  /**
   * Handle user login
   *
   * Endpoint: POST /api/auth/login
   * Body: { email, password }
   * Response: 200 OK with user data and token
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const credentials = req.body as LoginBody;

    const { token, refreshToken, user } =
      await this.authService.login(credentials);

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, { user, token });
  });

  /**
   * POST /api/auth/refresh
   * Reads the refresh token from the HttpOnly cookie.
   *
   * Response:
   * - Rotates the refresh token cookie
   * - Body: { token: <new_access_token> }
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    const { token, refreshToken } =
      await this.authService.refresh(rawRefreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, { token: token });
  });

  /**
   * POST /api/auth/logout
   * Reads and revokes the refresh token from the HttpOnly cookie.
   *
   * Response: 204 No Content
   * The cookie is cleared regardless of whether the token was valid.
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken: string | undefined =
      req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (rawRefreshToken) {
      await this.authService.logout(rawRefreshToken).catch(() => {});
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return sendNoContent(res);
  });
}
