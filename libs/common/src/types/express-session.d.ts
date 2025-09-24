import 'express-session';

/**
 * Module augmentation
 * Extends the `SessionData` interface from the `express-session` module
 * to optionally include a `csrf` property for storing a CSRF token.
 *
 * @property csrf - An optional string representing the CSRF token associated with the session.
 */
declare module 'express-session' {
  interface SessionData {
    csrf?: string;
  }
}
