/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { GetRouter } from '../../../types/get-router';
import * as userController from '../../../controllers/user/user-non-sso';

export const getUserNonSsoRouter: GetRouter = () => {
  const userNonSsoRouter = express.Router();

  userNonSsoRouter.get('/change-password', userController.getUserProfile);

  userNonSsoRouter.post('/change-password', userController.postUserProfile);

  return userNonSsoRouter;
};
