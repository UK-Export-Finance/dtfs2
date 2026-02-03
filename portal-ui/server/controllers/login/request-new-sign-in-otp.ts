import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import * as api from '../../api';
import { getNextAccessCodePage } from '../../helpers/getNextAccessCodePage';

type SendSignInOtpResponse = { data: { numberOfSignInOtpAttemptsRemaining?: number } };
type PostRequestNewAccessCodePageSession = { userToken: string };
export type PostNewAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: PostRequestNewAccessCodePageSession;
};

/**
 * Controller to get the new access code page
 * @param req - the request object
 * @param res - the response object
 */
export const requestNewSignInOtp = async (req: PostNewAccessCodePageRequest, res: Response) => {
  const {
    session: { userToken },
  } = req;
  try {
    const {
      data: { numberOfSignInOtpAttemptsRemaining: attemptsLeft },
    } = (await api.sendSignInOTP(userToken)) as SendSignInOtpResponse;

    if (typeof attemptsLeft === 'undefined') {
      console.error('No remaining OTP attempts found in session when rendering new access code page');
      return res.render('partials/problem-with-service.njk');
    }

    const { nextAccessCodePage } = getNextAccessCodePage(attemptsLeft);

    return res.redirect(nextAccessCodePage);
  } catch (error) {
    console.error('Error requesting new access code %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
