import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
  email?: string;
};

type GetCheckYourEmailAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userEmail?: string };
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

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    email: userEmail,
  };

  if (attemptsLeft >= 0) {
    return res.render('login/check-your-email-access-code.njk', viewModel);
  }

  console.error('Error getting check your email access code page');

  return res.render('partials/problem-with-service.njk');
};
