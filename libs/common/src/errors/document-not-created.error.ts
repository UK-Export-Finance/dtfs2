import { DatabaseError } from './database.error';

/**
 * This error is thrown when a no documents are created.
 * It is not thrown by default by the db-client,
 */
export class DocumentNotCreatedError extends DatabaseError {
  constructor() {
    const message = `Document not created`;
    super(message);

    this.name = 'DocumentNotCreatedError';
  }
}
