import { ApiError } from './api.error';

export class InvalidAuditDetailsError extends ApiError {
  constructor(message: string) {
    super({
      status: 400,
      message,
      code: 'INVALID_AUDIT_DETAILS',
    });

    this.name = this.constructor.name;
  }
}
