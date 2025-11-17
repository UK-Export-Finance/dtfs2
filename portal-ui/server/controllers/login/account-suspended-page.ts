import { Response } from 'express';
import { CustomExpressRequest } from '@ukef/dtfs2-common';

export type GetTemporarilySuspendedAccessCodePageRequest = CustomExpressRequest<{
  params: { page: string };
}>;

/**
 * Controller to get the temporarily suspended page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccountSuspendedPage = (req: GetTemporarilySuspendedAccessCodePageRequest, res: Response) => {
  res.render('login/temporarily-suspended-access-code.njk');
};
