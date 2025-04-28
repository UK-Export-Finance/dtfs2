import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';

export const getLoginSsoRouter: GetRouter = () => {
  const loginSsoRouter = express.Router();

  loginSsoRouter.route('/').get((req, res, next) => {
    LoginController.getLogin(req, res).catch(next);
  });
  loginSsoRouter.route('/logout').get(LoginController.getLogout);

  return loginSsoRouter;
};
