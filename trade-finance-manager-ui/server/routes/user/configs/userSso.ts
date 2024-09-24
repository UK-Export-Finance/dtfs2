import express from 'express';
import { getRouter } from '../../../types/get-router';

export const getUserSsoRouter: getRouter = () => {
  const userSsoRouter = express.Router();

  return userSsoRouter;
};
