import { isSignInOtpInDate } from './is-sign-in-otp-in-date';

describe('isSignInOtpInDate', () => {
  it('should return true if the OTP is still valid', () => {
    // Arrange
    const expiry = Date.now() + 1000; // OTP expires in 1 second

    // Act
    const result = isSignInOtpInDate(expiry);

    // Assert
    expect(result).toEqual(true);
  });

  it('should return false if the OTP has expired', () => {
    // Arrange
    const expiry = Date.now() - 1000; // OTP expired 1 second ago

    // Act
    const result = isSignInOtpInDate(expiry);

    // Assert
    expect(result).toEqual(false);
  });
});
