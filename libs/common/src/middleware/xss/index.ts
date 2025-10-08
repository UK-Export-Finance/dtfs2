import { Request, Response, NextFunction } from 'express';
import { xssClean } from '../../helpers';

/**
 * Express middleware to sanitize request parameters, body, and query against XSS attacks.
 *
 * This middleware applies the `xssClean` function to `req.params`, `req.body`, and `req.query`
 * to remove potentially malicious content before passing control to the next middleware.
 * If an error occurs during sanitization, it logs the error and continues processing.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 */
export const xss = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.params) {
      req.params = xssClean(req.params) as typeof req.params;
    }

    if (req.body) {
      req.body = xssClean(req.body as Record<string, unknown>) as Record<string, unknown>;
    }

    if (req.query) {
      req.query = xssClean(req.query) as typeof req.query;
    }
  } catch (error) {
    console.error('An error has occurred while sanitising the request %s %o', req.url, error);
  }

  next();
};
