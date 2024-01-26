import { InvalidPayloadError } from './invalid-payload';

describe('InvalidPayloadError', () => {
  it('exposes the message the error was created with', () => {
    // Arrange
    const message = 'Custom error message';

    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes a default status code of 400', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception.status).toBe(400);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidPayloadError(message);

    // Assert
    expect(exception.name).toEqual('InvalidPayloadError');
  });
});
