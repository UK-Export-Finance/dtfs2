import express from 'express';
import { GetConfiguredRouter } from '../../../types/get-configured-router';

export const getConfiguredLoginSsoRouter: GetConfiguredRouter = () => {
  const loginSsoRouter = express.Router();

  return loginSsoRouter;
};
