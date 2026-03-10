import { OTP_RESULT_TYPE, OtpLoginResult } from '../types/2fa/otp-login-result';
import { isOtpExpired } from './is-otp-expired';

const userId = 'user-123';

describe('isOtpExpired', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the OTP result is expired', () => {
    const expiredResult: OtpLoginResult = { type: OTP_RESULT_TYPE.EXPIRED };

    it('should return true', () => {
      // Act
      const result = isOtpExpired(expiredResult, userId);

      // Assert
      expect(result).toEqual(true);
    });

    it('should log an error with the userId', () => {
      // Act
      isOtpExpired(expiredResult, userId);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Access code expired for user %s', userId);
    });
  });

  describe('when the OTP result is not expired', () => {
    it.each([
      { description: 'success', otpResult: { type: OTP_RESULT_TYPE.SUCCESS, loginResponse: {} } as unknown as OtpLoginResult },
      { description: 'incorrect code', otpResult: { type: OTP_RESULT_TYPE.INCORRECT_CODE } as OtpLoginResult },
    ])('should return false when the result is $description', ({ otpResult }) => {
      // Act
      const result = isOtpExpired(otpResult, userId);

      // Assert
      expect(result).toEqual(false);
    });

    it('should not log an error when the result is not expired', () => {
      // Arrange
      const incorrectCodeResult: OtpLoginResult = { type: OTP_RESULT_TYPE.INCORRECT_CODE };

      // Act
      isOtpExpired(incorrectCodeResult, userId);

      // Assert
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
