import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';

/**
 * Creates an Express error-handling middleware factory that logs errors and renders a specified view.
 *
 * @param path - The path to the view template to render when an error occurs.
 * @param options - Optional parameter to pass to express render further to the template
 * @returns An Express error-handling middleware function.
 *
 * @remarks
 * This middleware logs the error and the requested URI, then responds with a 400 Bad Request status,
 * rendering the specified view. It also calls `next()` before handling the error, which may not be the intended behavior.
 *
 * @example
 * app.use(errors('error-page'));
 */
export const errors = (path: string, options?: object) => {
  return (error: unknown, req: Request, res: Response, next: NextFunction) => {
    next();

    console.error('❌ An error has occurred for the requested URI `%s` %o', req.url, error);
    return res.status(HttpStatusCode.BadRequest).render(path, options);
  };
};
