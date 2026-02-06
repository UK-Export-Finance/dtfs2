import { CustomExpressRequest, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginWithSignInOtpResponse } from '../../types/2fa/login-with-sign-in-otp-response';
import * as api from '../../api';
import updateSessionAfterLogin from '../../helpers/updateSessionAfterLogin';
import { CheckYourEmailAccessCodeViewModel } from '../../types/view-models/2fa/check-your-email-access-code-view-model';

type PostCheckYourEmailAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userId?: string; userToken?: string; userEmail?: string };
export type PostCheckYourEmailAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostCheckYourEmailAccessCodePageRequestSession;
  body: {
    signInOTP: string;
  };
};

/**
 * Controller to post the check your email access code page
 * @param req - the request object
 * @param res - the response object
 */
export const postCheckYourEmailAccessCodePage = async (req: PostCheckYourEmailAccessCodePageRequest, res: Response) => {
  const { signInOTP } = req.body;
  const {
    session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
  } = req;

  // If userId is missing, redirect to login
  if (!userId) {
    return res.redirect('/login');
  }

  try {
    if (typeof attemptsLeft === 'undefined') {
      console.error('No remaining OTP attempts found in session when rendering check your email access code page');
      return res.render('_partials/problem-with-service.njk');
    }

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

      const viewModel: CheckYourEmailAccessCodeViewModel = {
        attemptsLeft,
        requestNewCodeUrl: '/login/request-new-access-code',
        email: userEmail,
        errors: {
          errorSummary: [{ text: 'The access code you have entered is incorrect', href: 'signInOTP' }],
          fieldErrors: {
            signInOTP: { text: 'The access code you have entered is incorrect', href: 'signInOTP' },
          },
        },
      };
      return res.render('login/check-your-email-access-code.njk', viewModel);
    }

    // Only delete userId after successful 2FA login
    delete req.session.userId;
    return res.redirect(`/login/sign-in-link?t=${newUserToken}&u=${user?._id}`);
  } catch (error) {
    console.error('Error during login with sign-in OTP:', error);
    return res.render('_partials/problem-with-service.njk');
  }
};
