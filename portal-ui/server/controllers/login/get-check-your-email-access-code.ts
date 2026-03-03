import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { CheckYourEmailAccessCodeViewModel } from '../../types/view-models/2fa/check-your-email-access-code-view-model';

const REQUEST_NEW_CODE_URL = '/login/request-new-access-code';

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

  if (attemptsLeft === 2) {
    const viewModel: CheckYourEmailAccessCodeViewModel = {
      attemptsLeft,
      requestNewCodeUrl: REQUEST_NEW_CODE_URL,
      isSupportInfo: false,
      isAccessCodeLink: true,
      email: userEmail,
    };
    return res.render('login/check-your-email-access-code.njk', viewModel);
  }

  console.error('Invalid OTP attempts: expected 2 remaining attempts but found %d for user %s', attemptsLeft, userEmail);
  return res.redirect('/not-found');
};
