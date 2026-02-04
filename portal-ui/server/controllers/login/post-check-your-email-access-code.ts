import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse, AccessCodeViewModel, AccessCodePageRequest } from '../../types/2fa/sign-in-access-code-types';
import { validationErrorHandler } from '../../helpers';
import * as api from '../../api';
import updateSessionAfterLogin from '../../helpers/updateSessionAfterLogin';

/**
 * Controller to post the check your email access code page
 * @param req - the request object
 * @param res - the response object
 */
export const postSubmitSignInOtp = async (req: AccessCodePageRequest, res: Response) => {
  const { signInOTP } = req.body;

  const { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail } = req.session;

  try {
    if (typeof attemptsLeft === 'undefined') {
      return res.render('_partials/problem-with-service.njk');
    }

    if (!userToken || !userId) {
      return res.render('_partials/problem-with-service.njk');
    }
    const loginResponse: LoginWithSignInOtpResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP });
    const { token: newUserToken, loginStatus, user } = loginResponse;

    const { success, error: sessionError } = updateSessionAfterLogin({
      req,
      newUserToken,
      loginStatus,
      user,
    });

    if (!success) {
      console.error('Session update failed:', sessionError);

      return res.render('_partials/problem-with-service.njk');
    }
    if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
      const viewModel: AccessCodeViewModel = {
        attemptsLeft: typeof attemptsLeft === 'number' ? attemptsLeft : undefined,
        requestNewCodeUrl: '/login/request-new-access-code',
        email: userEmail,
        errors: validationErrorHandler({
          errMsg: 'The access code you have entered is incorrect',
          errRef: 'signInOTP',
        }) as AccessCodeViewModel['errors'],
      };

      return res.render('login/check-your-email-access-code.njk', viewModel);
    }

    return res.redirect('/dashboard');
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};
