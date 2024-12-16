import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class AmendmentNotFoundError extends ApiError {
  constructor(amendmentId: string, facilityId: string) {
    const message = `Amendment not found: ${amendmentId} on facility: ${facilityId}`;
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'AmendmentNotFoundError';
  }
}
