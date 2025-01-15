import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';

/**
 * Creates and configures the authentication SSO router.
 * This router handles the Single Sign-On (SSO) redirect form submission.
 *
 * @returns The configured authentication SSO router.
 */
export const getAuthSsoRouter: GetRouter = () => {
  const loginService = new LoginService();
  const userSessionService = new UserSessionService();
  const loginController = new LoginController({ loginService, userSessionService });
  const authSsoRouter = express.Router();

  // Todo: update this to check the right token
  authSsoRouter.post('/auth/sso-redirect/form', (req, res, next) => {
    loginController.handleSsoRedirectForm(req, res).catch(next);
  });
  return authSsoRouter;
};
