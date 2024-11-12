import httpMocks from 'node-mocks-http';
import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import createHttpError from 'http-errors';
import { getFrontEndErrorHandler } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  describe('frontEndErrorHandler', () => {
    console.error = jest.fn();

    let res: httpMocks.MockResponse<Response>;
    let req: httpMocks.MockRequest<Request>;
    let next: jest.Mock;

    beforeEach(() => {
      jest.resetAllMocks();
      ({ res, req } = httpMocks.createMocks());
      next = jest.fn();
    });

    describe('when the error is a CSRF token error', () => {
      it('redirects the user to /', () => {
        const error = createHttpError(HttpStatusCode.ImATeapot, { code: 'EBADCSRFTOKEN' });

        const frontEndErrorHandler = getFrontEndErrorHandler();
        frontEndErrorHandler(error, req, res, next);

        expect(res._getRedirectUrl()).toEqual('/');
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      });
    });

    describe('when the error is an unhandled error', () => {
      describe('when the problem with service template is not provided', () => {
        it('renders the default problem with service template', () => {
          const defaultProblemWithServiceTemplateLocation = '_partials/problem-with-service.njk';

          const error = new Error('An error occurred');

          const frontEndErrorHandler = getFrontEndErrorHandler();
          frontEndErrorHandler(error, req, res, next);

          expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
          expect(res._getRenderView()).toEqual(defaultProblemWithServiceTemplateLocation);
        });
      });

      describe('when the problem with service template is provided', () => {
        it('renders the provided problem with service template', () => {
          const problemWithServiceTemplateLocation = 'problemWithServiceTemplateLocation';

          const error = new Error('An error occurred');

          const frontEndErrorHandler = getFrontEndErrorHandler(problemWithServiceTemplateLocation);
          frontEndErrorHandler(error, req, res, next);

          expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
          expect(res._getRenderView()).toEqual(problemWithServiceTemplateLocation);
        });
      });
    });
  });
});
