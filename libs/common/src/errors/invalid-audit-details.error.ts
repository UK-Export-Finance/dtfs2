import { API_ERROR_CODE } from '../constants';
import { ApiError } from './api.error';

export class InvalidAuditDetailsError extends ApiError {
  constructor(message: string) {
    super({
      status: 400,
      message,
      code: API_ERROR_CODE.INVALID_AUDIT_DETAILS,
    });

    this.name = this.constructor.name;
  }
}
