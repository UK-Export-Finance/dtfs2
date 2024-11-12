import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import { getErrorType } from './front-end-error-handler';

describe('front-end-error-handler', () => {
  beforeEach(() => {});

  describe('getErrorType', () => {
    describe('when the error is a CSRF token error', () => {
      const error = createHttpError(HttpStatusCode.ImATeapot, { code: 'EBADCSRFTOKEN' });

      it('returns CSRF_TOKEN_ERROR', () => {
        const result = getErrorType(error);

        expect(result).toEqual('CSRF_TOKEN_ERROR');
      });
    });

    describe('when the error is an a non CSRF http error', () => {
      const error = createHttpError(HttpStatusCode.ImATeapot, { code: 'NOT_EBADCSRFTOKEN' });

      it('returns UNHANDLED_ERROR', () => {
        const result = getErrorType(error);

        expect(result).toEqual('UNHANDLED_ERROR');
      });
    });

    describe('when the error is an a CSRF non http error', () => {
      const error = { code: 'NOT_EBADCSRFTOKEN' };

      it('returns UNHANDLED_ERROR', () => {
        const result = getErrorType(error);

        expect(result).toEqual('UNHANDLED_ERROR');
      });
    });

    describe('when the error is an unhandled error', () => {
      const error = new Error('An error occurred');

      it('returns UNHANDLED_ERROR', () => {
        const result = getErrorType(error);

        expect(result).toEqual('UNHANDLED_ERROR');
      });
    });
  });
});
