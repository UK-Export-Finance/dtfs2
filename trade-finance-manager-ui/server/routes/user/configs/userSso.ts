import express from 'express';
import { GetRouter } from '../../../types/get-router';

export const getUserSsoRouter: GetRouter = () => {
  const userSsoRouter = express.Router();

  return userSsoRouter;
};
