import { DatabaseError } from './database.error';

/**
 * This error is thrown when a document is not successfully updated.
 * It is not thrown by default by the db-client,
 */
export class DocumentNotUpdatedError extends DatabaseError {
  constructor(documentId?: string) {
    const message = documentId ? `Document update failed for document with id: ${documentId}` : 'Document update failed';
    super(message);

    this.name = 'DocumentNotUpdatedError';
  }
}
