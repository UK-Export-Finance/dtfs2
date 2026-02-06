import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
  email?: string;
};

type GetCheckYourEmailAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userEmail?: string };
export type GetCheckYourEmailAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: GetCheckYourEmailAccessCodePageRequestSession;
};

/**
 * Controller to get the check your email access code page
 * @param req - the request object
 * @param res - the response object
 */
export const getCheckYourEmailAccessCodePage = (req: GetCheckYourEmailAccessCodePageRequest, res: Response) => {
  const {
    session: { numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
  } = req;

  // we check if typeof attemptsLeft is undefined rather than falsy as it can be 0 when the user has used all their attempts
  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering check your email access code page');
    return res.render('partials/problem-with-service.njk');
  }

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    email: userEmail,
  };

  try {
    return res.render('login/check-your-email-access-code.njk', viewModel);
  } catch (error) {
    console.error('Error getting check your email access code page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
