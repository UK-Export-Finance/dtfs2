/**
 * A base class for all database errors.
 * This should be extended from to create more specific database errors
 */
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';

    /**
     * Needed when compiling against ES5 to allow us to call `instanceof` on custom errors
     * and return the expected custom error class
     * */
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
