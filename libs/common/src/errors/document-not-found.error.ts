import { DatabaseError } from './database.error';

/**
 * This error is thrown when a no documents are found.
 * It is not thrown by default by the db-client,
 */
export class DocumentNotFoundError extends DatabaseError {
  constructor() {
    const message = `No documents were found`;
    super(message);

    this.name = 'DocumentNotFoundError';
  }
}
