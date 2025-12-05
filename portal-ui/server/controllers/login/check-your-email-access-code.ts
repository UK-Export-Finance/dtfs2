import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
};
type GetCheckYourEmailAccessCodePageRequestSession = { numberOfSendSignInOtpAttemptsRemaining?: number };
export type GetCheckYourEmailAccessCodePageRequest = CustomExpressRequest<{}> & {
  session: GetCheckYourEmailAccessCodePageRequestSession;
};

/**
 * Controller to get the check your email access code page
 * @param req - the request object
 * @param res - the response object
 */
export const getCheckYourEmailAccessCodePage = (req: GetCheckYourEmailAccessCodePageRequest, res: Response) => {
  const {
    session: { numberOfSendSignInOtpAttemptsRemaining: attemptsLeft },
  } = req;

  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering check your email access code page');
    return res.render('partials/problem-with-service.njk');
  }

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
  };

  try {
    return res.render('login/check-your-email-access-code.njk', viewModel);
  } catch (error) {
    console.error('Error getting check your email access code page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
