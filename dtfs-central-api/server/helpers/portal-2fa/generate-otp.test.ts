import { salt, hash, OTP, HEX_STRING_TYPE } from '@ukef/dtfs2-common';
import { generateOtp } from './generate-otp';
import { verifyHash } from './verify-hash';

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

      const expected = generatedOtp.hash.length;
      const result = hash(generatedOtp.securityCode, generatedOtp.salt).toString(HEX_STRING_TYPE).length;

      expect(result).toEqual(expected);
    });
  });

  describe('expiry', () => {
    it('should set an expiry time in the future', () => {
      const generatedOtp = generateOtp();

      const expiryTime = new Date().getTime() + OTP.DURATION_MILLISECONDS;

      expect(generatedOtp.expiry).toEqual(expiryTime);
    });
  });

  describe('cross-validation with verifyHash', () => {
    it('should generate an OTP that verifyHash can successfully validate', () => {
      const generatedOtp = generateOtp();

      const isValid = verifyHash(generatedOtp.securityCode, generatedOtp.salt, generatedOtp.hash, 'user-id');

      expect(isValid).toEqual(true);
    });
  });
});
