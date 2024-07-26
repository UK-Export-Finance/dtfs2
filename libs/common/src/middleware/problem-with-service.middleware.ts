import { ErrorRequestHandler } from 'express';

/**
 * Frontend middleware that handles CSRF token errors.
 */
export const problemWithService: ErrorRequestHandler = (error: { message?: string }, _req, res) => {
  res.render('partials/problem-with-service.njk', { error });
};
