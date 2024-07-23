import { RequestHandler } from 'express';
import { ApiError } from '../errors';

export const errorHandlingMiddleware: RequestHandler = (req, res, next) => {
  try {
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).send(error.message);
    }
    throw error;
  }
};
