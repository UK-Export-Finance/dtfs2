import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';

/**
 * Middleware factory that returns a handler for non-existent routes.
 *
 * Logs the requested URL and responds with a 404 status, rendering the specified view.
 * Passes the current user from the session (if available) to the view.
 *
 * @param path - The path to the view template to render for not found routes.
 * @param options - Optional parameter to pass to express render further to the template
 * @returns An Express middleware function handling 404 responses.
 */
export const notFound = (path: string, options?: object) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.info('Requested URL %s does not exist.', req.url);

    res.status(HttpStatusCode.NotFound).render(path, options);

    return next();
  };
};
