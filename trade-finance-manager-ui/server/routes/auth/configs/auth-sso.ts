import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { LoginService } from '../../../services/login.service';

export const getAuthSsoRouter: GetRouter = () => {
  const loginService = new LoginService();
  const loginController = new LoginController({ loginService });
  const authSsoRouter = express.Router();

  // Todo: update this to check the right token
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  authSsoRouter.post('/auth/sso-redirect/form', loginController.handleSsoRedirectForm.bind(loginController));
  return authSsoRouter;
};
