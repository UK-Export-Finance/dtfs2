import express from 'express';
import * as loginSsoController from '../../../controllers/login/loginSso';
import { getRouter } from '../../../types/get-router';

export const getLoginSsoRouter: getRouter = () => {
  const loginSsoRouter = express.Router();
  loginSsoRouter.get('/', loginSsoController.getLogin);

  return loginSsoRouter;
};
