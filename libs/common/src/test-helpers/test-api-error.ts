import { HttpStatusCode } from 'axios';
import { ApiError } from '@ukef/errors';
import { HttpStatusCodes, ApiErrorCode } from '@ukef/types';

type TestApiErrorParams = {
  status?: HttpStatusCodes;
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
