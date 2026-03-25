import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import * as api from '../../api';
import { getNextAccessCodePage } from '../../helpers/getNextAccessCodePage';

type SendSignInOtpResponse = { data: { numberOfSignInOtpAttemptsRemaining: number } };
type GetRequestNewAccessCodePageSession = { userToken: string; numberOfSignInOtpAttemptsRemaining?: number };
export type GetNewAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: GetRequestNewAccessCodePageSession;
};

/**
 * Controller to get the new access code page
 * @param req - the request object
 * @param res - the response object
 */
export const requestNewAccessCode = async (req: GetNewAccessCodePageRequest, res: Response) => {
  const {
    session: { userToken, numberOfSignInOtpAttemptsRemaining },
  } = req;

  try {
    // If user has no remaining OTP attempts, suspend account without sending a new OTP
    if (numberOfSignInOtpAttemptsRemaining === 0) {
      req.session.numberOfSignInOtpAttemptsRemaining = -1;
      const suspendedAccountPage = getNextAccessCodePage(-1);

      return res.redirect(suspendedAccountPage);
    }

    const {
      data: { numberOfSignInOtpAttemptsRemaining: attemptsLeft },
    } = (await api.sendSignInOTP(userToken)) as SendSignInOtpResponse;

    if (attemptsLeft >= -1) {
      // persist latest attempts in session so the next page can read it
      req.session.numberOfSignInOtpAttemptsRemaining = attemptsLeft;
      const nextAccessCodePage = getNextAccessCodePage(attemptsLeft);

      return res.redirect(nextAccessCodePage);
    }

    console.error('Error requesting new access code: attemptsLeft is not >= -1, value received: %s', attemptsLeft);

    return res.render('partials/problem-with-service.njk');
  } catch (error) {
    console.error('Error requesting new access code: %o', error);

    return res.render('partials/problem-with-service.njk');
  }
};
