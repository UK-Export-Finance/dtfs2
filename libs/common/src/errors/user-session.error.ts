import { ApiError } from './api.error';

type UserSessionParams = {
  status: number;
  message: string;
  cause?: unknown;
};

/**
 * Base Api Error class, used to facilitate commonised error handling
 */
export abstract class UserSessionError extends ApiError {
  protected constructor({ status, message, cause }: UserSessionParams) {
    super({ status, message, cause, code: 'INVALID_USER_SESSION' });
    this.name = this.constructor.name;
  }
}
