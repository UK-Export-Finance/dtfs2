import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidAmendmentStatusError extends ApiError {
  constructor(status?: string) {
    const message = status ? `Invalid portal amendment status: ${status}` : 'Invalid portal amendment status';
    super({ message, status: HttpStatusCode.BadRequest });

    this.name = 'InvalidAmendmentStatusError';
  }
}
