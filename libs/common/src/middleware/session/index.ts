import dotenv from 'dotenv';
import session from 'express-session';
import { redisStore, isHttps } from '../../helpers';
import { COOKIE } from '../../constants';
import { InvalidEnvironmentVariableError } from '../../errors';

dotenv.config();

/**
 * Configures and initialises the session middleware with secure cookie options and Redis store.
 *
 * - Validates the presence of the `SESSION_SECRET` environment variable.
 * - Determines if HTTPS is enabled to set appropriate cookie name and security options.
 * - Sets session cookie options including path, HTTP-only, secure flag, same-site policy, and max age.
 * - Initializes session middleware with the configured options and Redis store.
 *
 * @throws {InvalidEnvironmentVariableError} If `SESSION_SECRET` is not defined.
 */
export const expressSession = () => {
  const { SESSION_SECRET } = process.env;

  if (!SESSION_SECRET) {
    console.error('Invalid environment variable `SESSION_SECRET` value supplied %s', SESSION_SECRET);
    throw new InvalidEnvironmentVariableError('Invalid environment variable `SESSION_SECRET`');
  }

  const https = isHttps();

  // Session cookie name
  const name = https ? COOKIE.NAME.SECURE : COOKIE.NAME.UNSECURE;

  const cookie: session.CookieOptions = {
    path: COOKIE.PATH,
    httpOnly: COOKIE.HTTP_ONLY,
    secure: https,
    sameSite: COOKIE.SAME_SITE,
    maxAge: 604800000, // 7 days
  };

  const options: session.SessionOptions = {
    name,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie,
    store: redisStore(),
  };

  session(options);
};
