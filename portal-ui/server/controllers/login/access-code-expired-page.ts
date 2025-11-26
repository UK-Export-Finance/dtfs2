import { Response } from 'express';
import { CustomExpressRequest, PartiallyLoggedInPortalSessionData, AttemptsLeft } from '@ukef/dtfs2-common';

export type GetAccessCodeExpiredPageRequest = CustomExpressRequest<Record<string, never>>;

/**
 * Controller to get the access code expired page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccessCodeExpiredPage = (req: GetAccessCodeExpiredPageRequest, res: Response) => {
  const session = req.session as unknown as PartiallyLoggedInPortalSessionData;
  const allowedAttemptsLeftValues: AttemptsLeft[] = ['0', '1', '2', '3'];
  const attemptsRemainingValue = String(session.numberOfSignInLinkAttemptsRemaining ?? 0);
  const attemptsRemaining: AttemptsLeft = allowedAttemptsLeftValues.includes(attemptsRemainingValue as AttemptsLeft)
    ? (attemptsRemainingValue as AttemptsLeft)
    : '0';

  res.render('login/access-code-expired.njk', {
    attemptsRemaining,
  });
};
