import type { Response } from 'express';
import { HttpStatusCode } from 'axios';
import type { CustomExpressRequest } from '@ukef/dtfs2-common';

type BaseRequest = CustomExpressRequest<Record<string, never>>;

export type GetAccessCodeExpiredPageRequest = BaseRequest & {
  session: {
    numberOfSignInOtpAttemptsRemaining?: number;
  };
};

/**
 * Controller to get the access code expired page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccessCodeExpiredPage = (req: GetAccessCodeExpiredPageRequest, res: Response) => {
  const {
    session: { numberOfSignInOtpAttemptsRemaining },
  } = req;

  if (typeof numberOfSignInOtpAttemptsRemaining !== 'number' || numberOfSignInOtpAttemptsRemaining < 1 || numberOfSignInOtpAttemptsRemaining > 3) {
    // Log for debugging production issues
    console.error('Number of send access code attempts remaining was not present or invalid in the session:', numberOfSignInOtpAttemptsRemaining);
    return res.status(HttpStatusCode.InternalServerError).render('_partials/problem-with-service.njk');
  }

  return res.status(HttpStatusCode.Ok).render('login/access-code-expired.njk', {
    numberOfSignInOtpAttemptsRemaining,
  });
};
