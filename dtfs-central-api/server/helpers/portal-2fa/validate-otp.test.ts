import { HttpStatusCode } from 'axios';
import { SIGN_IN_OTP_STATUS } from '@ukef/dtfs2-common';
import { validateOtp } from './validate-otp';
import { signInTokenStatus } from './sign-in-token-status';
import { aPortalUser } from '../../../test-helpers';

jest.mock('./sign-in-token-status');

describe('validateOtp', () => {
  const user = aPortalUser();

  const mockSignInTokenStatus = signInTokenStatus as jest.Mock;

  describe(`when signInTokenStatus returns ${SIGN_IN_OTP_STATUS.VALID}`, () => {
    it(`should return success true with isValid true and statusCode ${HttpStatusCode.Ok}`, () => {
      // Arrange
      mockSignInTokenStatus.mockReturnValue(SIGN_IN_OTP_STATUS.VALID);

      // Act
      const result = validateOtp('anyOtpCode', user);

      // Assert
      const expected = { success: true, isValid: true, statusCode: HttpStatusCode.Ok };

      expect(result).toEqual(expected);
    });
  });

  describe(`when signInTokenStatus returns ${SIGN_IN_OTP_STATUS.EXPIRED}`, () => {
    it(`should return success false with isExpired true and statusCode ${HttpStatusCode.Unauthorized}`, () => {
      // Arrange
      mockSignInTokenStatus.mockReturnValue(SIGN_IN_OTP_STATUS.EXPIRED);

      // Act
      const result = validateOtp('anyOtpCode', user);

      // Assert
      const expected = { success: false, isExpired: true, statusCode: HttpStatusCode.Unauthorized };

      expect(result).toEqual(expected);
    });
  });

  describe(`when signInTokenStatus returns ${SIGN_IN_OTP_STATUS.INVALID}`, () => {
    it(`should return success false with isInvalid true and statusCode ${HttpStatusCode.Unauthorized}`, () => {
      // Arrange
      mockSignInTokenStatus.mockReturnValue(SIGN_IN_OTP_STATUS.INVALID);

      // Act
      const result = validateOtp('anyOtpCode', user);

      // Assert
      const expected = { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized };

      expect(result).toEqual(expected);
    });
  });

  describe(`when signInTokenStatus returns ${SIGN_IN_OTP_STATUS.NOT_FOUND}`, () => {
    it(`should return success false with notFound true and statusCode ${HttpStatusCode.NotFound}`, () => {
      // Arrange
      mockSignInTokenStatus.mockReturnValue(SIGN_IN_OTP_STATUS.NOT_FOUND);

      // Act
      const result = validateOtp('anyOtpCode', user);

      // Assert
      const expected = { success: false, notFound: true, statusCode: HttpStatusCode.NotFound };

      expect(result).toEqual(expected);
    });
  });

  describe('when signInTokenStatus returns an unexpected value', () => {
    it(`should return success false with isInvalid true and statusCode ${HttpStatusCode.Unauthorized}`, () => {
      // Arrange
      mockSignInTokenStatus.mockReturnValue('unexpectedValue');

      // Act
      const result = validateOtp('anyOtpCode', user);

      // Assert
      const expected = { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized };

      expect(result).toEqual(expected);
    });
  });
});
