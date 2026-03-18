import { Express } from "express";

import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/user/user.routes";

import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error-middleware";

export const registerRoutes = (app: Express) => {
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      message: "Server is healthy",
    });
  });

  // API routes
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);

  // 404 handler for undefined routes (BEFORE error handler)
  app.use(notFoundMiddleware);

  // Global error handler (ALWAYS LAST)
  app.use(errorMiddleware);
};
