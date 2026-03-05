import { OTP_RESULT_TYPE, OtpLoginResult } from '../types/2fa/otp-login-result';

/**
 * Type predicate that checks whether the OTP login result is expired.
 * When it returns true, logs an error so the caller can redirect and early-return.
 * When it returns false, TypeScript narrows otpResult to the non-expired union members
 * (success | incorrect-code), allowing safe access to loginResponse.
 * @param otpResult - The result of the OTP login attempt.
 * @param userId - The user's ID, used in the error log for traceability.
 */
export const isOtpExpired = (otpResult: OtpLoginResult, userId: string): otpResult is Extract<OtpLoginResult, { type: typeof OTP_RESULT_TYPE.EXPIRED }> => {
  if (otpResult.type !== OTP_RESULT_TYPE.EXPIRED) {
    return false;
  }

  console.error('Access code expired for user %s', userId);

  return true;
};
