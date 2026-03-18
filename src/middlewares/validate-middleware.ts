import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ValidationError } from "@/error/custom-errors";
import { logWarn } from "@/configs/logger";

/**
 * Middleware to validate request data using Zod schemas
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * router.post('/register', validate(registerSchema), controller.register);
 * ```
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => {
          const field = issue.path.slice(1).join(".") || "body";
          console.log({ field });
          const message =
            issue.code === "invalid_type" && issue.input === undefined
              ? `${field} is required`
              : issue.message;

          return {
            field: issue.path.join("."),
            message: message,
          };
        });

        logWarn("Validation failed", {
          path: req.path,
          method: req.method,
          errors: details,
        });

        next(new ValidationError("Validation failed", details));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Helper function to get value at a path in the request object
 */
function getValueAtPath(req: Request, path: (string | number)[]): any {
  let value: any = req;

  for (const key of path) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Validate only request body
 *
 * @param schema - Zod schema for body validation
 * @returns Express middleware function
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logWarn("Body validation failed", {
          path: req.path,
          method: req.method,
          errors: details,
        });

        next(new ValidationError("Request body validation failed", details));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate only request params
 *
 * @param schema - Zod schema for params validation
 * @returns Express middleware function
 */
export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = (await schema.parseAsync(req.params)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logWarn("Params validation failed", {
          path: req.path,
          method: req.method,
          errors: details,
        });

        next(new ValidationError("Request params validation failed", details));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate only request query
 *
 * @param schema - Zod schema for query validation
 * @returns Express middleware function
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logWarn("Query validation failed", {
          path: req.path,
          method: req.method,
          errors: details,
        });

        next(new ValidationError("Request query validation failed", details));
      } else {
        next(error);
      }
    }
  };
};
