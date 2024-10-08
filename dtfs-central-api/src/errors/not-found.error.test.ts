import { HttpStatusCode } from 'axios';
import { NotFoundError } from './not-found.error';

describe('NotFoundError', () => {
  it('exposes the message the error was created with', () => {
    // Arrange
    const message = 'Custom error message';

    // Act
    const exception = new NotFoundError(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes the 404 (Not Found) status code', () => {
    // Arrange
    const message = '';

    // Act
    const error = new NotFoundError(message);

    // Assert
    expect(error.status).toBe(HttpStatusCode.NotFound);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new NotFoundError(message);

    // Assert
    expect(exception.name).toEqual('NotFoundError');
  });
});
