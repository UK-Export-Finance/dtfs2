import axios, { HttpStatusCode } from 'axios';
import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';
import { updateSessionAfterLogin } from '../../helpers/updateSessionsAfterLogin';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';
import { SubmitAccessCodeViewModel } from '../../types/view-models/2fa/submit-access-code-view-model';

const CHECK_YOUR_EMAIL_TEMPLATE = 'login/check-your-email-access-code.njk';

const REQUEST_NEW_CODE_URL = '/login/new-access-code';

type PostSubmitAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userId?: string; userToken?: string; userEmail?: string };

export type PostCheckYourEmailAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostSubmitAccessCodePageRequestSession;
  body: {
    sixDigitAccessCode: string;
  };
};

/**
 * Handles POST submission of the access code (OTP) for 2FA sign-in.
 *
 * - Validates the access code is not empty (client-side validation).
 * - If validation passes, calls API to verify the code.
 * - If API rejects the code (incorrect OTP), renders validation error.
 * - If login status is not VALID_2FA, renders incorrect access code error.
 * - Updates the session on successful login and redirects to dashboard.
 * - Handles missing session data and API errors gracefully.
 *
 * @param req Request containing the submitted access code and session data such as userId, userToken, attemptsLeft, and userEmail.
 * @param res Response used to render views or perform redirects.
 * @returns Renders a view or redirects based on validation and login status.
 */
export const postCheckYourEmailAccessCode = async (req: PostCheckYourEmailAccessCodePageRequest, res: Response) => {
  const { sixDigitAccessCode } = req.body;
  const {
    session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
  } = req;

  if (!userId || !userToken) {
    console.error('UserId %s or userToken %s were not found', userId, userToken);

    return res.redirect('/not-found');
  }

  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering check your email access code page');

    return res.render('_partials/problem-with-service.njk');
  }

  // Validate form input first (empty field check)
  const validationErrors = generateValidationErrors(req.body);

  if (validationErrors) {
    const viewModel: SubmitAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: REQUEST_NEW_CODE_URL,
      email: userEmail,
      sixDigitAccessCode,
      validationErrors,
    };

    return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, viewModel);
  }

  // Attempt to verify the access code with the API
  let loginResponse: LoginWithSignInOtpResponse;

  try {
    loginResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP: sixDigitAccessCode });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
      console.error('Invalid sign-in OTP entered for user %s (API error)', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      const errorViewModel: SubmitAccessCodeViewModel = {
        attemptsLeft,
        requestNewCodeUrl: REQUEST_NEW_CODE_URL,
        email: userEmail,
        sixDigitAccessCode,
        validationErrors: incorrectCodeErrors,
      };

      return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, errorViewModel);
    }

    console.error('Unexpected error validating sign-in OTP for user %s', userId, error);

    return res.render('_partials/problem-with-service.njk');
  }

  const { token: newUserToken, loginStatus, user } = loginResponse;

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
    // Incorrect access code - API returned invalid status
    console.error('Invalid sign-in OTP entered for user %s', userId);

    const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

    const invalidStatusViewModel: SubmitAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: REQUEST_NEW_CODE_URL,
      email: userEmail,
      sixDigitAccessCode,
      validationErrors: incorrectCodeErrors,
    };

    return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, invalidStatusViewModel);
  }

  if (!newUserToken || !user) {
    console.error('Missing user token or user details after successful OTP validation for user %s', userId);

    return res.render('_partials/problem-with-service.njk');
  }

  updateSessionAfterLogin({
    req,
    newUserToken,
    loginStatus,
    user,
  });

  return res.redirect('/dashboard');
};
