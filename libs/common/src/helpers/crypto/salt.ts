import crypto from 'crypto';
import { CRYPTO } from '../../constants';

/**
 * Generates a cryptographically secure random salt as a Buffer.
 *
 * The salt is created using the number of bytes specified by `CRYPTO.SALT.BYTES`.
 * This is typically used for hashing or cryptographic operations where a unique salt is required.
 *
 * @param bytes The number of random bytes to generate for the salt. Defaults to `CRYPTO.SALT.BYTES`.
 * @returns A buffer containing random bytes to be used as a salt.
 */
export const salt = (bytes = CRYPTO.SALT.BYTES): Buffer => crypto.randomBytes(bytes);
