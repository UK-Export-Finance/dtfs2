import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validationErrorHandler } from '../../helpers';
import * as api from '../../api';
import { ResendAnotherAccessCodeViewModel } from '../../types/view-models/2fa/resend-another-access-code-view-model';
import { updateSessionAfterLogin } from '../../helpers/updateSessionAfterLogin';

type PostResendAnotherAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userId?: string; userToken?: string };
export type PostResendAnotherAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostResendAnotherAccessCodePageRequestSession;
  reqBody: {
    sixDigitAccessCode: string;
  };
};

/**
 * Controller to post the `new access code` page
 * @param req - the request object
 * @param res - the response object
 */
export const postResendAnotherAccessCodePage = async (req: PostResendAnotherAccessCodePageRequest, res: Response) => {
  const { sixDigitAccessCode } = req.body;

  const {
    session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft },
  } = req;

  if (!userId || !userToken) {
    console.error('UserId %s or userToken %s was not found', userId, userToken);
    return res.redirect('/not-found');
  }

  const viewModel: ResendAnotherAccessCodeViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    errors: validationErrorHandler({
      errMsg: 'The access code you have entered is incorrect',
      errRef: 'sixDigitAccessCode',
    }),
  };

  if (!sixDigitAccessCode) {
    console.error('Invalid sign-in OTP entered for user %s', userId);
    return res.render('login/resend-another-access-code.njk', viewModel);
  }

  try {
    if (attemptsLeft === 0) {
      const { token: newUserToken, loginStatus, user } = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP: sixDigitAccessCode });

      updateSessionAfterLogin({
        req,
        newUserToken,
        loginStatus,
        user,
      });

      if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
        console.error('Invalid sign-in OTP entered for user %s', userId);
        return res.render('login/resend-another-access-code.njk', viewModel);
      }

      return res.redirect(`/dashboard`);
    }

    console.error('Invalid OTP attempts: expected 0 remaining attempts but found %d for user %s', attemptsLeft, userId);
    return res.redirect('/not-found');
  } catch (error) {
    console.error('Error during login with sign-in OTP %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
