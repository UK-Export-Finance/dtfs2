import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';

export const getAuthSsoRouter: GetRouter = () => {
  const loginService = new LoginService();
  const userSessionService = new UserSessionService();
  const loginController = new LoginController({ loginService, userSessionService });
  const authSsoRouter = express.Router();

  // Todo: update this to check the right token
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  authSsoRouter.post('/auth/sso-redirect/form', loginController.handleSsoRedirectForm.bind(loginController));
  return authSsoRouter;
};
