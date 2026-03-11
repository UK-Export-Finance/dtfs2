import axios, { HttpStatusCode } from 'axios';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';

export const OTP_RESULT_TYPE = {
  SUCCESS: 'success',
  INCORRECT_CODE: 'incorrect-code',
} as const;

type OtpLoginResult = { type: typeof OTP_RESULT_TYPE.SUCCESS; loginResponse: LoginWithSignInOtpResponse } | { type: typeof OTP_RESULT_TYPE.INCORRECT_CODE };
/**
 * Calls the sign-in OTP API and returns a typed result.
 * Returns `incorrect-code` if the API responds with 401/403, or if the login status is not VALID_2FA.
 * Re-throws any other errors so the caller's catch block handles them as genuine failures.
 * @param token - The partial auth token.
 * @param userId - The user's ID.
 * @param signInOTP - The submitted OTP code.
 */
export const attemptOtpLogin = async ({ token, userId, signInOTP }: { token: string; userId: string; signInOTP: string }): Promise<OtpLoginResult> => {
  try {
    const loginResponse: LoginWithSignInOtpResponse = await api.loginWithSignInOtp({ token, userId, signInOTP });

    if (loginResponse.loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
      return { type: OTP_RESULT_TYPE.INCORRECT_CODE };
    }

    return { type: OTP_RESULT_TYPE.SUCCESS, loginResponse };
  } catch (apiError) {
    const status = axios.isAxiosError(apiError) ? apiError.response?.status : undefined;

    if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
      return { type: OTP_RESULT_TYPE.INCORRECT_CODE };
    }

    throw apiError;
  }
};
