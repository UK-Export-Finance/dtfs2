import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

/**
 * Error thrown when an amendment is not found, to be handled as an ApiError in the controller
 * and return a 404 status code
 */
export class AmendmentNotFoundError extends ApiError {
  constructor(amendmentId: string, facilityId: string) {
    const message = `Amendment not found: ${amendmentId} on facility: ${facilityId}`;
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'AmendmentNotFoundError';
  }
}
