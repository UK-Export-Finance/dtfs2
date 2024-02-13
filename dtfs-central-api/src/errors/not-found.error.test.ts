import { NotFoundError } from './not-found.error';

describe('NotFoundError', () => {
  it('exposes the message if one is provided', () => {
    // Arrange
    const errorMessage = 'report with ID 123 not found';

    // Act
    const error = new NotFoundError({ message: errorMessage });

    // Assert
    expect(error.message).toBe(errorMessage);
  });

  it('exposes a default message if one is not provided', () => {
    // Act
    const error = new NotFoundError();

    // Assert
    expect(error.message).toBe('Not found');
  });

  it('exposes the name of the error', () => {
    // Act
    const error = new NotFoundError();

    // Assert
    expect(error.name).toBe('NotFoundError');
  });

  it('exposes the cause if a cause is provided', () => {
    // Arrange
    const cause = 'exampleCause';

    // Act
    const error = new NotFoundError({ cause });

    // Assert
    expect(error.cause).toBe(cause);
  });

  it('does not expose a cause if a cause is not provided', () => {
    // Act
    const error = new NotFoundError();

    // Assert
    expect(error.cause).toBeUndefined();
  });
});
