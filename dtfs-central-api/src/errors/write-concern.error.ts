import { DatabaseError } from './database.error';

/**
 * This error is thrown when a write operation fails to write in MongoDb.
 * It is not thrown by default by the db-client,
 * but occassionally we want to throw an error if this happens.
 * Read more:
 * @see {@link https://docs.mongodb.com/manual/reference/write-concern/}
 */
export class WriteConcernError extends DatabaseError {
  constructor() {
    const message = `The write operation did not succeed`;
    super(message);

    this.name = 'WriteConcernError';
  }
}
