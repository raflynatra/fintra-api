import pool from "@/configs/db";
import crypto from "crypto";
import { RefreshTokenRow } from "./auth.types";

/**
 * AuthRepository
 * Handles all DB operations for auth.
 * Tokens are stored as SHA-256 hashes — the raw token is never persisted.
 */
export class AuthRepository {
  /**
   * Hash a raw token with SHA-256.
   * Used before storing or querying — never store the raw token.
   */
  private hash(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Persist a new refresh token for a user.
   *
   * @param userId   - Owner of the token
   * @param rawToken - The plaintext token (will be hashed before storing)
   * @param expiresAt - Expiry date
   */
  async createRefreshToken(
    userId: string,
    rawToken: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = this.hash(rawToken);
    const query = `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`;

    await pool.query(query, [userId, tokenHash, expiresAt]);
  }

  /**
   * Find a valid (non-revoked, non-expired) token row by its raw value.
   * Returns null if not found, expired, or already revoked.
   *
   * @param rawToken - Plaintext token from the client cookie
   */
  async findValidRefreshToken(
    rawToken: string,
  ): Promise<RefreshTokenRow | null> {
    const tokenHash = this.hash(rawToken);
    const query = `SELECT * FROM refresh_tokens
       WHERE token_hash = $1
         AND revoked = FALSE
         AND expires_at > NOW()`;

    const result = await pool.query<RefreshTokenRow>(query, [tokenHash]);
    return result.rows[0] ?? null;
  }

  /**
   * Revoke a single token (logout current device).
   *
   * @param rawToken - Plaintext token from the client cookie
   */
  async revokeOneRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hash(rawToken);
    const query = `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`;

    await pool.query(query, [tokenHash]);
  }

  /**
   * Revoke all tokens for a user (logout all devices).
   * Not used in the current setup but available for future use.
   *
   * @param userId - Target user
   */
  async revokeAllRefreshToken(userId: string): Promise<void> {
    const query = `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`;

    await pool.query(query, [userId]);
  }
}
