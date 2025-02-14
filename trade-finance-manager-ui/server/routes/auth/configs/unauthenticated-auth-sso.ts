import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';
import { GetRouter } from '../../../types/get-router';
import { UnauthenticatedAuthController } from '../../../controllers/auth/auth-sso/unauthenticated-auth.controller';

export const getUnauthenticatedAuthSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoController = new UnauthenticatedAuthController();
  const unauthenticatedAuthSsoRouter = express.Router();

  const loginService = new LoginService();
  const userSessionService = new UserSessionService();
  const loginController = new LoginController({ loginService, userSessionService });

  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect', (req, res) => {
    unauthenticatedAuthSsoController.postSsoRedirect(req, res);
  });

  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect/form', (req, res, next) => {
    loginController.handleSsoRedirectForm(req, res).catch(next);
  });

  return unauthenticatedAuthSsoRouter;
};
