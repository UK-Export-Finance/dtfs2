import { HttpStatusCode } from 'axios';
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

  it('exposes the 400 (Bad Request) status code', () => {
    // Arrange
    const message = '';

    // Act
    const error = new InvalidPayloadError(message);

    // Assert
    expect(error.status).toEqual(HttpStatusCode.BadRequest);
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
