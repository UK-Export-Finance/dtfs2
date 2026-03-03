import { HttpStatusCode } from 'axios';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { attemptOtpLogin, OTP_RESULT_TYPE } from './attempt-otp-login';
import { ResendAnotherAccessCodeViewModel } from '../../types/view-models/2fa/resend-another-access-code-view-model';
import { updateSessionAfterLogin } from '../../helpers/updateSessionAfterLogin';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';
import { generate2FAViewModel } from '../../helpers/generate-2fa-view-model';

const RESEND_ANOTHER_ACCESS_CODE_TEMPLATE = 'login/resend-another-access-code.njk';

type PostResendAnotherAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userId?: string; userToken?: string; userEmail?: string };
export type PostResendAnotherAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostResendAnotherAccessCodePageRequestSession;
  reqBody: {
    sixDigitAccessCode: string;
  };
};

/**
 * Controller to post the `resend another access code` page
 * @param req - the request object
 * @param res - the response object
 */
export const postResendAnotherAccessCodePage = async (req: PostResendAnotherAccessCodePageRequest, res: Response) => {
  try {
    const { sixDigitAccessCode } = req.body;

    const {
      session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
    } = req;

    if (!userId || !userToken) {
      console.error('UserId %s or userToken %s was not found', userId, userToken);
      return res.redirect('/not-found');
    }

    if (attemptsLeft !== 0) {
      /**
       * This POST handler is only reachable from the resend-another-access-code page, which
       * getNextAccessCodePage routes to exclusively when attemptsLeft === 0.
       * Any other value means the user arrived via the wrong page (stale session,
       * tampered URL, etc.) — treat it as a bad request rather than a service error.
       */
      console.error('Unexpected numberOfSignInOtpAttemptsRemaining value %s in resend-another-access-code handler, expected 0', attemptsLeft);

      return res.redirect('/not-found');
    }

    const validationErrors = generateValidationErrors(req.body);

    if (validationErrors) {
      const viewModel: ResendAnotherAccessCodeViewModel = generate2FAViewModel(attemptsLeft, userEmail, sixDigitAccessCode, validationErrors, {
        isSupportInfo: true,
        isAccessCodeLink: false,
      });

      return res.status(HttpStatusCode.BadRequest).render(RESEND_ANOTHER_ACCESS_CODE_TEMPLATE, viewModel);
    }

    const otpResult = await attemptOtpLogin({ token: userToken, userId, signInOTP: sixDigitAccessCode });

    if (otpResult.type === OTP_RESULT_TYPE.INCORRECT_CODE) {
      console.error('Invalid sign-in OTP entered for user %s', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      const errorViewModel: ResendAnotherAccessCodeViewModel = generate2FAViewModel(attemptsLeft, userEmail, sixDigitAccessCode, incorrectCodeErrors, {
        isSupportInfo: true,
        isAccessCodeLink: false,
      });

      return res.status(HttpStatusCode.BadRequest).render(RESEND_ANOTHER_ACCESS_CODE_TEMPLATE, errorViewModel);
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
