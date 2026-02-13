import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';
import updateSessionAfterLogin from '../../helpers/updateSessionsAfterLogin';
import { submitAccessCodeViewModel } from '../../types/view-models/2fa/submit-access-code-view-model';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';

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
 * @param {PostSubmitAccessCodePageRequest} req Express request, expects session with userId, userToken, attemptsLeft, and userEmail.
 * @param {Response} res Express response.
 * @returns {Promise<void>} Renders a view or redirects; does not return a value.
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
    const viewModel: submitAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: '/login/new-access-code',
      email: userEmail,
      signInOTP,
      validationErrors,
    };
    return res.render('login/check-your-email-access-code.njk', viewModel);
  }

  // Attempt to verify the access code with the API
  let loginResponse: LoginWithSignInOtpResponse;

  try {
    loginResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP });
  } catch (error) {
    // API error for incorrect OTP - show validation error
    console.error('Invalid sign-in OTP entered for user %s (API error)', userId);

    const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

    const viewModel: submitAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: '/login/new-access-code',
      email: userEmail,
      signInOTP,
      validationErrors: incorrectCodeErrors,
    };
    return res.render('login/check-your-email-access-code.njk', viewModel);
  }

  const { token: newUserToken, loginStatus, user } = loginResponse;

  updateSessionAfterLogin({
    req,
    newUserToken,
    loginStatus,
    user,
  });

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
    // Incorrect access code - API returned invalid status
    console.error('Invalid sign-in OTP entered for user %s', userId);

    const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

    const viewModel: submitAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: '/login/new-access-code',
      email: userEmail,
      signInOTP,
      validationErrors: incorrectCodeErrors,
    };
    return res.render('login/check-your-email-access-code.njk', viewModel);
  }

  // Successful login
  return res.redirect('/dashboard');
};
