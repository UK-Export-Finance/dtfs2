import { Request, Response, NextFunction } from 'express';
import { csrfSync } from 'csrf-sync';
import { isHttpError } from 'http-errors';
import { HttpStatusCode } from 'axios';
import { CSRF, SSO_URL, SSO_URL_FORM } from '../../constants';

const INVALID_CSRF_TOKEN_ERROR_CODE = 'EBADCSRFTOKEN';

const CSRF_TOKEN_BODY_PROPERTY_NAME = '_csrf';

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req: Request) =>
    ((req.body as Record<string, unknown>)?.[CSRF_TOKEN_BODY_PROPERTY_NAME] as string | undefined) ??
    ((req.query as Record<string, unknown>)?.[CSRF_TOKEN_BODY_PROPERTY_NAME] as string | undefined),
});

/**
 * Middleware to verify CSRF tokens for an incoming requests.
 *
 * This function checks if the request session is initialised, validates the HTTP method,
 * and ensures the CSRF token is present and valid. For file uploads, it moves the CSRF token
 * from the query to the body if necessary. It then verifies the token's age and integrity
 * using a timing-safe comparison.
 *
 * If the token is missing, expired, or invalid, the middleware responds with an Unauthorized status.
 * Otherwise, it calls the next middleware in the stack.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 * @returns void or a Response with Unauthorized status if verification fails.
 */
export const verify = (req: Request, res: Response, next: NextFunction): void | Response => {
  if (!req?.session) {
    throw new Error('Session has not been initialised.');
  }

  if (CSRF.VERIFY.SAFE.HTTP_METHODS.includes(req.method)) {
    return next();
  }

  /**
   * Exclude SSO redirect URL from CSRF verification
   * as the request is initiated by an external identity provider
   * This allows users to be redirected back to the application after authentication without encountering CSRF verification errors.
   */
  if (req.path === SSO_URL || req.path === SSO_URL_FORM) {
    return next();
  }

  return csrfSynchronisedProtection(req, res, (error?: unknown) => {
    /*
     * Strip the CSRF token after checking (whether validated or not) to avoid downstream validation issues and
     * unintentional forwarding (e.g. to the API).
     */
    if (req.body && typeof req.body === 'object') {
      delete (req.body as Record<string, unknown>)[CSRF_TOKEN_BODY_PROPERTY_NAME];
    }

    if (isHttpError(error) && error.code === INVALID_CSRF_TOKEN_ERROR_CODE) {
      return res.status(HttpStatusCode.Forbidden).send('Invalid CSRF token.');
    }

    return next(error);
  });
};
