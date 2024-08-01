import { ApiErrorCode } from './api-error-code';

export type ApiErrorResponseBody = {
  status?: number;
  code?: ApiErrorCode;
  message?: string | string[];
};
