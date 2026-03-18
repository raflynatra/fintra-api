import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logError, logWarn } from "@/configs/logger";
import {
  UserAlreadyExistsError,
  AuthenticationError,
} from "@/error/custom-errors";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AppJWTPayload,
  RefreshTokenResponse,
} from "./auth.types";
import { JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from "@/constants";
import { formatUserDates } from "./auth.utils";
import { UserRepository } from "../user/user.repository";
import { AuthRepository } from "./auth.repository";
import crypto from "crypto";

/**
 * Auth Service Class
 * Handles all authentication business logic
 */
export class AuthService {
  private userRepo: UserRepository;
  private authRepo: AuthRepository;

  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.userRepo = new UserRepository();
    this.authRepo = new AuthRepository();
  }

  /**
   * Register a new user
   *
   * @param data - Registration data (email, name, password)
   * @throws UserAlreadyExistsError if email is already registered
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const userExists = await this.userRepo.checkEmailExists(data.email);

      if (userExists) {
        logWarn("Registration failed: Email already exists", {
          email: data.email,
        });
        throw new UserAlreadyExistsError(
          "An account with this email already exists",
        );
      }

      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      const userData: RegisterRequest = {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      };

      const newUser = await this.userRepo.create(userData);

      const formattedUser = formatUserDates(newUser);

      return {
        user: {
          email: formattedUser.email,
          name: formattedUser.name,
        },
      };
    } catch (error) {
      logError("Registration failed", error, { email: data.email });
      throw error;
    }
  }

  /**
   * Login an existing user
   *
   * @param data - Login credentials (email, password)
   * @returns User information and authentication token
   * @throws AuthenticationError if credentials are invalid
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const user = await this.userRepo.findByEmailWithPassword(data.email);

      if (!user) {
        logWarn("Login failed: User not found", { email: data.email });
        throw new AuthenticationError("Invalid email or password");
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        logWarn("Login failed: Invalid password", { email: data.email });
        throw new AuthenticationError("Invalid email or password");
      }

      const token = this.generateToken({
        id: user.id,
        email: user.email,
      });
      const refreshToken = await this.createRefreshToken(user.id);

      return {
        user: {
          email: user.email,
          name: user.name,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      logError("Login failed", error, { email: data.email });
      throw error;
    }
  }

  /**
   * Rotate a refresh token.
   *
   * Why rotate? If a refresh token is stolen and used, the legitimate client's
   * next refresh will fail (token already revoked), alerting to a possible breach.
   *
   * @param rawRefreshToken - Token from the HttpOnly cookie
   * @returns New authentication token and refresh token
   * @throws AuthenticationError if credentials are invalid
   */
  async refresh(rawRefreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const tokenRow =
        await this.authRepo.findValidRefreshToken(rawRefreshToken);

      if (!tokenRow) {
        logWarn("Refresh failed: token not found, expired, or revoked");
        throw new AuthenticationError("Invalid or expired refresh token");
      }

      await this.authRepo.revokeOneRefreshToken(rawRefreshToken);

      const user = await this.userRepo.findById(tokenRow.user_id);
      if (!user) {
        throw new AuthenticationError("User no longer exists");
      }

      const token = this.generateToken({
        id: user.id,
        email: user.email,
      });

      const refreshToken = await this.createRefreshToken(user.id);

      return { token, refreshToken };
    } catch (error) {
      logError("Token refresh failed", error);
      throw error;
    }
  }

  /**
   * Logout the current device by revoking its refresh token.
   * The access token will expire naturally (max 15 min).
   *
   * @param rawRefreshToken - Token from the HttpOnly cookie
   */
  async logout(rawRefreshToken: string): Promise<void> {
    try {
      await this.authRepo.revokeOneRefreshToken(rawRefreshToken);
    } catch (error) {
      logError("Logout failed", error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   *
   * JWT (JSON Web Token) is used for stateless authentication.
   * The token contains user information and is signed with a secret key.
   *
   * @param payload - Data to include in the token (user id and email)
   * @returns Signed JWT token string
   *
   * Token structure:
   * - Header: Algorithm and token type
   * - Payload: User data (id, email)
   * - Signature: Ensures token hasn't been tampered with
   */
  private generateToken(payload: AppJWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRY,
    });
  }

  /**
   * Create and persist a new opaque refresh token.
   *
   * Uses crypto.randomBytes for a cryptographically secure random value.
   * The raw token is returned to the caller; only its hash is stored in DB.
   *
   * @param userId - Owner of the token
   * @returns Raw (unhashed) refresh token string
   */
  private async createRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(64).toString("hex"); // 128 char hex string
    const expiresAt = new Date(Date.now() + JWT_REFRESH_EXPIRY);
    await this.authRepo.createRefreshToken(userId, rawToken, expiresAt);
    return rawToken;
  }
}
