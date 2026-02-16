import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validationErrorHandler } from '../../helpers';
import * as api from '../../api';
import { ResendAnotherAccessCodeViewModel } from '../../types/view-models/2fa/resend-another-access-code-view-model';
import { updateSessionAfterLogin } from '../../helpers/updateSessionAfterLogin';

type PostResendAnotherAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userId?: string };
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

  try {
    if (attemptsLeft >= -1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { token: newUserToken, loginStatus, user } = await api.loginWithSignInOtp({ token: userToken, userId, signInOTP: sixDigitAccessCode });

      updateSessionAfterLogin({
        req,
        newUserToken,
        loginStatus,
        user,
      });

      if (loginStatus !== PORTAL_LOGIN_STATUS.VALID_2FA) {
        console.error('Invalid sign-in OTP entered for user %s', userId);

        const viewModel: ResendAnotherAccessCodeViewModel = {
          attemptsLeft,
          requestNewCodeUrl: '/login/request-new-access-code',
          errors: validationErrorHandler({
            errMsg: 'The access code you have entered is incorrect',
            errRef: 'sixDigitAccessCode',
          }),
        };

        return res.render('login/resend-another-access-code.njk', viewModel);
      }

      return res.redirect(`/login/sign-in-link?t=${newUserToken}&u=${userId}`);
    }

    console.error('No remaining OTP attempts found in session when rendering resend another access code page');
    return res.render('partials/problem-with-service.njk');
  } catch (error) {
    console.error('Error during login with sign-in OTP:', error);
    return res.render('partials/problem-with-service.njk');
  }
};
