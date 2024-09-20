import express from 'express';
import { GetConfiguredRouter } from '../../../types/get-configured-router';

export const getLoginSsoRouter: GetConfiguredRouter = () => {
  const loginSsoRouter = express.Router();

  return loginSsoRouter;
};
