import axios, { HttpStatusCode } from 'axios';
import { isPortal2FAFeatureFlagEnabled, logUserAuthError } from '@ukef/dtfs2-common';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import type { Response } from 'express';

import { validationErrorHandler, getNextAccessCodePage, getPortalBankListForLoginPage } from '@ukef/portal-ui/server/helpers';
import api from '@ukef/portal-ui/server/api';

type PostLoginSession = {
  userEmail?: string;
  userToken?: string;
  loginStatus?: string;
  userId?: string;
  numberOfSignInOtpAttemptsRemaining?: number;
  numberOfSendSignInLinkAttemptsRemaining?: number;
};
export type PostLoginRequest = CustomExpressRequest<{ reqBody: { email?: string; password?: string } }> & {
  session: PostLoginSession;
};

/**
 * Controller to handle login form submission
 * Handles both 2FA and non-2FA login flows depending on whether the 2FA feature flag is enabled.
 * @param {PostLoginRequest} req
 * @param {Response} res
 * @returns redirects to appropriate page based on login outcome and 2FA feature flag status
 */
export const postLogin = async (req: PostLoginRequest, res: Response) => {
  console.info('Portal-UI - Attempting to login user');

  const { email, password } = req.body;
  const loginErrors = [];

  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const passwordError = {
    errMsg: 'Enter a valid password',
    errRef: 'password',
  };

  if (!email || !password) {
    if (!email) {
      loginErrors.push(emailError);
    }

    if (!password) {
      loginErrors.push(passwordError);
    }

    const banks = await getPortalBankListForLoginPage();

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
      banks,
    });
  }

  /**
   * Send sign in link or OTP depending on whether 2FA feature flag is enabled
   */
  const is2FAEnabled = isPortal2FAFeatureFlagEnabled();

  if (is2FAEnabled) {
    let loginApiOtpSucceeded = false;

    try {
      const loginResponse = await api.login(email, password);

      const { token, loginStatus, user } = loginResponse;

      loginApiOtpSucceeded = true;

      req.session.userToken = token;
      req.session.loginStatus = loginStatus;
      // We do not store this in the user object to avoid existing logic using the existence of a `user` object to draw elements
      req.session.userEmail = user.email;
      req.session.userId = user.userId;

      console.info('Portal-UI - API login successful for user %s. Attempting to send sign in OTP', user.userId);
      type SendSignInOtpResponse = { data: { numberOfSignInOtpAttemptsRemaining: number } };

      const otpResponse = (await api.sendSignInOTP(token)) as SendSignInOtpResponse;
      const { numberOfSignInOtpAttemptsRemaining } = otpResponse.data;

      req.session.numberOfSignInOtpAttemptsRemaining = numberOfSignInOtpAttemptsRemaining;

      const nextAccessCodePage = getNextAccessCodePage(req.session.numberOfSignInOtpAttemptsRemaining);

      console.info('Portal-UI - Login and OTP sending successful for user %s. Redirecting to %s', user.userId, nextAccessCodePage);

      return res.redirect(nextAccessCodePage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (!loginApiOtpSucceeded) {
          const message = 'Failed to login';
          const authError = error instanceof Error ? error : { message: 'Unknown error' };
          logUserAuthError(authError, message);

          if (status === HttpStatusCode.Forbidden) {
            console.error('Access temporarily suspended for user %s', email);
            req.session.numberOfSignInOtpAttemptsRemaining = -1;
            return res.redirect('/login/temporarily-suspended-access-code');
          }

          loginErrors.push(emailError, passwordError);

          const banks = await getPortalBankListForLoginPage();

          return res.render('login/index.njk', {
            errors: validationErrorHandler(loginErrors),
            banks,
          });
        }

        if (status === HttpStatusCode.Forbidden) {
          console.error('Access temporarily suspended for user %s, setting numberOfSignInOtpAttemptsRemaining to -1', email);
          req.session.numberOfSignInOtpAttemptsRemaining = -1;

          return res.redirect('/login/temporarily-suspended-access-code');
        }

        const message = 'Failed to send sign in OTP, rendering problem with service page. The error was';
        const authError = error instanceof Error ? error : { message: 'Unknown error' };
        logUserAuthError(authError, message);
      } else {
        const isForbidden =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'status' in error.response &&
          error.response.status === HttpStatusCode.Forbidden;

        if (!loginApiOtpSucceeded) {
          if (error instanceof Error) {
            logUserAuthError(error, 'Failed to login');
          } else if (isForbidden) {
            logUserAuthError({ response: { status: HttpStatusCode.Forbidden } }, 'Failed to login');
          } else {
            console.error('An unknown error occurred during login: %o', error);
          }

          if (isForbidden) {
            console.error('Access temporarily suspended for user %s', email);
            req.session.numberOfSignInOtpAttemptsRemaining = -1;
            return res.redirect('/login/temporarily-suspended-access-code');
          }

          loginErrors.push(emailError, passwordError);
          const banks = await getPortalBankListForLoginPage();

          return res.render('login/index.njk', {
            errors: validationErrorHandler(loginErrors),
            banks,
          });
        }

        if (isForbidden) {
          console.error('Access temporarily suspended for user %s, setting numberOfSignInOtpAttemptsRemaining to -1', email);
          req.session.numberOfSignInOtpAttemptsRemaining = -1;
          return res.redirect('/login/temporarily-suspended-access-code');
        }

        if (error instanceof Error) {
          logUserAuthError(error, 'Failed to send sign in OTP, rendering problem with service page. The error was');
        } else {
          console.error('An unknown error occurred during login: %o', error);
        }
      }

      return res.render('_partials/problem-with-service.njk');
    }
  } else {
    let loginApiLinkSucceeded = false;

    try {
      const loginResponse = await api.login(email, password);

      const { token, loginStatus, user } = loginResponse;

      loginApiLinkSucceeded = true;

      req.session.userToken = token;
      req.session.loginStatus = loginStatus;
      // We do not store this in the user object to avoid existing logic using the existence of a `user` object to draw elements
      req.session.userEmail = user.email;
      req.session.userId = user._id;

      console.info('Portal-UI - API login successful for user %s. Attempting to send sign in link', user._id);
      type SendSignInLinkResponse = { data: { numberOfSendSignInLinkAttemptsRemaining: number } };

      const linkResponse = (await api.sendSignInLink(token)) as SendSignInLinkResponse;
      const { numberOfSendSignInLinkAttemptsRemaining } = linkResponse.data;

      req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining;

      console.info('Portal-UI - Login and sign-in link sending successful for user %s. Redirecting to /login/check-your-email', user._id);
      return res.redirect('/login/check-your-email');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (!loginApiLinkSucceeded) {
          const message = 'Failed to login';
          logUserAuthError(error, message);

          if (status === HttpStatusCode.Forbidden) {
            console.error('Access temporarily suspended for user');
            return res.status(HttpStatusCode.Forbidden).render('login/temporarily-suspended.njk');
          }

          loginErrors.push(emailError, passwordError);

          const banks = await getPortalBankListForLoginPage();

          return res.render('login/index.njk', {
            errors: validationErrorHandler(loginErrors),
            banks,
          });
        }

        if (status === HttpStatusCode.Forbidden) {
          req.session.numberOfSendSignInLinkAttemptsRemaining = -1;

          return res.status(HttpStatusCode.Forbidden).render('login/temporarily-suspended.njk');
        }

        const message = 'Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was';
        logUserAuthError(error, message);
      } else {
        const isForbidden =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'status' in error.response &&
          error.response.status === HttpStatusCode.Forbidden;

        if (isForbidden) {
          if (!loginApiLinkSucceeded) {
            logUserAuthError({ response: { status: HttpStatusCode.Forbidden } }, 'Failed to login');
            console.error('Access temporarily suspended for user');
          } else {
            req.session.numberOfSendSignInLinkAttemptsRemaining = -1;
          }

          return res.status(HttpStatusCode.Forbidden).render('login/temporarily-suspended.njk');
        }

        console.error('An unknown error occurred during login: %o', error);

        if (!loginApiLinkSucceeded) {
          loginErrors.push(emailError, passwordError);
          const banks = await getPortalBankListForLoginPage();

          return res.render('login/index.njk', {
            errors: validationErrorHandler(loginErrors),
            banks,
          });
        }
      }

      // Continue login flow so the user can retry sending sign-in link
      return res.redirect('/login/check-your-email');
    }
  }
};
