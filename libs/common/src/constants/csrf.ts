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
  },
  VERIFY: {
    SAFE: {
      HTTP_METHODS: ['GET', 'HEAD', 'OPTIONS'],
    },
  },
  CSRF_TOKEN_BODY_PROPERTY_NAME: '_csrf',
  INVALID_CSRF_TOKEN_ERROR_CODE: 'EBADCSRFTOKEN',
};
