import { ErrorRequestHandler } from 'express';

/**
 * Frontend middleware that renders problem with service if other middlewares do not handle the error.
 */
export const problemWithService: ErrorRequestHandler = (error: { message?: string }, _req, res) => {
  res.render('partials/problem-with-service.njk', { error });
};
