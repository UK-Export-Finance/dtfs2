import httpMocks from 'node-mocks-http';
import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { handleUnhandledError } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  console.error = jest.fn();
  let res: httpMocks.MockResponse<Response>;

  const error = new Error('An error occurred');
  const problemWithServiceTemplateLocation = 'problemWithServiceTemplateLocation';

  beforeEach(() => {
    jest.resetAllMocks();
    ({ res } = httpMocks.createMocks());
  });

  describe('handleUnhandledError', () => {
    describe('when the error is a CSRF token error', () => {
      it('calls console.error', () => {
        handleUnhandledError({ res, error, problemWithServiceTemplateLocation });

        expect(console.error).toHaveBeenCalledWith('An unhandled error occurred:', error);
      });

      it('returns a 500 status code', () => {
        handleUnhandledError({ res, error, problemWithServiceTemplateLocation });

        expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      });

      it('renders the problem with service template', () => {
        handleUnhandledError({ res, error, problemWithServiceTemplateLocation });

        expect(res._getRenderView()).toEqual(problemWithServiceTemplateLocation);
      });
    });
  });
});
