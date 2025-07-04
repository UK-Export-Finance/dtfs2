import express from 'express';
import { GetRouter } from '../../../types/get-router';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';

/**
 * Creates and configures the authentication SSO router.
 * This router handles the Single Sign-On (SSO) redirect form submission.
 *
 * @returns The configured authentication SSO router.
 */
export const getAuthSsoRouter: GetRouter = () => {
  const authSsoRouter = express.Router();

  // TODO DTFS2-6892: This router is to be deleted in future ticket
  authSsoRouter.route('/auth/sso-redirect/form').post((req, res, next) => {
    LoginController.handleSsoRedirectForm(req, res).catch(next);
  });
  return authSsoRouter;
};
