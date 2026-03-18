import { JwtPayload } from "jsonwebtoken";
import { CreateUserRequest, UserResponse } from "../user";

export interface RegisterRequest extends CreateUserRequest {
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Pick<UserResponse, "email" | "name">;
  token?: string;
  refreshToken?: string;
}

export interface AppJWTPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export const REFRESH_TOKEN_COOKIE = "refresh_token" as const;
