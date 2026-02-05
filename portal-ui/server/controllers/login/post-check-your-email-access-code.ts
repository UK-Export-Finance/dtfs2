import { CustomExpressRequest, PORTAL_LOGIN_STATUS, PortalSessionUser } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../api';
import updateSessionAfterLogin from '../../helpers/updateSessionAfterLogin';
import { AccessCodeViewModel } from '../../types/2fa/sign-in-access-code-types';

type LoginWithSignInOtpResponse = {
  loginStatus?: string;
  token?: string;
  user?: PortalSessionUser;
};

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
      return res.render('_partials/problem-with-service.njk', {
        message: 'No remaining OTP attempts found in session.',
      });
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

      const viewModel: AccessCodeViewModel = {
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
    return res.redirect('/dashboard');
  } catch (error: unknown) {
    let apiError = 'There was a problem validating your access code. Please try again.';
    let errorDetails: string[] = [];
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { data?: { message?: string; errors?: unknown[] } } }).response === 'object'
    ) {
      const responseData = (error as { response?: { data?: { message?: string; errors?: unknown[] } } }).response?.data;
      if (responseData?.message) {
        apiError = responseData.message;
      }
      if (Array.isArray(responseData?.errors)) {
        errorDetails = responseData.errors.map((err) => {
          if (typeof err === 'string') return err;
          if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string') {
            return (err as { message?: string }).message as string;
          }
          return JSON.stringify(err);
        });
      }
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: string }).message === 'string') {
      apiError = (error as { message?: string }).message as string;
    }
    // eslint-disable-next-line no-console
    console.error('Error during login with sign-in OTP:', error);
    return res.render('_partials/problem-with-service.njk', {
      error: {
        message: apiError,
        details: errorDetails,
      },
    });
  }
};
