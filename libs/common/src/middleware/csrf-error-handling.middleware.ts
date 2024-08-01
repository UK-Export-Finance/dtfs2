import { HttpStatusCode } from 'axios';
import { ErrorRequestHandler } from 'express';
import { isHttpError } from 'http-errors';

/**
 * Frontend middleware that handles CSRF token errors.
 */
export const csrfErrorHandling: ErrorRequestHandler = (error, req, res, next) => {
  if (isHttpError(error) && error.code === 'EBADCSRFTOKEN') {
    console.error("The user's CSRF token is incorrect, redirecting the user to /.");
    res.status(error.statusCode || HttpStatusCode.InternalServerError);
    res.redirect('/');
  } else {
    next(error);
  }
};
