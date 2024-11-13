import { NextFunction, Request, Response } from 'express';

/**
 * Wraps the route in a try-catch block, passing any errors to the next function.
 * This is required in Express 4 to catch async errors with the built in error handler.
 * It is not required for synchronous routes.
 * @example
 * // Existing route
 * router.route('/endpointUri').get(otherMiddleware, controller.getSomething);
 * // Route with error handling adaptor
 * router.route('/endpointUri').get(otherMiddleware, errorHandlingAdaptor(controller.getSomething));
 * @param req
 * @param res
 * @param next
 * @param route
 */
export const errorHandlingAdaptor = (
  // Parameter names changed to avoid shadowing the variables of this function
  route: (request: Request, response: Response, nextFunction: NextFunction) => unknown,
) => {
  const errorHandlingWrapper = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await route(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  return errorHandlingWrapper;
};
