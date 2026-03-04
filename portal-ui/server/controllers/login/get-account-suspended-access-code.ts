import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

type GetAccountSuspendedAccessCodePageRequestSession = { numberOfSignInOtpAttemptsRemaining: number };
export type GetAccountSuspendedAccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: GetAccountSuspendedAccessCodePageRequestSession;
};

/**
 * Controller to get the temporarily suspended access code page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccountSuspendedAccessCodePage = (req: GetAccountSuspendedAccessCodePageRequest, res: Response) => {
  const {
    session: { numberOfSignInOtpAttemptsRemaining: attemptsLeft },
  } = req;

  if (attemptsLeft === -1) {
    return res.render('login/temporarily-suspended-access-code.njk');
  }

  console.error('Invalid OTP attempts: expected -1 remaining attempts but found %d', attemptsLeft);

  return res.redirect('/not-found');
};
