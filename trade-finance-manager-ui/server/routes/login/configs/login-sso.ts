import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';

export const getLoginSsoRouter: GetRouter = () => {
  const loginService = new LoginService();
  const userSessionService = new UserSessionService();
  const loginController = new LoginController({ loginService, userSessionService });
  const loginSsoRouter = express.Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  loginSsoRouter.get('/', (req, res) => loginController.getLogin(req, res));

  return loginSsoRouter;
};
