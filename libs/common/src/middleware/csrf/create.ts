import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { getEpochMs } from '../../helpers/date';
import { CSRF } from '../../constants';

/**
 * Express middleware to generate and attach a CSRF token to the response.
 *
 * - Ensures that the session is initialised; throws an error if not.
 * - Generates a session-specific CSRF secret if one does not exist.
 * - Creates a CSRF token using HMAC-SHA512 with the session secret and the current epoch time.
 * - Attaches the generated CSRF token to `res.locals.csrfToken` for use in views or subsequent middleware.
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

  if (!req.session?.csrf) {
    req.session.csrf = crypto.randomBytes(CSRF.SECRET.BYTES).toString('hex');
  }

  const now = getEpochMs().toString();
  const hash = crypto.createHmac(CSRF.TOKEN.ALGORITHM, req.session.csrf).update(now).digest('hex');
  const token = `${hash}:${now}`;

  res.locals.csrfToken = token;

  return next();
};
