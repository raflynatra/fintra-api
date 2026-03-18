import { UserRepository } from "./user.repository";
import {
  UserNotFoundError,
  RequiredFieldError,
  ValidationError,
  InternalServerError,
  UserAlreadyExistsError,
} from "@/error/custom-errors";
import { logWarn, logError } from "@/configs/logger";
import { CreateUserRequest, UpdateUserRequest } from "./user.types";
import { generatePassword } from "@/utils";
import bcrypt from "bcrypt";

export class UserService {
  private userRepo: UserRepository;

  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async getAll() {
    try {
      return await this.userRepo.findAllActive();
    } catch (error) {
      logError("Failed to fetch users", error);
      throw error;
    }
  }

  async get(userId?: string) {
    if (!userId) {
      logWarn("Get user failed - user ID is required");
      throw new RequiredFieldError("id", "User ID is required");
    }

    try {
      const user = await this.userRepo.findById(userId);

      if (!user) {
        logWarn("Get user failed - user not found", { userId });
        throw new UserNotFoundError("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFoundError) throw error;
      logError("Get user failed - unexpected error", error, { userId });
      throw error;
    }
  }

  async getByEmail(email: string) {
    if (!email) {
      logWarn("Get user failed - email is required");
      throw new RequiredFieldError("email", "Email is required");
    }

    try {
      const user = await this.userRepo.findByEmail(email);

      if (!user) {
        logWarn("Get user failed - user not found", { email });
        throw new UserNotFoundError("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFoundError) throw error;
      logError("Get user failed - unexpected error", error, { email });
      throw error;
    }
  }

  async getByEmailWithPassword(email: string) {
    if (!email) {
      logWarn("Get user failed - email is required");
      throw new RequiredFieldError("email", "Email is required");
    }

    try {
      const user = await this.userRepo.findByEmailWithPassword(email);

      if (!user) {
        logWarn("Get user failed - user not found", { email });
        throw new UserNotFoundError("User not found");
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFoundError) throw error;
      logError("Get user failed - unexpected error", error, { email });
      throw error;
    }
  }

  async checkEmailExists(email: string) {
    if (!email) {
      logWarn("Check email failed - email is required");
      throw new RequiredFieldError("email", "Email is required");
    }

    try {
      return await this.userRepo.checkEmailExists(email);
    } catch (error) {
      logError("Check email failed - unexpected error", error, { email });
      throw error;
    }
  }

  async create(payload: CreateUserRequest) {
    try {
      const existingUser = await this.userRepo.checkEmailExists(payload.email);
      if (existingUser) {
        logWarn("Create user failed - email already exists", {
          email: payload.email,
        });
        throw new UserAlreadyExistsError(
          "An account with this email already exists",
        );
      }

      const plainPassword = payload.password || generatePassword({ length: 8 });
      const hashedPassword = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);

      const user = await this.userRepo.create({
        ...payload,
        password: hashedPassword,
      });

      if (!user) {
        logError("Create user failed - unexpected error", undefined, {
          payload,
        });
        throw new InternalServerError("Failed to create user");
      }

      return user;
    } catch (error) {
      if (
        error instanceof UserAlreadyExistsError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      logError("Create user failed - unexpected error", error, { payload });
      throw error;
    }
  }

  async update(userId: string, payload: UpdateUserRequest) {
    try {
      const existingUser = await this.userRepo.findById(userId);
      if (!existingUser) {
        logWarn("Update user failed - user not found", { userId });
        throw new UserNotFoundError("User not found");
      }

      const updatedUser = await this.userRepo.updateById(userId, payload);

      if (!updatedUser) {
        logError(
          "Update user failed - user not found after update",
          undefined,
          { userId },
        );
        throw new UserNotFoundError("User not found after update");
      }

      return updatedUser;
    } catch (error) {
      if (
        error instanceof UserNotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      logError("Update user failed - unexpected error", error, { userId });
      throw error;
    }
  }

  async delete(userId: string) {
    try {
      const existingUser = await this.userRepo.findById(userId);
      if (!existingUser) {
        logWarn("Delete user failed - user not found", { userId });
        throw new UserNotFoundError("User not found");
      }

      return await this.userRepo.delete(userId);
    } catch (error) {
      if (error instanceof UserNotFoundError) throw error;
      logError("Delete user failed - unexpected error", error, { userId });
      throw error;
    }
  }

  generatePasswordForUser(length: number = 12): string {
    return generatePassword({ length });
  }

  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }
}
