import httpMocks from 'node-mocks-http';
import { Response } from 'express';
import { handleCsrfTokenError } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  console.error = jest.fn();
  let res: httpMocks.MockResponse<Response>;

  beforeEach(() => {
    jest.resetAllMocks();
    ({ res } = httpMocks.createMocks());
  });
  describe('handleCsrfTokenError', () => {
    describe('when the error is a CSRF token error', () => {
      it('calls console.error', () => {
        handleCsrfTokenError(res as Response);

        expect(console.error).toHaveBeenCalledWith("The user's CSRF token is incorrect, redirecting the user to /.");
      });

      it('redirects the user to /', () => {
        handleCsrfTokenError(res as Response);

        expect(res._getRedirectUrl()).toEqual('/');
      });
    });
  });
});
