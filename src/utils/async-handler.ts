import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Async request handler type
 * A function that handles HTTP requests and can be async
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Promise that resolves to void or Response
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

/**
 * Wrap an async route handler to catch errors automatically
 *
 * Without this wrapper:
 * ```
 * router.get('/users', async (req, res) => {
 *   const users = await userService.getAll(); // If this throws, app crashes!
 *   res.json(users);
 * });
 * ```
 *
 * With this wrapper:
 * ```
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll(); // If this throws, error middleware handles it!
 *   res.json(users);
 * }));
 * ```
 *
 * @param fn - Async route handler function
 * @returns Express request handler that catches errors
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
