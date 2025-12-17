import crypto from 'crypto';
import { hash } from '@ukef/dtfs2-common';

export const verifyHash = (securityCode: string, otpSalt: string, otpHash: string) => {
  try {
    console.info('Validating OTP');

    const hashVerify = hash(securityCode, otpSalt);
    const otpHashBuffer = Buffer.from(otpHash, 'hex');

    return crypto.timingSafeEqual(otpHashBuffer, hashVerify);
  } catch (error) {
    console.error('Error validating OTP %o', error);

    throw new Error(`Error validating OTP`);
  }
};
