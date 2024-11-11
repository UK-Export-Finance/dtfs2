import { NextFunction, Request, Response } from 'express';

/**
 * Wraps the route in a try-catch block, passing any errors to the next function.
 * This is required in express 4 to catch async errors with the built in error handler.
 * It is not required for synchronous routes.
 * @param req
 * @param res
 * @param next
 * @param route
 */
export const errorHandlingAdaptor = async (
  req: Request,
  res: Response,
  next: NextFunction,
  // Parameter names changed to avoid shadowing the existing parameters of this function
  route: (request: Request, response: Response, nextFunction: NextFunction) => unknown,
) => {
  try {
    await route(req, res, next);
  } catch (error) {
    next(error);
  }
};
