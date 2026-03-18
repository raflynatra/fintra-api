import { z } from "zod";

const userIdSchema = z
  .uuid("Invalid user ID format")
  .min(1, "User ID is required");

const emailSchema = z
  .email("Invalid email format")
  .min(1)
  .max(255, "Email must not exceed 255 characters")
  .toLowerCase()
  .trim();

const nameSchema = z
  .string({
    message: "Name must be a string",
  })
  .nonempty("Name cannot be empty")
  .max(100, "Name must not exceed 100 characters")
  .trim();

export const getUserSchema = z.object({
  params: z.object({
    id: userIdSchema,
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: nameSchema,
    email: emailSchema,
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: userIdSchema,
  }),
  body: z.object({
    name: nameSchema,
    email: emailSchema.optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: userIdSchema,
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().min(1).max(1000)),
    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().min(1).max(100)),
    search: z.string().optional(),
    status: z.enum(["0", "1"]).optional(),
  }),
});

export type GetUserInput = z.infer<typeof getUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;

export type GetUserParams = z.infer<typeof getUserSchema>["params"];
export type UpdateUserParams = z.infer<typeof updateUserSchema>["params"];
export type UpdateUserBody = z.infer<typeof updateUserSchema>["body"];
export type DeleteUserParams = z.infer<typeof deleteUserSchema>["params"];
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>["query"];
