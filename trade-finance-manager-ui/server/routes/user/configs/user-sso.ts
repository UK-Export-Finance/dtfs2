import express from 'express';
import { GetRouter } from '@tfm-ui/types/get-router';

export const getUserSsoRouter: GetRouter = () => {
  const userSsoRouter = express.Router();

  return userSsoRouter;
};
