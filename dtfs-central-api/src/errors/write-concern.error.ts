import { DatabaseError } from "./database.error";

export class WriteConcernError extends DatabaseError {
  constructor() {
    const message = `The write operation did not succeed`;
    super(message);

    this.name = 'WriteConcernError';
  }
}
