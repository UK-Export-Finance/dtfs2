import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidAmendmentIdError extends ApiError {
  constructor(amendmentId?: string) {
    const message = amendmentId ? `Invalid amendment ID: ${amendmentId}` : 'Invalid amendment ID';
    super({ message, status: HttpStatusCode.BadRequest });

    this.name = 'InvalidAmendmentIdError';
  }
}
