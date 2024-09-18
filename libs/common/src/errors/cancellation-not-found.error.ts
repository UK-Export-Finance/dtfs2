import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class CancellationNotFoundError extends ApiError {
  constructor(dealId?: string) {
    const message = dealId ? `Cancellation not found on Deal: ${dealId}` : 'Deal Cancellation not found';
    super({ message, status: HttpStatusCode.NotFound });

    this.name = 'CancellationNotFoundError';
  }
}
