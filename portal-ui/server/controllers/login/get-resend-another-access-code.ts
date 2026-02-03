import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
  email?: string;
};

type GetResendAnotherAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining?: number; userEmail?: string };
export type GetResendAnotherAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: GetResendAnotherAccessCodePageRequestSession;
};

/**
 * Controller to get the resend another access code page
 * @param req - the request object
 * @param res - the response object
 */
export const getResendAnotherAccessCodePage = (req: GetResendAnotherAccessCodePageRequest, res: Response) => {
  const {
    session: { numberOfSignInOtpAttemptsRemaining: attemptsLeft, userEmail },
  } = req;

  if (typeof attemptsLeft === 'undefined') {
    console.error('No remaining OTP attempts found in session when rendering resend another access code page');
    return res.render('partials/problem-with-service.njk');
  }

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    email: userEmail,
  };

  try {
    return res.render('login/resend-another-access-code.njk', viewModel);
  } catch (error) {
    console.error('Error getting resend another access code page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
