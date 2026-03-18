import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate } from "@/middlewares/auth-middleware";
import { validate } from "@/middlewares/validate-middleware";
import {
  getUserSchema,
  updateUserSchema,
  deleteUserSchema,
  getUsersQuerySchema,
  createUserSchema,
} from "./user.validation";

const router = Router();
const userController = new UserController();

router.get(
  "/",
  authenticate,
  validate(getUsersQuerySchema),
  userController.getAll,
);

router.post(
  "/",
  authenticate,
  validate(createUserSchema),
  userController.create,
);

router.get("/:id", authenticate, validate(getUserSchema), userController.get);

router.put(
  "/:id",
  authenticate,
  validate(updateUserSchema),
  userController.update,
);

router.delete(
  "/:id",
  authenticate,
  validate(deleteUserSchema),
  userController.delete,
);

export const userRouter = router;
