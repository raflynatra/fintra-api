import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "@/middlewares/validate-middleware";
import {
  registerValidation,
  loginValidation,
  refreshValidation,
  logoutValidation,
} from "./auth.validation";
import {
  loginRateLimiter,
  refreshRateLimiter,
  registerRateLimiter,
} from "@/middlewares/auth-middleware";

const router = Router();

const authController = new AuthController();

router.post(
  "/register",
  registerRateLimiter,
  validate(registerValidation),
  authController.register,
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginValidation),
  authController.login,
);

router.post(
  "/refresh",
  refreshRateLimiter,
  validate(refreshValidation),
  authController.refresh,
);

router.post("/logout", validate(logoutValidation), authController.logout);

export { router as authRouter };
