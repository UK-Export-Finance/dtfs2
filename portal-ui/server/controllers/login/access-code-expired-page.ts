import type { Response } from 'express';
import { HttpStatusCode } from 'axios';
import type { CustomExpressRequest } from '@ukef/dtfs2-common';

type BaseRequest = CustomExpressRequest<Record<string, never>>;

export type GetAccessCodeExpiredPageRequest = BaseRequest & {
  session: {
    attemptsLeft?: number;
  };
};

/**
 * Controller to get the access code expired page.
 * @param req - the request object
 * @param res - the response object
 */
export const getAccessCodeExpiredPage = (req: GetAccessCodeExpiredPageRequest, res: Response) => {
  // TODO DTFS2-8222: Uncomment the code below when session management for access code attempts is implemented
  // and remove the default value workaround
  // const {
  //   session: { attemptsLeft },
  // } = req;
  //
  // if (typeof attemptsLeft !== 'number') {
  //   // Log for debugging production issues
  //   console.error('Number of send access code attempts remaining was not present in the session.');
  //   return res.status(HttpStatusCode.InternalServerError).render('_partials/problem-with-service.njk');
  // }

  // TODO DTFS2-8222: Remove default value workaround when session management for access code attempts is implemented
  // The attemptsLeft will be set by the login/access code flow
  const attemptsLeft = req.session.attemptsLeft ?? 3;

  if (attemptsLeft < 1 || attemptsLeft > 3) {
    console.error('Number of send access code attempts remaining was not within expected limits %s', attemptsLeft);
    return res.status(HttpStatusCode.InternalServerError).render('_partials/problem-with-service.njk');
  }

  return res.status(HttpStatusCode.Ok).render('login/access-code-expired.njk', {
    attemptsLeft,
  });
};
