import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
  email?: string;
};
type GetNewAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userEmail?: string };
export type GetNewAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: GetNewAccessCodePageRequestSession;
};

/**
 * Controller to get the new access code page
 * @param req - the request object
 * @param res - the response object
 */
export const getNewAccessCodePage = (req: GetNewAccessCodePageRequest, res: Response) => {
  const {
    session: { numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
  } = req;

  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering new access code page');
    return res.render('partials/problem-with-service.njk');
  }

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    email: userEmail,
  };

  try {
    return res.render('login/new-access-code.njk', viewModel);
  } catch (error) {
    console.error('Error getting new access code page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
