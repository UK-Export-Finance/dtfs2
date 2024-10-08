import { InvalidAuditDetailsError } from './invalid-audit-details.error';

describe('InvalidAuditDetailsError', () => {
  it('exposes the message the error was created with', () => {
    // Arrange
    const message = 'Custom error message';

    // Act
    const exception = new InvalidAuditDetailsError(message);

    // Assert
    expect(exception.message).toEqual(message);
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Arrange
    const message = '';

    // Act
    const error = new InvalidAuditDetailsError(message);

    // Assert
    expect(error.status).toBe(400);
  });

  it('exposes the name of the exception', () => {
    // Arrange
    const message = '';

    // Act
    const exception = new InvalidAuditDetailsError(message);

    // Assert
    expect(exception.name).toEqual('InvalidAuditDetailsError');
  });
});
