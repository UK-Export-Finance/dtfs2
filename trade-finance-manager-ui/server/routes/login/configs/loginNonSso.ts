/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import * as loginController from '../../../controllers/login/loginNonSso';
import { GetConfiguredRouter } from '../../../types/get-configured-router';

export const getConfiguredLoginNonSsoRouter: GetConfiguredRouter = () => {
  const loginNonSsoRouter = express.Router();

  loginNonSsoRouter.get('/', loginController.getLogin);

  loginNonSsoRouter.post('/', loginController.postLogin);

  loginNonSsoRouter.get('/logout', loginController.logout);

  return loginNonSsoRouter;
};
