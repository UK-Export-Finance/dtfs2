import crypto from 'crypto';
import { CRYPTO } from '../../constants';

/**
 * Generates a cryptographically secure random salt as a Buffer.
 *
 * The salt is created using the number of bytes specified by `CSRF.SECRET.BYTES`.
 * This is typically used for hashing or cryptographic operations where a unique salt is required.
 *
 * @returns A buffer containing random bytes to be used as a salt.
 */
export const salt = (): Buffer => crypto.randomBytes(CRYPTO.SALT.BYTES);
