/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import * as loginNonSsoController from '../../../controllers/login/loginNonSso';
import { getRouter } from '../../../types/get-router';

export const getLoginNonSsoRouter: getRouter = () => {
  const loginNonSsoRouter = express.Router();

  loginNonSsoRouter.get('/', loginNonSsoController.getLogin);

  loginNonSsoRouter.post('/', loginNonSsoController.postLogin);

  loginNonSsoRouter.get('/logout', loginNonSsoController.logout);

  return loginNonSsoRouter;
};
