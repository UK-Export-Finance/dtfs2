import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validationErrorHandler } from '../../helpers';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';
import updateSessionAfterLogin from '../../helpers/updateSessionsAfterLogin';
import { submitAccessCodeViewModel } from '../../types/view-models/2fa/submit-access-code-view-model';

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
 * - Validates the access code using the API.
 * - Updates the session on successful login.
 * - Renders validation errors or redirects as appropriate.
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

  // Try to validate the access code with the API. If the code is invalid, catch and render validation error.
  let loginResponse: LoginWithSignInOtpResponse;
  try {
    loginResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP });
  } catch (error) {
    // Invalid OTP or API error: show validation error and let user retry.
    console.error('Invalid sign-in OTP entered for user %s (caught error)', userId);
    const viewModel: submitAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: '/login/new-access-code',
      email: userEmail,
      errors: validationErrorHandler({
        errMsg: 'The access code you have entered is incorrect',
        errRef: 'signInOTP',
      }),
    };
    return res.render('login/check-your-email-access-code.njk', viewModel);
  }

  // Try to update session and handle post-login logic. If anything fails, show generic error page.
  try {
    const { token: newUserToken, loginStatus, user } = loginResponse;

    updateSessionAfterLogin({
      req,
      newUserToken,
      loginStatus,
      user,
    });

    if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
      console.error('Invalid sign-in OTP entered for user %s', userId);
      const viewModel: submitAccessCodeViewModel = {
        attemptsLeft,
        requestNewCodeUrl: '/login/new-access-code',
        email: userEmail,
        errors: validationErrorHandler({
          errMsg: 'The access code you have entered is incorrect',
          errRef: 'signInOTP',
        }),
      };
      return res.render('login/check-your-email-access-code.njk', viewModel);
    }

    return res.redirect('/dashboard');
    // return res.redirect(`/login/sign-in-link?t=${newUserToken}&u=${user?._id}`);
  } catch (error) {
    // Any unexpected error after login: show generic problem page.
    console.error('Error during login with sign-in OTP:', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
