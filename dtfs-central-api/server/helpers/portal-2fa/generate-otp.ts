import { authenticator } from 'otplib';
import { salt, hash, OTP, GeneratedOTP } from '@ukef/dtfs2-common';

export const generateOtp = (): GeneratedOTP => {
  console.info('Generating OTP');

  const generatedSalt = salt().toString('hex');

  authenticator.options = { digits: OTP.DIGITS };

  const securityCode = authenticator.generate(generatedSalt);

  const generatedHash = hash(securityCode, generatedSalt).toString('hex');

  const expiry = new Date().getTime() + OTP.DURATION_MILLISECONDS;

  return {
    securityCode,
    salt: generatedSalt,
    hash: generatedHash,
    expiry,
  };
};
