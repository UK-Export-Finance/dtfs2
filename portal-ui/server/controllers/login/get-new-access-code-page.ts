import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { NewAccessCodeViewModel } from '../../types/view-models/2fa/new-access-code-view-model';

const REQUEST_NEW_CODE_URL = '/login/request-new-access-code';

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

  const viewModel: NewAccessCodeViewModel = {
    attemptsLeft,
    requestNewCodeUrl: REQUEST_NEW_CODE_URL,
    isSupportInfo: false,
    isAccessCodeLink: true,
    email: userEmail,
  };

  if (attemptsLeft === 1) {
    return res.render('login/new-access-code.njk', viewModel);
  }

  console.error('Invalid OTP attempts: expected 1 remaining attempt but found %d for user %s', attemptsLeft, userEmail);
  return res.redirect('/not-found');
};
