import { HttpStatusCode } from 'axios';
import { CustomExpressRequest, OTP_RESULT_TYPE } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { attemptOtpLogin } from './attempt-otp-login';
import { NewAccessCodeViewModel } from '../../types/view-models/2fa/new-access-code-view-model';
import { updateSessionAfterLogin } from '../../helpers/updateSessionAfterLogin';
import incorrectAccessCodeRule from './validation/rules/incorrect-access-code';
import generateValidationErrors from './validation';
import { generate2FAViewModel } from '../../helpers/generate-2fa-view-model';
import { isOtpExpired } from '../../helpers/is-otp-expired';

const NEW_ACCESS_CODE_TEMPLATE = 'login/new-access-code.njk';

type PostNewAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userId?: string; userToken?: string; userEmail?: string };
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
  try {
    const { sixDigitAccessCode } = req.body;

    const {
      session: { userToken, userId, numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
    } = req;

    if (!userId || !userToken) {
      console.error('UserId %s or userToken %s was not found', userId, userToken);
      return res.redirect('/not-found');
    }

    if (attemptsLeft !== 1) {
      /**
       * This POST handler is only reachable from the new-access-code page, which
       * getNextAccessCodePage routes to exclusively when attemptsLeft === 1.
       * Any other value means the user arrived via the wrong page (stale session,
       * tampered URL, etc.) — treat it as a bad request rather than a service error.
       */
      console.error('Unexpected numberOfSignInOtpAttemptsRemaining value %s in new-access-code handler, expected 1', attemptsLeft);

      return res.redirect('/not-found');
    }

    const validationErrors = generateValidationErrors(req.body);

    if (validationErrors) {
      const viewModel: NewAccessCodeViewModel = generate2FAViewModel(attemptsLeft, userEmail, sixDigitAccessCode, validationErrors, {
        isSupportInfo: false,
        isAccessCodeLink: true,
      });

      return res.status(HttpStatusCode.BadRequest).render(NEW_ACCESS_CODE_TEMPLATE, viewModel);
    }

    const otpResult = await attemptOtpLogin({ token: userToken, userId, signInOTP: sixDigitAccessCode });

    if (isOtpExpired(otpResult, userId)) {
      console.error('Access code expired for user %s during new-access-code POST', userId);

      return res.redirect('/login/access-code-expired');
    }

    if (otpResult.type === OTP_RESULT_TYPE.INCORRECT_CODE) {
      console.error('Invalid sign-in OTP entered for user %s', userId);

      const incorrectCodeErrors = incorrectAccessCodeRule({}, {});

      const errorViewModel: NewAccessCodeViewModel = generate2FAViewModel(attemptsLeft, userEmail, sixDigitAccessCode, incorrectCodeErrors, {
        isSupportInfo: false,
        isAccessCodeLink: true,
      });

      return res.status(HttpStatusCode.BadRequest).render(NEW_ACCESS_CODE_TEMPLATE, errorViewModel);
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
