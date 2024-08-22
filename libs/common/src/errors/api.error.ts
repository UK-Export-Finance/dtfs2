import { ApiErrorCode } from '../types';

type ApiErrorParams = {
  status: number;
  message: string;
  code?: ApiErrorCode;
  cause?: unknown;
};

/**
 * Base Api Error class, used to facilitate commonised error handling
 */
export abstract class ApiError extends Error {
  public status: number;
  public code?: ApiErrorCode;

  protected constructor({ status, message, cause, code }: ApiErrorParams) {
    super(message);
    this.status = status;
    this.code = code;
    this.cause = cause;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
