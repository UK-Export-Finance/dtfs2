import { ERRORS } from '../../constants';
import { InvalidEntityTypeError } from './invalid-entity-type.error';

describe('InvalidEntityTypeError', () => {
  const entityType = 'an entity type';

  it('exposes the expected error message', () => {
    // Act
    const exception = new InvalidEntityTypeError(entityType);

    // Assert
    expect(exception.message).toEqual(ERRORS.ENTITY_TYPE.INVALID);
  });

  it('exposes the expected cause', () => {
    // Arrange
    const expectedCause = `Invalid entity type: ${entityType}`;
    // Act
    const exception = new InvalidEntityTypeError(entityType);

    // Assert
    expect(exception.cause).toEqual(expectedCause);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new InvalidEntityTypeError(entityType);

    // Assert
    expect(exception.name).toEqual('InvalidEntityTypeError');
  });

  it('is an instance of InvalidEntityTypeError', () => {
    // Act
    const exception = new InvalidEntityTypeError(entityType);

    // Assert
    expect(exception).toBeInstanceOf(InvalidEntityTypeError);
  });
});
