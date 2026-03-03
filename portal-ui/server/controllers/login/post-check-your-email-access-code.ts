import { HttpStatusCode } from 'axios';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { attemptOtpLogin, OTP_RESULT_TYPE } from './attempt-otp-login';
import { updateSessionAfterLogin } from '../../helpers/updateSessionsAfterLogin';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';
import { CheckYourEmailAccessCodeViewModel } from '../../types/view-models/2fa/check-your-email-access-code-view-model';
import { generateViewModel } from '../../helpers/generate-view-model';

const CHECK_YOUR_EMAIL_TEMPLATE = 'login/check-your-email-access-code.njk';

type PostCheckYourEmailAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userId?: string; userToken?: string; userEmail?: string };

export type PostCheckYourEmailAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostCheckYourEmailAccessCodePageRequestSession;
  body: {
    sixDigitAccessCode: string;
  };
};

/**
 * Handles POST submission of the access code (OTP) for 2FA sign-in.
 *
 * - Validates the access code is not empty (client-side validation).
 * - If validation passes, calls API to verify the code.
 * - If the user enters the wrong code (login status not VALID_2FA), renders a validation error.
 * - Updates the session on successful login and redirects to dashboard.
 * - Any unexpected errors (API failures, missing session data) are caught and render problem-with-service.
 *
 * @param req Request containing the submitted access code and session data such as userId, userToken, attemptsLeft, and userEmail.
 * @param res Response used to render views or perform redirects.
 * @returns Renders a view or redirects based on validation and login status.
 */
export const postCheckYourEmailAccessCode = async (req: PostCheckYourEmailAccessCodePageRequest, res: Response) => {
  try {
    const { sixDigitAccessCode } = req.body;
    const {
      session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
    } = req;

    if (!userId || !userToken) {
      console.error('UserId %s or userToken %s were not found', userId, userToken);

      return res.redirect('/not-found');
    }

    if (attemptsLeft !== 2) {
      /**
       * This POST handler is only reachable from the check-your-email page, which
       * getNextAccessCodePage routes to exclusively when attemptsLeft === 2.
       * Any other value means the user arrived via the wrong page (stale session,
       * tampered URL, etc.) — treat it as a bad request rather than a service error.
       */
      console.error('Unexpected numberOfSignInOtpAttemptsRemaining value %s in check-your-email access code handler, expected 2', attemptsLeft);

      return res.redirect('/not-found');
    }

    const validationErrors = generateValidationErrors(req.body);

    if (validationErrors) {
      const viewModel: CheckYourEmailAccessCodeViewModel = generateViewModel(attemptsLeft, userEmail, sixDigitAccessCode, validationErrors, {
        isSupportInfo: false,
        isAccessCodeLink: true,
      });

      return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, viewModel);
    }

    const otpResult = await attemptOtpLogin({ token: userToken, userId, signInOTP: sixDigitAccessCode });

    if (otpResult.type === OTP_RESULT_TYPE.INCORRECT_CODE) {
      console.error('Invalid sign-in OTP entered for user %s', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      const errorViewModel: CheckYourEmailAccessCodeViewModel = generateViewModel(attemptsLeft, userEmail, sixDigitAccessCode, incorrectCodeErrors, {
        isSupportInfo: false,
        isAccessCodeLink: true,
      });

      return res.status(HttpStatusCode.BadRequest).render(CHECK_YOUR_EMAIL_TEMPLATE, errorViewModel);
    }

    const { loginResponse } = otpResult;
    const { token: newUserToken, loginStatus, user } = loginResponse;

    if (!newUserToken || !loginStatus || !user) {
      console.error('Missing user token, login status, or user details after successful OTP validation for user %s', userId);

      throw new Error(`Missing user token, login status, or user details after successful OTP validation for user ${userId}`);
    }

    updateSessionAfterLogin({
      req,
      newUserToken,
      loginStatus,
      user,
    });

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error submitting access code %o', error);

    return res.render('_partials/problem-with-service.njk');
  }
};
