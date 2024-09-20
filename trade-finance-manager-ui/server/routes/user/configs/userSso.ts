import express from 'express';
import { GetConfiguredRouter } from '../../../types/get-configured-router';

export const getConfiguredUserSsoRouter: GetConfiguredRouter = () => {
  const userSsoRouter = express.Router();

  return userSsoRouter;
};
