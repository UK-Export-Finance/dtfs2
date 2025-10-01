/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import * as loginNonSsoController from '../../../controllers/login/login-non-sso';
import { GetRouter } from '../../../types/get-router';

export const getLoginNonSsoRouter: GetRouter = () => {
  const loginNonSsoRouter = express.Router();

  /**
   * @openapi
   * /:
   *   get:
   *     summary: Get login page
   *     tags: [TFM]
   *     description: Get login page
   *     responses:
   *       200:
   *         description: Ok
   */
  loginNonSsoRouter.get('/', loginNonSsoController.getLogin);

  /**
   * @openapi
   * /:
   *   post:
   *     summary: Post login page
   *     tags: [TFM]
   *     description: Post login page
   *     responses:
   *       200:
   *         description: Ok
   *       301:
   *         description: Resource permanently moved
   *       400:
   *         description: Bad Request
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal server error
   */
  loginNonSsoRouter.post('/', loginNonSsoController.postLogin);

  /**
   * @openapi
   * /logout:
   *   get:
   *     summary: logout
   *     tags: [TFM]
   *     description: logout
   *     responses:
   *       301:
   *         description: Resource permanently moved
   */
  loginNonSsoRouter.get('/logout', loginNonSsoController.logout);

  return loginNonSsoRouter;
};
