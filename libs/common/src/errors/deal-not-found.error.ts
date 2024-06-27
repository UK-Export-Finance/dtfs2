import { DatabaseError } from './database.error';

export class DealNotFoundError extends DatabaseError {
  constructor(dealId?: string) {
    const message = dealId ? `Deal not found: ${dealId}` : 'Deal not found';
    super(message);

    this.name = 'DealNotFoundError';
  }
}
