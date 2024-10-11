import { DealVersionError } from './deal-version.error';

describe('InvalidAuditDetailsError', () => {
  it('exposes the message the error was created with', () => {
    // Arrange
    const message = 'Custom error message';

    // Act
    const exception = new DealVersionError(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Arrange
    const message = '';

    // Act
    const error = new DealVersionError(message);

    // Assert
    expect(error.status).toEqual(400);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new DealVersionError(message);

    // Assert
    expect(exception.name).toEqual('DealVersionError');
  });
});
