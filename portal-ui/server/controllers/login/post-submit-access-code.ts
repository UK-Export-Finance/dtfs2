import axios, { HttpStatusCode } from 'axios';
import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';
import updateSessionAfterLogin from '../../helpers/updateSessionsAfterLogin';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';
import { renderAccessCodeErrorView } from './helpers/render-access-code-error';

type PostSubmitAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userId?: string; userToken?: string; userEmail?: string };

export type PostSubmitAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostSubmitAccessCodePageRequestSession;
  body: {
    signInOTP: string;
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
 * @param req Express request, expects session with userId, userToken, attemptsLeft, and userEmail.
 * @param res Express response.
 * @returns Renders a view or redirects; does not return a value.
 */
export const postSubmitAccessCode = async (req: PostSubmitAccessCodePageRequest, res: Response) => {
  const { signInOTP } = req.body;
  const {
    session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
  } = req;

  if (!userId) {
    console.error('userId missing from session:', req.session);

    return res.redirect('/login');
  }

  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering check your email access code page');

    return res.render('_partials/problem-with-service.njk');
  }

  // Validate form input first (empty field check)
  const validationErrors = generateValidationErrors(req.body);

  if (validationErrors) {
    return renderAccessCodeErrorView({
      res,
      attemptsLeft,
      email: userEmail,
      signInOTP,
      validationErrors,
    });
  }

  // Attempt to verify the access code with the API
  let loginResponse: LoginWithSignInOtpResponse;

  try {
    loginResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
      console.error('Invalid sign-in OTP entered for user %s (API error)', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      return renderAccessCodeErrorView({
        res,
        attemptsLeft,
        email: userEmail,
        signInOTP,
        validationErrors: incorrectCodeErrors,
      });
    }

    console.error('Unexpected error validating sign-in OTP for user %s', userId, error);

    return res.render('_partials/problem-with-service.njk');
  }

  const { token: newUserToken, loginStatus, user } = loginResponse;

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
    // Incorrect access code - API returned invalid status
    console.error('Invalid sign-in OTP entered for user %s', userId);

    const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

    return renderAccessCodeErrorView({
      res,
      attemptsLeft,
      email: userEmail,
      signInOTP,
      validationErrors: incorrectCodeErrors,
    });
  }

  updateSessionAfterLogin({
    req,
    newUserToken,
    loginStatus,
    user,
  });

  // Successful login
  return res.redirect('/dashboard');
};
