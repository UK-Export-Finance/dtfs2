/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import * as loginController from '../../../controllers/login/loginNonSso';
import { getRouter } from '../../../types/get-router';

export const getLoginNonSsoRouter: getRouter = () => {
  const loginNonSsoRouter = express.Router();

  loginNonSsoRouter.get('/', loginController.getLogin);

  loginNonSsoRouter.post('/', loginController.postLogin);

  loginNonSsoRouter.get('/logout', loginController.logout);

  return loginNonSsoRouter;
};
