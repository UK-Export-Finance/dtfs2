/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { GetConfiguredRouter } from '../../../types/get-configured-router';
import * as userController from '../../../controllers/user/userNonSso';

export const getConfiguredUserNonSsoRouter: GetConfiguredRouter = () => {
  const userNonSsoRouter = express.Router();

  userNonSsoRouter.get('/change-password', userController.getUserProfile);

  userNonSsoRouter.post('/change-password', userController.postUserProfile);

  return userNonSsoRouter;
};
