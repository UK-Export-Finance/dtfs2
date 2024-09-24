import { Request, Response } from 'express';
import { getLoginUrl } from '../../../services/entra-id-service';

/**
 * getLogin
 * @param req - Request
 * @param res - Response
 * @returns void
 * @description getLogin can be access by a user navigating to the `/` route, or triggered by a redirect if a token is not valid.
 */
export const getLogin = (req: Request, res: Response) => {
  if (req.session.user) {
    // User is already logged in.
    return res.redirect('/home');
  }

  return res.redirect(getLoginUrl());
};

// TODO dtfs2-6892: Update this logout handling
export const getLogout = (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
