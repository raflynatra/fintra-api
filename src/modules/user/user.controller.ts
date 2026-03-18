import { Response, Request } from "express";
import { UserService } from "./user.service";
import { asyncHandler } from "@/utils/async-handler";
import { sendSuccess, sendNoContent, sendCreated } from "@/utils/api-response";
import { CreateUserRequest, UpdateUserRequest } from "./user.types";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.userService.getAll();

    return sendSuccess(res, users);
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await this.userService.get(Array.isArray(id) ? id[0] : id);

    return sendSuccess(res, user);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as CreateUserRequest;

    await this.userService.create(payload);

    return sendCreated(res, null, "User created successfully");
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const request = req.body as UpdateUserRequest;
    await this.userService.update(Array.isArray(id) ? id[0] : id, request);

    return sendSuccess(res, null, "User updated successfully");
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.userService.delete(Array.isArray(id) ? id[0] : id);

    return sendNoContent(res);
  });
}
