import axios, { HttpStatusCode } from 'axios';
import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';
import { updateSessionAfterLogin } from '../../helpers/updateSessionsAfterLogin';
import generateValidationErrors from './validation';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import { renderAccessCodeErrorView } from './helpers/render-access-code-error';

const NEW_ACCESS_CODE_TEMPLATE = 'login/new-access-code.njk';

const REQUEST_NEW_CODE_URL = '/login/request-new-access-code';

type PostNewAccessCodePageRequestSession = {
  numberOfSignInOtpAttemptsRemaining?: number;
  userId?: string;
  userToken?: string;
  userEmail?: string;
};

export type PostNewAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostNewAccessCodePageRequestSession;
  body: {
    signInOTP?: string;
    sixDigitAccessCode?: string;
    accessCode?: string;
  };
};

/**
 * Handles POST submission for the new access code flow.
 * Validates the OTP, delegates shared validation/error rendering logic,
 * and redirects once the user passes 2FA verification.
 *
 * @param req Express request containing session and OTP payload.
 * @param res Express response used for rendering or redirecting.
 */
export const postNewAccessCodePage = async (req: PostNewAccessCodePageRequest, res: Response) => {
  const { signInOTP: bodySignInOTP, sixDigitAccessCode, accessCode } = req.body;
  // Normalise the OTP payload as different forms can post different field names
  const signInOTP = bodySignInOTP ?? sixDigitAccessCode ?? accessCode ?? '';

  const {
    session: { userToken, userId, userEmail, numberOfSignInOtpAttemptsRemaining: attemptsLeft },
  } = req;

  if (!userId) {
    console.error('userId missing from session:', req.session);

    return res.redirect('/login');
  }

  if (!userToken) {
    console.error('userToken missing from session for user %s', userId);

    return res.redirect('/login');
  }

  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering new access code page');

    return res.render('partials/problem-with-service.njk');
  }

  const renderNewAccessCodeError = (validationErrors: ReturnType<typeof generateValidationErrors>) =>
    // Centralise error rendering so both validation and API failures share the same view model
    renderAccessCodeErrorView({
      res,
      attemptsLeft,
      email: userEmail,
      signInOTP,
      validationErrors,
      templateName: NEW_ACCESS_CODE_TEMPLATE,
      requestNewCodeUrl: REQUEST_NEW_CODE_URL,
    });

  const validationErrors = generateValidationErrors({ signInOTP });

  if (validationErrors) {
    return renderNewAccessCodeError(validationErrors);
  }

  let loginResponse: LoginWithSignInOtpResponse;

  try {
    loginResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (status === HttpStatusCode.Unauthorized || status === HttpStatusCode.Forbidden) {
      console.error('Invalid sign-in OTP entered for user %s (API error)', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      return renderNewAccessCodeError(incorrectCodeErrors);
    }

    console.error('Unexpected error validating sign-in OTP for user %s', userId, error);

    return res.render('partials/problem-with-service.njk');
  }

  const { token: newUserToken, loginStatus, user } = loginResponse;

  if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
    console.error('Invalid sign-in OTP entered for user %s', userId);

    const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

    return renderNewAccessCodeError(incorrectCodeErrors);
  }

  if (!newUserToken || !user) {
    console.error('Missing user token or user details after successful OTP validation for user %s', userId);

    return res.render('partials/problem-with-service.njk');
  }

  // Promote the user to a fully-authenticated session before redirecting onward
  updateSessionAfterLogin({
    req,
    newUserToken,
    loginStatus,
    user,
  });

  // Successful login
  return res.redirect('/dashboard');
};
