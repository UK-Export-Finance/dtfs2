/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getRouter } from '../../../types/get-router';
import * as userController from '../../../controllers/user/userNonSso';

export const getUserNonSsoRouter: getRouter = () => {
  const userNonSsoRouter = express.Router();

  userNonSsoRouter.get('/change-password', userController.getUserProfile);

  userNonSsoRouter.post('/change-password', userController.postUserProfile);

  return userNonSsoRouter;
};
