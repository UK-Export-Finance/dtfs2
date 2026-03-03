import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { ResendAnotherAccessCodeViewModel } from '../../types/view-models/2fa/resend-another-access-code-view-model';

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

  if (attemptsLeft === 0) {
    const viewModel: ResendAnotherAccessCodeViewModel = {
      attemptsLeft,
      isSupportInfo: true,
      isAccessCodeLink: false,
      email: userEmail,
    };

    return res.render('login/resend-another-access-code.njk', viewModel);
  }

  console.error('Invalid OTP attempts: expected 0 remaining attempts but found %d for user %s', attemptsLeft, userEmail);

  return res.redirect('/not-found');
};
