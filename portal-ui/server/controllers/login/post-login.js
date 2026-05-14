import { HttpStatusCode } from 'axios';
import { isPortal2FAFeatureFlagEnabled } from '@ukef/dtfs2-common';

import { validationErrorHandler, getNextAccessCodePage } from '../../helpers';
import api from '../../api';

/**
 * Controller to handle login form submission
 * Handles both 2FA and non-2FA login flows depending on whether the 2FA feature flag is enabled.
 * @param {Request} req
 * @param {Response} res
 * @returns redirects to appropriate page based on login outcome and 2FA feature flag status
 */
// TODO: DTFS2-8304 - refactor this to be a ts file
export const postLogin = async (req, res) => {
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
    if (!email) loginErrors.push(emailError);
    if (!password) loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
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
      const {
        data: { numberOfSignInOtpAttemptsRemaining },
      } = await api.sendSignInOTP(req.session.userToken);

      req.session.numberOfSignInOtpAttemptsRemaining = numberOfSignInOtpAttemptsRemaining;

      const nextAccessCodePage = getNextAccessCodePage(req.session.numberOfSignInOtpAttemptsRemaining);

      console.info('Portal-UI - Login and OTP sending successful for user %s. Redirecting to %s', user.userId, nextAccessCodePage);

      return res.redirect(nextAccessCodePage);
    } catch (error) {
      const status = error.response?.status;

      if (!loginApiOtpSucceeded) {
        console.error('Failed to login %o', error);

        if (status === HttpStatusCode.Forbidden) {
          console.error('Access temporarily suspended for user %s', email);
          req.session.numberOfSignInOtpAttemptsRemaining = -1;
          return res.redirect('/login/temporarily-suspended-access-code');
        }

        loginErrors.push(emailError, passwordError);

        return res.render('login/index.njk', {
          errors: validationErrorHandler(loginErrors),
        });
      }

      if (status === HttpStatusCode.Forbidden) {
        console.error('Access temporarily suspended for user %s, setting numberOfSignInOtpAttemptsRemaining to -1', email);
        req.session.numberOfSignInOtpAttemptsRemaining = -1;

        return res.redirect('/login/temporarily-suspended-access-code');
      }

      console.error('Failed to send sign in OTP, rendering problem with service page. The error was %o', error);

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
      const {
        data: { numberOfSendSignInLinkAttemptsRemaining },
      } = await api.sendSignInLink(req.session.userToken);

      req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining;

      console.info('Portal-UI - Login and sign-in link sending successful for user %s. Redirecting to /login/check-your-email', user._id);
      return res.redirect('/login/check-your-email');
    } catch (error) {
      const status = error.response?.status;

      if (!loginApiLinkSucceeded) {
        console.error('Failed to login %o', error);

        if (status === HttpStatusCode.Forbidden) {
          console.error('Access temporarily suspended for user');
          return res.status(HttpStatusCode.Forbidden).render('login/temporarily-suspended.njk');
        }

        loginErrors.push(emailError, passwordError);

        return res.render('login/index.njk', {
          errors: validationErrorHandler(loginErrors),
        });
      }

      if (status === HttpStatusCode.Forbidden) {
        req.session.numberOfSendSignInLinkAttemptsRemaining = -1;

        return res.status(HttpStatusCode.Forbidden).render('login/temporarily-suspended.njk');
      }

      const message = 'Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was ';
      console.error('%s %o', message, error);

      // Continue login flow so the user can retry sending sign-in link
      return res.redirect('/login/check-your-email');
    }
  }
};
