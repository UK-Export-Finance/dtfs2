import { DatabaseError } from './database.error';

/**
 * This error is thrown when a delete operation returns `{ acknowledged: true , deletedCount: 0 }`
 * It is not thrown by default by the db-client,
 */
export class DocumentNotDeletedError extends DatabaseError {
  constructor() {
    const message = `No documents were deleted`;
    super(message);

    this.name = 'DocumentNotDeletedError';
  }
}
