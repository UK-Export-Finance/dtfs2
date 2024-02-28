import { ERRORS } from '../../constants';

export class InvalidEntityTypeError extends Error {
  /**
   * Represents an error that occurs when an invalid entity type is encountered.
   * @param entityType - Entity type in string
   */
  constructor(entityType: unknown) {
    super();
    this.name = ERRORS.ENTITY_TYPE.INVALID;
    this.cause = `Invalid entity type: ${entityType}`;
  }
}
