import { generate } from 'otplib';
import { salt, hash, OTP, GeneratedOTP, HEX_STRING_TYPE } from '@ukef/dtfs2-common';

/**
 * Generates a new OTP code along with its salt, hash, and expiry time.
 * @returns object containing securityCode, salt, hash, and expiry
 */
export const generateOtp = async (): Promise<GeneratedOTP> => {
  console.info('Generating OTP');

  const saltBuffer = salt();
  const generatedSalt = saltBuffer.toString(HEX_STRING_TYPE);

  const securityCode = await generate({
    secret: saltBuffer,
    digits: OTP.DIGITS,
  });

  const generatedHash = hash(securityCode, generatedSalt).toString(HEX_STRING_TYPE);

  const expiry = new Date().getTime() + OTP.DURATION_MILLISECONDS;

  return {
    securityCode,
    salt: generatedSalt,
    hash: generatedHash,
    expiry,
  };
};
