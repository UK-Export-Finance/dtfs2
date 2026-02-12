import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
  email?: string;
};

type GetResendAnotherAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userEmail?: string };
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

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    email: userEmail,
  };

  if (attemptsLeft >= -1) {
    return res.render('login/resend-another-access-code.njk', viewModel);
  }

  console.error('Error getting resend another access code page');

  return res.render('partials/problem-with-service.njk');
};
