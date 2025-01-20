import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

/**
 * Error thrown when eligibility criteria is not found, to be handled as an ApiError in the controller
 * and return a 404 status code
 */
export class EligibilityCriteriaNotFoundError extends ApiError {
  constructor() {
    const message = 'Eligibility criteria not found';
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'EligibilityCriteriaNotFoundError';
  }
}
