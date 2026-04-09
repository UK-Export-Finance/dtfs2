import { HttpStatusCode } from 'axios';
import { PortalUser, SIGN_IN_OTP_STATUS } from '@ukef/dtfs2-common';
import { signInTokenStatus } from './sign-in-token-status';

/**
 * Validates provided OTP code
 * if successful, returns success and isValid flag as true and statusCode
 * if unsuccessful, returns success as false with appropriate flags and statusCode
 * @param otpCode - provided OTP code
 * @param user - user object
 * @returns validation result object
 */
export const validateOtp = (otpCode: string, user: PortalUser) => {
  const status = signInTokenStatus(user, otpCode);

  switch (status) {
    case SIGN_IN_OTP_STATUS.VALID:
      return { success: true, isValid: true, statusCode: HttpStatusCode.Ok };
    case SIGN_IN_OTP_STATUS.EXPIRED:
      return { success: false, isExpired: true, statusCode: HttpStatusCode.Unauthorized };
    case SIGN_IN_OTP_STATUS.INVALID:
      return { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized };
    case SIGN_IN_OTP_STATUS.NOT_FOUND:
      return { success: false, notFound: true, statusCode: HttpStatusCode.NotFound };
    default:
      return { success: false, isInvalid: true, statusCode: HttpStatusCode.Unauthorized };
  }
};
