import { ERRORS } from '../../constants';

export class InvalidEntityTypeError extends Error {
  /**
   * Represents an error that occurs when an invalid entity type is encountered.
   * @param entityType - Entity type in string
   */
  constructor(entityType: string) {
    super();
    this.name = 'InvalidEntityTypeError';
    this.message = ERRORS.ENTITY_TYPE.INVALID;
    this.cause = `Invalid entity type: ${entityType}`;

    /**
     * Needed when compiling against ES5 to allow us to call `instanceof` on custom errors
     * and return the expected custom error class
     * */
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
