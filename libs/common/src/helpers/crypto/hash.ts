import crypto from 'crypto';
import { CRYPTO } from '../../constants';

/**
 * Generates a cryptographic hash of a password using a provided salt.
 *
 * Utilizes the PBKDF2 algorithm with parameters defined in `CRYPTO.HASHING`.
 * Throws an error if the salt or password is empty or consists only of whitespace.
 *
 * @param password - The password to hash.
 * @param salt - The cryptographic salt to use for hashing.
 * @returns A Buffer containing the resulting hash.
 * @throws Error if the salt or password is empty.
 */
export const hash = (password: string, salt: string): Buffer => {
  if (!salt.trim().length) {
    throw new Error('Salt cannot be empty');
  }

  if (!password.trim().length) {
    throw new Error('Password cannot be empty');
  }

  return crypto.pbkdf2Sync(password, salt, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM);
};
