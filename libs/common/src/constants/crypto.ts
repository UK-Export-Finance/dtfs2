/**
 * Cryptography-related constants used throughout the application.
 */
// TODO: DTFS2-8243 - Align EXIPs with DTFS crypto standards
export const CRYPTO = {
  // Configuration for password hashing
  HASHING: {
    /**
     * Number of hashing iterations for key derivation
     *
     * @remarks https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
     */
    ITERATIONS: 210_000,
    // Desired length of the derived key in bytes
    KEY_LENGTH: 128,
    // Hashing algorithm to use (e.g., 'SHA512')
    ALGORITHM: 'SHA512',
  },
  SALT: {
    // Salt random bytes
    BYTES: 128,
  },
};
