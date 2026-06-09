import { Request, Response, NextFunction } from 'express';
import { SSO_URL, SSO_URL_FORM } from '../../constants';
import { generateToken } from './csrf-sync-instance';

/**
 * Express middleware to generate and attach a CSRF token to the response.
 *
 * - Ensures that the session is initialised; throws an error if not.
 * - Generates a csrf token using csrf-sync's `generateToken` function.
 *
 * @param req - Express request object, expected to have a session property.
 * @param res - Express response object, used to attach the CSRF token.
 * @param next - Express next middleware function.
 *
 * @throws If the session is not initialized on the request object.
 */
export const create = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req?.session) {
    throw new Error('Session has not been initialised.');
  }

  /**
   * Exclude SSO redirect routes from CSRF token generation
   * as the request is initiated by an external identity provider
   * This allows users to be redirected back to the application after authentication without encountering CSRF errors.
   */
  if (req.path === SSO_URL || req.path === SSO_URL_FORM) {
    return next();
  }

  res.locals.csrfToken = generateToken(req);

  return next();
};
