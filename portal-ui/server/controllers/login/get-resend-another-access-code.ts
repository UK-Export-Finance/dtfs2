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

  if (attemptsLeft === 0) {
    return res.render('login/resend-another-access-code.njk', viewModel);
  }

  console.error('Invalid OTP attempts: expected 0 remaining attempts but found %d for user %s', attemptsLeft, userEmail);
  return res.redirect('/not-found');
};
