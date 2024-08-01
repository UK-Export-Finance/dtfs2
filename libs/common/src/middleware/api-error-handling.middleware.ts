import { ErrorRequestHandler } from 'express';
import { ApiError } from '../errors';

/**
 * Middleware to handle errors of the ApiError type at a global level
 * Note: Express 4.x requires the route function to be wrapped in a try catch block
 * and to call `next(error)` to pass the error for this middleware to work
 */
export const apiErrorHandling: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json(error.message);
  }
  next(error);
};
