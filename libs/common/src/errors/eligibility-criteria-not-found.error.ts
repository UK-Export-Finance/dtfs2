import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class EligibilityCriteriaNotFoundError extends ApiError {
  constructor() {
    const message = 'Latest Eligibility Criteria not found';
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'EligibilityCriteriaNotFoundError';
  }
}
