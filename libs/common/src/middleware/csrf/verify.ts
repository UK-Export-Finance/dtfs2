import { HttpStatusCode } from 'axios';
import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import { getEpochMs } from '../../helpers/date';
import { CustomExpressRequest } from '../../types';
import { CSRF } from '../../constants';

export const verify = (
  req: CustomExpressRequest<{ query: { _csrf: string }; reqBody: { _csrf: string } }>,
  res: Response,
  next: NextFunction,
): void | Response => {
  if (!req?.session) {
    console.error('❌ Session has not been initialised for request %s', req.url);
    return res.sendStatus(HttpStatusCode.Unauthorized);
  }

  if (CSRF.VERIFY.SAFE.HTTP_METHODS.includes(req.method)) {
    return next();
  }

  const isCsrfQuery = req.query?._csrf && !req.body?._csrf;

  /**
   * Mover CSRF token from query to body for file upload
   */
  if (isCsrfQuery) {
    req.body = {
      ...req.body,
      _csrf: req.query._csrf,
    };
  }

  // Client token
  const token = req.body._csrf;
  // Server secret
  const secret = req.session.csrf;

  // CSRF token or secret is void
  if (!token || !secret) {
    return res.sendStatus(HttpStatusCode.Unauthorized);
  }

  const [clientHash, timestamp] = token.split(':');
  const past = parseInt(String(timestamp), 10);

  // If an invalid CSRF token has been received
  if (!clientHash || !timestamp || Number.isNaN(past)) {
    return res.sendStatus(HttpStatusCode.Unauthorized);
  }

  const now = getEpochMs();
  const age = now - past;

  /**
   * Token age validation.
   *
   * If the token was generated over 30 minutes ago
   * then mark the token as stale and send an unauthorised response.
   */
  if (age > CSRF.TOKEN.MAX_AGE) {
    return res.sendStatus(HttpStatusCode.Unauthorized);
  }

  const serverHash = crypto.createHmac(CSRF.TOKEN.ALGORITHM, secret).update(timestamp).digest('hex');
  const clientBuffer = Buffer.from(clientHash, 'hex') as unknown as Uint8Array;
  const serverBuffer = Buffer.from(serverHash, 'hex') as unknown as Uint8Array;

  const equalLength = clientHash.length === serverHash.length;
  const equalBuffer = crypto.timingSafeEqual(clientBuffer, serverBuffer);
  const valid = equalLength && equalBuffer;

  if (!valid) {
    console.error('Invalid CSRF token has been supplied, unauthorised request');
    return res.sendStatus(HttpStatusCode.Unauthorized);
  }

  return next();
};
