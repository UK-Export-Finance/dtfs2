import { HttpStatusCode } from 'axios';
import { ApiError } from './api.error';

export class InvalidDealIdError extends ApiError {
  constructor(dealId?: string) {
    const message = dealId ? `Invalid deal ID: ${dealId}` : 'Invalid deal ID';
    super({ message, status: HttpStatusCode.BadRequest });

    this.name = 'InvalidDealIdError';
  }
}
