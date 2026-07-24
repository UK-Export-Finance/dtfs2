import { HttpStatusCode } from 'axios';
import { SIGN_IN_OTP_STATUS } from '@ukef/dtfs2-common';
import { validateOtp } from './validate-otp';
import { signInTokenStatus } from './sign-in-token-status';
import { aPortalUser } from '../../../test-helpers';

jest.mock('./sign-in-token-status');

describe('validateOtp', () => {
  const user = aPortalUser();

  const mockSignInTokenStatus = signInTokenStatus as jest.Mock;

  /**
   * Verifies the OTP response mapping for each signInTokenStatus outcome, including the fallback case.
   */
  describe('when signInTokenStatus returns a known status', () => {
    it.each([
      {
        status: SIGN_IN_OTP_STATUS.VALID,
        expected: { success: true, isValid: true, statusCode: HttpStatusCode.Ok },
      },
      {
        status: SIGN_IN_OTP_STATUS.EXPIRED,
        expected: { success: false, isExpired: true, statusCode: HttpStatusCode.Unauthorized },
      },
      {
        status: SIGN_IN_OTP_STATUS.INVALID,
        expected: { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized },
      },
      {
        status: SIGN_IN_OTP_STATUS.NOT_FOUND,
        expected: { success: false, notFound: true, statusCode: HttpStatusCode.NotFound },
      },
      {
        status: 'unexpectedValue',
        expected: { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized },
      },
    ])('should return the expected response when signInTokenStatus returns $status', ({ status, expected }) => {
      // Arrange
      mockSignInTokenStatus.mockReturnValue(status);

      // Act
      const result = validateOtp('anyOtpCode', user);

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
