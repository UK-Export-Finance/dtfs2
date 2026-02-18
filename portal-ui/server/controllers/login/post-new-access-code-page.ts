import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validationErrorHandler } from '../../helpers';
import * as api from '../../api';
import { NewAccessCodeViewModel } from '../../types/view-models/2fa/new-access-code-view-model';
import { updateSessionAfterLogin } from '../../helpers/updateSessionAfterLogin';

type PostNewAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userId?: string; userToken?: string };
export type PostNewAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostNewAccessCodePageRequestSession;
  reqBody: {
    sixDigitAccessCode: string;
  };
};

/**
 * Controller to post the `new access code` page
 * @param req - the request object
 * @param res - the response object
 */
export const postNewAccessCodePage = async (req: PostNewAccessCodePageRequest, res: Response) => {
  const { sixDigitAccessCode } = req.body;

  const {
    session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft },
  } = req;

  if (!userId) {
    console.error('UserId was not found', userId);
    return res.redirect('/not-found');
  }

  if (!userToken) {
    console.error('userToken was not found', userToken);
    return res.redirect('/not-found');
  }

  const viewModel: NewAccessCodeViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/new-access-code',
    errors: validationErrorHandler({
      errMsg: 'The access code you have entered is incorrect',
      errRef: 'sixDigitAccessCode',
    }),
  };

  if (!sixDigitAccessCode) {
    console.error('Invalid sign-in OTP entered for user %s', userId);
    return res.render('login/new-access-code.njk', viewModel);
  }

  try {
    if (attemptsLeft === 1) {
      const { token: newUserToken, loginStatus, user } = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP: sixDigitAccessCode });

      updateSessionAfterLogin({
        req,
        newUserToken,
        loginStatus,
        user,
      });

      if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
        console.error('Invalid sign-in OTP entered for user %s', userId);
        return res.render('login/new-access-code.njk', viewModel);
      }

      return res.redirect(`/login/sign-in-link?t=${newUserToken}&u=${userId}`);
    }
    console.error('Invalid OTP attempts: expected 1 remaining attempt but found %d for user %s', attemptsLeft, userId);
    return res.redirect('/not-found');
  } catch (error) {
    console.error('Error during login with sign-in OTP:', error);
    return res.render('partials/problem-with-service.njk');
  }
};
