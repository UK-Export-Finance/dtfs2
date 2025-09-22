import { COOKIE_SAME_SITE } from '../types';

/**
 * Constants for configuring cookie options.
 *
 * @property PREFIX - Cookie prefix, typically used for security (e.g., "__Host").
 * @property HTTP_ONLY - Indicates if the cookie should be HTTP-only.
 * @property SAME_SITE - The SameSite policy for the cookie (e.g., "strict").
 * @property PATH - The path scope of the cookie.
 * @property MAX_AGE - Maximum age of the cookie in milliseconds (e.g., 7 days).
 */
export const COOKIE = {
  NAME: {
    SECURE: '__Host-dtfs-session',
    UNSECURE: 'dtfs-session',
  },
  HTTP_ONLY: true,
  SAME_SITE: COOKIE_SAME_SITE,
  PREFIX: '__Host',
  PATH: '/',
  MAX_AGE: 604800000, // 7 days
};
