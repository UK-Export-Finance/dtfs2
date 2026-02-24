import axios, { HttpStatusCode } from 'axios';
import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import { OTP_RESULT_TYPE, OtpLoginResult } from '../../types/2fa/otp-login-result';
import * as api from '../../api';
import { updateSessionAfterLogin } from '../../helpers/updateSessionsAfterLogin';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';
import { CheckYourEmailAccessCodeViewModel } from '../../types/view-models/2fa/check-your-email-access-code-view-model';

type ApiErrorResponse = {
  errors?: Array<{ msg?: string }>;
};

const CHECK_YOUR_EMAIL_TEMPLATE = 'login/check-your-email-access-code.njk';

const REQUEST_NEW_CODE_URL = '/login/new-access-code';

type PostCheckYourEmailAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userId?: string; userToken?: string; userEmail?: string };

export type PostCheckYourEmailAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostCheckYourEmailAccessCodePageRequestSession;
  body: {
    sixDigitAccessCode: string;
  };
};

/**
 * Calls the sign-in OTP API and returns a typed result.
 *
 * - Returns `{ type: 'expired' }` if the API response indicates the access code is expired (via isExpired property, loginStatus 'EXPIRED', or error message containing 'expired').
 * - Returns `{ type: 'incorrect-code' }` if the API responds with 401/403 or login status is not VALID_2FA.
 * - Returns `{ type: 'success', loginResponse }` on successful login.
 * - Re-throws any other errors so the caller's catch block handles them as genuine failures.
 *
 * @param token The partial auth token.
 * @param userId The user's ID.
 * @param signInOTP The submitted OTP code.
 * @returns OtpLoginResult indicating expired, incorrect, or successful login.
 */
const attemptOtpLogin = async ({ token, userId, signInOTP }: { token: string; userId: string; signInOTP: string }): Promise<OtpLoginResult> => {
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
      let status: number | undefined;
      let data: unknown;

      if (apiError.response && typeof apiError.response === 'object') {
        status = apiError.response?.status;
        data = apiError.response?.data;
      }

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

/**
 * Handles POST submission of the access code (OTP) for 2FA sign-in.
 *
 * - Validates the access code is not empty (client-side validation).
 * - If validation passes, calls API to verify the code.
 * - If the user enters the wrong code (login status not VALID_2FA), renders a validation error.
 * - If the access code is expired (API returns EXPIRED or error message contains 'expired'), redirects to the access code expired page.
 * - Updates the session on successful login and redirects to dashboard.
 * - Any unexpected errors (API failures, missing session data) are caught and render problem-with-service.
 *
 * @param req Request containing the submitted access code and session data such as userId, userToken, attemptsLeft, and userEmail.
 * @param res Response used to render views or perform redirects.
 * @returns Renders a view, redirects to dashboard, access code expired page, or not-found based on validation and login status.
 */
export const postCheckYourEmailAccessCode = async (req: PostCheckYourEmailAccessCodePageRequest, res: Response) => {
  try {
    const { sixDigitAccessCode } = req.body;
    const {
      session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
    } = req;

    if (!userId || !userToken) {
      console.error('UserId %s or userToken %s were not found', userId, userToken);

      return res.redirect('/not-found');
    }

    if (attemptsLeft !== 2) {
      /**
       * This POST handler is only reachable from the check-your-email page, which
       * getNextAccessCodePage routes to exclusively when attemptsLeft === 2.
       * Any other value means the user arrived via the wrong page (stale session,
       * tampered URL, etc.) — treat it as a bad request rather than a service error.
       */
      console.error('Unexpected numberOfSignInOtpAttemptsRemaining value %s in check-your-email access code handler, expected 2', attemptsLeft);

      return res.redirect('/not-found');
    }

    const validationErrors = generateValidationErrors(req.body);

    if (validationErrors) {
      const viewModel: CheckYourEmailAccessCodeViewModel = {
        attemptsLeft,
        requestNewCodeUrl: REQUEST_NEW_CODE_URL,
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: userEmail,
        sixDigitAccessCode,
        validationErrors,
      };

      return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, viewModel);
    }

    const otpResult = await attemptOtpLogin({ token: userToken, userId, signInOTP: sixDigitAccessCode });

    if (otpResult.type === OTP_RESULT_TYPE.EXPIRED) {
      console.error('Access code expired for user %s', userId);

      return res.redirect('/login/access-code-expired');
    }

    if (otpResult.type === OTP_RESULT_TYPE.INCORRECT_CODE) {
      console.error('Invalid sign-in OTP entered for user %s', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      const errorViewModel: CheckYourEmailAccessCodeViewModel = {
        attemptsLeft,
        requestNewCodeUrl: REQUEST_NEW_CODE_URL,
        isSupportInfo: false,
        isAccessCodeLink: true,
        email: userEmail,
        sixDigitAccessCode,
        validationErrors: incorrectCodeErrors,
      };

      return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, errorViewModel);
    }

    const { loginResponse } = otpResult;
    const { token: newUserToken, loginStatus, user } = loginResponse;

    if (!newUserToken || !loginStatus || !user) {
      console.error('Missing user token, login status, or user details after successful OTP validation for user %s', userId);

      throw new Error(`Missing user token, login status, or user details after successful OTP validation for user ${userId}`);
    }

    updateSessionAfterLogin({
      req,
      newUserToken,
      loginStatus,
      user,
    });

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error submitting access code %o', error);

    return res.render('_partials/problem-with-service.njk');
  }
};
