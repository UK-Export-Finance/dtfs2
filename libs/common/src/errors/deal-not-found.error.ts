import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class DealNotFoundError extends ApiError {
  constructor(dealId?: string) {
    const message = dealId ? `Deal not found: ${dealId}` : 'Deal not found';
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'DealNotFoundError';
  }
}
