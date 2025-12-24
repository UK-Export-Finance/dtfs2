import crypto from 'crypto';
import { hash } from '@ukef/dtfs2-common';

/**
 * verifies provided otp code against stored hash and salt
 * generates hash from provided otp code and salt
 * then compares it to stored hash
 * @param otpCode - user entered OTP code
 * @param otpSalt - salt stored in database
 * @param otpHash - hash stored in database for generated OTP code
 * @returns true or false if hashes match
 */
export const verifyHash = (otpCode: string, otpSalt: string, otpHash: string) => {
  try {
    console.info('Validating OTP hash');

    /**
     * generates a hash for the provided OTP code
     * uses hash from database for generated OTP code
     * compares both hashes in a timing safe way
     */
    const hashVerify = hash(otpCode, otpSalt);
    // convert stored hash hex to buffer for comparison
    const otpHashBuffer = Buffer.from(otpHash, 'hex');

    return crypto.timingSafeEqual(new Uint8Array(otpHashBuffer), new Uint8Array(hashVerify));
  } catch (error) {
    console.error('Error validating OTP hash %o', error);

    throw new Error(`Error validating OTP hash`);
  }
};
