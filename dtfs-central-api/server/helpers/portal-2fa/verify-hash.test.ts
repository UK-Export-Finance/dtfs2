import crypto from 'crypto';
import { hash as generateHash, salt as generateSalt, HEX_STRING_TYPE } from '@ukef/dtfs2-common';
import { verifyHash } from './verify-hash';

describe('verifyHash', () => {
  const otpSalt = generateSalt().toString(HEX_STRING_TYPE);
  const otpCode = '123456';
  const otpHash = generateHash(otpCode, otpSalt).toString(HEX_STRING_TYPE);

  describe('when the provided OTP code is correct', () => {
    it('should return true', () => {
      const result = verifyHash(otpCode, otpSalt, otpHash, 'user123');

      expect(result).toEqual(true);
    });
  });

  describe('when the provided OTP code is incorrect', () => {
    it('should return false', () => {
      const result = verifyHash('654321', otpSalt, otpHash, 'user123');

      expect(result).toEqual(false);
    });
  });

  describe('when an error occurs during hash verification', () => {
    beforeEach(() => {
      jest.mock('crypto');

      crypto.timingSafeEqual = jest.fn().mockImplementation(() => {
        throw new Error('Crypto error');
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should throw an error', () => {
      expect(() => verifyHash(otpCode, otpSalt, otpHash, 'user123')).toThrow(new Error('Error validating OTP hash'));
    });
  });
});
