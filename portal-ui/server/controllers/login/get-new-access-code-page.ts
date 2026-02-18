import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type ViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl?: string;
  email?: string;
};
type GetNewAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number; userEmail?: string };
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

  const viewModel: ViewModel = {
    attemptsLeft,
    requestNewCodeUrl: '/login/request-new-access-code',
    email: userEmail,
  };

  if (attemptsLeft === 1) {
    return res.render('login/new-access-code.njk', viewModel);
  }

  console.error('Invalid OTP attempts: expected 1 remaining attempt but found %d for user %s', attemptsLeft, userEmail);
  return res.redirect('/not-found');
};
