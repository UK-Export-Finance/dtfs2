import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';

export const getUnauthenticatedLoginSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoRouter = express.Router();

  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect', (req, res) => {
    LoginController.postSsoRedirect(req, res);
  });

  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect/form', (req, res, next) => {
    LoginController.handleSsoRedirectForm(req, res).catch(next);
  });

  return unauthenticatedAuthSsoRouter;
};
