import axios, { HttpStatusCode } from 'axios';
import {
  PORTAL_LOGIN_STATUS,
  parseApiErrorResponse,
  errorsIncludeMessage,
  OtpLoginResult,
  OTP_RESULT_TYPE,
  LoginWithSignInOtpResponse,
} from '@ukef/dtfs2-common';
import * as api from '../../api';

/**
 * Calls the sign-in OTP API and returns a typed result.
 * Returns `expired` if the API response indicates the access code is expired.
 * Returns `incorrect-code` if the API responds with 401/403, or if the login status is not VALID_2FA.
 * Re-throws any other errors so the caller's catch block handles them as genuine failures.
 * @param token - The partial auth token.
 * @param userId - The user's ID.
 * @param signInOTP - The submitted OTP code.
 */
export const attemptOtpLogin = async ({ token, userId, signInOTP }: { token: string; userId: string; signInOTP: string }): Promise<OtpLoginResult> => {
  try {
    const loginResponse: LoginWithSignInOtpResponse = await api.loginWithSignInOtp({ token, userId, signInOTP });

    if (loginResponse.isExpired) {
      return { type: OTP_RESULT_TYPE.EXPIRED };
    }

    if (loginResponse.loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
      return { type: OTP_RESULT_TYPE.INCORRECT_CODE };
    }

    return { type: OTP_RESULT_TYPE.SUCCESS, loginResponse };
  } catch (apiError) {
    if (axios.isAxiosError(apiError)) {
      const status = apiError.response?.status;
      const data: unknown = apiError.response?.data;

      // Checks if data has the expected shape of an API error response, and safely extracts the `errors` array if defined.
      const errors = parseApiErrorResponse(data)?.errors;

      // Detect expired OTP by searching API error messages for the substring 'expired' (case-insensitive)
      const expiredMsg = errorsIncludeMessage(errors, 'expired');

      if ((status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) && expiredMsg) {
        return { type: OTP_RESULT_TYPE.EXPIRED };
      }

      if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
        return { type: OTP_RESULT_TYPE.INCORRECT_CODE };
      }
    }
    throw apiError;
  }
};
