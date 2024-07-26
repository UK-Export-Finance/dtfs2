import { ErrorRequestHandler } from 'express';

/**
 * Middleware that logs errors to the console.
 * This middleware should be used prior to any other error handling middleware.
 * This ensures that we log any errors that are later handled in other error handling middleware.
 */
export const errorLogging: ErrorRequestHandler = (error, req, _res, next) => {
  const { method, originalUrl } = req;
  console.error(`An error occurred to request: ${method} ${originalUrl}:
    ${error}`);
  next(error);
};
