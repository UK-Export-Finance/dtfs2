import { HttpStatusCode } from 'axios';
import { ErrorRequestHandler, Response } from 'express';
import { isHttpError } from 'http-errors';

/**
 * Handles the CSRF token error by redirecting the user to the root of the application.
 * @param res
 */
const handleCsrfTokenError = (res: Response) => {
  console.error("The user's CSRF token is incorrect, redirecting the user to /.");
  // Redirects always override the status code with 302
  // So there is no purpose setting the status code explicitly to a 500
  // We cannot send the status and then redirect as Express closes and sends the response
  // as soon as send is called
  res.redirect('/');
};

/**
 * Handles an otherwise unhandled error by logging the error and rendering the problem with service page.
 * @param error
 * @param res
 * @param problemWithServiceTemplate
 */
const handleOtherwiseUnhandledError = (error: unknown, res: Response, problemWithServiceTemplate: string) => {
  console.error('An unhandled error occurred:', error);
  res.status(HttpStatusCode.InternalServerError);
  res.render(problemWithServiceTemplate);
};

const getErrorType = (error: unknown) => {
  if (isHttpError(error) && error.code === 'EBADCSRFTOKEN') {
    return 'CSRF_TOKEN_ERROR';
  }
  return 'UNHANDLED_ERROR';
};

/**
 * Gets the front-end error handler middleware.
 *
 * The front-end error handler middleware handles errors that occur in the application.
 *
 * It is required to be added last to the app in generateApp.
 *
 * In Express 4, it only catches async errors if next(error) is called with an error inside the async function.
 * @param [problemWithServiceTemplate]
 * @example
 * // Async route in a routes file
 * app.get('*', (req, res) => {
 * // route implementation that can throw errors
 * }.catch(next(error)); // This will be caught by the front-end error handler
 */
export const getFrontEndErrorHandler = (problemWithServiceTemplate: string = '_partials/problem-with-service.njk') => {
  const frontEndErrorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    // Delegates to the default Express error handler
    // when the headers have already been sent to the client
    if (res.headersSent) {
      next(error);
      return;
    }

    const errorType = getErrorType(error);

    switch (errorType) {
      case 'CSRF_TOKEN_ERROR':
        handleCsrfTokenError(res);
        break;
      case 'UNHANDLED_ERROR':
      default:
        handleOtherwiseUnhandledError(error, res, problemWithServiceTemplate);
        break;
    }
  };

  return frontEndErrorHandler;
};
