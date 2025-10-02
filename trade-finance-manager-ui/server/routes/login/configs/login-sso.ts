import express from 'express';
import { LoginController } from '../../../controllers/login/login-sso/login.controller';
import { GetRouter } from '../../../types/get-router';

export const getLoginSsoRouter: GetRouter = () => {
  const loginSsoRouter = express.Router();

  /**
   * @openapi
   * /:
   *   get:
   *     summary: Get login page
   *     tags: [TFM]
   *     description: Get login page
   *     responses:
   *       301:
   *         description: Resource permanently moved
   *       500:
   *         description: Internal server error
   */
  loginSsoRouter.route('/').get((req, res, next) => {
    LoginController.getLogin(req, res).catch(next);
  });

  /**
   * @openapi
   * /logout:
   *   get:
   *     summary: logout
   *     tags: [TFM]
   *     description: logout
   *     responses:
   *       200:
   *         description: Ok
   *       301:
   *         description: Resource permanently moved
   */
  loginSsoRouter.route('/logout').get(LoginController.getLogout);

  return loginSsoRouter;
};
