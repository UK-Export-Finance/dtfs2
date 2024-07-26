import { ErrorRequestHandler } from 'express';
import { isHttpError } from 'http-errors';

export const unknownErrorHandling: ErrorRequestHandler = (error, _req, res, next) => {
  if (isHttpError(error) && error.code === 'EBADCSRFTOKEN') {
    console.error("The user's CSRF token is incorrect, redirecting the user to /.");
    // handle CSRF token errors here
    res.status(error.statusCode || 500);
    res.redirect('/');
  } else {
    next(error);
  }
};
