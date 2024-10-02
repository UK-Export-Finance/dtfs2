import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { UnauthenticatedAuthController } from '../../../controllers/auth/authSso/unauthenticated-auth.controller';

export const getUnauthenticatedAuthSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoController = new UnauthenticatedAuthController();

  const unauthenticatedAuthSsoRouter = express.Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/unbound-method
  unauthenticatedAuthSsoRouter.post('auth/accept-sso-redirect', unauthenticatedAuthSsoController.postSsoRedirect);

  return unauthenticatedAuthSsoRouter;
};
