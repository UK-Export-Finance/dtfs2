import express from 'express';
import { getRouter } from '../../../types/get-router';

export const getLoginSsoRouter: getRouter = () => {
  const loginSsoRouter = express.Router();

  return loginSsoRouter;
};
