import { RequestHandler } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import { isHttps } from '../is-https';
// import { redisStore } from './configure-redis-cache';
import { COOKIE } from '../../constants';
import { InvalidEnvironmentVariableError } from '../../errors';

dotenv.config();

/**
 * Configures and returns an Express session middleware instance.
 *
 * This function reads the `SESSION_SECRET` environment variable and throws an error if it is not set.
 * It determines whether to use secure cookies based on the current protocol (HTTPS).
 * The session cookie name and options are set according to the security context.
 * The session is configured to use a Redis store, and cookies are set with appropriate options.
 *
 * @throws If the `SESSION_SECRET` environment variable is missing or invalid.
 * @returns Configured Express session middleware.
 */
export const expressSession = (): RequestHandler => {
  const { SESSION_SECRET } = process.env;

  if (!SESSION_SECRET) {
    console.error('Invalid environment variable `SESSION_SECRET` value supplied %s', SESSION_SECRET);
    throw new InvalidEnvironmentVariableError('Invalid environment variable `SESSION_SECRET`');
  }

  const secure = isHttps();

  // Session cookie name
  const name = secure ? COOKIE.NAME.SECURE : COOKIE.NAME.UNSECURE;

  // Session cookie configuration
  const cookie: session.CookieOptions = {
    secure,
    path: COOKIE.PATH,
    httpOnly: COOKIE.HTTP_ONLY,
    sameSite: COOKIE.SAME_SITE,
    maxAge: COOKIE.MAX_AGE,
  };

  // Express session configuration
  const options: session.SessionOptions = {
    name,
    cookie,
    secret: SESSION_SECRET,
    store: undefined,
    resave: false,
    saveUninitialized: true,
  };

  return session(options);
};
