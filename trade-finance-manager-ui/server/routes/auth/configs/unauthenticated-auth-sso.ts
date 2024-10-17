import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { UnauthenticatedAuthController } from '../../../controllers/auth/auth-sso/unauthenticated-auth.controller';

export const getUnauthenticatedAuthSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoController = new UnauthenticatedAuthController();

  const unauthenticatedAuthSsoRouter = express.Router();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  unauthenticatedAuthSsoRouter.post('auth/accept-sso-redirect', (res, req) => unauthenticatedAuthSsoController.postSsoRedirect(res, req));

  return unauthenticatedAuthSsoRouter;
};
