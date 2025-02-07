import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';
import { UnauthenticatedAuthController } from '../../../controllers/auth/auth-sso/unauthenticated-auth.controller';

export const getUnauthenticatedAuthSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoRouter = express.Router();

  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect', (req, res) => {
    UnauthenticatedAuthController.postSsoRedirect(req, res);
  });

  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect/form', (req, res, next) => {
    LoginController.handleSsoRedirectForm(req, res).catch(next);
  });

  return unauthenticatedAuthSsoRouter;
};
