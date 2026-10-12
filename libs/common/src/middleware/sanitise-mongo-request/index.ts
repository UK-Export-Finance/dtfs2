import type { RequestHandler } from 'express';
import mongoSanitise from 'express-mongo-sanitize';

export type SanitiseTarget = Record<string, unknown> | unknown[];

/**
 * Checks if a value can be sanitised by the `express-mongo-sanitize` library.
 * excludes `null` and primitives so we only pass objects and arrays to the sanitization function.
 * @param value - The value to check for sanitisation eligibility.
 * @returns True if the value is an object or array, false otherwise.
 */
export const canBeSanitised = (value: unknown): value is SanitiseTarget => Array.isArray(value) || (typeof value === 'object' && value !== null);

/**
 * Sanitises request input that may contain MongoDB operators.
 * We sanitise in-place rather than replacing request properties, which avoids
 * Express 5 issues with read-only accessors (for example, `req.query`).
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const sanitiseMongoRequest: RequestHandler = (req, _res, next) => {
  [req.body, req.params, req.headers, req.query].forEach((value) => {
    if (canBeSanitised(value)) {
      mongoSanitise.sanitize(value, { allowDots: true });
    }
  });

  next();
};
