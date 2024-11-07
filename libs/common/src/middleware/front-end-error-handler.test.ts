import httpMocks from 'node-mocks-http';
import { ErrorRequestHandler, Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import createHttpError from 'http-errors';
import { getFrontEndErrorHandler } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  describe('frontEndErrorHandler', () => {
    const problemWithServiceTemplateLocation = 'problemWithServiceTemplateLocation';
    let frontEndErrorHandler: ErrorRequestHandler;
    let res: httpMocks.MockResponse<Response>;
    let req: httpMocks.MockRequest<Request>;
    let next: jest.Mock;
    beforeEach(() => {
      jest.resetAllMocks();
      frontEndErrorHandler = getFrontEndErrorHandler(problemWithServiceTemplateLocation);
      ({ res, req } = getHttpMocks());
      next = jest.fn();
    });

    describe('when the error is a CSRF token error', () => {
      it('redirects the user to /', () => {
        const error = createHttpError(HttpStatusCode.ImATeapot, { code: 'EBADCSRFTOKEN' });

        frontEndErrorHandler(error, req, res, next);

        expect(res._getRedirectUrl()).toEqual('/');
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      });
    });

    describe('when the error is an unhandled error', () => {
      it('renders the problem with service template', () => {
        const error = new Error('An error occurred');

        frontEndErrorHandler(error, req, res, next);

        expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
        expect(res._getRenderView()).toEqual(problemWithServiceTemplateLocation);
      });
    });
  });

  function getHttpMocks() {
    return httpMocks.createMocks();
  }
});
