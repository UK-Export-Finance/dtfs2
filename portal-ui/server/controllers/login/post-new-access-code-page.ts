import { CustomExpressRequest, PORTAL_LOGIN_STATUS, PortalSessionUser } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validationErrorHandler } from '../../helpers';
import * as api from '../../api';
import { NewAccessCodeViewModel } from '../../types/view-models/2fa/new-access-code-view-model';
import updateSessionAfterLogin from '../../helpers/updateSessionAfterLogin';

type LoginWithSignInOtpResponse = {
  loginStatus?: string;
  token?: string;
  user?: PortalSessionUser;
};

type PostNewAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userId?: string };
export type PostNewAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostNewAccessCodePageRequestSession;
  reqBody: {
    signInOTP: string;
  };
};

/**
 * Controller to post the `new access code` page
 * @param req - the request object
 * @param res - the response object
 */
export const postNewAccessCodePage = async (req: PostNewAccessCodePageRequest, res: Response) => {
  const { signInOTP } = req.body;

  const {
    session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft },
  } = req;

  try {
    if (typeof attemptsLeft === 'undefined') {
      console.error('No remaining OTP attempts found in session when rendering new access code page');
      return res.render('partials/problem-with-service.njk');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const loginResponse: LoginWithSignInOtpResponse = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP });
    const { token: newUserToken, loginStatus, user } = loginResponse;

    updateSessionAfterLogin({
      req,
      newUserToken,
      loginStatus,
      user,
    });

    if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
      console.error('Invalid sign-in OTP entered for user %s', userId);

      const viewModel: NewAccessCodeViewModel = {
        attemptsLeft,
        requestNewCodeUrl: '/login/new-access-code',
        errors: validationErrorHandler({
          errMsg: 'The access code you have entered is incorrect',
          errRef: 'signInOTP',
        }),
      };

      return res.render('login/new-access-code.njk', viewModel);
    }

    return res.redirect(`/login/sign-in-link?t=${newUserToken}&u=${user?._id}`);
  } catch (error) {
    console.error('Error during login with sign-in OTP:', error);
    return res.render('partials/problem-with-service.njk');
  }
};
