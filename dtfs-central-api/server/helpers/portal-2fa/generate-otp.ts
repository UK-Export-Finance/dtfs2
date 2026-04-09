import { authenticator } from 'otplib';
import { salt, hash, OTP, GeneratedOTP, HEX_STRING_TYPE } from '@ukef/dtfs2-common';

/**
 * Generates a new OTP code along with its salt, hash, and expiry time.
 * @returns object containing securityCode, salt, hash, and expiry
 */
export const generateOtp = (): GeneratedOTP => {
  console.info('Generating OTP');

  const generatedSalt = salt().toString(HEX_STRING_TYPE);

  // options for OTP generation - setting number of digits
  authenticator.options = { digits: OTP.DIGITS };

  const securityCode = authenticator.generate(generatedSalt);

  const generatedHash = hash(securityCode, generatedSalt).toString(HEX_STRING_TYPE);

  const expiry = new Date().getTime() + OTP.DURATION_MILLISECONDS;

  return {
    securityCode,
    salt: generatedSalt,
    hash: generatedHash,
    expiry,
  };
};
