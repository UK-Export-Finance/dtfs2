import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';

export const getUnauthenticatedLoginSsoRouter: GetRouter = () => {
  const unauthenticatedAuthSsoRouter = express.Router();

  /**
   * @openapi
   * /auth/sso-redirect:
   *   post:
   *     summary: Handles the SSO redirect from the SSO authority (Microsoft Entra).
   *     tags: [TFM]
   *     description: Handles the SSO redirect from the SSO authority (Microsoft Entra).
   *     responses:
   *       200:
   *         description: Ok
   *       404:
   *         description: Not Found
   */
  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect', (req, res) => {
    LoginController.postSsoRedirect(req, res);
  });

  /**
   * @openapi
   * /auth/sso-redirect/form:
   *   post:
   *     summary: Handles the SSO redirect form submission.
   *     tags: [TFM]
   *     description: Handles the SSO redirect form submission.
   *     responses:
   *       200:
   *         description: Ok
   *       400:
   *         description: Bad Request
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal server error
   */
  unauthenticatedAuthSsoRouter.post('/auth/sso-redirect/form', (req, res, next) => {
    LoginController.handleSsoRedirectForm(req, res).catch(next);
  });

  return unauthenticatedAuthSsoRouter;
};
