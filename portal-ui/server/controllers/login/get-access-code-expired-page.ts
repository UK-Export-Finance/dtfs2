import type { Response } from 'express';
import type { CustomExpressRequest } from '@ukef/dtfs2-common';

type BaseRequest = CustomExpressRequest<Record<string, never>>;

type GetAccessCodeExpiredPageRequestSession = {
  numberOfSignInOtpAttemptsRemaining?: number;
  userEmail?: string;
};
export type GetAccessCodeExpiredPageRequest = BaseRequest & {
  session: GetAccessCodeExpiredPageRequestSession;
};

/**
 * Controller to get the access code expired page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccessCodeExpiredPage = (req: GetAccessCodeExpiredPageRequest, res: Response) => {
  try {
    const {
      session: { numberOfSignInOtpAttemptsRemaining: attemptsLeft },
    } = req;

    if (attemptsLeft === undefined) {
      console.error('No remaining OTP attempts found in session when rendering access code expired page');
      return res.render('partials/problem-with-service.njk');
    }

    const viewModel = {
      attemptsLeft,
    };

    return res.render('login/access-code-expired.njk', viewModel);
  } catch (error) {
    console.error('Error getting access code expired page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};
