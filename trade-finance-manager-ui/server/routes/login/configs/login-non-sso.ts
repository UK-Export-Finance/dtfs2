/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import * as loginNonSsoController from '../../../controllers/login/login-non-sso';
import { GetRouter } from '../../../types/get-router';

export const getLoginNonSsoRouter: GetRouter = () => {
  const loginNonSsoRouter = express.Router();

  loginNonSsoRouter.get('/', loginNonSsoController.getLogin);

  loginNonSsoRouter.post('/', loginNonSsoController.postLogin);

  loginNonSsoRouter.get('/logout', loginNonSsoController.logout);

  return loginNonSsoRouter;
};
