import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Request, Response, NextFunction } from 'express';
import { LoginController } from '../controllers/login/login-sso/login.controller';

/**
 * Middleware to validate the user session
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const validateUser = async (req: Request, res: Response, next: NextFunction) => {
  // This try catch is added due to the function being async
  // it does not modify the prior synchronous behaviour of this middleware
  try {
    if (req.session.user) {
      next();
    } else if (isTfmSsoFeatureFlagEnabled()) {
      await LoginController.getLogin(req, res);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Unable to validate user: %o', error);
    next(error);
  }
};
