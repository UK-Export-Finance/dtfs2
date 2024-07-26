import { ErrorRequestHandler } from 'express';
import { ApiError } from '../errors';

export const apiErrorHandling: ErrorRequestHandler = (error, _req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json(error.message);
  }
  next(error);
};
