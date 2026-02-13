import { salt, hash, OTP, HEX_STRING_TYPE } from '@ukef/dtfs2-common';
import { generateOtp } from './generate-otp';

describe('generateOtp', () => {
  describe('security code', () => {
    it('should generate a security code of the correct length', () => {
      const generatedOtp = generateOtp();

      const securityCodeLength = generatedOtp.securityCode.length;

      expect(securityCodeLength).toEqual(OTP.DIGITS);
    });
  });

  describe('salt', () => {
    it('should generate a salt of the correct length', () => {
      const generatedOtp = generateOtp();

      const expectedSaltLength = generatedOtp.salt.length;
      const saltLength = salt().toString(HEX_STRING_TYPE).length;

      expect(expectedSaltLength).toEqual(saltLength);
    });
  });

  describe('hash', () => {
    it('should generate a hash of the correct length', () => {
      const generatedOtp = generateOtp();

      const expectedHashLength = generatedOtp.hash.length;
      const hashLength = hash(generatedOtp.securityCode, generatedOtp.salt).toString(HEX_STRING_TYPE).length;

      expect(expectedHashLength).toEqual(hashLength);
    });
  });

  describe('expiry', () => {
    it('should set an expiry time in the future', () => {
      const generatedOtp = generateOtp();

      const expiryTime = new Date().getTime() + OTP.DURATION_MILLISECONDS;

      expect(generatedOtp.expiry).toEqual(expiryTime);
    });
  });
});
