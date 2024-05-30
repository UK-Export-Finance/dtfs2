import { ErrorCode } from '../types';

type ApiErrorParams = {
  status: number;
  message: string;
  cause?: unknown;
  errorCode?: ErrorCode;
};

/**
 * Base Api Error class, used to facilitate commonised error handling
 */
export abstract class ApiError extends Error {
  public status: number;

  public errorCode?: ErrorCode;

  protected constructor({ status, message, cause, errorCode }: ApiErrorParams) {
    super(message);
    this.status = status;
    this.cause = cause;
    this.errorCode = errorCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
