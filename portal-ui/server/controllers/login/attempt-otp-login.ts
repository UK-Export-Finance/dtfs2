import axios, { HttpStatusCode } from 'axios';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import { OTP_RESULT_TYPE, OtpLoginResult } from '../../types/2fa/otp-login-result';
import * as api from '../../api';

export { OTP_RESULT_TYPE } from '../../types/2fa/otp-login-result';

type ApiErrorResponse = {
  errors?: Array<{ msg?: string }>;
};

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

    if (loginResponse.isExpired || loginResponse.loginStatus === 'EXPIRED') {
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

      let errors: ApiErrorResponse['errors'];

      if (data && typeof data === 'object' && !Array.isArray(data) && 'errors' in data) {
        const { errors: extractedErrors } = data as ApiErrorResponse;
        errors = extractedErrors;
      }

      // Detect expired OTP by error message text
      const expiredMsg = errors && Array.isArray(errors) ? errors.find((e) => typeof e.msg === 'string' && e.msg.includes('expired')) : undefined;

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
