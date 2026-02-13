import crypto from 'crypto';
import { hash as generateHash, HEX_STRING_TYPE } from '@ukef/dtfs2-common';

/**
 * verifies provided otp code against stored hash and salt
 * generates hash from provided otp code and salt
 * then compares it to stored hash
 * @param otpCode - user entered OTP code
 * @param otpSalt - salt stored in database
 * @param otpHash - hash stored in database for generated OTP code
 * @param userId - user ID
 * @returns true or false if hashes match
 */
export const verifyHash = (otpCode: string, otpSalt: string, otpHash: string, userId: string) => {
  try {
    console.info('Validating OTP hash for user %s', userId);

    // generate hash from provided otp code and salt
    const generatedOTPHash = generateHash(otpCode, otpSalt);

    // convert stored hash hex to buffer for comparison
    const storedOTPHash = Buffer.from(otpHash, HEX_STRING_TYPE);

    // compare generated hash to stored hash
    return crypto.timingSafeEqual(new Uint8Array(storedOTPHash), new Uint8Array(generatedOTPHash));
  } catch (error) {
    console.error('Error validating OTP hash for user %s: %o', userId, error);

    throw new Error(`Error validating OTP hash`);
  }
};
