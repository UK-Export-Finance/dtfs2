import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { UnauthenticatedAuthController } from '../../../controllers/auth/auth-sso/unauthenticated-auth.controller';

export const getUnauthenticatedAuthSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoController = new UnauthenticatedAuthController();

  const unauthenticatedAuthSsoRouter = express.Router();

  unauthenticatedAuthSsoRouter.post('auth/accept-sso-redirect', unauthenticatedAuthSsoController.postSsoRedirect.bind(unauthenticatedAuthSsoController));

  return unauthenticatedAuthSsoRouter;
};
