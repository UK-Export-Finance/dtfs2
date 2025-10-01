/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { GetRouter } from '../../../types/get-router';
import * as userController from '../../../controllers/user/user-non-sso';

export const getUserNonSsoRouter: GetRouter = () => {
  const userNonSsoRouter = express.Router();

  /**
   * @openapi
   * /:
   *   get:
   *     summary: Get user profile page
   *     tags: [TFM]
   *     description: Get user profile page
   *     responses:
   *       200:
   *         description: Ok
   *       301:
   *         description: Resource permanently moved
   */
  userNonSsoRouter.get('/change-password', userController.getUserProfile);

  /**
   * @openapi
   * /:
   *   post:
   *     summary: Post change password
   *     tags: [TFM]
   *     description: Post change password
   *     responses:
   *       200:
   *         description: Ok
   *       400:
   *         description: Bad Request
   */
  userNonSsoRouter.post('/change-password', userController.postUserProfile);

  return userNonSsoRouter;
};
