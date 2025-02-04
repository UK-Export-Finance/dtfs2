import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

/**
 * Error thrown when an amendment exists but the request cannot be processed as it is incomplete, to be handled as an ApiError in the controller
 * and return a 409 status code.
 */
export class AmendmentIncompleteError extends ApiError {
  constructor(facilityId: string, amendmentId: string, message: string) {
    super({ message: `Amendment ${amendmentId} on facility ${facilityId} is incomplete: ${message}`, status: HttpStatusCode.Conflict });

    this.name = 'AmendmentIncompleteError';
  }
}
