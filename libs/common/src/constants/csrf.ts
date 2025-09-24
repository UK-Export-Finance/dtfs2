/**
 * CSRF-related constants.
 *
 * @remarks
 * Contains configuration values for CSRF token handling.
 *
 */
export const CSRF = {
  SECRET: {
    /**
     * Number of bytes
     */
    BYTES: 123,
  },
  TOKEN: {
    /**
     * Hashing algorithm used for token generation using HMAC
     */
    ALGORITHM: 'SHA512',
    /**
     * CSRF token validity in microseconds
     * 30 minutes (30 * 60 * 1000)
     */
    MAX_AGE: 1800000,
  },
  VERIFY: {
    SAFE: {
      HTTP_METHODS: ['GET', 'HEAD', 'OPTIONS'],
    },
  },
};
