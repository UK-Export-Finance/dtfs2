import crypto from 'crypto';
import { hash as generateHash, salt as generateSalt, HEX_STRING_TYPE } from '@ukef/dtfs2-common';
import { verifyHash } from './verify-hash';

describe('verifyHash', () => {
  const otpSalt = generateSalt().toString(HEX_STRING_TYPE);
  const otpCode = '123456';
  const otpHash = generateHash(otpCode, otpSalt).toString(HEX_STRING_TYPE);
  const maliciousUserId = 'user123\n!@#$';
  const sanitisedUserId = maliciousUserId.replace(/[^a-zA-Z0-9_-]/g, '');

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the provided OTP code is correct', () => {
    it('should return true', () => {
      const result = verifyHash(otpCode, otpSalt, otpHash, maliciousUserId);

      expect(result).toEqual(true);
      expect(console.info).toHaveBeenNthCalledWith(1, 'Validating OTP hash for user %s', sanitisedUserId);
    });
  });

  describe('when the provided OTP code is incorrect', () => {
    it('should return false', () => {
      const result = verifyHash('654321', otpSalt, otpHash, maliciousUserId);

      expect(result).toEqual(false);
      expect(console.info).toHaveBeenNthCalledWith(1, 'Validating OTP hash for user %s', sanitisedUserId);
    });
  });

  describe('when an error occurs during hash verification', () => {
    beforeEach(() => {
      jest.spyOn(crypto, 'timingSafeEqual').mockImplementation(() => {
        throw new Error('Crypto error');
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw an error', () => {
      expect(() => verifyHash(otpCode, otpSalt, otpHash, maliciousUserId)).toThrow(new Error('Error validating OTP hash'));

      expect(console.info).toHaveBeenNthCalledWith(1, 'Validating OTP hash for user %s', sanitisedUserId);
      expect(console.error).toHaveBeenNthCalledWith(1, 'Error validating OTP hash for user %s: %o', sanitisedUserId, expect.any(Error));
    });
  });
});
