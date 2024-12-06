import { HttpStatusCode } from 'axios';
import { ApiError } from '../errors';
import { ApiErrorCode } from '../types';

type TestApiErrorParams = {
  status?: HttpStatusCode;
  message?: string;
  code?: ApiErrorCode;
  cause?: unknown;
};

export class TestApiError extends ApiError {
  constructor(testApiErrorParams: TestApiErrorParams = {}) {
    const defaults = { status: HttpStatusCode.InternalServerError, message: '' };
    const apiErrorConstructorParams = { ...defaults, ...testApiErrorParams };
    super(apiErrorConstructorParams);
  }
}
