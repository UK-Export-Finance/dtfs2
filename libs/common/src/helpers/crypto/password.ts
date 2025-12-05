import crypto from 'crypto';
import { PasswordHash } from '../../types';
import { CSRF } from '../../constants';

/**
 * This function generates salt and hash from a string password.
 * Password should never be stored in any storage (databases or session) rather should hashed with a random salt.
 * @param password Password to use to create hash
 * @returns object containing both salt and hash as strings
 */
export const generatePasswordHash = (password: string): PasswordHash => {
  const salt = crypto.randomBytes(CSRF.SECRET.BYTES).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, CSRF.TOKEN.ALGORITHM).toString('hex');

  return {
    salt,
    hash,
  };
};
