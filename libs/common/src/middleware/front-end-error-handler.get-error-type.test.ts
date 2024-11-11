import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import { getErrorType } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  beforeEach(() => {});

  describe('getErrorType', () => {
    it('returns CSRF_TOKEN_ERROR if the error is a CSRF token error', () => {
      getErrorType(createHttpError(HttpStatusCode.ImATeapot, { code: 'EBADCSRFTOKEN' }));
    });

    it('returns UNHANDLED_ERROR if the error is an a non CSRF http error', () => {
      getErrorType(createHttpError(HttpStatusCode.ImATeapot, { code: 'NOT_EBADCSRFTOKEN' }));
    });

    it('returns UNHANDLED_ERROR if the error is an a non CSRF http error', () => {
      getErrorType({ code: 'NOT_EBADCSRFTOKEN' });
    });

    it('returns UNHANDLED_ERROR if the error is an unhandled error', () => {
      getErrorType(new Error('An error occurred'));
    });
  });
});
