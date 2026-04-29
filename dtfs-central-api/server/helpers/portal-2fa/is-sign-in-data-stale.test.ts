import { OTP } from '@ukef/dtfs2-common';
import { isSignInDataStale } from './is-sign-in-data-stale';

describe('isSignInDataStale', () => {
  it('should return false if signInOTPSendDate is not provided', () => {
    // Act
    const result = isSignInDataStale();

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false if signInOTPSendDate is within the stale period', () => {
    // Arrange
    const signInOTPSendDate = new Date(Date.now() - OTP.TIME_TO_RESET_SIGN_IN_OTP_SEND_COUNT_IN_MILLISECONDS + 1000);

    // Act
    const result = isSignInDataStale(signInOTPSendDate);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return true if signInOTPSendDate is outside the stale period', () => {
    // Arrange
    const signInOTPSendDate = new Date(Date.now() - OTP.TIME_TO_RESET_SIGN_IN_OTP_SEND_COUNT_IN_MILLISECONDS - 1000);

    // Act
    const result = isSignInDataStale(signInOTPSendDate);

    // Assert
    expect(result).toEqual(true);
  });
});
