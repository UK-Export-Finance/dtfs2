import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

export type GetAccessCodeExpiredPageRequest = CustomExpressRequest<Record<string, never>> & {
  session: {
    numberOfSendSignInLinkAttemptsRemaining?: number;
  };
};

/**
 * Controller to get the access code expired page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccessCodeExpiredPage = (req: GetAccessCodeExpiredPageRequest, res: Response) => {
  const {
    session: { numberOfSendSignInLinkAttemptsRemaining },
  } = req;

  if (typeof numberOfSendSignInLinkAttemptsRemaining !== 'number') {
    // Log for debugging production issues
    console.error('Number of send sign in link attempts remaining was not present in the session.');
    return res.render('_partials/problem-with-service.njk');
  }

  if (numberOfSendSignInLinkAttemptsRemaining < 1 || numberOfSendSignInLinkAttemptsRemaining > 3) {
    // Log for monitoring unexpected session state
    console.error('Number of send sign in link attempts remaining was not within expected bounds');
    return res.render('_partials/problem-with-service.njk');
  }

  return res.render('login/access-code-expired.njk', {
    attemptsLeft: numberOfSendSignInLinkAttemptsRemaining,
  });
};
