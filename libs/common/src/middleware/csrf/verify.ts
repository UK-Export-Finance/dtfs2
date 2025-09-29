import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import { getEpochMs } from '../../helpers/date';
import { CustomExpressRequest } from '../../types';
import { CSRF } from '../../constants';

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
 * @param req - The custom Express request object, containing session, query, and body.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 * @returns void or a Response with Unauthorized status if verification fails.
 */
export const verify = (
  req: CustomExpressRequest<{ query: { _csrf?: string }; reqBody: { _csrf: string } }>,
  _res: Response,
  next: NextFunction,
): void | Response => {
  if (!req?.session) {
    throw new Error('Session has not been initialised.');
  }

  if (CSRF.VERIFY.SAFE.HTTP_METHODS.includes(req.method)) {
    return next();
  }

  const isCsrfQuery = req.query?._csrf && !req.body?._csrf;

  /**
   * Move CSRF token from query to body for file upload
   */
  if (isCsrfQuery) {
    req.body = {
      ...req.body,
      _csrf: req.query._csrf as string,
    };
  }

  // Server secret
  const secret = req.session.csrf;

  // CSRF token or secret is void
  if (!secret) {
    throw new Error('Invalid CSRF secret.');
  }

  // Client token
  const token = req.body._csrf;

  if (!token) {
    throw new Error('Invalid CSRF token.');
  }

  const [clientHash, timestamp] = token.split(':');
  const past = parseInt(String(timestamp), 10);

  // If an invalid CSRF token has been received
  if (!clientHash || !timestamp || Number.isNaN(past)) {
    throw new Error('Invalid token has been received.');
  }

  const now = getEpochMs();
  const age = now - past;

  /**
   * Token age validation.
   *
   * If the token was generated over 60 minutes ago
   * then mark the token as stale and send an unauthorised response.
   */
  if (age > CSRF.TOKEN.MAX_AGE) {
    throw new Error('CSRF token is either invalid or has expired.');
  }

  const serverHash = crypto.createHmac(CSRF.TOKEN.ALGORITHM, secret).update(timestamp).digest('hex');
  const clientBuffer = Buffer.from(clientHash, 'hex') as unknown as Uint8Array;
  const serverBuffer = Buffer.from(serverHash, 'hex') as unknown as Uint8Array;

  const equalLength = clientHash.length === serverHash.length;
  const equalBuffer = crypto.timingSafeEqual(clientBuffer, serverBuffer);
  const valid = equalLength && equalBuffer;

  if (!valid) {
    throw new Error('Invalid CSRF token has been supplied.');
  }

  /**
   * If valid, invalid CSRF secret for renewal
   */
  req.session.csrf = undefined;

  return next();
};
