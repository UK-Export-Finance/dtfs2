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
    BYTES: 128,
  },
  TOKEN: {
    /**
     * Hashing algorithm used for token generation using HMAC
     */
    ALGORITHM: 'SHA512',
    /**
     * CSRF token validity in microseconds
     * 60 minutes (60 * 60 * 1000)
     */
    MAX_AGE: 3600000,
  },
  VERIFY: {
    SAFE: {
      HTTP_METHODS: ['GET', 'HEAD', 'OPTIONS'],
    },
  },
};
