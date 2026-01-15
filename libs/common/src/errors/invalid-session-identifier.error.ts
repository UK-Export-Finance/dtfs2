import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidSessionIdentifierError extends ApiError {
  constructor(sessionIdentifier?: string) {
    const message = sessionIdentifier ? `Invalid session identifier: ${sessionIdentifier}` : 'Invalid session identifier';
    super({ message, status: HttpStatusCode.BadRequest });

    this.name = 'InvalidSessionIdentifierError';
  }
}
