import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';
import { LoginService } from '../../../services/login.service';

export const getLoginSsoRouter: GetRouter = () => {
  const loginService = new LoginService();
  const loginController = new LoginController({ loginService });
  const loginSsoRouter = express.Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  loginSsoRouter.get('/', (req, res, next) => loginController.getLogin(req, res, next));

  return loginSsoRouter;
};
