import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import { getErrorType } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  beforeEach(() => {});

  describe('getErrorType', () => {
    it('returns CSRF_TOKEN_ERROR if the error is a CSRF token error', () => {
      const result = getErrorType(createHttpError(HttpStatusCode.ImATeapot, { code: 'EBADCSRFTOKEN' }));

      expect(result).toEqual('CSRF_TOKEN_ERROR');
    });

    it('returns UNHANDLED_ERROR if the error is an a non CSRF http error', () => {
      const result = getErrorType(createHttpError(HttpStatusCode.ImATeapot, { code: 'NOT_EBADCSRFTOKEN' }));

      expect(result).toEqual('UNHANDLED_ERROR');
    });

    it('returns UNHANDLED_ERROR if the error is an a non CSRF http error', () => {
      const result = getErrorType({ code: 'NOT_EBADCSRFTOKEN' });

      expect(result).toEqual('UNHANDLED_ERROR');
    });

    it('returns UNHANDLED_ERROR if the error is an unhandled error', () => {
      const result = getErrorType(new Error('An error occurred'));

      expect(result).toEqual('UNHANDLED_ERROR');
    });
  });
});
