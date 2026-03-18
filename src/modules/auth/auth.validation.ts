import { z } from "zod";

const emailField = z
  .string({ message: "Email is required" })
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .toLowerCase()
  .trim()
  .max(255, "Email must be less than 255 characters");

const passwordField = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be less than 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  );

const loginPasswordField = z
  .string({ message: "Password is required" })
  .min(1, "Password is required");

const nameField = z
  .string({ message: "Name is required" })
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .trim();

export const registerValidation = z.object({
  body: z.object({
    email: emailField,
    name: nameField,
    password: passwordField,
  }),
});

export const loginValidation = z.object({
  body: z.object({
    email: emailField,
    password: loginPasswordField,
  }),
});

export const refreshValidation = z.object({
  cookies: z.object({
    refresh_token: z
      .string({ message: "Refresh token is required" })
      .min(1, "Refresh token is required"),
  }),
});

export const logoutValidation = z.object({
  cookies: z.object({
    refresh_token: z
      .string({ message: "Refresh token is required" })
      .min(1, "Refresh token is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerValidation>;
export type LoginInput = z.infer<typeof loginValidation>;
export type RefreshInput = z.infer<typeof refreshValidation>;
export type LogoutInput = z.infer<typeof logoutValidation>;

export type RegisterBody = RegisterInput["body"];
export type LoginBody = LoginInput["body"];
